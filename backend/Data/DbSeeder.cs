using Bitacora.Api.Models;

namespace Bitacora.Api.Data;

// Estructura "Zero-data": solo se crean los dos usuarios para poder entrar.
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Usuarios.Any()) return;

        db.Usuarios.AddRange(
            new Usuario
            {
                NombreUsuario = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123*"),
                Rol = Roles.Administrador
            },
            new Usuario
            {
                NombreUsuario = "consulta",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Consulta123*"),
                Rol = Roles.Consulta
            });

        db.SaveChanges();
    }
}
