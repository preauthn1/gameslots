玩家端 API 接口文档（REST）
版本：v1.1
Base Path：/api/v1
协议：HTTPS（生产） / HTTP（本地）
数据格式：JSON
字符编码：UTF-8
本文档描述用户前端（Player）所需的全部 HTTP 接口，供平台自营用户与第三方平台接入用户（经 game_token 进入）使用。
第三方服务端 Open API（获取 game_url、商户回调等）见 GameProviderAPI.md。

目录

1. 概述
2. 通用约定
3. 错误码
4. 接口一览
5. 健康检查
6. 认证 Auth
7. 用户 User
8. 游戏 Games
9. 钱包 Wallet
10. 游戏局 Game / Spin
11. 对接说明
12. 第三方用户接入（Game Provider）

13. 概述
    平台提供老虎机（Slot）游戏能力，包括：

- 用户注册 / 登录 / 密码重置（内部商户 platform 等）
- game_token 兑换会话（第三方商户用户，不经注册/登录）
- 游戏大厅与游戏配置拉取
- 钱包余额与流水（内部：本地钱包；第三方：商户回调同步）
- Spin 下注、派奖、免费局、奖池
- 注单历史与回放
  所有业务接口（除健康检查、公开游戏列表、auth/game-token 外）在需要登录时通过 JWT Bearer Token 鉴权。

2. 通用约定
   2.1 Base URL
   环境 Base URL
   本地 http://127.0.0.1:83/api/v1
   生产 https://{your-api-domain}/api/v1
   完整请求示例：
   GET https://testgameapi.pubmaticbr.app/api/v1/games HTTP/1.1
   Accept: application/json
   2.2 统一响应结构
   {
   "code": 0,
   "msg": "success",
   "data": {}
   }
   字段 类型 说明
   code integer 0 表示成功；非 0 为业务错误码
   msg string 提示信息或 i18n key
   data object \ array \ null 业务数据；无数据时为 null
   HTTP 状态码与 code 对应关系见 错误码。
   2.3 请求头
   Header 必填 适用 说明
   Content-Type 是 POST / PUT application/json
   Accept 推荐 全部 application/json
   Authorization 条件 需登录接口 Bearer {access_token}
   X-Merchant-Code 条件 注册、忘记密码 商户编码，默认 platform
   Accept-Language 否 全部 zh-CN / en-US，影响错误文案
   X-Request-Id 否 全部 链路追踪 UUID，建议传入
   2.4 分页
   列表类接口支持 Query 参数：
   参数 类型 默认 约束
   page integer 1 ≥ 1
   page_size integer 20 1 ~ 100
   分页响应 data 结构：
   {
   "list": [],
   "pagination": {
   "page": 1,
   "page_size": 20,
   "total": 156,
   "total_pages": 8
   }
   }
   2.5 金额与时间
   项目 约定
   金额 整数，单位：分（1000 = 10.00 元）
   时间 ISO 8601（如 2026-06-18T14:04:47+08:00）或 Y-m-d H:i:s
   2.6 静态资源 URL
   cover_url、image_url 等字段可能为：

- 相对路径：/uploads/game-covers/1/xxx.jpg
- 绝对 URL：https://gamex5.s3.ap-south-1.amazonaws.com/uploads/...
  客户端应原样使用 HTTPS 绝对地址；相对路径需拼接 API 静态资源域名。

3. 错误码
   code HTTP 说明
   0 200 成功
   40001 400 参数校验失败
   40002 400 投注金额不在允许档位
   40100 401 未登录或 Token 无效
   40101 401 Token 过期
   40300 403 无权限
   40301 403 账号已冻结
   40400 404 资源不存在
   40901 409 幂等重复请求（返回首次结果）
   42201 422 余额不足
   42202 422 游戏不可用
   42203 422 免费局不可用
   42204 422 商户结算失败（第三方用户 Spin；响应不含 grid）
   42301 423 操作过于频繁（并发锁）
   50000 500 服务器内部错误
   50301 503 游戏维护中
   错误响应示例：
   {
   "code": 42201,
   "msg": "error.insufficient_balance",
   "data": null
   }

