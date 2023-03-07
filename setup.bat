@echo off
node --version > NUL

if errorlevel 1 (
    echo "nodejs is not installed"
    echo "go to http://nodejs.org/download/ and download the latest version"
    pause
    exit /b 1
)

npm i > NUL

deck_creator\setup.bat
card_creator\setup.bat
