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
    public class JSConstraintsController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public JSConstraintsController(ApplicationContext context)
        {
            _context = context;
        }

        //api/JSConstraints
        [HttpGet("GetAllConstraints")]
        public async Task<ActionResult<IEnumerable<JSConstraint>>> GetAllConstraints () 
        {
            return await _context.JSConstraintsTable.ToListAsync<JSConstraint>();
        }

        [HttpGet("GetByJuniorStation/{StationNum}")]
        public async Task<ActionResult<IEnumerable<JSConstraint>>> GetConstraintsByJuniorStation (int StationNum) 
        {
            return await _context.JSConstraintsTable.Where<JSConstraint>(con => con.JuniorStation == StationNum).ToListAsync<JSConstraint>();
        }

        [HttpGet("GetBySeniorStation/{StationNum}")]
        public async Task<ActionResult<IEnumerable<JSConstraint>>> GetConstraintsBySeniorStation (int StationNum) 
        {
            return await _context.JSConstraintsTable.Where<JSConstraint>(con => con.SeniorStation == StationNum).ToListAsync<JSConstraint>();
        }

    }
}