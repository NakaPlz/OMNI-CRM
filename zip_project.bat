@echo off
echo Zipping project for deployment...

:: Create build directory if it doesn't exist
if not exist "deploy" mkdir deploy

:: Zip server (excluding node_modules)
echo Zipping Server...
tar -cvf deploy/risut-crm.tar --exclude=node_modules --exclude=.git server client

echo.
echo Compression complete!
echo Upload the file "deploy/risut-crm.tar" to your VPS.
echo.
echo Example SCP command:
echo scp deploy/risut-crm.tar user@your-vps-ip:/var/www/
pause
