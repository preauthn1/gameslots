#!/bin/bash

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，正在安装..."
    # 在这里添加安装 Node.js 的命令，根据你的操作系统
    # 示例：使用 nvm 安装 Node.js
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    source ~/.nvm/nvm.sh
    nvm install --lts
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 启动应用
pm2 start ../server/index.mjs --name "nuxt-app" --watch

echo "Nuxt 3 应用已启动！"
