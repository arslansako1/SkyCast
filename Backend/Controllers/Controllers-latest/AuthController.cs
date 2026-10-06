using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net;
using SkyCast.API.Services;

[ApiController]
[Route("api/auth")]
public class AuthController(TokenService _tokenService, UserManager<ApplicationUser> _userManager, AppDbContext _context, IConfiguration _configration, EmailService _emailService) : ControllerBase
{

    [HttpPost("signup")]
    public async Task<ActionResult> SignupAsync(SignupRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email!) is not null)
        {
            return BadRequest("Email is already taken.");
        }

        var user = new ApplicationUser
        {
            FirstName = request.FirstName!,
            LastName = request.LastName!,
            Email = request.Email,
            UserName = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password!);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, Roles.User);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "User created but role assignment failed",
                errors = roleResult.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            message = $"User '{request.Email}' signed up successfully",
            email = request.Email,
            role = "User"
        });
    }

    [HttpPost("signupAdmin")]
    public async Task<ActionResult> AdminSignupAsync(SignupRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email!) is not null)
        {
            return BadRequest("Email is already taken");

        }

        var secretKey = _configration["AdminSettings:SecretKey"];

        if (string.IsNullOrEmpty(request.AdminSecretKey) || request.AdminSecretKey != secretKey)
        {
            return BadRequest("Invalid admin secret key");
        }

        if (await _userManager.FindByEmailAsync(request.Email!) is not null)
        {
            return BadRequest("Invalid admin secret key");
        }

        var user = new ApplicationUser
        {
            FirstName = request.FirstName!,
            LastName = request.LastName!,
            Email = request.Email,
            UserName = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password!);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, Roles.Admin);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "User created but role assignment failed",
                errors = roleResult.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            message = $"User '{request.Email}' signed up successfully",
            email = request.Email,
            role = "Admin"
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        Console.WriteLine($" User roles: {string.Join(", ", roles)}");

        var (token, expiresAt) = _tokenService.CreateToken(user, roles);

        var refreshToken = _tokenService.CreateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
        };

        await _context.RefreshTokens.AddAsync(refreshTokenEntity);
        await _context.SaveChangesAsync();


        return Ok(new AuthResponse(token, refreshToken, expiresAt, user.Id, user.Email!, user.FirstName, user.LastName, roles.ToList()));

    }

    [HttpPost("forgetPassword")]
    public async Task<ActionResult> ForgetPassword(ForgetPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Ok(new { message = "If your email exists, you'll receive a reset link." });
        }
        ;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        var encodedToken = WebUtility.UrlEncode(token);
        var encodedEmail = WebUtility.UrlEncode(request.Email);

        var resetLink = $"http://localhost:5173/resetPassword?token={encodedToken}&email={encodedEmail}";


        var emailBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>
                <h1 style='color: #1a1a2e;'>🔐 Reset Your Password</h1>
                <p>Hello,</p>
                <p>We received a request to reset your password for SkyCast.</p>
                <p style='margin: 30px 0;'>
                    <a href='{resetLink}' style='background: #fbbf24; color: #1a1a2e; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;'>
                        🔗 Reset Password
                    </a>
                </p>
                <p style='color: #666; font-size: 14px;'>This link will expire in <strong>1 hour</strong>.</p>
                <hr style='border: none; border-top: 1px solid #eee;'/>
                <p style='color: #999; font-size: 12px;'>If you didn't request this, please ignore this email.</p>
                <p style='color: #999; font-size: 12px;'>© 2026 SkyCast</p>
            </div>
        ";

        await _emailService.SendEmailAsync(request.Email, "Reset your skyCast password", emailBody);

        return Ok(new { message = "Reset link sent to your password" });

    }


    [HttpPost("resetPassword")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
    {

        Console.WriteLine($"Email: {request.Email}");
        Console.WriteLine($"Token length: {request.Token?.Length ?? 0}");
        Console.WriteLine($"New password length: {request.NewPassword?.Length ?? 0}");
        Console.WriteLine($"New password: {request.NewPassword}");

        var decodedToken = request.Token;
        var decodedEmail = request.Email;

        if (!string.IsNullOrEmpty(request.Token))
        {
            try
            {
                decodedToken = Uri.UnescapeDataString(request.Token);
            }
            catch
            {
                decodedToken = WebUtility.UrlDecode(request.Token);
            }
        }

        Console.WriteLine($"Decoded Email: {decodedEmail}");
        Console.WriteLine($"Decoded Token length: {decodedToken?.Length ?? 0}");
        Console.WriteLine($"Decoded Token: {decodedToken?.Substring(0, Math.Min(20, decodedToken?.Length ?? 0))}...");

        var user = await _userManager.FindByEmailAsync(decodedEmail);
        if (user == null)
        {
            Console.WriteLine("User not found");
            return BadRequest(new { message = "Invalid request." });
        }
        ;
        Console.WriteLine($"User found {user.Email}");

        Console.WriteLine("Reseting password...");
        var result = await _userManager.ResetPasswordAsync(user, decodedToken!, request.NewPassword!);

        if (!result.Succeeded)
        {
            Console.WriteLine("Reset failed");
            return BadRequest(new
            {
                message = "Reset failed",
                errors = result.Errors.Select(e => e.Description).ToList()
            });
        }

        Console.WriteLine("Password reseted successfully");
        return Ok(new { message = "Password reset successfully" });


    }

    [HttpPost("refreshToken")]
    public async Task<ActionResult> RefreshTokenAsync(RefreshTokenRequest reqeust)
    {
        var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == reqeust.RefreshToken);

        if (refreshToken is null)
        {
            throw new BadRequestException("Invalid refresh token");
        }

        if (refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new BadRequestException("Refresh token has expired");
        }

        var user = await _userManager.FindByIdAsync(refreshToken.UserId);

        if (user is null)
        {
            throw new BadRequestException("User not found");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var (newAcessToken, expiresAt) = _tokenService.CreateToken(user, roles);

        var newRefreshToken = _tokenService.CreateRefreshToken();

        _context.RefreshTokens.Remove(refreshToken);

        var refreshTokenEntity = new RefreshToken
        {

            Token = newRefreshToken,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
        };

        await _context.RefreshTokens.AddAsync(refreshTokenEntity);


        await _context.SaveChangesAsync();

        return Ok(new AuthResponse(
            newAcessToken,
            newRefreshToken,
            expiresAt,
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            roles.ToList()
        ));
    }
}