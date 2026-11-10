import type { Plugin } from "vite";
class ConditionalCompilation {
  instruct: string;
  constructor(dev: string) {
    this.instruct = dev
  }
  public transform(code: string,id:string): string | undefined {
    if (this.instruct && !id.includes("node_modules")) {
      const codeList: RegExpMatchArray | null = code.match(new RegExp("[\\S]+?.(#ifdef|#ifndef) +[\\s\\S]+?.#endif.*[\\S]*", "g"))
      if (codeList) {
        codeList.forEach((item: string) => {
          // 取出第一行的字符串进行识别验证
          const devLineOne: string = item.split("\n")[0]
          const ifdef: boolean = devLineOne.includes("#ifdef");
          // 替换#ifdef
          if (ifdef) {
            const devs: string[] = devLineOne.split("#ifdef")[1].split("||")
            // 找不到环境替换成空的字符串
            const flag: boolean = !devs.find(item => item.includes(this.instruct))
            // 替换字符串
            if (flag) {
              code = code.replace(item, "")
            }
          } else {
            // 替换#ifndef
            const devs: string[] = devLineOne.split("#ifndef")[1].split("||")
            // 找到环境替换成空的字符串
            const flag: boolean = !!devs.find(item => item.includes(this.instruct))
            if (flag) {
              code = code.replace(item, "")
            }
          }
        });
      }
      return code
    }
  }
}

export default (config: { dev: string; }): Plugin => {
  const conditionalCompilation: ConditionalCompilation = new ConditionalCompilation(config?.dev)
  return {
    name: "vite-conditional-compilation",
    enforce: "pre",
    transform: conditionalCompilation.transform.bind(conditionalCompilation)
  }
};