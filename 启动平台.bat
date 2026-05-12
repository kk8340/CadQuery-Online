@echo off
title CadQuery 建模平台
echo ========================================
echo    CadQuery 在线建模平台
echo ========================================
echo.
echo 正在启动服务器...
echo.
start http://localhost:8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
