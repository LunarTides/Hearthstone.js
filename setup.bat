@echo off
bun --version > NUL

if errorlevel 1 (
    echo "Bun is not installed"
    echo "go to https://bun.sh and download the latest version"
    pause
    exit /b 1
)

bun install
