# Bitácora de Configuración de Redes y Equipos

Aplicación web cliente-servidor: **React + Vite + Tailwind** (frontend), **C# .NET 8 Web API** (backend), **MySQL** (base de datos) y API externa **MAC Lookup** (api.maclookup.app).

## Requisitos
- .NET SDK 8
- Node.js 18+
- MySQL 8 en ejecución

## 1. Backend
1. En `backend/appsettings.json` cambia `TU_PASSWORD` por la contraseña de tu MySQL.
2. Ejecuta:
   ```
   cd backend
   dotnet restore
   dotnet run
   ```
3. La API queda en http://localhost:5000 (Swagger en `/swagger`). Al iniciar crea la base `bitacora_db`, las tablas y dos usuarios.

## 2. Frontend
```
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173. Si la API usa otro puerto, edita `frontend/.env`.

## Usuarios iniciales
| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador Técnico | `admin` | `Admin123*` |
| Usuario de Consulta (solo lectura) | `consulta` | `Consulta123*` |

El sistema arranca sin datos (Zero-data): primero se crean categorías, luego equipos y después intervenciones.

## Cumplimiento de la propuesta
| Propuesta | Dónde está |
|---|---|
| Gestión de inventario (CRUD equipos) | `EquiposController`, `pages/Equipos.jsx`, `EquipoForm.jsx` |
| Detección automática por MAC | `macLookup.js` + `EquipoForm.jsx` (al salir del campo MAC) |
| Registro de intervenciones (CRUD) | `IntervencionesController`, `IntervencionForm.jsx` |
| Historial cronológico por equipo | `pages/EquipoDetalle.jsx` (línea de tiempo, más reciente primero) |
| Gestión de categorías | `CategoriasController`, `pages/Categorias.jsx` |
| Dos roles (Administrador / Consulta) | JWT + `[Authorize(Roles=...)]` en la API; botones ocultos para solo lectura |
| API RESTful C# .NET Core + MySQL | `backend/` (EF Core + Pomelo) |
| Base de datos relacional normalizada | `Models/`, `Data/AppDbContext.cs`, `database/schema.sql` |

## Endpoints
`POST /api/auth/login` · `GET|POST /api/categorias` · `PUT|DELETE /api/categorias/{id}` · `GET|POST /api/equipos` · `GET|PUT|DELETE /api/equipos/{id}` · `GET|POST /api/intervenciones` · `GET|PUT|DELETE /api/intervenciones/{id}`
