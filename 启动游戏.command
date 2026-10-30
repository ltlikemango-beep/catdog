#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js，请先安装 Node.js 18 或更新版本。"
  read -r -p "按回车关闭窗口……"
  exit 1
fi
if curl --max-time 2 -fsS http://127.0.0.1:4173/ 2>/dev/null | head -c 600 | grep -q '毛球派对'; then
  open 'http://127.0.0.1:4173/'
  exit 0
fi
node server.mjs &
game_server_pid=$!
trap 'kill "$game_server_pid" 2>/dev/null' EXIT INT TERM
for attempt in 1 2 3 4 5; do
  if curl --max-time 1 -fsS http://127.0.0.1:4173/ >/dev/null 2>&1; then
    open 'http://127.0.0.1:4173/'
    echo "游戏已打开。关闭本终端窗口即可停止服务。"
    wait "$game_server_pid"
    exit $?
  fi
  sleep 1
done
echo "启动未成功，请检查 4173 端口是否被其他程序占用。"
read -r -p "按回车关闭窗口……"
