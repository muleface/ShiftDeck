namespace WebAPI.Models;

public class Shift {
    public int Id {get; set;}
    
    public int InternId {get; set;}

    public DateTime ShiftDate {get; set;}

    public string Department {get; set;} //can probably change this to a short with a small department reference table to save space, if needed due to free hosting plan constraints for the database.

}

