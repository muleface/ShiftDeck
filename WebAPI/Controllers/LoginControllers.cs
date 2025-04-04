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
    [Route("api/[controller]")] //means that each query's initial URL is serverURL:port/api/login
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public LoginController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Login/getallLogins
        [HttpGet("getAllLogins")]
public async Task<ActionResult<IEnumerable<Login>>> GetAllLogins()
{
    var logins = await _context.LoginTable.ToListAsync();

    if (logins == null || logins.Count == 0)
    {
        return NotFound("No logins found.");
    }

    return logins;
}

        // GET: api/Login/getLoginsByUserName/{username}
        [HttpGet("getLoginsByUserName/{username}")]
        public async Task<ActionResult<Login>> getLoginsByUserName(string username)
        {
            var login = await _context.LoginTable.FindAsync(username);

            if (login == null)
            {
                return NotFound();
            }

            return login;
        }
        /*
        // GET: api/Login/getLoginsByPassword/{password}
        [HttpGet("getLoginsByPassword/{password}")]
        public async Task<ActionResult<IEnumerable<Login>>> getLoginsByPassword(string password)
        {
            var login = await _context.LoginTable.Where(i => i.user_password == password).ToListAsync<Login>();

            if (login == null)
            {
                return NotFound();
            }

            return login;
        }
        */
        // GET: api/Login/getLoginsByInternId/{id}
        [HttpGet("getLoginsByInternId/{id}")]
        public async Task<ActionResult<IEnumerable<Login>>> getLoginsByInternId(int id)
        {
            var logins = await _context.LoginTable.Where(l => l.id == id).ToListAsync();

            if (logins == null || logins.Count == 0)
            {
                return NotFound();
            }

            return logins;
        }



        // POST: api/login
        [HttpPost]  
public async Task<ActionResult<Login>> AddLogin(Login login)
{
    if (login == null)
    {
        return BadRequest("Invalid login data.");
    }

    _context.LoginTable.Add(login);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(getLoginsByUserName), new { username = login.username }, login);
}

        
    }
}
