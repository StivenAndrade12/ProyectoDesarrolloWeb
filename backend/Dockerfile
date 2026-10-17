# Etapa 1: Compilación (SDK de .NET 8)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo de proyecto y restaurar dependencias
COPY ["*.csproj", "./"]
RUN dotnet restore

# Copiar el resto del código y compilar en modo Release
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Ejecución (Imagen ligera de ASP.NET Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway asigna un puerto dinámico en la variable PORT, o usamos 8080 por defecto
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

# IMPORTANTE: Si tu archivo .csproj no se llama "backend.csproj", 
# cambia "backend.dll" por el nombre exacto de tu .csproj terminado en .dll
ENTRYPOINT ["dotnet", "Bitacora.Api.dll"]