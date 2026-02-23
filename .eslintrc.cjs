module.exports = {
  // 标识为根配置文件，ESLint 不会向上查找其他配置文件
  root: true,
  // 配置运行环境，启用对应环境的全局变量
  env: {
    browser: true, // 支持浏览器环境全局变量（如 window、document）
    commonjs: true, // 支持 CommonJS 模块规范（如 require、module）
    node: true, // 支持 Node.js 环境全局变量（如 process、__dirname）
    es6: true, // 支持 ES6+ 语法（如 Promise、箭头函数）
    "vue/setup-compiler-macros": true // 支持 Vue 的 <script setup> 语法糖
  },
  // 继承的规则集（基础规则 + 插件推荐规则）
  extends: [
    "eslint:recommended", // 继承 ESLint 官方推荐的基础规则
    "plugin:vue/vue3-recommended", // 继承 Vue3 官方推荐的 Vue 语法规则
    "@vue/eslint-config-prettier" // 整合 Prettier 规则，避免 ESLint 与 Prettier 格式化冲突
  ],
  // 启用的 ESLint 插件
  plugins: ["vue"], // 启用 Vue 插件，提供 Vue 语法检查能力
  // 解析器配置（控制代码解析方式）
  parserOptions: {
    parser: "@babel/eslint-parser", // 使用 Babel 解析器，支持最新 JS 语法（如装饰器）
    sourceType: "module", // 代码使用 ES 模块规范（import/export）
    ecmaVersion: "latest", // 支持最新的 ECMAScript 版本语法
    requireConfigFile: false// 禁用 Babel 配置文件检查
  },
  // 声明全局变量（无需声明即可使用的变量）
  globals: {},
  // 自定义规则配置（优先级高于继承的规则）
  rules: {
    // 基础 JavaScript 缩进规则（与 Vue 规则保持一致，避免冲突）
    "indent": [
      2,
      2
    ],

    // 以下为其他 JS 和 Vue 规则配置（保持原规则逻辑）
    // 数字表示错误级别，0（off）= 关闭该规则（不检查），1（warn）：违反时仅警告；，2（error）：违反时报错
    "no-undef": 2, // 禁止使用未声明的变量（报错）
    "no-redeclare": 2, // 禁止变量重复声明（报错）
    "semi": [2, "never"], // 语句末尾不加分号（报错）
    "no-func-assign": 2, // 禁止对函数名重新赋值（报错）
    "arrow-spacing": [2, { before: true, after: true }], // 箭头函数的箭头前后必须有空格（报错）
    "block-spacing": [2, "always"], // 代码块 { 后和 } 前必须有空格（如 if() { ... }）（报错）
    "brace-style": [2, "1tbs", { allowSingleLine: true }], // 大括号风格：左括号与语句同一行，单行代码块允许省略换行（报错）
    "comma-spacing": [2, { before: false, after: true }], // 逗号后必须有空格，逗号前不能有空格（报错）
    "comma-style": [2, "last"], // 逗号必须放在行尾（如数组、对象的最后一个元素后不允许逗号）（报错）
    "eol-last": 2, // 文件末尾必须有一个空行（报错）
    "eqeqeq": [2, "allow-null"], // 必须使用 === 和 !== 比较，允许 null 与 undefined 用 == 比较（报错）
    "generator-star-spacing": [2, { before: true, after: true }], // generator 函数的 * 前后必须有空格（如 function* gen()）（报错）
    "jsx-quotes": [2, "prefer-single"], // JSX 中属性优先使用单引号（报错）
    "key-spacing": [2, { beforeColon: false, afterColon: true }], // 对象属性名后的冒号前无空格、后有空格（如 { a: 1 }）（报错）
    "keyword-spacing": [2, { before: true, after: true }], // 关键字（如 if、for）前后必须有空格（报错）
    "new-parens": 2, // new 关键字创建实例时必须带括号（如 new Object()）（报错）
    "no-cond-assign": 2, // 禁止在条件语句中使用赋值操作（如 if (a = 1)）（报错）
    "no-dupe-args": 2, // 禁止函数参数重复（报错）
    "no-dupe-class-members": 2, // 禁止类成员重复（报错）
    "no-duplicate-case": 2, // 禁止 switch case 重复（报错）
    "no-empty-pattern": 2, // 禁止空的解构模式（如 const {} = obj）（报错）
    "no-eval": 2, // 禁止使用 eval() 函数（报错）
    "no-extra-parens": [2, "functions"], // 禁止函数表达式多余的括号（如 (function() {})() 中的外层括号）（报错）
    "no-invalid-regexp": 2, // 禁止无效的正则表达式（报错）
    "no-irregular-whitespace": 2, // 禁止不规则空白字符（如全角空格）（报错）
    "no-mixed-spaces-and-tabs": 2, // 禁止混合使用空格和 tab 缩进（报错）
    "no-multi-spaces": [2, { ignoreEOLComments: true }], // 禁止多余的空格（忽略行尾注释前的空格）（报错）
    "no-multiple-empty-lines": [2, { max: 1 }], // 禁止连续多个空行（最多允许 1 个）（报错）
    "no-regex-spaces": 2, // 禁止正则表达式中出现多个连续空格（报错）
    "no-trailing-spaces": 2, // 禁止行尾有多余空格（报错）
    "no-whitespace-before-property": 2, // 属性访问时，. 前不能有空格（如 obj.prop 而非 obj .prop）（报错）
    "operator-linebreak": [2, "after", { overrides: { "?": "before", ":": "before" } }], // 运算符换行时，运算符应在换行后；三元运算符 ? : 需在换行前（报错）
    "padded-blocks": [2, "never"], // 禁止代码块内首尾有空行（如 { \n code \n } 不允许）（报错）
    "semi-spacing": [2, { before: false, after: true }], // 分号前无空格、后有空格（报错）
    "space-before-blocks": [2, "always"], // 代码块前必须有空格（如 function() {} 而非 function(){}）（报错）
    "space-in-parens": [2, "never"], // 括号内首尾不能有空格（如 (1) 而非 ( 1 )）（报错）
    "space-infix-ops": 2, // 中缀运算符（如 +、=）前后必须有空格（报错）
    "space-unary-ops": [2, { words: true, nonwords: false }], // 单词类一元运算符（如 typeof、delete）后必须有空格；符号类（如 !、++）前后无空格（报错）
    "spaced-comment": [
      2,
      "always", // 注释 // 或 /* 后必须有空格
      { markers: ["global", "globals", "eslint", "eslint-disable", "*package", "!", ","] }, // 特殊注释标记（如 /*!）后可无空格
    ],
    "template-curly-spacing": [2, "never"], // 模板字符串中 ${} 内首尾无空格（如 `${a}` 而非 `${ a }`）（报错）
    "wrap-iife": [2, "any"], // 立即执行函数表达式（IIFE）必须用括号包裹（报错）
    "yield-star-spacing": [2, "both"], // yield* 中 * 前后必须有空格（报错）
    "object-curly-spacing": [2, "always", { objectsInObjects: false }], // 对象字面量必须有空格（如 { a: 1 }）；嵌套对象内部可无空格（如 { a: {b:1} }）（报错）
    "vue/attribute-hyphenation": [2, "always"], // Vue 模板中属性名必须使用连字符命名（如 :my-prop 而非 :myProp）（报错）
    "vue/multi-word-component-names": [2, { ignores: ["App"] }], // Vue 组件名必须为多单词（ PascalCase 或 kebab-case），忽略 App 组件（报错）
    "vue/no-v-model-argument": "off" // 允许 v-model 使用参数（如 v-model:value，关闭该规则）
  }
}