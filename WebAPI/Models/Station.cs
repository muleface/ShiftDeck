using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("stations")]
public class Station {
    [Key]
    [Column("station_num")]
    public int StationNum {get; set;}

    [Column("station_name")]
    public string StationName {get; set;}
}