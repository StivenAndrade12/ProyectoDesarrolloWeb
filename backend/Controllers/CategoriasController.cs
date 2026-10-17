using Bitacora.Api.Data;
using Bitacora.Api.Dtos;
using Bitacora.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Api.Controllers;

[ApiController]
[Route("api/categorias")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriasController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> Listar() =>
        await _db.Categorias
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto(c.Id, c.Nombre, c.Equipos.Count))
            .ToListAsync();

    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<CategoriaDto>> Crear(CategoriaInput input)
    {
        var nombre = input.Nombre.Trim();
        if (await _db.Categorias.AnyAsync(c => c.Nombre == nombre))
            return Conflict(new { mensaje = "Ya existe una categoría con ese nombre." });

        var cat = new Categoria { Nombre = nombre };
        _db.Categorias.Add(cat);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new CategoriaDto(cat.Id, cat.Nombre, 0));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Actualizar(int id, CategoriaInput input)
    {
        var cat = await _db.Categorias.FindAsync(id);
        if (cat is null) return NotFound();

        var nombre = input.Nombre.Trim();
        if (await _db.Categorias.AnyAsync(c => c.Nombre == nombre && c.Id != id))
            return Conflict(new { mensaje = "Ya existe una categoría con ese nombre." });

        cat.Nombre = nombre;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<IActionResult> Eliminar(int id)
    {
        var cat = await _db.Categorias.Include(c => c.Equipos).FirstOrDefaultAsync(c => c.Id == id);
        if (cat is null) return NotFound();
        if (cat.Equipos.Count > 0)
            return Conflict(new { mensaje = "No se puede eliminar: la categoría tiene equipos asociados." });

        _db.Categorias.Remove(cat);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
