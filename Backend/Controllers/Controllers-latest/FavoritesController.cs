using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoriteController(AppDbContext _context, UserManager<ApplicationUser> _userManager) : ControllerBase
{
    [HttpPost("addFavorites")]
    public async Task<ActionResult> AddFavoritesAsync([FromBody] FavoriteCityRequest request)
    {
   
        var user = await _userManager.GetUserAsync(User);
        var userId = user?.Id;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("You must be logged in");
        };

        var exists = await _context.FavoriteCitiess.AnyAsync(f => f.UserId == userId && f.CityName == request!.CityName);

        if (exists)
        {
            return BadRequest(new {message = "City is already in favorites"});
        }

        var favoriteCity = new FavoriteCities{
            UserId = userId,
            CityName = request!.CityName,
            AddedAt = DateTime.UtcNow,
        };

        _context.FavoriteCitiess.Add(favoriteCity);
        await _context.SaveChangesAsync();

       return Ok(new FavoriteCityResponse(
        favoriteCity.Id,
        request.CityName,
        DateTime.UtcNow
    ));
}

    
    [HttpGet("getFavorites")]
    public async Task<ActionResult> GetFavoritesAsync()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new {message = "You must be logged in"});
        };

        var favoriteCities = await _context.FavoriteCitiess
        .Where(fc => fc.UserId == userId)
        .Select(fc => new FavoriteCityResponse(fc.Id, fc.CityName, fc.AddedAt))
        .ToListAsync();


        return Ok(favoriteCities);
    }

    [HttpDelete("deleteFavorite")]
    public async Task<ActionResult> DeleteFavoritesAsync([FromQuery] string cityName)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new {message = "You must be logged in firs"});
        };

        var RemovedCity = await _context.FavoriteCitiess.FirstOrDefaultAsync(fc => fc.UserId == userId && fc.CityName == cityName);
        if (RemovedCity == null)
        {
            return NotFound();
        }
         
        _context.FavoriteCitiess.Remove(RemovedCity);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}