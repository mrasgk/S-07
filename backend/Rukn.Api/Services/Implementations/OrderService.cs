using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Rukn.Api.Data;
using Rukn.Api.DTOs;
using Rukn.Api.Entities;
using Rukn.Api.Enums;
using Rukn.Api.Exceptions;
using Rukn.Api.Hubs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<OrderHub> _hubContext;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        AppDbContext context,
        IHubContext<OrderHub> hubContext,
        ILogger<OrderService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<CustomerOrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        // Check customer input constraints early to avoid unnecessary DB queries
        if (string.IsNullOrWhiteSpace(request.CustomerName) || request.CustomerName.Trim().Length < 2 || request.CustomerName.Trim().Length > 60)
            throw new DomainValidationException("يرجى إدخال اسم عميل صالح (بين 2 و 60 حرفاً).");

        if (!MoroccanPhoneValidator.IsValid(request.CustomerPhone))
            throw new DomainValidationException("يرجى إدخال رقم هاتف مغربي صالح (مثال: 0612345678 أو +212612345678).");

        if (request.Quantity <= 0 || request.Quantity > 20)
            throw new DomainValidationException("يجب أن تكون الكمية بين 1 و 20 كوب.");

        if (request.CustomerNote?.Length > 200)
            throw new DomainValidationException("الملاحظات يجب ألا تتجاوز 200 حرف.");

        var normalizedPhone = MoroccanPhoneValidator.Normalize(request.CustomerPhone);

        // Atomic stock decrement is wrapped in an explicit transaction with row-level
        // execution update to prevent race conditions or overselling under high concurrency.
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var coffee = await _context.DailyCoffees
            .FirstOrDefaultAsync(c => c.Id == request.DailyCoffeeId, ct);

        if (coffee is null || !coffee.IsAvailable)
            throw new ResourceNotFoundException("عذرًا، نفدت كمية قهوة اليوم أو غير متوفرة.");

        // ExecuteUpdateAsync ensures decrement only succeeds if current stock satisfies requested quantity.
        var rowsAffected = await _context.DailyCoffees
            .Where(c => c.Id == request.DailyCoffeeId && c.AvailableQuantity >= request.Quantity)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.AvailableQuantity, c => c.AvailableQuantity - request.Quantity)
                .SetProperty(c => c.UpdatedAt, DateTime.UtcNow), ct);

        if (rowsAffected == 0)
        {
            _logger.LogWarning("Depleted stock: Coffee {Id}, requested {Quantity}, available {Available}",
                coffee.Id, request.Quantity, coffee.AvailableQuantity);
            throw new OutOfStockException("عذرًا، الكمية المتبقية غير كافية لتلبية طلبك.");
        }

        var orderNumber = $"RUKN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        var totalPrice = coffee.Price * request.Quantity;

        // Keep the original price and coffee name on the order so subsequent
        // coffee updates do not mutate historical receipts or accounting records.
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            DailyCoffeeId = coffee.Id,
            CoffeeNameSnapshot = coffee.Name,
            UnitPriceSnapshot = coffee.Price,
            Quantity = request.Quantity,
            TotalPrice = totalPrice,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = normalizedPhone,
            CustomerNote = request.CustomerNote?.Trim(),
            Status = OrderStatus.New,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation("Order {OrderNumber} placed successfully.", orderNumber);

        // Count pending orders ahead in line to provide an instantaneous queue estimate
        var queuePos = await _context.Orders
            .AsNoTracking()
            .CountAsync(o => (o.Status == OrderStatus.New || o.Status == OrderStatus.Preparing) && o.CreatedAt <= order.CreatedAt, ct);

        // Notify barista staff dashboard immediately via SignalR push
        try
        {
            await _hubContext.Clients.Group("StaffDashboard").SendAsync("OrderCreated", new
            {
                order.Id,
                order.OrderNumber,
                order.CoffeeNameSnapshot,
                order.Quantity,
                order.TotalPrice,
                order.CustomerName,
                Status = order.Status.ToString(),
                StatusArabic = GetArabicStatus(order.Status),
                order.CreatedAt
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast order creation to staff.");
        }

        return new CustomerOrderResponse(
            order.OrderNumber,
            order.CoffeeNameSnapshot,
            order.UnitPriceSnapshot,
            order.Quantity,
            order.TotalPrice,
            order.Status,
            GetArabicStatus(order.Status),
            order.CancellationReason,
            order.CreatedAt,
            queuePos
        );
    }

    public async Task<CustomerOrderResponse> GetOrderByNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        var cleanNumber = orderNumber.Trim().ToUpperInvariant();
        var order = await _context.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderNumber == cleanNumber, ct);

        if (order is null)
            throw new ResourceNotFoundException("لم نتمكن من العثور على هذا الطلب.");

        int queuePos = 0;
        if (order.Status == OrderStatus.New || order.Status == OrderStatus.Preparing)
        {
            queuePos = await _context.Orders
                .AsNoTracking()
                .CountAsync(o => (o.Status == OrderStatus.New || o.Status == OrderStatus.Preparing) && o.CreatedAt <= order.CreatedAt, ct);
        }

        return new CustomerOrderResponse(
            order.OrderNumber,
            order.CoffeeNameSnapshot,
            order.UnitPriceSnapshot,
            order.Quantity,
            order.TotalPrice,
            order.Status,
            GetArabicStatus(order.Status),
            order.CancellationReason,
            order.CreatedAt,
            queuePos
        );
    }

    public async Task<IReadOnlyList<StaffOrderResponse>> GetStaffOrdersAsync(OrderStatus? statusFilter = null, CancellationToken ct = default)
    {
        var query = _context.Orders.AsNoTracking();

        if (statusFilter.HasValue)
            query = query.Where(o => o.Status == statusFilter.Value);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new StaffOrderResponse(
                o.Id,
                o.OrderNumber,
                o.DailyCoffeeId,
                o.CoffeeNameSnapshot,
                o.UnitPriceSnapshot,
                o.Quantity,
                o.TotalPrice,
                o.CustomerName,
                o.CustomerPhone,
                o.CustomerNote,
                o.Status,
                GetArabicStatus(o.Status),
                o.CancellationReason,
                o.CreatedAt,
                o.UpdatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task<StaffOrderResponse> GetStaffOrderByIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            throw new ResourceNotFoundException("لم يتم العثور على الطلب المطلوب.");

        return new StaffOrderResponse(
            order.Id,
            order.OrderNumber,
            order.DailyCoffeeId,
            order.CoffeeNameSnapshot,
            order.UnitPriceSnapshot,
            order.Quantity,
            order.TotalPrice,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerNote,
            order.Status,
            GetArabicStatus(order.Status),
            order.CancellationReason,
            order.CreatedAt,
            order.UpdatedAt
        );
    }

    public async Task<IReadOnlyList<StaffOrderResponse>> GetRecentOrdersAsync(int count = 5, CancellationToken ct = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .Select(o => new StaffOrderResponse(
                o.Id,
                o.OrderNumber,
                o.DailyCoffeeId,
                o.CoffeeNameSnapshot,
                o.UnitPriceSnapshot,
                o.Quantity,
                o.TotalPrice,
                o.CustomerName,
                o.CustomerPhone,
                o.CustomerNote,
                o.Status,
                GetArabicStatus(o.Status),
                o.CancellationReason,
                o.CreatedAt,
                o.UpdatedAt
            ))
            .ToListAsync(ct);
    }

    public async Task<StaffOrderResponse> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, CancellationToken ct = default)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            throw new ResourceNotFoundException("لم يتم العثور على الطلب المطلوب.");

        // Validate strictly allowed lifecycle progressions:
        // New -> Preparing -> Ready -> Completed, or Cancelled from New/Preparing.
        var isValidTransition = (order.Status, newStatus) switch
        {
            (OrderStatus.New, OrderStatus.Preparing) => true,
            (OrderStatus.New, OrderStatus.Cancelled) => true,
            (OrderStatus.Preparing, OrderStatus.Ready) => true,
            (OrderStatus.Preparing, OrderStatus.Cancelled) => true,
            (OrderStatus.Ready, OrderStatus.Completed) => true,
            (var current, var target) when current == target => true,
            _ => false
        };

        if (!isValidTransition)
            throw new DomainValidationException($"لا يمكن تحويل حالة الطلب من '{GetArabicStatus(order.Status)}' إلى '{GetArabicStatus(newStatus)}'.");

        // Releasing inventory if transitioning to Cancelled through status endpoint
        if (newStatus == OrderStatus.Cancelled && order.Status != OrderStatus.Cancelled)
        {
            var coffee = await _context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == order.DailyCoffeeId, ct);
            if (coffee != null)
            {
                coffee.AvailableQuantity += order.Quantity;
            }
        }

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Order {OrderNumber} updated to {Status}", order.OrderNumber, newStatus);

        // Notify customer on their dedicated order group so the tracking timeline updates live
        var customerGroup = OrderHub.GetOrderGroupName(order.OrderNumber);
        try
        {
            await _hubContext.Clients.Group(customerGroup).SendAsync("OrderStatusUpdated", new
            {
                order.OrderNumber,
                Status = order.Status.ToString(),
                StatusArabic = GetArabicStatus(order.Status),
                UpdatedAt = order.UpdatedAt
            }, ct);

            // SignalR: Broadcast to Staff Dashboard
            await _hubContext.Clients.Group("StaffDashboard").SendAsync("StaffOrderStatusChanged", new
            {
                order.Id,
                order.OrderNumber,
                Status = order.Status.ToString(),
                StatusArabic = GetArabicStatus(order.Status),
                UpdatedAt = order.UpdatedAt
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast status update via SignalR.");
        }

        return new StaffOrderResponse(
            order.Id,
            order.OrderNumber,
            order.DailyCoffeeId,
            order.CoffeeNameSnapshot,
            order.UnitPriceSnapshot,
            order.Quantity,
            order.TotalPrice,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerNote,
            order.Status,
            GetArabicStatus(order.Status),
            order.CancellationReason,
            order.CreatedAt,
            order.UpdatedAt
        );
    }

    public async Task<CustomerOrderResponse> CancelCustomerOrderAsync(string orderNumber, string reason, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            throw new ResourceNotFoundException("رقم الطلب غير صحيح.");

        var cleanNumber = orderNumber.Trim().ToUpperInvariant();
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderNumber == cleanNumber, ct);

        if (order is null)
            throw new ResourceNotFoundException("لم يتم العثور على الطلب المطلوب.");

        var staffResponse = await CancelOrderAsync(order.Id, reason, ct);

        return new CustomerOrderResponse(
            staffResponse.OrderNumber,
            staffResponse.CoffeeName,
            staffResponse.UnitPrice,
            staffResponse.Quantity,
            staffResponse.TotalPrice,
            staffResponse.Status,
            staffResponse.StatusArabic,
            staffResponse.CancellationReason,
            staffResponse.CreatedAt
        );
    }

    public async Task<StaffOrderResponse> CancelOrderAsync(Guid orderId, string reason, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainValidationException("يرجى إدخال سبب الإلغاء.");

        var trimmedReason = reason.Trim();
        if (trimmedReason.Length > 500)
            throw new DomainValidationException("سبب الإلغاء يجب ألا يتجاوز 500 حرف.");

        // Cancellation and stock restoration must execute inside the same transaction
        // to prevent restoring cups without successfully transitioning the order to Cancelled.
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order is null)
            throw new ResourceNotFoundException("لم يتم العثور على الطلب المطلوب.");

        if (order.Status == OrderStatus.Cancelled)
            throw new DomainValidationException("هذا الطلب ملغي بالفعل ولا يمكن إلغاؤه مجدداً.");

        // Orders that reached Ready or Completed have already been ground/brewed/served
        // and cannot be cancelled through the normal staff workflow.
        if (order.Status != OrderStatus.New && order.Status != OrderStatus.Preparing)
            throw new DomainValidationException($"لا يمكن إلغاء الطلب وهو في حالة '{GetArabicStatus(order.Status)}'. يمكن إلغاء الطلبات الجديدة أو التي قيد التحضير فقط.");

        // Restore reserved cups back into available stock exactly once
        var coffee = await _context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == order.DailyCoffeeId, ct);
        if (coffee != null)
        {
            coffee.AvailableQuantity += order.Quantity;
            coffee.UpdatedAt = DateTime.UtcNow;
        }

        order.Status = OrderStatus.Cancelled;
        order.CancellationReason = trimmedReason;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation("Order {OrderNumber} cancelled. Reason: {Reason}. Restored {Quantity} cups.",
            order.OrderNumber, trimmedReason, order.Quantity);

        // SignalR: Notify customer order tracking channel
        var customerGroup = OrderHub.GetOrderGroupName(order.OrderNumber);
        try
        {
            await _hubContext.Clients.Group(customerGroup).SendAsync("OrderStatusUpdated", new
            {
                order.OrderNumber,
                Status = order.Status.ToString(),
                StatusArabic = GetArabicStatus(order.Status),
                CancellationReason = order.CancellationReason,
                UpdatedAt = order.UpdatedAt
            }, ct);

            // SignalR: Notify Staff Dashboard
            await _hubContext.Clients.Group("StaffDashboard").SendAsync("StaffOrderStatusChanged", new
            {
                order.Id,
                order.OrderNumber,
                Status = order.Status.ToString(),
                StatusArabic = GetArabicStatus(order.Status),
                CancellationReason = order.CancellationReason,
                UpdatedAt = order.UpdatedAt
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast order cancellation via SignalR.");
        }

        return new StaffOrderResponse(
            order.Id,
            order.OrderNumber,
            order.DailyCoffeeId,
            order.CoffeeNameSnapshot,
            order.UnitPriceSnapshot,
            order.Quantity,
            order.TotalPrice,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerNote,
            order.Status,
            GetArabicStatus(order.Status),
            order.CancellationReason,
            order.CreatedAt,
            order.UpdatedAt
        );
    }

    public async Task<StaffDashboardSummary> GetDashboardSummaryAsync(CancellationToken ct = default)
    {
        var total = await _context.Orders.CountAsync(ct);
        var newCount = await _context.Orders.CountAsync(o => o.Status == OrderStatus.New, ct);
        var prepCount = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Preparing, ct);
        var readyCount = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Ready, ct);
        var cancelledCount = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled, ct);

        // Calculate Revenue from non-cancelled orders
        var nonCancelledQuery = _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled);

        var totalRevenue = await nonCancelledQuery.SumAsync(o => (decimal?)o.TotalPrice, ct) ?? 0m;

        var todayUtc = DateTime.UtcNow.Date;
        var todayRevenue = await nonCancelledQuery
            .Where(o => o.CreatedAt >= todayUtc)
            .SumAsync(o => (decimal?)o.TotalPrice, ct) ?? 0m;

        // Past 7 days revenue progression for visual chart
        var sevenDaysAgo = todayUtc.AddDays(-6);
        var recentOrdersList = await nonCancelledQuery
            .Where(o => o.CreatedAt >= sevenDaysAgo)
            .Select(o => new { o.CreatedAt, o.TotalPrice })
            .ToListAsync(ct);

        var revenueHistory = new List<RevenueDataPoint>();
        for (var i = 6; i >= 0; i--)
        {
            var dayDate = todayUtc.AddDays(-i);
            var nextDay = dayDate.AddDays(1);
            var dayOrders = recentOrdersList.Where(o => o.CreatedAt >= dayDate && o.CreatedAt < nextDay).ToList();

            var dayArabic = dayDate.ToString("ddd", new System.Globalization.CultureInfo("ar-MA"));
            var formattedDate = dayDate.ToString("MM/dd");

            revenueHistory.Add(new RevenueDataPoint(
                formattedDate,
                dayArabic,
                dayOrders.Sum(o => o.TotalPrice),
                dayOrders.Count
            ));
        }

        return new StaffDashboardSummary(total, newCount, prepCount, readyCount, cancelledCount, totalRevenue, todayRevenue, revenueHistory);
    }

    public async Task<AnalyticsResponse> GetAnalyticsAsync(string period = "7d", CancellationToken ct = default)
    {
        var todayUtc = DateTime.UtcNow.Date;
        DateTime startDate;
        int daysCount;

        switch (period.ToLowerInvariant())
        {
            case "30d":
                daysCount = 30;
                startDate = todayUtc.AddDays(-29);
                break;
            case "month":
                startDate = new DateTime(todayUtc.Year, todayUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                daysCount = (todayUtc - startDate).Days + 1;
                break;
            case "7d":
            default:
                daysCount = 7;
                startDate = todayUtc.AddDays(-6);
                break;
        }

        var nonCancelledOrders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled && o.CreatedAt >= startDate)
            .Select(o => new { o.CreatedAt, o.TotalPrice, o.Status })
            .ToListAsync(ct);

        var totalRevenue = nonCancelledOrders.Sum(o => o.TotalPrice);
        var totalOrders = nonCancelledOrders.Count;

        // Daily aggregated points
        var dailyData = new List<RevenueDataPoint>();
        for (var i = 0; i < daysCount; i++)
        {
            var dayDate = startDate.AddDays(i);
            var nextDay = dayDate.AddDays(1);
            var dayOrders = nonCancelledOrders.Where(o => o.CreatedAt >= dayDate && o.CreatedAt < nextDay).ToList();

            var dayArabic = dayDate.ToString("ddd", new System.Globalization.CultureInfo("ar-MA"));
            var formattedDate = dayDate.ToString("MM/dd");

            dailyData.Add(new RevenueDataPoint(
                formattedDate,
                dayArabic,
                dayOrders.Sum(o => o.TotalPrice),
                dayOrders.Count
            ));
        }

        // Status Distribution
        var allPeriodOrders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.CreatedAt >= startDate)
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var statusMap = allPeriodOrders.ToDictionary(k => k.Status, v => v.Count);

        var statusDistribution = new List<StatusDistributionPoint>
        {
            new("New", "جديد", statusMap.GetValueOrDefault(OrderStatus.New, 0), "#3B82F6"),
            new("Preparing", "قيد التحضير", statusMap.GetValueOrDefault(OrderStatus.Preparing, 0), "#F59E0B"),
            new("Ready", "جاهز للاستلام", statusMap.GetValueOrDefault(OrderStatus.Ready, 0), "#10B981"),
            new("Completed", "تم التسليم", statusMap.GetValueOrDefault(OrderStatus.Completed, 0), "#B77B4B"),
            new("Cancelled", "ملغي", statusMap.GetValueOrDefault(OrderStatus.Cancelled, 0), "#EF4444")
        };

        return new AnalyticsResponse(totalRevenue, totalOrders, dailyData, statusDistribution);
    }

    private static string GetArabicStatus(OrderStatus status) => status switch
    {
        OrderStatus.New => "جديد",
        OrderStatus.Preparing => "قيد التحضير",
        OrderStatus.Ready => "جاهز",
        OrderStatus.Completed => "تم التسليم",
        OrderStatus.Cancelled => "ملغي",
        _ => "غير معروف"
    };
}
