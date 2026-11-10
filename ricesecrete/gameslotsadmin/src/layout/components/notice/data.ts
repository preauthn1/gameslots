export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  title: string;
  name: string;
  count: number;
}

export const noticesData: TabItem[] = [
  {
    key: "1",
    title: "待审核提现",
    name: "withdrawal",
    count: 0
  },
  {
    key: "2",
    title: "待审核线下充值",
    name: "offlin",
    count: 0
  },
  {
    key: "3",
    title: "待审核活动申请",
    name: "action",
    count: 0
  }
];
