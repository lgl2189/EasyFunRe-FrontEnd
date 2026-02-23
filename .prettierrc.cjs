module.exports = {
  // 代码的最大行宽，超过该宽度会自动换行（单位：字符）
  printWidth: 130,
  // 强制每个属性单独一行，默认false
  singleAttributePerLine: false,
  // 每行最大属性数，默认为1
  htmlAttributeWrapThreshold: 5,
  // 核心配置：基础缩进使用 2 个空格（必须设置，统一项目缩进标准）
  tabWidth: 2,
  // 禁用 tab 缩进，强制使用空格进行缩进
  useTabs: false,
  // 字符串使用单引号而非双引号（如 'hello' 而非 "hello"）
  singleQuote: true,
  // 语句末尾添加分号（如 const a = 1; 而非 const a = 1）
  semi: false,
  // 对象字面量的括号与内容之间添加空格（如 { foo: 1 } 而非 {foo: 1}）
  bracketSpacing: true,
  // 箭头函数的参数始终使用括号包裹（如 (a) => {} 而非 a => {}）
  arrowParens: 'always',
  // HTML 标签的闭合括号不与内容在同一行（即闭合括号另起一行，如 </div> 单独成行）
  bracketSameLine: true,
}
