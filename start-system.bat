@echo off
echo Starting AI Lifestyle Coach System...

echo.
echo 1. Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath data"

timeout /t 3

echo.
echo 2. Starting Backend Server...
cd backend
start "Backend" cmd /k "npm start"

timeout /t 3

echo.
echo 3. Starting Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo System started! 
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause