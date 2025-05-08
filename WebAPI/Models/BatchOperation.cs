using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebAPI.Models;


public class BatchOperation
{
    public List<Shift> ShiftsToAdd { get; set; } = new List<Shift>();
    public List<int> ShiftIdsToDelete { get; set; } = new List<int>();
}

public class BatchOperationResults
{
    public List<Shift> AddedShifts { get; set; } = new List<Shift>();
    public List<int> DeletedShifts { get; set; } = new List<int>();
}