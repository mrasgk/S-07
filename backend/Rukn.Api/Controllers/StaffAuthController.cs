using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rukn.Api.DTOs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Controllers;

[ApiController]
[Route("api/staff/auth")]
[Produces("application/json")]
public class StaffAuthController : ControllerBase
{
    private readonly IStaffAuthService _authService;

    public StaffAuthController(IStaffAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(StaffUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] StaffLoginRequest request, CancellationToken ct)
    {
        var user = await _authService.AuthenticateAsync(request.Username, request.Password, ct);
        if (user is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "بيانات الدخول غير صحيحة",
                Detail = "اسم المستخدم أو كلمة المرور غير متطابقة."
            });
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, "Staff")
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(12)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);

        return Ok(user);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "تم تسجيل الخروج بنجاح." });
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(StaffUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId, ct);
        if (user is null)
            return Unauthorized();

        return Ok(user);
    }

    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "كلمة المرور غير صالحة",
                Detail = "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل."
            });
        }

        var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword, ct);
        if (!success)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "فشل تغيير كلمة المرور",
                Detail = "كلمة المرور الحالية غير صحيحة أو البيانات المدخلة غير مقبولة."
            });
        }

        return Ok(new { message = "تم تغيير كلمة المرور بنجاح." });
    }
}
