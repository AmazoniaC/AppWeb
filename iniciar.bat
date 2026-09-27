@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Amazonia Concrete ERP

echo.
echo  ==============================================
echo    Amazonia Concrete ERP - puesta en marcha
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  No se encontro Node.js. Instalalo desde https://nodejs.org ^(version LTS^)
  echo  y vuelve a abrir este archivo.
  pause
  exit /b 1
)

if not exist package.json (
  echo  Este archivo debe estar dentro de la carpeta del proyecto AppWeb,
  echo  junto a package.json.
  pause
  exit /b 1
)

if not exist .env (
  echo  Primera vez: vamos a crear el archivo de configuracion .env
  echo.
  set /p CLAVE= Escribe la contrasena del usuario postgres de PostgreSQL y pulsa Enter: 
  set SECRETO=
  for /l %%i in (1,1,8) do set SECRETO=!SECRETO!!RANDOM!!RANDOM!
  (
    echo DATABASE_URL="postgresql://postgres:!CLAVE!@localhost:5432/amazonia_erp?schema=public"
    echo SESSION_SECRET="!SECRETO!"
  ) > .env
  echo  Archivo .env creado.
  echo.
)

echo  [1/4] Instalando dependencias ^(la primera vez tarda unos minutos^)...
call npm install --no-fund --no-audit
if errorlevel 1 goto error

echo.
echo  [2/4] Creando la base de datos y sus tablas...
call npx prisma migrate deploy
if errorlevel 1 goto errorbd

echo.
echo  [3/4] Cargando usuarios y datos de ejemplo...
call npx prisma db seed
if errorlevel 1 goto error

echo.
echo  [4/4] Arrancando la aplicacion. No cierres esta ventana mientras la uses.
echo.
echo  Entra con:  admin@amazonia.local   /   Amazonia2026!
echo.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
goto fin

:errorbd
echo.
echo  No se pudo conectar a PostgreSQL. Revisa que PostgreSQL este encendido y
echo  que la contrasena sea correcta. Para escribirla de nuevo, borra el archivo
echo  .env de esta carpeta y vuelve a abrir iniciar.bat.
pause
exit /b 1

:error
echo.
echo  Algo fallo. Toma una captura de esta ventana y enviasela a Claude.
pause
exit /b 1

:fin
endlocal
