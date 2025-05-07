using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Services;
using Microsoft.EntityFrameworkCore.Query.Internal;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")] //means that the start of each query's URL is serverURL:port/api/shifts
    [ApiController]
    public class ShiftsController : ControllerBase
    { 

        /* SUMMARY OF ACTIONS:
        GET:
        api/shifts/getallshifts -> returns all shift entries as a list of Shift objects. example call: GET serverURL:port/api/shifts
        api/shifts/getshiftbyid -> returns the shift with the corresponding request ID. should always be a single shift. example call: GET serverURL:port/api/shifts/getshiftbyid/1 (1 is the id)
        api/shifts/getshiftsbydate -> returns list of shifts with the corresponding request date. example call: GET serverURL:port/api/shifts/getshiftsbydate/yyyy-mm-dd
        api/shifts/getshiftsbydept -> returns list of shifts of the corresponding department. example call: GET serverURL:port/api/shifts/getshiftsbydept/Cardiology (should be altered in the future)
        api/shifts/getshiftsbyinternname -> returns list of shifts assigned to an intern by name. example call: GET serverURL:port/api/shifts/getshiftsbyinternname/baba%20yaga (%20 is translated to empty space, so it's baba yaga)
        
        POST:
        api/shifts/addshift -> adds a new shift to the shifts table. example call:
        POST serverURL:port/api/shifts/addshift
        Content-Type: application-json
        {
            "internId" : 1,
            "shiftDate": "2025-03-15"
            "department": "Cardiology"
        }
        basically, we pass the shift's parameters in json format as key:value pairs
        
        DELETE:
        api/shifts/deleteshift -> removes an existing shift by ID. example call: DELETE serverURL:port/api/shifts/deleteshift/1

        */
        private readonly ApplicationContext _context;

        public ShiftsController(ApplicationContext context)
        {
            _context = context;
        }

        //GET: api/shifts/getallshifts
        [HttpGet("GetAllShifts")]
        public async Task<ActionResult<IEnumerable<Shift>>> GetAllShifts() 
        {
            var shifts = await _context.ShiftsTable.ToListAsync<Shift>();

            if (shifts == null)
            {
                return NotFound("No shifts found in database.");
            }

            return shifts;
        } 

        //GET: api/shifts/getshiftbyid/{id}
        [HttpGet("GetShiftByID/{id}")]
        public async Task<ActionResult<Shift>> GetShiftById (int id)
        {
            var shift = await _context.ShiftsTable.FirstOrDefaultAsync<Shift>(s => s.Id == id);

            if (shift == null)
            {
                return NotFound($"No shift by ID: {id} was found.");
            }

            return shift;
        }

        // GET: api/shifts/getshiftsbydate/{date} - api/shifts/getshiftsbydate/2025-03-15 or year-month-day
        [HttpGet("GetShiftsByDate/{date}")]
        public async Task<ActionResult<IEnumerable<Shift>>> GetShiftsByDate(DateTime date) 
        {
            var shifts = await _context.ShiftsTable.Where<Shift>(s => s.ShiftDate == date).ToListAsync<Shift>();

            if (shifts.Count == 0) 
            {
                return NotFound($"No shift exists for {date}.");
            }

            return shifts;
        }
        
        // GET: api/shifts/getshiftsbystationnum/{num}
        [HttpGet("GetShiftsByStationNum/{num}")]
        public async Task<ActionResult<IEnumerable<Shift>>> GetShiftsByDepartment(int num) 
        {
            var shifts = await _context.ShiftsTable.Where<Shift>(s => s.StationNum == num).ToListAsync<Shift>();

            if (shifts.Count == 0)
            {
                return NotFound($"No shift exists for station number {num}.");
            }

            return shifts;
        }
        
        //this request should be reworked - i'm not sure if there's even a point in searching by name.
        // GET: api/shifts/getshiftsbyinternname/{name}
        [HttpGet("GetShiftsByInternName/{name}")]
        public async Task<ActionResult<IEnumerable<Shift>>> GetShiftsByInternName(string name) 
        {
            var intern = await _context.InternsTable.FirstOrDefaultAsync(i => i.FirstName.ToLower() == name.ToLower() || i.LastName.ToLower() == name.ToLower());
            // this returns only the first intern found that fits the criteria - by order of entry into the database (user creation date), not alphabetical order.
            if (intern == null) 
            {
                return NotFound($"No intern by name: {name} exists.");
            }

            var shifts = await _context.ShiftsTable.Where<Shift>(s => s.InternId == intern.Id).ToListAsync<Shift>();

            if (shifts.Count == 0) 
            {
                return NotFound($"No shifts found for intern: {name}.");
            }

            return shifts;
        }

        // GET: api/shifts/getshiftsbyinternid/{name}
        [HttpGet("GetShiftsByInternId/{id}")]
        public async Task<ActionResult<IEnumerable<Shift>>> GetShiftsByInternName(int id)
        {
            var shifts = await _context.ShiftsTable.Where<Shift>(s => s.InternId == id).ToListAsync<Shift>();

            if (shifts.Count == 0) 
            {
                return NotFound($"No shifts found for internId: {id}.");
            }

            return shifts;
        }

               // POST: api/shifts
        [HttpPost()]
        public async Task<ActionResult<Shift>> AddShift(Shift shift) 
        {
            try 
            {
                if (shift == null)
                    return BadRequest("Shift data is required.");
        
                if (await _context.InternsTable.FirstOrDefaultAsync(i => i.Id == shift.InternId) == null)
                    return BadRequest($"No intern by Id {shift.InternId} found.");
        
                if (shift.ShiftDate == default)
                    return BadRequest("Shift date is required.");
        
                if (await _context.StationsTable.FirstOrDefaultAsync(st => st.StationNum == shift.StationNum) == null)
                    return BadRequest("Station is nonexistent.");
        
                var shiftsToValidate = new List<Shift> { shift };
                var validationResult = await ValidateShifts(shiftsToValidate);
        
                if (!validationResult.IsValid)
                    return BadRequest("Validation failed: " + string.Join(", ", validationResult.InvalidReasons));
        
                bool shiftOverlap = await _context.ShiftsTable.AnyAsync(s => 
                    s.ShiftDate.Date == shift.ShiftDate.Date &&
                    s.StationNum == shift.StationNum);
        
                if (shiftOverlap)
                    return BadRequest($"This intern already has a shift in station no. {shift.StationNum} on {shift.ShiftDate:yyyy-MM-dd}");
        
                shift.ShiftDate = shift.ShiftDate.ToUniversalTime();
                _context.ShiftsTable.Add(shift);
                await _context.SaveChangesAsync();
        
                return CreatedAtAction(nameof(GetShiftById), new { id = shift.Id }, shift);
            }
            catch (Exception ex) 
            {
                return BadRequest($"Failed to add shift : {ex.Message}");
            }
        }
        
        // PUT: api/shifts/
        [HttpPut()]
        public async Task<ActionResult<Shift>> ChangeShift(Shift newShift) 
        {
            try 
            {
                if (newShift == null)
                    return BadRequest("Shift data is required.");
        
                if (await _context.InternsTable.FirstOrDefaultAsync(i => i.Id == newShift.InternId) == null)
                    return BadRequest($"No intern by Id {newShift.InternId} found.");
        
                Shift? oldShift = await _context.ShiftsTable.FindAsync(newShift.Id);
        
                if (oldShift == null) 
                    return BadRequest($"No shift by Id {newShift.Id} found.");
                
                if (oldShift.InternId == newShift.InternId)
                    return BadRequest($"Shift is already assigned to intern ID: {oldShift.InternId}. No changes necessary.");
        
                if (await _context.ShiftsTable.AnyAsync(s => s.Id != newShift.Id &&
                                                             s.ShiftDate == newShift.ShiftDate &&
                                                             s.InternId == newShift.InternId))
                    return BadRequest($"Intern ID: {newShift.InternId} is already assigned to a shift on {newShift.ShiftDate}");
        
                var shiftsToValidate = new List<Shift> { newShift };
                var validationResult = await ValidateShifts(shiftsToValidate);
        
                if (!validationResult.IsValid)
                    return BadRequest("Validation failed: " + string.Join(", ", validationResult.InvalidReasons));
        
                oldShift.InternId = newShift.InternId;
                await _context.SaveChangesAsync();
        
                return Ok(oldShift); 
            }
            catch (Exception ex) 
            {
                return BadRequest($"Failed to update shift : {ex.Message}");
            }
        }
        
        // DELETE: api/shifts/{id}
        [HttpDelete("/{id}")]
        public async Task<IActionResult> DeleteShift(int id) 
        {
            var shift = await _context.ShiftsTable.FirstOrDefaultAsync(s => s.Id == id);
        
            if (shift == null)
                return NotFound($"No shift by ID: {id} exists.");
        
            _context.ShiftsTable.Remove(shift);
            await _context.SaveChangesAsync();
        
            return Ok(shift);
        }
        
        // INTERNAL VALIDATION METHOD
        private async Task<(bool IsValid, List<string> InvalidReasons)> ValidateShifts(List<Shift> shifts)
        {
            var invalidReasons = new List<string>();
        
            foreach (var shift in shifts)
            {
                var previousDate = shift.ShiftDate.AddDays(-1).Date;
                bool hasPreviousDayShift = await _context.ShiftsTable.AnyAsync(s =>
                    s.InternId == shift.InternId && s.ShiftDate.Date == previousDate);
        
                if (hasPreviousDayShift && shift.ShiftDate.DayOfWeek != DayOfWeek.Saturday)
                    invalidReasons.Add($"Intern {shift.InternId} scheduled on consecutive days ({previousDate:yyyy-MM-dd} and {shift.ShiftDate:yyyy-MM-dd})");
        
                var internRole = await _context.StationRolesTable.FirstOrDefaultAsync(r =>
                    r.InternId == shift.InternId && r.StationNum == shift.StationNum);
        
                if (internRole == null)
                {
                    invalidReasons.Add($"Intern {shift.InternId} is not authorized for station {shift.StationNum}");
                    continue;
                }
        
                if (internRole.Role == 1)
                {
                    var validSeniors = await _context.JSConstraintsTable
                        .Where(js => js.JuniorStation == shift.StationNum)
                        .Select(js => js.SeniorStation)
                        .ToListAsync();
        
                    var sameDayShifts = await _context.ShiftsTable
                        .Where(s => s.ShiftDate.Date == shift.ShiftDate.Date)
                        .ToListAsync();
        
                    var seniorRoles = await _context.StationRolesTable
                        .Where(r => r.Role == 2)
                        .ToListAsync();
        
                    bool hasSenior = sameDayShifts.Any(s =>
                        validSeniors.Contains(s.StationNum) &&
                        seniorRoles.Any(r =>
                            r.InternId == s.InternId &&
                            r.StationNum == shift.StationNum));
        
                    if (!hasSenior && validSeniors.Any())
                        invalidReasons.Add($"Junior intern {shift.InternId} at station {shift.StationNum} requires senior backup");
                }
            }
        
            return (invalidReasons.Count == 0, invalidReasons);
        }
        [HttpGet("GetShiftStats")]
        public async Task<ActionResult<IEnumerable<object>>> GetShiftStats()
        {
            var now = DateTime.UtcNow;
            var thisMonthStart = new DateTime(now.Year, now.Month, 1);
            var lastMonth = now.AddMonths(-1);
            var lastMonthStart = new DateTime(lastMonth.Year, lastMonth.Month, 1);
            var rangeStart = lastMonthStart;
            var rangeEnd = thisMonthStart.AddMonths(1);

            var shifts = await _context.ShiftsTable
                .Where(s => s.ShiftDate >= rangeStart && s.ShiftDate < rangeEnd)
                .ToListAsync();

            var interns = await _context.InternsTable.ToListAsync();

            var result = interns.Select(intern => new {
                InternId = intern.Id,
                InternName = $"{intern.FirstName} {intern.LastName}",
                TotalShifts = shifts.Count(s => s.InternId == intern.Id),
                WeekendShifts = shifts.Count(s =>
                    s.InternId == intern.Id &&
                    (s.ShiftDate.DayOfWeek == DayOfWeek.Friday || s.ShiftDate.DayOfWeek == DayOfWeek.Saturday))
            });

            return Ok(result);
        }

        //POST: api/shifts/batch
        [HttpPost("batch")]
        public async Task<ActionResult<BatchOperationResults>> ProcessBatchOperations (BatchOperation batch) 
        {
            try
            {
                if (batch == null)
                    return BadRequest("No batch operation data received.");

                DateTime? targetMonth = null;
                //this section checks if any operations were actually sent, and takes the target date so we can later validate the entire month at once.
                if (batch.ShiftsToAdd.Any())
                    targetMonth = batch.ShiftsToAdd.First().ShiftDate.Date;
                else if (batch.ShiftIdsToDelete.Any())
                {
                    var firstShiftToDelete = await _context.ShiftsTable.FirstOrDefaultAsync<Shift>(s => batch.ShiftIdsToDelete.Contains(s.Id));
                    if (firstShiftToDelete != null)
                        targetMonth = firstShiftToDelete.ShiftDate.Date;
                    else
                        return BadRequest("Cannot find any shifts to be deleted.");
                }
                else
                    return BadRequest("No batch operations were specified.");
                
                //this section defines the start and end of the validation period - start of month to the end of month.
                var startOfMonth = new DateTime(targetMonth.Value.Year, targetMonth.Value.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1); //AddDays(-1) goes to the last day of previous month, which is why we add a month beforehand.

                //We grab the currently committed shifts of the target month from the database and keep it in memory.
                var monthShifts = await _context.ShiftsTable.Where(s => s.ShiftDate >= startOfMonth && s.ShiftDate <= endOfMonth).ToListAsync<Shift>();

                //Apply deletions to the in-memory list of shifts
                var postDeletionsShifts = monthShifts.Where(s => !batch.ShiftIdsToDelete.Contains(s.Id)).ToList<Shift>();

                //Filter out all the old shifts (old shifts that have the same date and station as new shifts, which means shifts the user intends to change)
                var finalShifts = postDeletionsShifts.Where(s => 
                                      !batch.ShiftsToAdd.Any(newShift =>
                                      newShift.ShiftDate.Date == s.ShiftDate.Date &&
                                      newShift.StationNum == s.StationNum)).ToList<Shift>();

                //Add all the new shifts to finalShifts
                foreach (Shift newShift in batch.ShiftsToAdd)
                    finalShifts.Add(newShift);
                
                if (finalShifts != null)
                {
                    //we start a day earlier and finish a day later to account for consecutive day assignments at the ends of the range.
                    var validationResult = validateRange(finalShifts, startOfMonth, endOfMonth);
                    if (validationResult.IsValid)
                    {
                        //Remove all shifts from this month from the database and add finalShifts
                         var existingMonthShifts = await _context.ShiftsTable.Where(s => s.ShiftDate >= startOfMonth && s.ShiftDate <= endOfMonth).ToListAsync();
                         _context.ShiftsTable.RemoveRange(existingMonthShifts);

                         foreach (Shift newShift in finalShifts)
                            _context.ShiftsTable.Add(newShift);
                        
                        await _context.SaveChangesAsync();

                        //Fetch the newly assigned shifts with the corresponding shift IDs
                        var addedShifts = _context.ShiftsTable.Where(s => 
                                                                batch.ShiftsToAdd.Any(newShift =>
                                                                newShift.ShiftDate.Date == s.ShiftDate.Date &&
                                                                newShift.StationNum == s.StationNum)).ToList<Shift>();
                        

                        return Ok(new BatchOperationResults  
                        {
                            AddedShifts = addedShifts,
                            DeletedShifts = existingMonthShifts.Select(s => s.Id).ToList()
                        });

                    }
                    else
                        return BadRequest($"Shift Validation failed - {validationResult.ErrorMessage}"); //validateMonth will be responsible for sending detailed reason for validation failure.
                }
                else
                    return BadRequest("finalShifts is null, severe logic issue.");
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"Error in batch operation: {e.Message}");
                
                return BadRequest($"An error occurred while processing the batch operation: {e.Message}");
            }
        }

        private (bool IsValid, string ErrorMessage) validateRange(List<Shift> shifts, DateTime startOfMonth, DateTime endOfMonth)
        {
            if (shifts == null || !shifts.Any())
                return (true, ""); // No shifts to validate

            // Group shifts by date for easy access
            var shiftsByDate = shifts
                .GroupBy(s => s.ShiftDate.Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Group shifts by intern for consecutive day validation
            var shiftsByIntern = shifts
                .GroupBy(s => s.InternId)
                .ToDictionary(g => g.Key, g => g.OrderBy(s => s.ShiftDate).ToList());

            // Validation results
            var isValid = true;
            var errors = new List<string>();

            // 1. Validate station authorization
            foreach (var shift in shifts)
            {
                var stationRole = _context.StationRolesTable
                    .FirstOrDefault(r => r.InternId == shift.InternId && r.StationNum == shift.StationNum);
                
                if (stationRole == null || stationRole.Role <= 0)
                {
                    isValid = false;
                    errors.Add($"Intern {shift.InternId} is not authorized for station {shift.StationNum} on {shift.ShiftDate:yyyy-MM-dd}");
                }
            }

            // 2. Validate consecutive days
            if (!ValidateConsecutiveDays(shiftsByIntern, out var consecutiveDaysErrors))
            {
                isValid = false;
                errors.AddRange(consecutiveDaysErrors);
            }

            // 3. Validate junior-senior backup requirements
            if (!ValidateJuniorSeniorBackup(shifts, shiftsByDate, out var backupErrors))
            {
                isValid = false;
                errors.AddRange(backupErrors);
            }

            return (isValid, string.Join("; ", errors));
        }

        private bool ValidateConsecutiveDays(Dictionary<int, List<Shift>> shiftsByIntern, out List<string> errors)
        {
            errors = new List<string>();
            bool isValid = true;

            foreach (var internId in shiftsByIntern.Keys)
            {
                var internShifts = shiftsByIntern[internId];
                
                // Check for consecutive days
                for (int i = 0; i < internShifts.Count - 1; i++)
                {
                    var currentShiftDate = internShifts[i].ShiftDate.Date;
                    var nextShiftDate = internShifts[i + 1].ShiftDate.Date;
                    
                    // If the difference is exactly 1 day, we have consecutive shifts
                    if ((nextShiftDate - currentShiftDate).TotalDays == 1)
                    {
                        isValid = false;
                        errors.Add($"Intern {internId} has consecutive shifts on {currentShiftDate:yyyy-MM-dd} and {nextShiftDate:yyyy-MM-dd}");
                    }
                }
            }

            return isValid;
        }

        private bool ValidateJuniorSeniorBackup(List<Shift> allShifts, Dictionary<DateTime, List<Shift>> shiftsByDate, out List<string> errors)
        {
            errors = new List<string>();
            bool isValid = true;

            // Process each day's shifts
            foreach (var date in shiftsByDate.Keys)
            {
                var dayShifts = shiftsByDate[date];
                
                // Find all juniors working this day
                var juniorShifts = new List<(Shift Shift, int JuniorStation)>();
                
                foreach (var shift in dayShifts)
                {
                    var stationRole = _context.StationRolesTable
                        .FirstOrDefault(r => r.InternId == shift.InternId && r.StationNum == shift.StationNum);
                    
                    if (stationRole?.Role == 1) // Role 1 = Junior
                    {
                        juniorShifts.Add((shift, shift.StationNum));
                    }
                }
                
                // For each junior, check if they have a senior backup
                foreach (var (juniorShift, juniorStation) in juniorShifts)
                {
                    // Find valid senior stations from constraints
                    var validSeniorStations = _context.JSConstraintsTable
                        .Where(c => c.JuniorStation == juniorStation)
                        .Select(c => c.SeniorStation)
                        .ToList();
                    
                    // If no constraints defined, no backup needed
                    if (validSeniorStations.Count == 0)
                        continue;
                    
                    bool hasSeniorBackup = false;
                    
                    // Check if any senior is scheduled at one of the valid stations
                    foreach (var seniorStation in validSeniorStations)
                    {
                        // Find shifts at this senior station on the same day
                        var seniorStationShifts = dayShifts.Where(s => s.StationNum == seniorStation).ToList();
                        
                        foreach (var potentialSeniorShift in seniorStationShifts)
                        {
                            // Check if this intern is actually a senior for the junior's station
                            var isSenior = _context.StationRolesTable.Any(r => 
                                r.InternId == potentialSeniorShift.InternId && 
                                r.StationNum == juniorStation && 
                                r.Role == 2); // Role 2 = Senior
                            
                            if (isSenior)
                            {
                                hasSeniorBackup = true;
                                break;
                            }
                        }
                        
                        if (hasSeniorBackup)
                            break;
                    }
                    
                    if (!hasSeniorBackup)
                    {
                        isValid = false;
                        errors.Add($"Junior intern {juniorShift.InternId} at station {juniorStation} on {date:yyyy-MM-dd} requires senior backup");
                    }
                }
            }
            return isValid;
        }
    }
}