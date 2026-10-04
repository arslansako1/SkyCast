using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
        
    
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<FavoriteCities> FavoriteCitiess => Set<FavoriteCities>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}