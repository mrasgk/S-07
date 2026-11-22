using Rukn.Api.DTOs;

namespace Rukn.Api.Services.Interfaces;

/// <summary>
/// Service interface governing staff credentials, secure authentication, and profile settings.
/// </summary>
public interface IStaffAuthService
{
    /// <summary>
    /// Authenticates staff credentials against stored BCrypt password hash.
    /// </summary>
    Task<StaffUserResponse?> AuthenticateAsync(string username, string password, CancellationToken ct = default);

    /// <summary>
    /// Retrieves active staff profile by unique identifier.
    /// </summary>
    Task<StaffUserResponse?> GetUserByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Validates current password and updates to newly hashed password.
    /// </summary>
    Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
}
