

using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

public record AuthResponse(

    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    string UserId,
    string Email,
    string FirstName,
    string LastName,
    List<string> Roles
    
);