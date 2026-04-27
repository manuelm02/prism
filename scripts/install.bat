@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ======================================
echo    Prism 安装脚本
echo ======================================
echo.

:: 检查 Node.js
echo [1/4] 检查 Node.js...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18.0 或更高版本
    echo.
    echo 安装方法:
    echo   访问 https://nodejs.org/ 下载 LTS 版本安装包
    echo.
    pause
    exit /b 1
)

for /f "tokens=2 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i

if %NODE_MAJOR% lss 18 (
    echo [错误] Node.js 版本过低
    echo 需要 Node.js 18.0 或更高版本
    pause
    exit /b 1
)

for /f %%i in ('node -v') do echo Node.js 版本: %%i ✓

:: 检查 npm
echo.
echo [2/4] 检查 npm...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm
    pause
    exit /b 1
)

for /f %%i in ('npm -v') do echo npm 版本: %%i ✓

:: 安装 OpenCLI
echo.
echo [3/4] 安装 OpenCLI...

where opencli >nul 2>nul
if %errorlevel% equ 0 (
    echo OpenCLI 已安装 ✓
) else (
    echo 正在安装 OpenCLI...
    npm install -g @jackwener/opencli
    
    where opencli >nul 2>nul
    if %errorlevel% equ 0 (
        echo OpenCLI 安装成功 ✓
    ) else (
        echo [警告] OpenCLI 安装可能失败
        echo 请手动安装: npm install -g @jackwener/opencli
    )
)

:: 安装 Prism
echo.
echo [4/4] 安装 Prism...

where prism >nul 2>nul
if %errorlevel% equ 0 (
    echo Prism 已安装 ✓
) else (
    echo 正在安装 Prism...
    npm install -g @manuelm02/prism-cli
    
    where prism >nul 2>nul
    if %errorlevel% equ 0 (
        echo Prism 安装成功 ✓
    ) else (
        echo [警告] Prism 安装可能失败
        echo 请手动安装: npm install -g @manuelm02/prism-cli
    )
)

:: 安装完成
echo.
echo ======================================
echo    安装完成!
echo ======================================
echo.
echo [重要] 还需要安装 OpenCLI 浏览器扩展
echo.
echo 安装步骤:
echo   1. 访问 https://github.com/jackwener/OpenCLI/releases
echo   2. 下载最新的 opencli-extension-v{version}.zip
echo   3. 解压下载的文件
echo   4. 打开 Chrome，访问 chrome://extensions
echo   5. 启用右上角的「开发者模式」
echo   6. 点击「加载已解压的扩展程序」
echo   7. 选择解压后的文件夹
echo.
echo 使用方法:
echo   运行 prism 命令启动工具
echo   浏览器会自动打开 http://localhost:3000
echo.
echo 更多信息请查看 README.md
echo.
pause