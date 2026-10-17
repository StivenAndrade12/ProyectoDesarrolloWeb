using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Bitacora.Api.Models;
using Bitacora.Api.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Bitacora.Tests;

public class SeguridadTests
{
    private readonly TokenService _tokenService;

    public SeguridadTests()
    {
        // Simulamos la configuración de appsettings.json en memoria
        var configEnMemoria = new Dictionary<string, string?>
        {
            { "Jwt:Key", "clave-secreta-de-prueba-con-mas-de-32-caracteres!!" },
            { "Jwt:Issuer", "BitacoraApi" },
            { "Jwt:Audience", "BitacoraWeb" },
            { "Jwt:ExpireHours", "8" }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configEnMemoria)
            .Build();

        _tokenService = new TokenService(configuration);
    }

    [Fact]
    public void CrearToken_UsuarioAdministrador_ContieneClaimsCorrectos()
    {
        // 1. Arrange (Preparar el escenario)
        var admin = new Usuario
        {
            Id = 1,
            NombreUsuario = "admin",
            Rol = "Administrador",
            PasswordHash = "hash_simulado"
        };

        // 2. Act (Ejecutar el método real de tu TokenService)
        string jwt = _tokenService.Crear(admin);

        // 3. Assert (Verificar que el resultado sea correcto)
        Assert.False(string.IsNullOrWhiteSpace(jwt));

        var lector = new JwtSecurityTokenHandler();
        var tokenDecodificado = lector.ReadJwtToken(jwt);

        Assert.Equal("BitacoraApi", tokenDecodificado.Issuer);
        Assert.Contains(tokenDecodificado.Claims, c => c.Type == ClaimTypes.Name && c.Value == "admin");
        Assert.Contains(tokenDecodificado.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Administrador");
    }

    [Fact]
    public void CrearToken_UsuarioConsulta_AsignaRolSoloLectura()
    {
        // 1. Arrange
        var consulta = new Usuario
        {
            Id = 2,
            NombreUsuario = "consulta",
            Rol = "Consulta",
            PasswordHash = "hash_simulado"
        };

        // 2. Act
        string jwt = _tokenService.Crear(consulta);
        var tokenDecodificado = new JwtSecurityTokenHandler().ReadJwtToken(jwt);

        // 3. Assert
        Assert.Contains(tokenDecodificado.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Consulta");
    }

    [Fact]
    public void ModeloEquipo_ValoresPorDefecto_InicializaCorrectamente()
    {
        // Verifica que la entidad Equipo se instancie sin errores de referencia nula
        var equipo = new Equipo
        {
            Id = 10,
            Nombre = "Router Principal Cisco",
            DireccionMac = "00:40:0B:C1:23:45",
            Marca = "Cisco Systems",
            CategoriaId = 1
        };

        Assert.Equal("00:40:0B:C1:23:45", equipo.DireccionMac);
        Assert.Equal("Cisco Systems", equipo.Marca);
    }
}