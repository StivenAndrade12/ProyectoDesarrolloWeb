using System.ComponentModel.DataAnnotations;

namespace Bitacora.Api.Models;

public class Intervencion
{
    public int Id { get; set; }

    public int EquipoId { get; set; }
    public Equipo? Equipo { get; set; }

    public DateTime Fecha { get; set; }

    [Required, MaxLength(1000)]
    public string FallaReportada { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string ConfiguracionAplicada { get; set; } = string.Empty;
}
