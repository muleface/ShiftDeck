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
            return await _context.InternsTable.ToListAsync();
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
        [HttpGet("GetInternByName/{name}")]
        public async Task<ActionResult<Intern>> GetInternByName(string name)
        {
            var intern = await _context.InternsTable.FirstOrDefaultAsync((i) => i.InternName.ToLower() == name.ToLower());

            if (intern == null)
            {
                return NotFound($"No intern named {name} was found.");
            }

            return intern;
        }
    }
}
