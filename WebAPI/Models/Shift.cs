using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;

[Table("shifts")]
public class Shift {
    [Key]
    [Column("shift_id")]
    public int Id {get; set;}
    
    [Column("intern_id")]
    public int InternId {get; set;}

    [Column("shift_date")]
    public DateTime ShiftDate {get; set;}

    [Column("station_num")]
    public int StationNum {get; set;} //can probably change this to a short with a small department reference table to save space, if needed due to free hosting plan constraints for the database.

    public Shift(int internId, DateTime date, int station)
    {
        this.InternId = internId;
        this.ShiftDate = date;
        this.StationNum = station;
    }

}

