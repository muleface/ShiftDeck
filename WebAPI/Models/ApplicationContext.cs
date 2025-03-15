using Microsoft.EntityFrameworkCore;

namespace WebAPI.Models;

public class ApplicationContext : DbContext 
{
    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) 
    {

    }

    public DbSet<Intern> InternsTable {get; set;}
    public DbSet<Shift> ShiftsTable {get; set;} 
}