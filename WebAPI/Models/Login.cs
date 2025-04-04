using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("login")]
public class Login {
    [Key]
    [Column("username")]
    public string username {get; set;}

    [Column("user_password")]
    public string userPassword {get; set;}

    [Column("intern_id")]
    public int id {get; set;}

    [Column("status")]
    public int status {get; set;} //department is not really needed, everyone will have the same value - Pediatric
}