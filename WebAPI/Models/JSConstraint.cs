using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("junior_senior_constraints")]
public class JSConstraint { 

    [Column("con_id")]
    public int Id {get; set;}

    [Column("junior_station")]
    public int JuniorStation {get; set;}

    [Column("senior_station")]
    public int SeniorStation {get; set;}
}