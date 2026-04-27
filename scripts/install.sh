#!/bin/bash

# Prism 一键安装脚本
# 适用于 macOS 和 Linux

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Prism 安装脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检测操作系统
OS="$(uname -s)"
case "$OS" in
  Darwin*)  OS="macos" ;;
  Linux*)   OS="linux" ;;
  *)        echo -e "${RED}不支持的操作系统: $OS${NC}" && exit 1 ;;
esac

echo -e "${GREEN}检测到操作系统: $OS${NC}"

# 检查 Node.js
echo ""
echo -e "${YELLOW}[1/4] 检查 Node.js...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}未检测到 Node.js，请先安装 Node.js 18.0 或更高版本${NC}"
  echo ""
  echo -e "${YELLOW}安装 Node.js 的方法:${NC}"
  echo ""
  if [ "$OS" = "macos" ]; then
    echo "  方式一 (推荐): 使用 Homebrew"
    echo "    brew install node"
    echo ""
    echo "  方式二: 官网下载安装包"
    echo "    访问 https://nodejs.org/ 下载 LTS 版本"
  else
    echo "  方式一 (推荐): 使用包管理器"
    echo "    Ubuntu/Debian: sudo apt install nodejs npm"
    echo "    CentOS/RHEL:   sudo yum install nodejs npm"
    echo ""
    echo "  方式二: 官网下载安装包"
    echo "    访问 https://nodejs.org/ 下载 LTS 版本"
  fi
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Node.js 版本过低: $(node -v)${NC}"
  echo -e "${RED}需要 Node.js 18.0 或更高版本${NC}"
  exit 1
fi

echo -e "${GREEN}Node.js 版本: $(node -v) ✓${NC}"

# 检查 npm
echo ""
echo -e "${YELLOW}[2/4] 检查 npm...${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}未检测到 npm${NC}"
  exit 1
fi

echo -e "${GREEN}npm 版本: $(npm -v) ✓${NC}"

# 安装 OpenCLI
echo ""
echo -e "${YELLOW}[3/4] 安装 OpenCLI...${NC}"

if command -v opencli &> /dev/null; then
  echo -e "${GREEN}OpenCLI 已安装 ✓${NC}"
else
  echo -e "${BLUE}正在安装 OpenCLI...${NC}"
  npm install -g @jackwener/opencli
  
  if command -v opencli &> /dev/null; then
    echo -e "${GREEN}OpenCLI 安装成功 ✓${NC}"
  else
    echo -e "${RED}OpenCLI 安装失败${NC}"
    echo -e "${YELLOW}请手动安装: npm install -g @jackwener/opencli${NC}"
    exit 1
  fi
fi

# 安装 Prism
echo ""
echo -e "${YELLOW}[4/4] 安装 Prism...${NC}"

if command -v prism &> /dev/null; then
  echo -e "${GREEN}Prism 已安装 ✓${NC}"
else
  echo -e "${BLUE}正在安装 Prism...${NC}"
  npm install -g @manuelm02/prism-cli
  
  if command -v prism &> /dev/null; then
    echo -e "${GREEN}Prism 安装成功 ✓${NC}"
  else
    echo -e "${RED}Prism 安装失败${NC}"
    echo -e "${YELLOW}请手动安装: npm install -g @manuelm02/prism-cli${NC}"
    exit 1
  fi
fi

# 安装完成
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}   安装完成!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}重要: 还需要安装 OpenCLI 浏览器扩展${NC}"
echo ""
echo -e "${BLUE}安装步骤:${NC}"
echo "  1. 访问 https://github.com/jackwener/OpenCLI/releases"
echo "  2. 下载最新的 opencli-extension-v{version}.zip"
echo "  3. 解压下载的文件"
echo "  4. 打开 Chrome，访问 chrome://extensions"
echo "  5. 启用右上角的「开发者模式」"
echo "  6. 点击「加载已解压的扩展程序」"
echo "  7. 选择解压后的文件夹"
echo ""
echo -e "${BLUE}使用方法:${NC}"
echo "  运行 prism 命令启动工具"
echo "  浏览器会自动打开 http://localhost:3000"
echo ""
echo -e "${BLUE}更多信息请查看 README.md${NC}"