using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        [ForeignKey("Intern")]
        public int InternId { get; set; }

    }
}