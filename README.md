# Supabase 保活脚本

定期向 Supabase 发送请求，防止连接超时。

## 配置步骤
1. 克隆仓库：`git clone <仓库地址>`
2. 进入目录：`cd supabase-keepalive`
3. 复制环境变量模板：`cp .env.example .env`，并填写真实值
4. 安装依赖（如果后续添加了依赖）：`npm install`

## 运行脚本
```bash
node scripts/ping-supabase.js
