# 换电脑运行与服务器部署

## 换电脑运行

安装 Node.js 18 或更新版本及 Git，然后运行：

```bash
git clone https://github.com/ltlikemango-beep/catdog.git
cd catdog
npm test
npm start
```

浏览器访问 `http://127.0.0.1:4173/`。项目没有第三方运行依赖，无需执行安装或构建命令。私有仓库需要先在新电脑登录有访问权限的 GitHub 账号。

## 部署方式一：静态网站

将仓库中的 `dist/` 目录作为网站根目录，首页为 `index.html`，无需构建。托管服务须正确提供 `.js`、`.mjs` 的 JavaScript 内容类型。可配置域名与 HTTPS 后分享游戏网址。

## 部署方式二：Node.js 服务

在 Linux 或 macOS 服务器上进入仓库目录，运行：

```bash
HOST=0.0.0.0 PORT=8080 npm start
```

先通过 `http://服务器地址:8080/` 测试。公网访问还需放行服务器防火墙或云安全组对应端口。正式分享时可使用托管平台进程管理或系统服务保持运行，并配置域名、反向代理与 HTTPS；关闭前台终端会停止当前服务。

`PORT` 指定监听端口，`HOST` 指定监听地址，默认仅本机可访问。也支持 `npm start -- --host=0.0.0.0`。

## 获取后续更新

工作区没有未保存修改时，在仓库目录运行：

```bash
git pull --ff-only
npm test
```

Node.js 部署需重启服务；静态部署需重新发布 `dist/`。本仓库上传并不会自动开通网站。

本版支持同一设备轮流操作。部署到公网后每个人可打开游戏，但不具备跨设备房间联机功能。
