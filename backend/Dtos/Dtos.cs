using System.ComponentModel.DataAnnotations;

namespace Bitacora.Api.Dtos;

public record LoginRequest([Required] string NombreUsuario, [Required] string Password);
public record LoginResponse(string Token, string NombreUsuario, string Rol);

public record CategoriaDto(int Id, string Nombre, int TotalEquipos);
public record CategoriaInput([Required, MaxLength(60)] string Nombre);

public record EquipoDto(
    int Id, string Nombre, string? DireccionMac, string? Marca,
    int CategoriaId, string CategoriaNombre, int TotalIntervenciones);

public record EquipoInput(
    [Required, MaxLength(100)] string Nombre,
    [MaxLength(17)] string? DireccionMac,
    [MaxLength(100)] string? Marca,
    [Required] int CategoriaId);

public record IntervencionDto(
    int Id, int EquipoId, DateTime Fecha, string FallaReportada, string ConfiguracionAplicada);

public record IntervencionInput(
    [Required] int EquipoId,
    [Required] DateTime Fecha,
    [Required, MaxLength(1000)] string FallaReportada,
    [Required, MaxLength(4000)] string ConfiguracionAplicada);
