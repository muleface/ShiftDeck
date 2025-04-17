namespace WebAPI.Models
{
    public class RegisterDto
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public int InternId { get; set; }
        public int Status { get; set; } // 0 = Intern, 1 = Manager
    }
}
