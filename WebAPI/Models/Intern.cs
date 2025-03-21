using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("interns")]
public class Intern {
    [Key]
    [Column("intern_id")]
    public int Id {get; set;}

    [Column("first_name")]
    public string FirstName {get; set;}

    [Column("last_name")]
    public string LastName {get; set;}

    [Column("department")]
    public string Department {get; set;} //department is not really needed, everyone will have the same value - Pediatric
}