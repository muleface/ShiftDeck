using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")] //means that each query's initial URL is serverURL:port/api/interns
    [ApiController]
    public class InternsController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public InternsController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/interns/getallinterns
        [HttpGet("GetAllInterns")]
        public async Task<ActionResult<IEnumerable<Intern>>> GetAllInterns()
        {
            return await _context.InternsTable.ToListAsync<Intern>();
        }

        // GET: api/interns/getinternsbyid/{id}
        [HttpGet("GetInternById/{id}")]
        public async Task<ActionResult<Intern>> GetInternById(int id)
        {
            var intern = await _context.InternsTable.FindAsync(id);

            if (intern == null)
            {
                return NotFound();
            }

            return intern;
        }

        // GET: api/interns/getinternsbyname/{name}
        [HttpGet("GetInternsByName/{name}")]
        public async Task<ActionResult<IEnumerable<Intern>>> GetInternByName(string name)
        {
            var interns = await _context.InternsTable.Where(i => i.FirstName == name || i.LastName == name).ToListAsync<Intern>();

            if (interns == null)
            {
                return NotFound($"No intern named {name} was found.");
            }

            return interns;
        }
        // POST: api/intern
        [HttpPost]
        public async Task<ActionResult<Intern>> AddIntern(Intern intern)
        {
            if (intern == null)
            {
                return BadRequest("Invalid intern data.");
            }

            _context.InternsTable.Add(intern);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInternById), new { Id = intern.Id }, intern);
        }

        
    }
}
