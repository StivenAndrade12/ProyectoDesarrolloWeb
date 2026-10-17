using System.ComponentModel.DataAnnotations;

namespace Bitacora.Api.Models;

public class Equipo
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    // Opcional: formato AA:BB:CC:DD:EE:FF
    [MaxLength(17)]
    public string? DireccionMac { get; set; }

    [MaxLength(100)]
    public string? Marca { get; set; }

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public List<Intervencion> Intervenciones { get; set; } = new();
}
