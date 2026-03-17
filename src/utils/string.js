/**
 * 生成随机字符串
 * @param {number} length - 生成的字符串长度，默认64
 * @param {Object} options - 可选配置
 * @param {boolean} options.includeLetters - 是否包含大小写字母，默认true
 * @param {boolean} options.includeNumbers - 是否包含数字，默认true
 * @param {boolean} options.includeSymbols - 是否包含特殊符号，默认false
 * @returns {string} 生成的随机字符串
 */
function generateRandomString(length = 64, options = {}) {
  // 默认配置
  const { includeLetters = true, includeNumbers = true, includeSymbols = false } = options

  // 定义可选字符池
  let charPool = ''
  // 大小写字母
  if (includeLetters) {
    charPool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  }
  // 数字
  if (includeNumbers) {
    charPool += '0123456789'
  }
  // 特殊符号（排除易混淆的字符：` ' " \ | ~ , . < >`）
  if (includeSymbols) {
    charPool += '!@#$%^*_+-'
  }

  // 校验字符池是否为空
  if (charPool.length === 0) {
    throw new Error('字符池不能为空，请至少启用一种字符类型（字母/数字/符号）')
  }

  let result = ''
  // 生成随机字符串（使用crypto.getRandomValues，比Math.random更安全）
  const array = new Uint32Array(length)
  window.crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    // 取模运算确保索引在字符池范围内
    const randomIndex = array[i] % charPool.length
    result += charPool[randomIndex]
  }

  return result
}
