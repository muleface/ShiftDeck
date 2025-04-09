using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using WebAPI.Models;

public class LoginRequest
{
    public string UserName { get; set; }
    public string UserPassword { get; set; }
}

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
        // GET: api/Login/getLoginsByData?username=foo&userPassword=bar
[HttpGet("getLoginsByData")]
public async Task<ActionResult<Login>> GetLoginsByData(string username, string userPassword)
{
    var login = await _context.LoginTable
        .FirstOrDefaultAsync(l => l.username == username && l.userPassword == userPassword);

    if (login == null)
    {
        return NotFound();
    }

    return login;
}
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

[HttpPost("login")]
public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
{
    var login = await _context.LoginTable
        .FirstOrDefaultAsync(l => l.username == request.UserName && l.userPassword == request.UserPassword);

    if (login == null)
    {
        return NotFound();
    }

    return Ok(new { id = login.id, status = login.status }); // Return id and status if login is found
}

        
    }
}
