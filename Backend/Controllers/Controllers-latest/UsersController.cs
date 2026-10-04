

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(UserManager<ApplicationUser> _userManager) : ControllerBase
{

   
    [HttpPut("updateMe")]
    public async Task<ActionResult> UpdateMeAsync(UpdateUserRequest request)
    {
    var userId1 = User.FindFirstValue("sub");
    var userId2 = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
    var userId3 = User.FindFirstValue(ClaimTypes.NameIdentifier);
 
    var userId = userId1 ?? userId2 ?? userId3;
    
    if (string.IsNullOrEmpty(userId))
    {
        return Unauthorized("User ID not found in token.");
    }
       
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if(user is null)
        {
            return NotFound("User not found");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
      

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            Roles = roles

            
        });
        
    }
}