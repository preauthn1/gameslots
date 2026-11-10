export default (num: string | number | undefined, fixedNum: number = 2) => {
  num = Number(num) || 0
  const options = {
    minimumFractionDigits: fixedNum,
    maximumFractionDigits: fixedNum,
    useGrouping: true, // 使用分隔符
  }
  return new Intl.NumberFormat("en-US", options).format(num);

}