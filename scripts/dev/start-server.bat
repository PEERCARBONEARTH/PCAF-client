@echo off
cd /d "%~dp0"
echo Starting PCAF RAG Server...
node backend/server.js
pause