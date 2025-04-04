using Microsoft.EntityFrameworkCore;

namespace WebAPI.Models;

public class ApplicationContext : DbContext 
{
    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) 
    {
        //remember to set a primary key for the stationPermsTable - it's not a singular column.
    }

    public DbSet<Intern> InternsTable {get; set;}
    public DbSet<Shift> ShiftsTable {get; set;} 
    public DbSet<Station> StationsTable {get; set;}
    public DbSet<StationRole> StationRolesTable {get; set;}
    public DbSet<Login> LoginTable {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder) //sets a composite primary key (InternId, StationNum) for the StationRole object using fluent API
    {
        
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