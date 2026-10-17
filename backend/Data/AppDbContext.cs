using Bitacora.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Bitacora.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Intervencion> Intervenciones => Set<Intervencion>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Categoria>().HasIndex(c => c.Nombre).IsUnique();

        b.Entity<Equipo>()
            .HasOne(e => e.Categoria)
            .WithMany(c => c.Equipos)
            .HasForeignKey(e => e.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);   // no se borra una categoría con equipos

        b.Entity<Intervencion>()
            .HasOne(i => i.Equipo)
            .WithMany(e => e.Intervenciones)
            .HasForeignKey(i => i.EquipoId)
            .OnDelete(DeleteBehavior.Cascade);    // al dar de baja un equipo se va su bitácora

        b.Entity<Usuario>().HasIndex(u => u.NombreUsuario).IsUnique();
    }
}
