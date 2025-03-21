using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages;

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
    public DbSet<Login> LoginsTable {get; set;}
}