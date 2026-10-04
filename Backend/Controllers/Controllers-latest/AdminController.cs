

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/admin")]
public class AdminController(UserManager<ApplicationUser> _userManager) : ControllerBase
{

    [HttpGet("getAllUsers")]
    public async Task<ActionResult> GetAllUsersAsync()
    {
         var users = await _userManager.Users.ToListAsync();
        
        var result = users.Select(u => new
        {
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email,
            u.EmailConfirmed,
        });

        return Ok(result);   
    }

    [HttpGet("getUser/{id}")]
    public async Task<ActionResult> GetUserAsync(string id)
    {
         Console.WriteLine($"GetUser called with ID: {id}");

        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound("User not found");
        };

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

   [HttpPut("updateUser/{id}")]
public async Task<ActionResult> UpdateUserAsync(string id, UpdateAdminRequest request)
{
    var user = await _userManager.FindByIdAsync(id);
    if (user is null)
    {
        return NotFound($"User with ID {id} not found");
    }

    user.FirstName = request.FirstName;
    user.LastName = request.LastName;
    user.Email = request.Email;

    var updateResult = await _userManager.UpdateAsync(user);
    if (!updateResult.Succeeded)
    {
        return BadRequest(updateResult.Errors.Select(e => e.Description));
    }

    var currentRoles = await _userManager.GetRolesAsync(user);
    
    if (currentRoles.Any())
    {
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
    }
    
    await _userManager.AddToRoleAsync(user, request.Role); 

    var updatedUser = await _userManager.FindByIdAsync(id);
    var updatedRoles = await _userManager.GetRolesAsync(updatedUser!);

    return Ok(new
    {
        updatedUser!.Id,
        updatedUser.FirstName,
        updatedUser.LastName,
        updatedUser.Email,
        Roles = updatedRoles
    });
}

    [HttpPut("deleteUser/{id}")]
    public async Task<ActionResult> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound($"User with ID {id} not found");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return NoContent();
 
    }
    
}