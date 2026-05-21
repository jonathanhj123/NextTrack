@echo off
title NextTrack Launcher

:menu
cls
echo =========================
echo        NEXTTRACK
echo =========================
echo.
echo 1. Run dev-server
echo 2. Run create-db
echo 3. Exit
echo.

set /p choice=Choose option: 

if "%choice%"=="1" goto devserver
if "%choice%"=="2" goto createdb
if "%choice%"=="3" exit

echo.
echo Invalid choice.
pause
goto menu


:devserver
cls
echo Running dev-server...
echo.

call npm run dev-server

echo.
echo =========================
echo dev-server exited.
echo =========================
pause
goto menu


:createdb
cls
echo Running create-db...
echo.

call npm run create-db

echo.
echo =========================
echo create-db exited.
echo =========================
pause
goto menu