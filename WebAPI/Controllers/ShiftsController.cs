using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")] //means that the start of each query's URL is serverURL:port/api/shifts
    [ApiController]
    public class ShiftsController : ControllerBase
    { 

        /* SUMMARY OF ACTIONS:
        GET:
        api/shifts -> returns all shift entries as a list of Shift objects. example call: GET serverURL:port/api/shifts
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

        //GET: api/shifts
        [HttpGet]
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
        
        // GET: api/shifts/getshiftsbystationnum/{dept}
        [HttpGet("GetShiftsByStationNum/{dept}")]
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
            try {
                // data validation conditionals
                if (shift == null)
                {
                    return BadRequest("Shift data is required.");
                }

                if(await _context.InternsTable.FirstOrDefaultAsync<Intern>(i => i.Id == shift.InternId) == null) // intern doesn't exist in database by id
                {
                    return BadRequest($"No intern by Id {shift.InternId} found.");
                }
                
                if (shift.ShiftDate == default)
                {
                    return BadRequest("Shift date is required.");
                }

                if (await _context.StationsTable.FirstOrDefaultAsync<Station>(st => st.StationNum == shift.StationNum) == null)
                {
                    return BadRequest("Station is nonexistent.");
                }

                bool shiftOverlap = await _context.ShiftsTable.AnyAsync(s => 
                    s.ShiftDate.Date == shift.ShiftDate.Date &&
                    s.StationNum == shift.StationNum); //overlap for a shift on the same day and in the same station - could be different interns.
                    
                if (shiftOverlap)
                {
                    return BadRequest($"This intern already has a shift in station no. {shift.StationNum} on {shift.ShiftDate:yyyy-MM-dd}");
                }

                // end of data validation conditionals

                _context.ShiftsTable.Add(shift);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetShiftById), new {id = shift.Id}, shift); //1st and 2nd arg effectively combine to the relevant URL for the request
                                                                                          // the 3rd arg is the object with the auto-generated ID.
            }
            catch (Exception ex) {

                return BadRequest($"Failed to add shift : {ex.Message}");
            }
        }

        //PUT: api/shifts/
        [HttpPut()]
        public async Task<ActionResult<Shift>> ChangeShift (Shift newShift) 
        {
            try {
                // data validation conditionals
                if (newShift == null)
                {
                    return BadRequest("Shift data is required.");
                }

                if(await _context.InternsTable.FirstOrDefaultAsync<Intern>(i => i.Id == newShift.InternId) == null) // intern doesn't exist in database by id
                {
                    return BadRequest($"No intern by Id {newShift.InternId} found.");
                }
                
                Shift? oldShift = await _context.ShiftsTable.FindAsync(newShift.Id);

                if (oldShift == null) 
                {
                    return BadRequest($"No shift by Id {newShift.Id} found.");
                }

                else if (oldShift.InternId == newShift.InternId)
                {
                    return BadRequest($"Shift is already assigned to intern ID: {oldShift.InternId}. No changes necessary.");
                }

                if (await _context.ShiftsTable.AnyAsync<Shift>(s => s.Id != newShift.Id &&
                                                                    s.ShiftDate == newShift.ShiftDate &&
                                                                    s.InternId == newShift.InternId) == true)
                {
                    return BadRequest($"Intern ID: {newShift.InternId} is already assigned to a shift on {newShift.ShiftDate}");
                }

                oldShift.InternId = newShift.InternId; //this actually accesses the database and modifies the entry.
                await _context.SaveChangesAsync();

                return NoContent(); 
                                                                                          
            }
            catch (Exception ex) {

                return BadRequest($"Failed to add shift : {ex.Message}");
            }
        }

        //DELETE: api/shifts/{id}
        [HttpDelete("/{id}")]
        public async Task<IActionResult> DeleteShift(int id) 
        {
            var shift = await _context.ShiftsTable.FirstOrDefaultAsync<Shift>(s => s.Id == id);

            if (shift == null)
            {
                return NotFound($"No shift by ID: {id} exists.");
            }

            _context.ShiftsTable.Remove(shift);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}