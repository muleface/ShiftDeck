using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")] //means that each query's initial URL is serverURL:port/api/interns
    [ApiController]

    public class StationRolesController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public StationRolesController(ApplicationContext context)
        {
            _context = context;
        }

        //GET: api/stationroles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StationRole>>> GetAllRoles () 
        {
            var stationRoles = await _context.StationRolesTable.ToListAsync<StationRole>();

            if (stationRoles == null)
            {
                return BadRequest("No station role entries found in database.");
            }
            
            return stationRoles;
        }
        
        //GET: api/stationroles/rolesbyinternid/{id}
        [HttpGet("/RolesByInternID/{id}")]
        public async Task<ActionResult<IEnumerable<StationRole>>> GetRolesByInternID (int id) 
        {
            var stationRoles = await _context.StationRolesTable.Where(st => st.InternId == id).ToListAsync<StationRole>();

            if (stationRoles == null)
            {
                return BadRequest($"No station roles designated for intern ID: {id}.");
            }

            return stationRoles;
        }

        //GET: api/stationroles/rolesbyfullname?firstName={first_name}&lastName={last_name}
        [HttpGet("/RolesByFullName")]
        public async Task<ActionResult<IEnumerable<StationRole>>> GetRolesByFullName ([FromQuery] string firstName, [FromQuery] string lastName) 
        {
            if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
            {
                return BadRequest("Both first and last names are required.");
            }

            var intern = await _context.InternsTable.FirstOrDefaultAsync<Intern>(i => i.FirstName == firstName &&
                                                                                      i.LastName == lastName);
            if (intern == null)
            {
                return BadRequest($"No intern by name {firstName} {lastName} found.");
            }
            
            return await GetRolesByInternID(intern.Id);
        }

        //GET: api/stationroles/rolesbystationnum/{num}
        [HttpGet("/RolesByStationNum/{num}")]
        public async Task<ActionResult<IEnumerable<StationRole>>> GetRolesByStationNum (int num)
        {
            var stationRoles = await _context.StationRolesTable.Where(r => r.StationNum == num).ToListAsync<StationRole>();

            if (stationRoles == null)
            {
                return BadRequest($"No roles designated for station no. {num}");
            }

            return stationRoles;
        }

        //GET: api/stationroles/rolesbystationname/{name}
        [HttpGet("/RolesByStationName/{name}")]
        public async Task<ActionResult<IEnumerable<StationRole>>> GetRolesByStationName (string name)
        {
            var station = await _context.StationsTable.FirstOrDefaultAsync(r => r.StationName == name);

            if (station == null)
            {
                return BadRequest($"No station by name {name} found.");
            }

            return await GetRolesByStationNum(station.StationNum);
        }

        //POST: api/stationroles
        [HttpPost()]
        public async Task<ActionResult<StationRole>> AddStationRole (StationRole role)
        {
            if (role == null)
            {
                return BadRequest("Data required for station role addition.");
            }

            var roleOverlap = await _context.StationRolesTable.FirstOrDefaultAsync(r => r.StationNum == role.StationNum &&
                                                                          r.InternId == role.InternId);
            if (roleOverlap != null)
            {
                return BadRequest($"Role is already assigned for intern ID: {role.InternId} at station no. {role.StationNum}.");
            }

            _context.StationRolesTable.Add(role);
            await _context.SaveChangesAsync();

            return Ok(role); // i decided to not return anything here since we can already know the primary key - it's {stationNum, InternID}.                                                                          
        }

        //PUT: api/stationroles
        [HttpPut()]
        public async Task<ActionResult<StationRole>> ChangeStationRole (StationRole role)
        {
            if (role == null)
            {
                return BadRequest("Data required for station role change.");
            }

            var oldStationRole = await _context.StationRolesTable.FirstOrDefaultAsync(r => r.InternId == role.InternId &&
                                                                                           r.StationNum == role.StationNum);
            
            if (oldStationRole == null)
            {
                return BadRequest($"No rule for intern ID: {role.InternId} at station no. {role.StationNum} exists.");
            }

            oldStationRole.Role = role.Role;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //DELETE: api/stationroles/{internid}
        [HttpDelete("/{internId}")]
        public async Task<ActionResult<StationRole>> DeleteStationRolesByName (int? internId)
        {
            if (internId == null)
            {
                return BadRequest("No ID entered for role deletion.");
            }
            
            var stationRoles = await _context.StationRolesTable.Where(r => r.InternId == internId).ToListAsync<StationRole>();

            _context.StationRolesTable.RemoveRange(stationRoles);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