4. 接口一览
   方法 路径 认证 说明
   GET /health 否 健康检查
   POST /auth/register 否 注册
   POST /auth/login 否 登录
   POST /auth/forgot-password 否 申请重置密码
   POST /auth/reset-password 否 重置密码
   POST /auth/game-token 否 第三方 game_token 换 JWT
   GET /games/categories 否 游戏分类
   GET /games 否 游戏列表
   GET /games/{id} 否 游戏详情
   GET /user/profile 是 当前用户资料
   PUT /user/profile 是 更新资料
   PUT /user/password 是 修改密码
   GET /wallet/balance 是 钱包余额
   GET /wallet/logs 是 钱包流水
   GET /wallet/game-records 是 全部游戏注单摘要
   POST /game/{game_id}/spin 是 执行 Spin
   GET /game/{game_id}/history 是 指定游戏 Spin 历史
   GET /game/replay/{spin_id} 是 Spin 回放
   POST /game/{game_id}/buy-free-spin 是 购买免费局套餐
   GET /game/{game_id}/free-spin-state 是 免费局状态

5. 健康检查
   GET /health
   检查 API 服务是否可用。
   认证：不需要
   请求参数：无
   响应 data
   {
   "status": "ok",
   "service": "slot-platform-api",
   "time": "2026-06-18T14:00:00+08:00"
   }

6. 认证 Auth
   POST /auth/register
   注册新用户，自动创建钱包（余额 0）。
   认证：不需要
   请求头
   Header 必填 说明
   X-Merchant-Code 否 商户编码，默认 platform
   请求体
   字段 类型 必填 约束 说明
   username string 是 3~64 字符 登录名
   password string 是 8~64 字符 密码
   nickname string 否 — 昵称，默认同 username
   locale string 否 — 语言，默认 zh-CN
   请求示例
   {
   "username": "player01",
   "password": "SecurePass123",
   "nickname": "玩家一号",
   "locale": "zh-CN"
   }
   响应 data
   {
   "user": {
   "id": 1,
   "username": "player01",
   "nickname": "玩家一号",
   "locale": "zh-CN"
   },
   "access_token": "eyJhbGciOiJIUzI1NiIs...",
   "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
   "expires_in": 7200
   }
   字段 说明
   access_token 访问令牌，放入 Authorization: Bearer
   refresh_token 刷新令牌（当前版本未提供 refresh 接口，请重新登录）
   expires_in access_token 有效秒数
   常见错误：40001 用户名已存在；40400 商户不存在

POST /auth/login
用户登录。
认证：不需要
请求体
字段 类型 必填 说明
username string 是 用户名
password string 是 密码
注意：当前实现登录默认商户为 platform，请求头 X-Merchant-Code 对登录无效。用户按商户隔离注册，请使用对应商户下注册的账号。
请求示例
{
"username": "demo",
"password": "User@123"
}
响应 data：同注册接口。
常见错误：40100 用户名或密码错误；40301 账号冻结

POST /auth/forgot-password
申请重置密码。即使用户不存在也返回统一成功文案（防止枚举）。
认证：不需要
请求头：X-Merchant-Code（可选，默认 platform）
请求体
字段 类型 必填
username string 是
响应 data
{
"message": "If the account exists, a reset link has been sent.",
"expires_in": 3600,
"reset_token": "a1b2c3d4..."
}
字段 说明
reset_token 仅开发/联调环境返回（APP_DEBUG 或 PASSWORD_RESET_EXPOSE_TOKEN=true）；生产应通过邮件下发

POST /auth/reset-password
使用令牌设置新密码。
认证：不需要
请求体
字段 类型 必填 约束
token string 是 重置令牌
password string 是 8~64 字符
响应 data：null
常见错误：40001 令牌无效、已使用或过期

