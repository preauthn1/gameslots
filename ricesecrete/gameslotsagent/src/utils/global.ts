// import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
export const timeCycle = time => {
  if (!time) {
    return "";
  }
  const t = new Date(time);
  //返回年月日
  return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
};

export const formaTime = timestamp => {
  if (!timestamp) {
    return "";
  }
  timestamp = timestamp.toString().length < 13 ? timestamp * 1000 : timestamp;
  const date = new Date(timestamp);

  const Y = date.getFullYear() + "-";
  const M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  const D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
  const h =
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";

  const m =
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":";
  const s =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return Y + M + D + h + m + s;
};

export const getQueryParams = queryParam => {
  let url = "";
  for (const key in queryParam) {
    if (Object.hasOwnProperty.call(queryParam, key)) {
      const val = queryParam[key].toString();
      // console.log(val, key)
      if (val !== "") {
        url += "&" + key + "=" + encodeURIComponent(val);
      }
    }
  }
  return url.substring(1);
};

export const copyContent = val => {
  // 获取需要复制的元素以及元素内的文本内容
  const text = val;
  // 添加一个input元素放置需要的文本内容
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  // 选中并复制文本到剪切板
  input.select();
  document.execCommand("copy");
  // 移除input元素
  document.body.removeChild(input);
  message("复制成功", {
    type: "success"
  });
};
