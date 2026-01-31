using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Infrastructure.Data;

namespace QMS.API.Services;

public class AuthService : IAuthService
{
    private readonly QMSDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(QMSDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Room)
            .Include(u => u.Printer)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is inactive");
        }

        var (accessToken, expiresAt) = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return new LoginResponse(
            user.UserId,
            user.Username,
            user.FullName,
            user.Role,
            user.RoomId,
            user.Room?.RoomCode,
            user.PrinterId,
            user.Printer?.PrinterName,
            user.AreaCode,
            accessToken,
            refreshToken,
            expiresAt
        );
    }

    public async Task<LoginResponse> RefreshTokenAsync(string token, string refreshToken)
    {
        var principal = GetPrincipalFromExpiredToken(token);
        var username = principal.Identity?.Name;

        var user = await _context.Users
            .Include(u => u.Room)
            .Include(u => u.Printer)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var (newAccessToken, expiresAt) = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        await _context.SaveChangesAsync();

        return new LoginResponse(
            user.UserId,
            user.Username,
            user.FullName,
            user.Role,
            user.RoomId,
            user.Room?.RoomCode,
            user.PrinterId,
            user.Printer?.PrinterName,
            user.AreaCode,
            newAccessToken,
            newRefreshToken,
            expiresAt
        );
    }

    public async Task<IEnumerable<UserDto>> GetUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Room)
            .Include(u => u.Printer)
            .Select(u => new UserDto(
                u.UserId,
                u.Username,
                u.FullName,
                u.Role,
                u.RoomId,
                u.Room != null ? u.Room.RoomCode : null,
                u.PrinterId,
                u.Printer != null ? u.Printer.PrinterName : null,
                u.AreaCode,
                u.IsActive
            ))
            .ToListAsync();
    }

    public async Task<UserDto> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.Room)
            .Include(u => u.Printer)
            .FirstOrDefaultAsync(u => u.UserId == id)
            ?? throw new KeyNotFoundException($"User not found: {id}");

        return new UserDto(
            user.UserId,
            user.Username,
            user.FullName,
            user.Role,
            user.RoomId,
            user.Room != null ? user.Room.RoomCode : null,
            user.PrinterId,
            user.Printer != null ? user.Printer.PrinterName : null,
            user.AreaCode,
            user.IsActive
        );
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException($"Username already exists: {request.Username}");
        }

        var user = new User
        {
            Username = request.Username,
            PasswordHash = HashPassword(request.Password),
            FullName = request.FullName,
            Role = request.Role,
            RoomId = request.RoomId,
            PrinterId = request.PrinterId,
            AreaCode = request.AreaCode,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<UserDto> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new KeyNotFoundException($"User not found: {id}");

        user.FullName = request.FullName;
        user.Role = request.Role;
        user.RoomId = request.RoomId;
        user.PrinterId = request.PrinterId;
        user.AreaCode = request.AreaCode;
        user.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(user.UserId);
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new KeyNotFoundException($"User not found: {id}");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException($"User not found: {userId}");

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.PasswordHash = HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    }

    public async Task ResetPasswordAsync(int userId, ResetPasswordRequest request)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException($"User not found: {userId}");

        user.PasswordHash = HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    }

    private (string token, DateTime expiresAt) GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        if (user.RoomId.HasValue)
            claims.Add(new("RoomId", user.RoomId.Value.ToString()));
        
        if (!string.IsNullOrEmpty(user.AreaCode))
            claims.Add(new("AreaCode", user.AreaCode));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSuperSecretKeyWithAtLeast32CharactersLong!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSuperSecretKeyWithAtLeast32CharactersLong!")),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken || 
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}