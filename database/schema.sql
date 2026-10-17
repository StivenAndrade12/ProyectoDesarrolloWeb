-- Opcional: la API crea las tablas sola (EnsureCreated). Este script sirve como referencia / documentación.
CREATE DATABASE IF NOT EXISTS bitacora_db CHARACTER SET utf8mb4;
USE bitacora_db;

CREATE TABLE Usuarios (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  NombreUsuario VARCHAR(50) NOT NULL UNIQUE,
  PasswordHash LONGTEXT NOT NULL,
  Rol VARCHAR(20) NOT NULL
);

CREATE TABLE Categorias (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE Equipos (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  DireccionMac VARCHAR(17) NULL,
  Marca VARCHAR(100) NULL,
  CategoriaId INT NOT NULL,
  FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id) ON DELETE RESTRICT
);

CREATE TABLE Intervenciones (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  EquipoId INT NOT NULL,
  Fecha DATETIME NOT NULL,
  FallaReportada VARCHAR(1000) NOT NULL,
  ConfiguracionAplicada VARCHAR(4000) NOT NULL,
  FOREIGN KEY (EquipoId) REFERENCES Equipos(Id) ON DELETE CASCADE
);
