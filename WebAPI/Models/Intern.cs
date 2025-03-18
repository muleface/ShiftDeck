using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("interns")]
public class Intern {
    [Key]
    [Column("intern_id")]
    public int Id {get; set;}

    [Column("name")]
    public string InternName {get; set;}

    [Column("hospital")]
    public string Hospital {get; set;}

}