@echo off
echo Starting RiSut's Omni-CRM...

:: Start Server
echo Starting Backend Server...
start "RiSut CRM Server" cmd /k "cd server && npm start"

:: Start Client
echo Starting Frontend Client...
start "RiSut CRM Client" cmd /k "cd client && npm run dev"

:: Wait for servers to initialize
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

:: Open Browser
echo Opening Application...
start http://localhost:5173

echo Done! You can minimize the command windows, but do not close them.
pause
