# sungodslotgame
slot游戏前端 
项目备注：老虎机游戏
前端搭建：Vue3 + PixiJS + TypeScript + Vite
-- 用pixi做布局，用gsap做动画
<!-- +Vant4 按需自动导入 （备用-暂时没用上） -->
启动命令：npm run dev
打包命令：npm run build

备注：两套前端，一套 接口传值1，一套接口传值2，
传值1：普通游戏，正如我现在这套代码游戏。
传值2,:类似消消乐游戏，选中后会自动消除，消除后其余的图标会落下来不上消失的缺口。
倍率：默认选中1倍，中奖一次是1倍，2次是2倍，3次是3倍，以此类推。倍率的数字，会在后端接口里面获取，然后在前端显示出来。

--- 服务端控制免费局概率，前端无法干预。加一个开发调试快捷键，方便测试转场效果。
测试流程：
1. 进入游戏后按 G → 卷轴上方出现 FREE SPINS: 10 指示器
--现在按 'G' 的行为改为 toggle：
- 有免费次数时 → 清零，指示器消失
- 无免费次数时 → 设为 10，指示器显示
2. 点击 Spin → 会以 use_free_spin: true 发请求（不扣余额）
3. 按 F → 直接播放转场视频动画（全屏 transition_750px.mp4，4秒后自动结束并显示指示器）

-- 两个游戏不同的效果
老虎机游戏有连线，可以同时多条
麻将游戏有，消消乐效果与倍数

positions: [[行, 列], [2, 1]]，

# 背景人物动效，有卡顿的原因及解决方法：能解决的方式 ：修改素材本身 — 让 tile049 的画面接近 tile000（比如让动画师调整最后一帧的 pose，使循环首尾帧视觉连贯）。
-- 从 spritesheet JSON 分析：

tile000 和 tile049 的位置 ：

帧 图集坐标 位置 tile000 (0, 0) 左上角，动画起始帧 tile049 (2800, 2152) 右下角，动画末尾帧

它们在整个 3600×2690 图集上处于对角线两端，分别是动画的 起始 pose 和 结束 pose 。一个完整的待机动画序列从 tile000 开始逐渐变化到 tile049，循环时 tile049 瞬间切回 tile000。

此外还有 tile041 → tile048 的 6 帧缺口 （tile042~047 缺失），tile048 紧接着 tile041 也可能存在不连贯。

结论 ：顿变的根因是素材本身首尾帧视觉不连贯，代码层面已无优化空间。要彻底解决需要让美术调整 tile049 的画面，使其与 tile000 的 pose/色调接近，形成无缝循环。

## 项目结构

```
sungodslotgame/
├── src/                                  # 源码目录
│   ├── api/                              # 接口层（fetch 封装 + 各业务请求）
│   │   ├── client.ts                     # 请求封装：鉴权、超时、错误处理
│   │   ├── auth.ts                       # 登录
│   │   ├── wallet.ts                     # 余额查询
│   │   ├── games.ts                      # 游戏详情
│   │   ├── game-spin.ts                  # 旋转 / 免费局状态 / 历史
│   │   ├── types.ts                      # 接口类型定义
│   │   └── index.ts                      # API 统一出口
│   ├── assets/                           # 静态资源
│   │   ├── audio/licensed/               # 已授权音效（mp3 / wav）
│   │   ├── gif/                          # 转场视频（transition_750px.mp4）
│   │   ├── images/                       # 图片资源（webp / svg）
│   │   └── spritesheet/sungod-idle/      # 太阳神待机帧动画（json + webp）
│   ├── component/
│   │   ├── modules/                      # 游戏核心逻辑与渲染
│   │   │   ├── GameLogic.ts              # 游戏逻辑基类（旋转/倍率/免费局/大奖）
│   │   │   ├── SlotGameLogic.ts          # 老虎机逻辑（gameId = 1）
│   │   │   ├── MahjongGameLogic.ts       # 麻将胡了逻辑（gameId = 2）
│   │   │   ├── GameRenderer.ts           # 渲染器基类（PixiJS 布局）
│   │   │   ├── SlotGameRenderer.ts       # 老虎机渲染器（中奖连线高亮）
│   │   │   ├── MahjongGameRenderer.ts    # 麻将渲染器（爆炸 / 补位动画）
│   │   │   ├── MultiplierPanel.ts        # 倍率面板
│   │   │   ├── ResponsiveManager.ts      # 响应式适配（视口缩放）
│   │   │   ├── useGame.ts                # 游戏 Composable（装配逻辑与 API）
│   │   │   ├── loadingState.ts           # 全局加载状态
│   │   │   ├── audio/
│   │   │   │   ├── GameSound.ts          # 音效（Web Audio）
│   │   │   │   └── GameMusic.ts          # 背景音乐
│   │   │   └── sungod_anim/
│   │   │       └── SungodAnimation.ts    # 太阳神待机动画
│   │   └── views/                        # 游戏相关视图
│   │       ├── GamePage.vue              # 游戏主页面
│   │       ├── GameSettings.vue          # 设置面板
│   │       ├── GameHistory.vue           # 历史记录
│   │       └── HowToPlay.vue             # 玩法说明
│   ├── router/
│   │   └── index.ts                      # 路由配置
│   ├── utils/                            # 工具函数
│   │   └── useMoney.ts                   # 金额转换工具
│   ├── views/                            # 页面视图
│   │   ├── login.vue                     # 登录
│   │   ├── home.vue                      # 首页
│   │   ├── lobby.vue                     # 大厅
│   │   ├── play.vue                      # 入口（第三方嵌入入口）
│   │   ├── slot.vue                      # 老虎机入口
│   │   └── mahjong.vue                   # 麻将入口
│   ├── App.vue                           # 根组件（加载态）
│   └── main.ts                           # 应用入口
├── index.html                            # HTML 模板
├── vite.config.ts                        # Vite 配置（代理、vendor 分包）
├── tsconfig.json                         # TS 配置（含路径别名 @ → src）
├── tsconfig.app.json                     # 应用侧 TS 配置
├── tsconfig.node.json                    # 构建工具侧 TS 配置
├── .env.development                      # 开发环境变量
├── .env.production                       # 生产环境变量
└── package.json                          # 依赖与脚本
```