@echo off
echo Starting MongoDB...
echo Make sure you have MongoDB installed!
echo.

REM Try different common MongoDB paths
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
) else (
    echo MongoDB not found in common paths
    echo Please install MongoDB or run: mongod
    pause
)