POST /auth/game-token
将开放平台下发的 game_token（来自 game_url 查询参数）兑换为玩家 JWT。供第三方商户用户进入游戏，不需要注册/登录。
认证：不需要
请求体
字段 类型 必填 说明
game_token string 是 game_url 中的 token 参数明文
请求示例
{
"game_token": "550e8400-e29b-41d4-a716-446655440000.xYzAbC..."
}
响应 data
{
"user": {
"id": 123,
"username": "tp_3_user_10086",
"nickname": "玩家",
"locale": "zh-CN"
},
"access_token": "eyJhbGciOiJIUzI1NiIs...",
"refresh_token": "eyJhbGciOiJIUzI1NiIs...",
"expires_in": 7200,
"game_id": 1,
"external_user_id": "user_10086",
"merchant_id": 3
}
字段 说明
game_id 本次进游戏的目标游戏 ID（JWT 内亦携带）
external_user_id 第三方平台用户 ID
merchant_id 第三方商户 ID
常见错误
code 场景
40100 game_token 无效或已吊销
40101 game_token 已过期
40301 映射用户已冻结
获取 game_url 与 game_token 的方式见 Game Provider 对接文档。

7. 用户 User
   以下接口需 Header：Authorization: Bearer {access_token}
   GET /user/profile
   获取当前登录用户资料。
   响应 data
   {
   "id": 1,
   "username": "demo",
   "nickname": "演示用户",
   "locale": "zh-CN",
   "merchant_id": 1,
   "status": 1
   }
   字段 说明
   status 1 正常，0 冻结

PUT /user/profile
更新昵称或语言。
请求体（至少传一项）
字段 类型 必填 说明
nickname string 否 昵称
locale string 否 如 zh-CN、en-US
响应 data：同 GET /user/profile

PUT /user/password
修改登录密码。
请求体
字段 类型 必填 约束
old_password string 是 当前密码
new_password string 是 8~64 字符
响应 data：null
常见错误：40100 原密码错误

8. 游戏 Games
   GET /games/categories
   获取启用中的游戏分类。
   认证：不需要
   响应 data：分类数组
   [
   {
   "id": 1,
   "name": "经典",
   "slug": "classic",
   "sort_order": 1,
   "status": 1
   }
   ]

GET /games
分页获取游戏列表（仅 status=1）。
认证：不需要
Query 参数
参数 类型 说明
category string hot = 热门；或分类 slug；all 不过滤
category_id integer 按分类 ID 筛选
page integer 页码
page_size integer 每页条数
响应 data
{
"list": [
{
"id": 1,
"code": "lucky777",
"name": "Lucky 777",
"category_id": 1,
"rows": 3,
"cols": 5,
"cover_url": "https://gamex5.s3.ap-south-1.amazonaws.com/uploads/game-covers/1/xxx.jpg",
"is_hot": 1,
"sort_order": 1,
"status": 1
}
],
"pagination": {
"page": 1,
"page_size": 20,
"total": 5,
"total_pages": 1
}
}

