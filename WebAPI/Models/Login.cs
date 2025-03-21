using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("login")]
public class login { 
    [Key]
    [Column("username")]
    public int Username {get; set;}

    [Column("user_password")]
    public int Password {get; set;}

    [Column("intern_id")]
    public int InternId {get; set;}

    [Column("status")]
    public int Status {get; set;}

}