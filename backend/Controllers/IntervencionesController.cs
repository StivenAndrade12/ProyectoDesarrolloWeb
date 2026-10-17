using Bitacora.Api.Data;
using Bitacora.Api.Dtos;
using Bitacora.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Api.Controllers;

[ApiController]
[Route("api/intervenciones")]
[Authorize]
public class IntervencionesController : ControllerBase
{
    private readonly AppDbContext _db;
    public IntervencionesController(AppDbContext db) => _db = db;

    private static IntervencionDto ToDto(Intervencion i) =>
        new(i.Id, i.EquipoId, i.Fecha, i.FallaReportada, i.ConfiguracionAplicada);

    // GET api/intervenciones?equipoId=3  -> historial cronológico (más reciente primero)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<IntervencionDto>>> Listar(int? equipoId)
    {
        var q = _db.Intervenciones.AsQueryable();
        if (equipoId.HasValue) q = q.Where(i => i.EquipoId == equipoId);

        var lista = await q.OrderByDescending(i => i.Fecha).ThenByDescending(i => i.Id).ToListAsync();
        return lista.Select(ToDto).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<IntervencionDto>> Obtener(int id)
    {
        var i = await _db.Intervenciones.FindAsync(id);
        return i is null ? NotFound() : ToDto(i);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<IntervencionDto>> Crear(IntervencionInput input)
    {
        if (!await _db.Equipos.AnyAsync(e => e.Id == input.EquipoId))
            return BadRequest(new { mensaje = "El equipo indicado no existe." });

        var i = new Intervencion
        {
            EquipoId = input.EquipoId,
            Fecha = input.Fecha,
            FallaReportada = input.FallaReportada.Trim(),
            ConfiguracionAplicada = input.ConfiguracionAplicada.Trim()
        };
        _db.Intervenciones.Add(i);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Obtener), new { id = i.Id }, ToDto(i));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Actualizar(int id, IntervencionInput input)
    {
        var i = await _db.Intervenciones.FindAsync(id);
        if (i is null) return NotFound();

        i.Fecha = input.Fecha;
        i.FallaReportada = input.FallaReportada.Trim();
        i.ConfiguracionAplicada = input.ConfiguracionAplicada.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Eliminar(int id)
    {
        var i = await _db.Intervenciones.FindAsync(id);
        if (i is null) return NotFound();
        _db.Intervenciones.Remove(i);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
