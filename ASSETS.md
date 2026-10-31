# 原版素材与参考来源

2026-10-31，手机横屏战斗界面调整。

## 运行素材

来源为用户通过 TapTap 下载并授权分析的本地安装包：

- `downloads/狗狗呼叫喵星-3.0.53-TapTap.apk`
- 版本 3.0.53，包名 `com.joyclap.kfnghjmt`。
- 安装包 MD5：`3034b7c7bed25ae3ff26348b58039232`。

通过 UnityPy（资源读取库）只读提取 Texture2D（纹理）与 NGUI（界面系统）图集中的切片。图集使用自身的 `mSprites` 坐标，不从宣传截图猜测裁切。提取工作文件保存在 `asset-work/`，运行时只需要 `dist/assets/original/`。

- 树林背景、地面、树干、枝条、光效均为包内场景纹理。
- 六个角色使用包内静态插图，未恢复其原版骨骼动画。
- 回合标牌、头像边框、设置、重开、退出、纸质面板、按钮等来自原版图集。
- `rope-strip.png` 从原绳索纹理 `zrope00_0` 的 `(25,16)-(37,112)` 有效条带中提取，避免把大幅透明留白缩进线宽。
- `claw-shot.png` 为原版 `cat_shot` 纹理；弹药效果仍遵循现有原型数值。
- 具体原始名称和坐标见 `asset-work/used-assets.json` 与 `asset-work/sprites.json`。

没有从安装包执行业务脚本。当前发布目录没有加入外部图片请求。

## 视觉参考

主要战斗界面参考为 `reference/guide-7.png`，437×223 像素，来自：

https://www.ddooo.com/softdown/195077.htm

页面原图：

https://img.ddooo.com/uppic/210423/202104231451515229.jpg

另保存 TapTap 官方应用页提供的宣传截图，作为原版美术语言参考：

https://www.taptap.cn/app/207437

宣传截图不能用来确定完整战斗界面。该战斗参考早于当前安装包版本，且分辨率较低；当前只还原战斗画面的布局和美术素材，不据此宣称原版所有状态或每个像素已经一致。
