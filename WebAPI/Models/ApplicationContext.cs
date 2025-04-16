using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace WebAPI.Models;

public class ApplicationContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) 
    {
        //remember to set a primary key for the stationPermsTable - it's not a singular column.
    }

    public DbSet<Intern> InternsTable {get; set;}
    public DbSet<Shift> ShiftsTable {get; set;} 
    public DbSet<Station> StationsTable {get; set;}
    public DbSet<StationRole> StationRolesTable {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder) //sets a composite primary key (InternId, StationNum) for the StationRole object using fluent API
    {
        base.OnModelCreating(modelBuilder);

            // Fix for PostgreSQL requiring explicit keys on Identity entities
            modelBuilder.Entity<IdentityUserLogin<string>>(b =>
            {
                b.HasKey(l => new { l.LoginProvider, l.ProviderKey });
            });

            modelBuilder.Entity<IdentityUserRole<string>>(b =>
            {
                b.HasKey(r => new { r.UserId, r.RoleId });
            });

            modelBuilder.Entity<IdentityUserToken<string>>(b =>
            {
                b.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
            });

            modelBuilder.Entity<IdentityUserClaim<string>>(b =>
            {
                b.HasKey(uc => uc.Id);
            });

            modelBuilder.Entity<IdentityRoleClaim<string>>(b =>
            {
                b.HasKey(rc => rc.Id);
            });
        modelBuilder.Entity<StationRole>()
            .HasKey(sr => new { sr.InternId, sr.StationNum });
            
        modelBuilder.Entity<StationRole>()
            .Property(sr => sr.InternId)
            .HasColumnOrder(0);
            
        modelBuilder.Entity<StationRole>()
            .Property(sr => sr.StationNum)
            .HasColumnOrder(1);
    }
}