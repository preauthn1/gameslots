import { resolve } from "path";

export const getAsyncRoutes = () => {
  return new Promise((resolve, reject) => {
    const data = [
      // {
      //   path: "/permission",
      //   meta: {
      //     title: "menus.permission",
      //     icon: "lollipop",
      //     rank: 1
      //   },
      //   children: [
      //     {
      //       path: "/permission/page/index",
      //       name: "PermissionPage",
      //       meta: {
      //         title: "menus.permissionPage",
      //         roles: ["admin", "common"]
      //       }
      //     },
      //     {
      //       path: "/permission/button/index",
      //       name: "PermissionButton",
      //       meta: {
      //         title: "menus.permissionButton",
      //         roles: ["admin", "common"],
      //         auths: ["btn_add", "btn_edit", "btn_delete"]
      //       }
      //     }
      //   ]
      // },
      {
        path: "/user",
        meta: {
          title: "会员管理",
          icon: "IF-icon-7",
          rank: 2
        },
        children: [
          {
            path: "/user/pages/list",
            name: "userList",
            meta: {
              title: "会员列表",
              keepAlive: true,
              roles: ["admin", "common"]
            }
          },
          {
            path: "/user/pages/agent",
            name: "agentList",
            meta: {
              title: "代理列表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/user/pages/userlevel",
            name: "userlevelList",
            meta: {
              title: "会员等级",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/user/pages/userbank",
            name: "userbankList",
            meta: {
              title: "会员提现账号",
              roles: ["admin", "common"]
            }
          },
          // {
          //   path: "/user/pages/seniorMember",
          //   name: "seniorMember",
          //   meta: {
          //     title: "上级会员",
          //     roles: ["admin", "common"]
          //   }
          // },
          {
            path: "/user/pages/userloginlog",
            name: "userloginlogList",
            meta: {
              title: "会员登录日志",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/permission",
        meta: {
          title: "出入金管理",
          icon: "IF-icon-jine",
          rank: 3
        },
        children: [
          {
            path: "/offline/useroffline",
            name: "PermissionPage",
            meta: {
              title: "用户充值",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/offline/userwithdrawal",
            name: "userwithdrawal",
            meta: {
              title: "用户提现",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/offline/useradjust",
            name: "useradjust",
            meta: {
              title: "人工调整",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/games",
        meta: {
          title: "游戏管理",
          icon: "IF-icon-wangyou",
          rank: 4
        },
        children: [
          {
            path: "/games/leaguemanage",
            name: "leaguemanage",
            meta: {
              title: "联赛管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/games/schedulemanage",
            name: "schedulemanage",
            meta: {
              title: "赛程管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/games/betmanage",
            name: "betmanage",
            meta: {
              title: "注单管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/games/gameresult",
            name: "gameresult",
            meta: {
              title: "赛果管理",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/threeGames",
        meta: {
          title: "第三方游戏",
          icon: "IF-icon-youxi",
          rank: 5
        },
        children: [
          {
            path: "/threeGames/gameCategory",
            name: "gameCategory",
            meta: {
              title: "游戏分类",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gamePlatform",
            name: "gamePlatform",
            meta: {
              title: "游戏平台",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameManage",
            name: "gameManage",
            meta: {
              title: "游戏管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameRecord",
            name: "gameRecord",
            meta: {
              title: "游戏记录",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/rebateSet",
            name: "rebateSet",
            meta: {
              title: "返佣设置",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameReport",
            name: "gameReport",
            meta: {
              title: "游戏报表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameRebate",
            name: "gameRebate",
            meta: {
              title: "代理返佣",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameRebates",
            name: "gameRebates",
            meta: {
              title: "返水管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/threeGames/gameUserDayReport",
            name: "gameUserDayReport",
            meta: {
              title: "用户日报表",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/huodongguanli",
        meta: {
          title: "活动管理",
          icon: "IF-icon-huodong",
          rank: 6
        },
        children: [
          {
            path: "/huodongguanli/offerManage",
            name: "offerManage",
            meta: {
              title: "优惠管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/applyManage",
            name: "applyManage",
            meta: {
              title: "申请管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/lotteryConfig",
            name: "lotteryConfig",
            meta: {
              title: "抽奖配置",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/prizeList",
            name: "prizeList",
            meta: {
              title: "奖品列表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/lotteryRecord",
            name: "lotteryRecord",
            meta: {
              title: "抽奖记录",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/pointRecord",
            name: "pointRecord",
            meta: {
              title: "积分记录",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/huodongguanli/lotteryReport",
            name: "lotteryReport",
            meta: {
              title: "抽奖报表",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/fund",
        meta: {
          title: "基金管理",
          icon: "IF-icon-zhinengjijin",
          rank: 7
        },
        children: [
          {
            path: "/fund/list",
            name: "listManage",
            meta: {
              title: "基金列表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/fund/orderlistManage",
            name: "fundROrderlistManage",
            meta: {
              title: "基金订单",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/fund/fund_record",
            name: "fundrecordManage",
            meta: {
              title: "基金报表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/fund/interest",
            name: "interestManage",
            meta: {
              title: "基金收益明细",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/report",
        meta: {
          title: "报表管理",
          icon: "IF-icon-baobiao1",
          rank: 8
        },
        children: [
          {
            path: "/report/reportManage",
            name: "reportManage",
            meta: {
              title: "运营总表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/report/orderlistManage",
            name: "orderlistManage",
            meta: {
              title: "财务报表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/report/userManage",
            name: "userManage",
            meta: {
              title: "用户输赢",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/report/offlineManage",
            name: "offlineManage",
            meta: {
              title: "充值排行榜",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/report/withdrawalManage",
            name: "withdrawalManage",
            meta: {
              title: "提现排行榜",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/zhifuguanli",
        meta: {
          title: "银行/收款/支付管理",
          icon: "IF-icon-yinhang2",
          rank: 9
        },
        children: [
          {
            path: "/banksk/list",
            name: "bankskList",
            meta: {
              title: "线下收款账户",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/payset/list",
            name: "paysetList",
            meta: {
              title: "支付平台",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/payset/paysetcountList",
            name: "paysetcountList",
            meta: {
              title: "渠道统计",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/payset/currencylist",
            name: "currencyList",
            meta: {
              title: "货币管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/payset/agentlist",
            name: "payagentList",
            meta: {
              title: "银商管理",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/zhanwuguanli",
        meta: {
          title: "站务管理",
          icon: "IF-icon-fenzuguanli",
          rank: 10
        },
        children: [
          {
            path: "/banner/list",
            name: "bannerList",
            meta: {
              title: "首页轮播图",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/gonggao/list",
            name: "gonggaoList",
            meta: {
              title: "公告管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/news/list",
            name: "newsList",
            meta: {
              title: "基础问答",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/service/list",
            name: "serviceList",
            meta: {
              title: "客服管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/rule/list",
            name: "ruleList",
            meta: {
              title: "规则管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/user/msglist",
            name: "usermsgList",
            meta: {
              title: "站内信",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/feedback/list",
            name: "feedbackList",
            meta: {
              title: "反馈管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/journalism/list",
            name: "journalismList",
            meta: {
              title: "新闻管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/journalism/type",
            name: "journalismType",
            meta: {
              title: "新闻分类",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/system",
        meta: {
          title: "系统管理",
          icon: "IF-icon-xitongguanli1",
          rank: 11
        },
        children: [
          {
            path: "/admin/lists",
            name: "adminLists",
            meta: {
              title: "管理员列表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/admin/roleList",
            name: "adminRoleList",
            meta: {
              title: "角色管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/admin/authorManage",
            name: "authorManage",
            meta: {
              title: "权限规则",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/admin/systemSetting",
            name: "systemSetting",
            meta: {
              title: "系统设定",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/admin/logList",
            name: "adminLogList",
            meta: {
              title: "操作记录",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/thirdset/list",
            name: "thirdsetList",
            meta: {
              title: "三方登陆管理",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/iplimit/list",
            name: "iplimitList",
            meta: {
              title: "IP黑名单",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/bangdan",
        meta: {
          title: "榜单管理",
          icon: "IF-icon-ziyuan121",
          rank: 12
        },
        children: [
          {
            path: "/bangdan/list",
            name: "bangdanList",
            meta: {
              title: "榜单设定",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/falseaccout/list",
            name: "falseAccoutList",
            meta: {
              title: "假账户管理",
              roles: ["admin", "common"]
            }
          }
        ]
      },
      {
        path: "/weishang",
        meta: {
          title: "微商管理",
          icon: "IF-icon-ziyuan121",
          rank: 12
        },
        children: [
          {
            path: "/weishang/list",
            name: "weishangList",
            meta: {
              title: "代理返佣",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/weishang/sellloglist",
            name: "sellloglist",
            meta: {
              title: "推广奖金",
              roles: ["admin", "common"]
            }
          }, {
            path: "/weishang/report",
            name: "report",
            meta: {
              title: "微商报表",
              roles: ["admin", "common"]
            }
          }, {
            path: "/weishang/viewreport",
            name: "viewreport",
            meta: {
              title: "查看报表",
              roles: ["admin", "common"],
              showLink: false
            }
          }, {
            path: "/weishang/reportdetail",
            name: "reportdetail",
            meta: {
              title: "下层充提报表",
              roles: ["admin", "common"],
              showLink: false
            }
          }, {
            path: "/weishang/wchatlist",
            name: "wchatlist",
            meta: {
              title: "微商列表",
              roles: ["admin", "common"],
            }
          }, {
            path: "/weishang/wchatset",
            name: "wchatset",
            meta: {
              title: "微商设置",
              roles: ["admin", "common"],
            }
          },
        
        ]
      },
      {
        path: "/language",
        meta: {
          title: "语言管理",
          icon: "IF-icon-yuyan1",
          rank: 13
        },
        children: [
          {
            path: "/nation/list",
            name: "nationList",
            meta: {
              title: "国家列表",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/language/index",
            name: "languageIndex",
            meta: {
              title: "语言种类",
              roles: ["admin", "common"]
            }
          },
          {
            path: "/language/items",
            name: "languageItems",
            meta: {
              title: "语言类目",
              roles: ["admin", "common"]
            }
          }
        ]
      }
    ];
    resolve(data);
  });
};
