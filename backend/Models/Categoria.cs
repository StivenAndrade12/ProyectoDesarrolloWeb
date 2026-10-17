using System.ComponentModel.DataAnnotations;

namespace Bitacora.Api.Models;

public class Categoria
{
    public int Id { get; set; }

    [Required, MaxLength(60)]
    public string Nombre { get; set; } = string.Empty;

    public List<Equipo> Equipos { get; set; } = new();
}
