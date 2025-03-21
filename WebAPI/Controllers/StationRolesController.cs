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
    }
}
