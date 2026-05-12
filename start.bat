@echo off
echo ========================================
echo   CadQuery 在线建模平台
echo ========================================
echo.

echo [1/2] 检查 Python 依赖...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo 正在安装依赖...
    pip install -r requirements.txt
) else (
    echo 依赖已安装
)

echo.
echo [2/2] 启动服务...
echo 服务将在 http://localhost:8000 启动
echo 请在浏览器中打开该地址
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

cd backend
python main.py
