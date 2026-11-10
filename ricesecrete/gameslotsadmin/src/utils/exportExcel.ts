import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

export const exportExcel = (title='数据表',columns, dataList) => {
  const res = dataList.map(item => {
    const arr = [];
    columns.forEach(column => {
        arr.push(item[column.prop as string]);
    });
    return arr;
  });

  const titleList = [];
  columns.forEach(column => {
    titleList.push(column.label);
  });
  res.unshift(titleList);
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  utils.book_append_sheet(workBook, workSheet, "数据报表");
  writeFile(workBook, title +".xlsx");
  message("导出成功", {
    type: "success"
  });
};

