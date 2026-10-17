using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bitacora.Api.Controllers;

[ApiController]
[Route("api/mac")]
[Authorize]
public class MacController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    public MacController(IHttpClientFactory http) => _http = http;

    // GET api/mac?direccion=00:1A:11:00:22:33
    // Consume la API externa MAC Lookup (api.maclookup.app) desde el servidor.
    [HttpGet]
    public async Task<IActionResult> Buscar([FromQuery] string direccion)
    {
        if (string.IsNullOrWhiteSpace(direccion))
            return BadRequest(new { mensaje = "Falta la dirección MAC." });

        try
        {
            var client = _http.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(8);

            var res = await client.GetAsync(
                $"https://api.maclookup.app/v2/macs/{Uri.EscapeDataString(direccion.Trim())}");

            if ((int)res.StatusCode == 429 || (int)res.StatusCode == 409)
                return StatusCode(429, new { mensaje = "Límite de consultas alcanzado. Escribe la marca manualmente." });

            if (!res.IsSuccessStatusCode)
                return StatusCode(502, new { mensaje = "El servicio de fabricantes no respondió correctamente." });

            using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
            var root = doc.RootElement;

            var encontrado = root.TryGetProperty("found", out var f) && f.GetBoolean();
            var fabricante = root.TryGetProperty("company", out var c) ? c.GetString() : null;

            return Ok(new { encontrado = encontrado && !string.IsNullOrWhiteSpace(fabricante), fabricante });
        }
        catch (Exception)
        {
            return StatusCode(502, new { mensaje = "No se pudo conectar con el servicio de fabricantes." });
        }
    }
}