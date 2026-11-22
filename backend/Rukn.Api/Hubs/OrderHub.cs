using Microsoft.AspNetCore.SignalR;
using Rukn.Api.DTOs;

namespace Rukn.Api.Hubs;

public class OrderHub : Hub
{
    private readonly ILogger<OrderHub> _logger;

    public OrderHub(ILogger<OrderHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Customers join their specific order group to receive status updates.
    /// Strictly limits updates to this specific orderNumber channel.
    /// </summary>
    public async Task JoinOrderTracking(string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            return;

        var groupName = GetOrderGroupName(orderNumber.Trim());
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Client {ConnectionId} subscribed to {Group}", Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Staff members join the staff group to receive live new order alerts & dashboard events.
    /// Safely handles unauthenticated calls without throwing HubException.
    /// </summary>
    public async Task<bool> JoinStaffDashboard()
    {
        if (Context.User?.Identity?.IsAuthenticated == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "StaffDashboard");
            _logger.LogInformation("Staff {User} connected to StaffDashboard ({ConnectionId})", Context.User.Identity.Name, Context.ConnectionId);
            return true;
        }

        _logger.LogWarning("Unauthenticated attempt to join StaffDashboard from {ConnectionId}", Context.ConnectionId);
        return false;
    }

    public static string GetOrderGroupName(string orderNumber) => $"order_{orderNumber.ToUpperInvariant()}";
}
