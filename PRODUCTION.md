# 猫狗同屏作战：生产部署约定

仓库 `https://github.com/ltlikemango-beep/catdog`，分支 `main`。本次为原版素材的手机横屏界面，保留同设备双人轮流操作，不支持跨设备联机。完整递归发布 `dist/`，包含全部 `assets/` 图片；无需构建或安装 npm 依赖。

## 服务器与路径

- 腾讯云轻量服务器 Ubuntu-kS9S，实例 `lhins-qyy9192a`，北京，Ubuntu 24.04，公网 IP `81.70.36.164`。
- 只使用现有登录的腾讯云控制台文件管理、执行命令和终端。缺少登录或权限时明确告知用户；不得重置密码、添加登录密钥或调整防火墙。
- 最终入口 `http://81.70.36.164/catdog/`。当前为 HTTP，未经实际配置验证不得声称支持 HTTPS。
- 发布目录 `/opt/web-games/catdog/releases/<完整 commit SHA>/`，软链接 `/opt/web-games/catdog/current`。
- 主配置 `/etc/nginx/sites-available/wanba-giant-axe`，路由 `/etc/nginx/snippets/web-games-20261030.conf`。
- 发布目录直接放 `dist/` 内文件，入口为 `current/index.html`，不能多套一层 `dist/`。
- 首次部署提交 `bd0f9b4e56cd4f1a3a7655ef5054d455737e8261` 只作历史记录，不代表当前线上版本。

## 每次发布顺序

1. 阅读 `AGENTS.md`（若存在）、`DEPLOY.md`、`VALIDATION.md`，检查工作区并保留无关改动。
2. `npm test` 后通过 `npm start` 验证实际操作。默认本地端口 4173，支持 `PORT`、`HOST` 覆盖；生产使用已有 Nginx 静态服务，不新增 Node.js 进程。
3. 将相关改动提交并推送到 `main`，记录完整 SHA，只发布已经推送的明确提交。对同一份 `dist/` 打包并生成完整 SHA256 清单。
4. 实查 `readlink -f /opt/web-games/catdog/current`、现有路由、Nginx 和斧子服务状态；记录实际旧目录并准备相应回滚命令，不能从历史 SHA 推断。
5. 上传后校验压缩包 SHA256，解压到此前不存在的 `releases/<SHA>/`；核对全部文件摘要及 `www-data` 读取权限。不直接修改 current 内文件，不覆盖旧发布目录。
6. 同一文件系统内创建临时软链接，以 `mv -Tf` 原子替换 current。静态更新无需重启斧子服务。
7. 只有必要时才修改 Nginx；先备份，`nginx -t` 通过后才 reload，检查失败恢复配置。保留现有 `no-cache` 和 JavaScript MIME，图片应为正确的 PNG 类型。
8. 从公网验收，失败立即恢复实际旧目录，再验证恢复结果。

原子切换示例：

```bash
OLD_RELEASE=$(readlink -f /opt/web-games/catdog/current)
test -f "$NEW_RELEASE/index.html"
ln -s "$NEW_RELEASE" /opt/web-games/catdog/current.next
mv -Tf /opt/web-games/catdog/current.next /opt/web-games/catdog/current
```

回滚示例：

```bash
ln -s "$OLD_RELEASE" /opt/web-games/catdog/current.rollback
mv -Tf /opt/web-games/catdog/current.rollback /opt/web-games/catdog/current
```

变量必须使用本次实查和验证后的真实目录。临时链接名已存在时应检查并另选唯一名称，不盲目覆盖。发布日志必须给出不含占位变量、可直接执行的回滚命令。

## 验收与记录

- 全部发布文件正常、摘要与提交一致，JS/MJS 类型正确，PNG 为图片类型，全部保留 `no-cache`。
- `/catdog`、`/bug` 跳至带末尾斜线入口；缺失资源返回 404，不能回退到首页 HTML。
- 实测横屏选角、瞄准助手、弹药、角度力度、发射、回合推进、拖拽、设置、重开；检查竖屏提示与预览。
- 检查桌面和手机模拟尺寸，不得将桌面模拟描述为真实手机验收。
- 保留公交、斧子、斧子服务和排行榜数据。公交浏览器存档不受本次发布影响；只读验证排行榜，不提交测试成绩。
- 每次发布在独立日志中记录北京时间、完整 SHA、新旧目录及 current、修改内容、测试与公网结果、配置备份位置、直接回滚命令、未验证事项。
- 不把密码、Token、私钥写入 Git、文档或聊天。

素材来源见 `ASSETS.md`；当前原型不应描述为完整原版复刻。具体生产结果以本次部署日志为准。
