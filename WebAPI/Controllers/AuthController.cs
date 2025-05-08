using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager,
                              SignInManager<ApplicationUser> signInManager,
                              IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.UserName,
                InternId = request.InternId,
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Assign role if provided
            if (!string.IsNullOrEmpty(request.Role))
            {
                var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
                if (!roleResult.Succeeded)
                {
                    return BadRequest(roleResult.Errors);
                }
            }

            return Ok("User registered successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
            {
                Console.WriteLine("❌ User not found.");
                return Unauthorized("Invalid username or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                Console.WriteLine("❌ Password check failed.");
                return Unauthorized("Invalid username or password");
            }

            var token = await GenerateJwtToken(user);
            Console.WriteLine("✅ Login successful.");
            return Ok(new { token });
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim("id", user.Id),
                new Claim("internId", user.InternId.ToString()),
                new Claim("role", roles.FirstOrDefault() ?? "Intern") // assuming single role
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        [HttpPost("PromoteToManager/{userId}")]
        public async Task<IActionResult> PromoteToManager(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound($"User with ID '{userId}' not found.");

            // Check if user is already in 'Manager' role
            if (await _userManager.IsInRoleAsync(user, "Manager"))
                return BadRequest($"User '{user.UserName}' is already a manager.");

            // Remove from Intern role if needed
            if (await _userManager.IsInRoleAsync(user, "Intern"))
                await _userManager.RemoveFromRoleAsync(user, "Intern");

            // Assign Manager role
            var result = await _userManager.AddToRoleAsync(user, "Manager");
            if (!result.Succeeded)
                return BadRequest($"Failed to assign Manager role: {string.Join("; ", result.Errors.Select(e => e.Description))}");

            return Ok($"User '{user.UserName}' promoted to Manager.");
        }

    }

    public class RegisterRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public int InternId { get; set; }
        public string Role { get; set; }
    }

    public class LoginRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
