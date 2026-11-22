using System.Text.RegularExpressions;
using Rukn.Api.Enums;

namespace Rukn.Api.DTOs;

// Coffee
public record DailyCoffeeResponseDto(
    Guid Id,
    string Name,
    string? Description,
    string? Origin,
    string? RoastLevel,
    string? TastingNotes,
    string? ImageUrl,
    decimal Price,
    int AvailableQuantity,
    bool IsAvailable
);

// Customer Preorder Request
public record CreateOrderRequest(
    Guid DailyCoffeeId,
    string CustomerName,
    string CustomerPhone,
    int Quantity,
    string? CustomerNote
);

// Customer-safe Order Response (Never exposes phone, private notes, or internal sensitive fields)
public record CustomerOrderResponse(
    string OrderNumber,
    string CoffeeName,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice,
    OrderStatus Status,
    string StatusArabic,
    string? CancellationReason,
    DateTime CreatedAt,
    int QueuePosition = 0
);

// Staff Order Response (Includes contact details and internal operational data)
public record StaffOrderResponse(
    Guid Id,
    string OrderNumber,
    Guid DailyCoffeeId,
    string CoffeeName,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice,
    string CustomerName,
    string CustomerPhone,
    string? CustomerNote,
    OrderStatus Status,
    string StatusArabic,
    string? CancellationReason,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// Staff Cancel Order Request
public record CancelOrderRequest(
    string Reason
);

// Staff Update Status
public record UpdateOrderStatusRequest(
    OrderStatus Status
);

// Analytics DTOs
public record RevenueDataPoint(
    string Date,
    string DayName,
    decimal TotalRevenue,
    int OrdersCount
);

public record StatusDistributionPoint(
    string Status,
    string StatusArabic,
    int Count,
    string Color
);

public record AnalyticsResponse(
    decimal TotalRevenue,
    int TotalOrders,
    IReadOnlyList<RevenueDataPoint> DailyData,
    IReadOnlyList<StatusDistributionPoint> StatusDistribution
);

// Staff Dashboard Summary
public record StaffDashboardSummary(
    int TotalOrders,
    int NewOrders,
    int PreparingOrders,
    int ReadyOrders,
    int CancelledOrders,
    decimal TotalRevenue,
    decimal TodayRevenue,
    IReadOnlyList<RevenueDataPoint> RevenueHistory
);

// Staff Coffee Requests
public record CreateCoffeeRequest(
    string Name,
    string Description,
    string Origin,
    string RoastLevel,
    string TastingNotes,
    string? ImageUrl,
    decimal Price,
    int AvailableQuantity,
    bool IsAvailable
);

public record UpdateCoffeeRequest(
    string Name,
    string Description,
    string Origin,
    string RoastLevel,
    string TastingNotes,
    string? ImageUrl,
    decimal Price,
    int AvailableQuantity,
    bool IsAvailable
);

public record UpdateCoffeeAvailabilityRequest(
    bool IsAvailable
);

public record UpdateCoffeeInventoryRequest(
    int AvailableQuantity
);

// Staff Auth & Password Change
public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record StaffLoginRequest(
    string Username,
    string Password
);

public record StaffUserResponse(
    Guid Id,
    string Username
);

public static class MoroccanPhoneValidator
{
    // Moroccan phone format:
    // Starts with 06, 07, 05 (10 digits total) or +2126, +2127, +2125, 2126, 2127, 2125
    private static readonly Regex PhoneRegex = new(
        @"^(?:(?:\+|00)212|0)[5-7]\d{8}$",
        RegexOptions.Compiled);

    public static bool IsValid(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var cleaned = phone.Trim().Replace(" ", "").Replace("-", "");
        return PhoneRegex.IsMatch(cleaned);
    }

    public static string Normalize(string phone)
    {
        var cleaned = phone.Trim().Replace(" ", "").Replace("-", "");
        if (cleaned.StartsWith("+212"))
            return "0" + cleaned[4..];
        if (cleaned.StartsWith("00212"))
            return "0" + cleaned[5..];
        if (cleaned.StartsWith("212") && cleaned.Length == 12)
            return "0" + cleaned[3..];
        return cleaned;
    }
}
