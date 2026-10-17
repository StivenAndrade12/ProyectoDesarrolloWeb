using System.Text.RegularExpressions;
using Bitacora.Api.Data;
using Bitacora.Api.Dtos;
using Bitacora.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Api.Controllers;

[ApiController]
[Route("api/equipos")]
[Authorize]
public class EquiposController : ControllerBase
{
    private static readonly Regex MacRegex =
        new(@"^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$", RegexOptions.Compiled);

    private readonly AppDbContext _db;
    public EquiposController(AppDbContext db) => _db = db;

    private static EquipoDto ToDto(Equipo e) =>
        new(e.Id, e.Nombre, e.DireccionMac, e.Marca, e.CategoriaId,
            e.Categoria?.Nombre ?? "", e.Intervenciones.Count);

    // GET api/equipos?categoriaId=1&buscar=router
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipoDto>>> Listar(int? categoriaId, string? buscar)
    {
        var q = _db.Equipos.Include(e => e.Categoria).Include(e => e.Intervenciones).AsQueryable();

        if (categoriaId.HasValue) q = q.Where(e => e.CategoriaId == categoriaId);
        if (!string.IsNullOrWhiteSpace(buscar))
            q = q.Where(e => e.Nombre.Contains(buscar) ||
                             (e.Marca != null && e.Marca.Contains(buscar)) ||
                             (e.DireccionMac != null && e.DireccionMac.Contains(buscar)));

        var lista = await q.OrderBy(e => e.Nombre).ToListAsync();
        return lista.Select(ToDto).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipoDto>> Obtener(int id)
    {
        var e = await _db.Equipos.Include(x => x.Categoria).Include(x => x.Intervenciones)
            .FirstOrDefaultAsync(x => x.Id == id);
        return e is null ? NotFound() : ToDto(e);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<EquipoDto>> Crear(EquipoInput input)
    {
        var error = await Validar(input);
        if (error is not null) return BadRequest(new { mensaje = error });

        var e = new Equipo
        {
            Nombre = input.Nombre.Trim(),
            DireccionMac = Normalizar(input.DireccionMac),
            Marca = string.IsNullOrWhiteSpace(input.Marca) ? null : input.Marca.Trim(),
            CategoriaId = input.CategoriaId
        };
        _db.Equipos.Add(e);
        await _db.SaveChangesAsync();
        await _db.Entry(e).Reference(x => x.Categoria).LoadAsync();
        return CreatedAtAction(nameof(Obtener), new { id = e.Id }, ToDto(e));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Actualizar(int id, EquipoInput input)
    {
        var e = await _db.Equipos.FindAsync(id);
        if (e is null) return NotFound();

        var error = await Validar(input);
        if (error is not null) return BadRequest(new { mensaje = error });

        e.Nombre = input.Nombre.Trim();
        e.DireccionMac = Normalizar(input.DireccionMac);
        e.Marca = string.IsNullOrWhiteSpace(input.Marca) ? null : input.Marca.Trim();
        e.CategoriaId = input.CategoriaId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Eliminar(int id)
    {
        var e = await _db.Equipos.FindAsync(id);
        if (e is null) return NotFound();
        _db.Equipos.Remove(e);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string?> Validar(EquipoInput input)
    {
        if (!await _db.Categorias.AnyAsync(c => c.Id == input.CategoriaId))
            return "La categoría indicada no existe.";

        if (!string.IsNullOrWhiteSpace(input.DireccionMac) && !MacRegex.IsMatch(input.DireccionMac.Trim()))
            return "La dirección MAC no es válida. Usa el formato AA:BB:CC:DD:EE:FF.";

        return null;
    }

    private static string? Normalizar(string? mac) =>
        string.IsNullOrWhiteSpace(mac) ? null : mac.Trim().ToUpperInvariant().Replace('-', ':');
}
