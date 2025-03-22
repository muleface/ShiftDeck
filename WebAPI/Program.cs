using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // applies the application context class as context to the server.

builder.Services.AddRouting(options => { //sets all URL queries to be case-insensitive, to avoid confusion / issues with search by name
    options.LowercaseUrls = true;
});

var app = builder.Build(); 

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
