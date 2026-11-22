using Rukn.Api.DTOs;
using Rukn.Api.Enums;

namespace Rukn.Api.Services.Interfaces;

/// <summary>
/// Service interface governing customer preorders, state transitions, stock allocation, and barista management.
/// </summary>
public interface IOrderService
{
    /// <summary>
    /// Creates a preorder with atomic stock decrement and notifies staff via SignalR.
    /// </summary>
    Task<CustomerOrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default);

    /// <summary>
    /// Fetches order tracking details by public reference number.
    /// </summary>
    Task<CustomerOrderResponse> GetOrderByNumberAsync(string orderNumber, CancellationToken ct = default);

    /// <summary>
    /// Cancels an order on behalf of a customer while in eligible preparation states.
    /// </summary>
    Task<CustomerOrderResponse> CancelCustomerOrderAsync(string orderNumber, string reason, CancellationToken ct = default);

    /// <summary>
    /// Lists orders for staff management with optional status filtering.
    /// </summary>
    Task<IReadOnlyList<StaffOrderResponse>> GetStaffOrdersAsync(OrderStatus? statusFilter = null, CancellationToken ct = default);

    /// <summary>
    /// Retrieves full order details including customer phone and notes for staff.
    /// </summary>
    Task<StaffOrderResponse> GetStaffOrderByIdAsync(Guid orderId, CancellationToken ct = default);

    /// <summary>
    /// Retrieves the most recent orders for dashboard display.
    /// </summary>
    Task<IReadOnlyList<StaffOrderResponse>> GetRecentOrdersAsync(int count = 5, CancellationToken ct = default);

    /// <summary>
    /// Advances order status through the preparation lifecycle.
    /// </summary>
    Task<StaffOrderResponse> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, CancellationToken ct = default);

    /// <summary>
    /// Cancels an active order, stores the required reason, and restores inventory atomically.
    /// </summary>
    Task<StaffOrderResponse> CancelOrderAsync(Guid orderId, string reason, CancellationToken ct = default);

    /// <summary>
    /// Aggregates key performance indicator counts and revenues for staff dashboard.
    /// </summary>
    Task<StaffDashboardSummary> GetDashboardSummaryAsync(CancellationToken ct = default);

    /// <summary>
    /// Calculates daily revenue and order volume trends for analytics charts.
    /// </summary>
    Task<AnalyticsResponse> GetAnalyticsAsync(string period = "7d", CancellationToken ct = default);
}
