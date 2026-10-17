using Bitacora.Api.Data;
using Bitacora.Api.Dtos;
using Bitacora.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest req)
    {
        var user = await _db.Usuarios.FirstOrDefaultAsync(u => u.NombreUsuario == req.NombreUsuario);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });

        return new LoginResponse(_tokens.Crear(user), user.NombreUsuario, user.Rol);
    }
}
