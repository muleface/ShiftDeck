using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("station_roles")]
public class StationRole { 

    [Column("intern_id")]
    public int InternId {get; set;}

    [Column("station_num")]
    public int StationNum {get; set;}

    [Column("role_num")]
    public int Role {get; set;}

}