module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential"
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "vue"
  ],
  "rules": {
    "indent": [1, 2],//缩进
    "quotes": ["error", "double"],//双引号
    "camelcase": 0,//驼峰命名变量
    "no-cond-assign": 2,//不在if中赋值操作
    "no-console": 1,//禁止使用console
    "no-undef": 0,//变量和函数在使用前必须先声明。全局变量或函数除外。
    "no-unused-vars": 2,//变量定义后会一定要被使用。
    "no-alert": 2,//代码不用 alert,confirm 和 prompt。系统的弹出框比较丑，一般都用自定义的弹出框。
    "vue/multi-word-component-names": "off",
  }
};
