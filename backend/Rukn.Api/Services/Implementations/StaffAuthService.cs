using Microsoft.EntityFrameworkCore;
using Rukn.Api.Data;
using Rukn.Api.DTOs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Services.Implementations;

public class StaffAuthService : IStaffAuthService
{
    private readonly AppDbContext _context;
    private readonly ILogger<StaffAuthService> _logger;

    public StaffAuthService(AppDbContext context, ILogger<StaffAuthService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<StaffUserResponse?> AuthenticateAsync(string username, string password, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return null;

        var user = await _context.StaffUsers
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive, ct);

        if (user is null)
        {
            _logger.LogWarning("Staff login failed: user '{Username}' not found or inactive", username);
            return null;
        }

        var isMatch = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!isMatch)
        {
            _logger.LogWarning("Staff login failed: incorrect password for '{Username}'", username);
            return null;
        }

        _logger.LogInformation("Staff '{Username}' authenticated successfully.", username);
        return new StaffUserResponse(user.Id, user.Username);
    }

    public async Task<StaffUserResponse?> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _context.StaffUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id && u.IsActive, ct);

        return user is null ? null : new StaffUserResponse(user.Id, user.Username);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
            return false;

        if (newPassword.Length < 6)
            return false;

        var user = await _context.StaffUsers.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, ct);
        if (user is null)
            return false;

        var isMatch = BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash);
        if (!isMatch)
        {
            _logger.LogWarning("Password change failed for user '{Username}': current password incorrect", user.Username);
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Password changed successfully for staff user '{Username}'", user.Username);
        return true;
    }
}
