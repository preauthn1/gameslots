import conditionalCompilation from "./vite-plugins/conditionalCompilation.js"
import path from "path";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
export default defineNuxtConfig({
  ssr: import.meta.env.VITE_API_SSR === "true",
  devtools: { enabled: false },

  app: {
    keepalive: { max: 10 },
    pageTransition: {
      name: "page",
      mode: "out-in"
    },
  },

  modules: ["@vant/nuxt", "@unocss/nuxt"],

  postcss: {
    plugins: {
      // 这个工具可以实现自动添加CSS3前缀
      "autoprefixer": {
        overrideBrowserslist: ["last 5 version", ">1%", "ie >=8"]
      },
      "postcss-pxtorem": {
        rootValue: 37.5, // 指定转换倍率，我现在设置这个表示1rem=37.5px;
        propList: ["*"], // 属性列表，表示你要把哪些css属性的px转换成rem，这个*表示所有
        mediaQuery: false, // 是否允许使用媒体查询，false媒体查询的代码可用，true不可用
        exclude: "ignore",
        replace: true, // 替换包含rem的规则，而不是添加回退
        minPixelValue: 1, // 需要转换的最小值，一般1px像素不转换，以上才转换
        unitPrecision: 6, // 转换成rem单位的小数点后的保留位数
        selectorBalckList: ["van"], // 匹配不被转换为rem的选择器
      },
    },
  },

  plugins: [
    { src: "@/plugins/index" },
    { src: "@/plugins/index.client" },
  ],

  vite: {
    plugins: [
      conditionalCompilation({ dev: "app" }),
      createSvgIconsPlugin({
        iconDirs: [
          path.resolve(process.cwd(), "assets/icon"),//基础图标库
        ],
        symbolId: "icon-[name]",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      }
    }
  },

  compatibilityDate: "2025-01-08"
})