using System.ComponentModel.DataAnnotations;

namespace Bitacora.Api.Models;

public static class Roles
{
    public const string Administrador = "Administrador";
    public const string Consulta = "Consulta";
}

public class Usuario
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Rol { get; set; } = Roles.Consulta;
}