GET /games/{id}
获取单个游戏完整配置（进入游戏前必调）。
认证：不需要
路径参数
参数 说明
id 游戏 ID
响应 data
{
"id": 1,
"code": "lucky777",
"name": "Lucky 777",
"game_type": "normal",
"pay_type": "payline",
"pay_table_type": "payline",
"rows": 3,
"cols": 5,
"reel_layout": null,
"engine_config": null,
"cover_url": "/uploads/game-covers/1/xxx.jpg",
"bet_options": [100, 200, 500, 1000],
"free_spin_packages": [
{
"id": 1,
"bet_amount": 1000,
"price": 5000,
"free_spins": 10
}
],
"icons": [
{
"code": "A",
"name": "樱桃",
"icon_type": "normal",
"image_url": "/uploads/game-icons/1/xxx.png",
"is_wild": 0,
"is_scatter": 0
}
],
"paytable_summary": [
{
"icon": "A",
"count": 3,
"multiplier": 5
}
],
"free_spin_rules": [
{
"scatter_count": 3,
"free_spins": 10,
"weight_version_id": 2,
"weight_version_name": "免费局权重",
"weight_version_key": "free_spin"
}
],
"paylines": [
{
"id": 1,
"name": "Line 1",
"line_type": "line",
<!-- positions [[0,0] 为 [列, 行] 格式，从左到右、从上到下顺序 -->
"positions": [[0,0],[0,1],[0,2],[0,3],[0,4]],
"sort_order": 1
}
]
}
字段 说明
game_type 玩法类型：normal / cascade / cluster / megaways / hold_spin / hybrid
pay_type 赔付方式：payline / ways / cluster
pay_table_type 赔率表类型，通常与 pay_type 一致
reel_layout Megaways 等可变列高布局元数据，普通线奖为 null
engine_config 引擎扩展配置（后台可视化维护），客户端一般只读展示
bet_options 可用投注档位（分）
free_spin_packages 可购买的免费局套餐
icons 盘面图标定义
paytable_summary 赔率摘要
free_spin_rules Scatter 触发免费局规则
paylines 中奖线定义，positions 为 [row, col]
常见错误：40400 游戏不存在或已下架

9. 钱包 Wallet
   需登录。
   GET /wallet/balance
   响应 data（内部商户 / 本地钱包）
   {
   "balance": 100000,
   "frozen_amount": 0,
   "available": 100000,
   "source": "wallet"
   }
   响应 data（第三方商户用户）
   {
   "balance": 1000000,
   "frozen_amount": 0,
   "available": 1000000,
   "source": "merchant"
   }
   字段 说明
   balance 可用余额（分）
   frozen_amount 内部钱包：Spin 进行中冻结金额；第三方固定 0
   available 当前等于 balance
   source wallet = 本地钱包；merchant = 实时调用商户 balance_url 同步（有短时缓存）
   第三方用户余额以商户侧为准，Open API / 商户回调金额单位为元字符串，玩家 API 仍为分。

GET /wallet/logs
钱包流水（分页）。
Query 参数
参数 类型 说明
type string 筛选类型，见下表
page integer 页码
page_size integer 每页条数
流水类型 type
值 说明
freeze 下注冻结
unfreeze 解冻
bet 扣款（结算）
win 派奖
buy_free_spin 购买免费局
admin_adjust 后台调账
list[] 字段
字段 类型 说明
id integer 流水 ID
user_id integer 用户 ID
merchant_id integer 商户 ID
type string 流水类型
amount integer 变动金额（分，负数为支出）
balance_before integer 变动前余额
balance_after integer 变动后余额
ref_type string 关联业务类型
ref_id string 关联业务 ID
remark string 备注
created_at string 创建时间

GET /wallet/game-records
当前用户全部游戏的注单摘要（分页，最多统计 5000 条）。
Query：page、page_size
list[] 字段
字段 类型 说明
spin_id string 局 ID（UUID）
game_id integer 游戏 ID
bet_amount integer 投注（分）
win_amount integer 派奖（分）
net_amount integer 净盈亏（分）
is_free_spin integer 1 免费局 / 0 普通局
created_at string 时间

10. 游戏局 Game / Spin
    需登录。
    POST /game/{game_id}/spin
    执行一次 Spin（核心接口）。
    路径参数：game_id — 游戏 ID
    请求体
    字段 类型 必填 说明
    request_id string 是 幂等键，建议 UUID；24h 内重复提交返回相同结果
    bet_amount integer 条件 use_free_spin=false 时必填，须在 bet_options 内
    use_free_spin boolean 否 默认 false；true 时使用免费次数，不扣余额
    请求示例（普通局）
    {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "bet_amount": 1000,
    "use_free_spin": false
    }
    请求示例（免费局）
    {
    "request_id": "660e8400-e29b-41d4-a716-446655440001",
    "use_free_spin": true
    }
    响应 data
    {
    "spin_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "game_id": 1,
    "bet_amount": 1000,
    "win_amount": 2500,
    "net_amount": 1500,
    "balance_after": 101500,
    "is_free_spin": false,
    "free_spin": {
    "triggered": false,
    "awarded": 0,
    "remaining": 0
    },
    "jackpot": {
    "won": false,
    "level": null,
    "amount": 0
    },
    "grid": [
    ["A", "K", "Q", "J", "10"],
    ["A", "A", "K", "Q", "J"],
    ["Wild", "A", "K", "Q", "J"]
    ],
    "wins": [
    {
    "payline_id": 1,
    "payline_name": "Line 1",
    "positions": [[1,0],[1,1],[1,2]],
    "icon": "A",
    "match_count": 3,
    "multiplier": 5,
    "win_amount": 2500
    }
    ],
    "replay_token": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "cascade_times": null,
    "replay": {
    "schema_version": 1,
    "frames": [
    { "step": 1, "action": "reveal_grid", "grid": [] }
    ],
    "meta": null
    },
    "created_at": "2026-06-18T14:04:47+08:00"
    }
    字段 说明
    grid 二维数组 [row][col]，值为图标 code
    wins 本局中奖线明细
    free_spin.triggered 本局是否触发新的免费局
    free_spin.awarded 本局新获得的免费次数
    free_spin.remaining 剩余免费次数
    jackpot.won 是否中奖池
    replay_token 回放 ID，同 spin_id
    cascade_times 二期 级联 / tumble 轮数；普通线奖为 null
    replay 二期 内联回放摘要，含 schema_version、frames、meta（与 GET /game/replay/{spin_id} 同源）
    二期多玩法可选字段（cascade / cluster / megaways / hold_spin / hybrid）
    字段 类型 说明
    cascade_times int \ null 连消 / tumble 总轮数
    replay.schema_version int 回放协议版本，当前多为 2
    replay.frames array 逐步动画帧（消除、高亮、派奖、Hold 等）
    replay.meta object \ null 如 total_ways、hold_triggered、rounds 等引擎元数据
    普通 normal 线奖局：cascade_times 为 null，replay.frames 仍为 reveal / highlight / show_win 等基础步骤。
    常见错误
    code 场景
    40002 投注档位非法
    42201 余额不足
    42202 游戏下架
    42203 无剩余免费次数
    42204 商户 bet_url 结算失败或超时；data 为 null 或不含 grid，前端勿展示开奖
    40901 幂等重复（data 为首次结果）
    42301 同一用户并发 Spin 被锁

GET /game/{game_id}/history
指定游戏的 Spin 历史（当前用户，最多 100 条）。
路径参数：game_id
Query：page、page_size
list[] 字段：同 game-records 注单摘要。

GET /game/replay/{spin_id}
获取某一局的回放数据（仅能查看本人注单）。
路径参数：spin_id — Spin UUID
响应 data
{
"spin_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
"bet": 1000,
"win": 2500,
"result": [
["A", "K", "Q", "J", "10"],
["A", "A", "K", "Q", "J"],
["Wild", "A", "K", "Q", "J"]
],
"lines": [],
"frames": [
{ "step": 1, "action": "reveal_grid", "grid": [] },
{ "step": 2, "action": "highlight_line", "payline_id": 1, "positions": [] },
{ "step": 3, "action": "show_win", "win_amount": 2500 },
{ "step": 4, "action": "total_win", "win_amount": 2500 }
],
"schema_version": 1,
"meta": null,
"cascade_times": null,
"free_spin": {
"triggered": false,
"awarded": 0,
"remaining": 0
},
"jackpot": {
"won": false,
"level": null,
"amount": 0
}
}
字段 说明
result 最终盘面，同 Spin 的 grid
lines 中奖线数组，结构同 wins
frames 回放动画步骤序列
schema_version 二期 回放协议版本
meta 二期 引擎元数据（ways、Hold 阶段等）
cascade_times 二期 级联 / tumble 轮数，无则 null
常见错误：40400 非本人或不存在

POST /game/{game_id}/buy-free-spin
购买免费局套餐。
路径参数：game_id
请求体
字段 类型 必填 说明
request_id string 是 幂等键
package_id integer 是 free_spin_packages[].id
请求示例
{
"request_id": "770e8400-e29b-41d4-a716-446655440002",
"package_id": 1
}
响应 data
{
"request_id": "770e8400-e29b-41d4-a716-446655440002",
"game_id": 1,
"package_id": 1,
"bet_amount": 1000,
"quantity": 10,
"total_cost": 5000,
"free_spin_remaining": 10,
"balance_after": 95000
}
常见错误：42201 余额不足；40001 套餐无效

GET /game/{game_id}/free-spin-state
查询当前用户在某游戏的免费局状态。
路径参数：game_id
响应 data
{
"game_id": 1,
"remaining_spins": 10,
"total_won": 3500,
"bet_amount": 1000
}
字段 说明
remaining_spins 剩余免费次数
total_won 免费局累计赢得（分）
bet_amount 免费局对应的名义投注档位（分）

11. 对接说明
    11.1 推荐对接流程
1. GET /health → 确认服务可用
1. POST /auth/login → 获取 access_token
1. GET /wallet/balance → 展示余额
1. GET /games/categories + GET /games → 大厅
1. GET /games/{id} → 加载游戏配置与资源
1. GET /game/{id}/free-spin-state → 免费局状态
1. POST /game/{id}/spin → 游戏循环（带 request_id）
1. GET /game/replay/{spin_id} → 回放（可选）
   11.2 幂等性
   POST /game/{game_id}/spin 与 POST /game/{game_id}/buy-free-spin 必须传唯一 request_id（建议 UUID v4）。

- 网络超时重试时使用相同 request_id
- 服务端 24 小时内返回首次成功结果，code 可能为 40901 或 0（实现上重复请求直接返回缓存结果）
  11.3 商户隔离
- 注册、忘记密码通过 X-Merchant-Code 指定商户
- 用户、钱包、注单均按 merchant_id 隔离
- 联调默认商户：platform
  11.4 Token 生命周期
- access_token 默认有效期 7200 秒（2 小时），由环境变量 JWT_PLAYER_TTL 控制
- Token 过期返回 40100 / 40101，需引导用户重新登录
- POST /auth/refresh 尚未实现
  11.5 未实现接口（请勿依赖）
  方法 路径 说明
  POST /auth/refresh Token 刷新
  GET /games/recent 最近游玩
  11.6 OpenAPI
  机器可读规格见：backend/openapi/player-api.yaml（可用 Swagger UI / Postman 导入）。
  11.7 变更记录
  日期 版本 说明
  2026-06-18 1.1 Game Provider：新增 auth/game-token；钱包 source；Spin 42204；第三方接入章节
  2026-06-18 1.0 首版：覆盖玩家端全部已上线接口

12. 第三方用户接入（Game Provider）
    本节面向第三方平台的前端（嵌入或跳转我方玩家 Web）。服务端 Open API 见 GameProviderAPI.md。
    12.1 与内部用户的区别
    项目 内部用户（platform） 第三方用户（third_party）
    进入方式 注册 / 登录 贵方服务端 POST /open-api/v1/game/url → 浏览器打开 game_url
    鉴权 POST /auth/login POST /auth/game-token
    余额 本地 wallets 表 商户 balance_url 回调
    Spin 扣款 本地钱包 商户 bet_url 回调（bet+win 一次）
    结算失败 少见（本地事务） 42204，不返回 grid
    12.2 推荐前端流程
1. 用户从贵方站点跳转我方 game_url（含 token、game_id）
1. 前端 POST /auth/game-token { game_token } → access_token
1. GET /wallet/balance → source=merchant
1. GET /games/{game_id} → 游戏配置
1. POST /game/{game_id}/spin → 带 request_id
   - 成功：展示 grid / wins
   - 42204：提示结算失败，勿展示假开奖
     玩家 Web 入口路径：/play?token={plain_token}&game_id={id}&lang=zh-CN（由 game_url 提供完整 URL）。
     12.3 相关文档
     文档 说明
     GameProviderAPI.md 第三方服务端对接（Open API + 商户回调）
     GameProviderAPI.pdf 同上 PDF
     game-provider/07-testing-guide.md 联调与 Mock 测试命令

文档维护：与 backend/route/api.php 保持同步。疑问请联系平台后端负责人。
Word 版本：player-api.docx（由 python docs/scripts/generate_player_api_docx.py 从本 Markdown 生成）
