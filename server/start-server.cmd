@echo off
setlocal
cd /d "%~dp0"
echo Iniciando Fox2Txt em http://127.0.0.1:8765 ...
node server.js
if errorlevel 1 (
  echo.
  echo O servidor terminou com erro. Pressione uma tecla para fechar.
  pause >nul
)
endlocal
