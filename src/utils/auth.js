/**
 * 生成设备ID
 * @returns {string} 设备ID
 */
export const generateFingerprint = () => {
  const deviceEnvironment = getDeviceFingerprint()
  return hashString(deviceEnvironment)
}

/**
 * 简单的字符串哈希算法 (FNV-1a)
 * @param {string} str - 输入字符串
 * @returns {string} 32位十六进制哈希值
 */
const hashString = (str) => {
  let hash = 0x811c9dc5 // FNV offset basis
  const fnvPrime = 0x01000193

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, fnvPrime)
  }

  // 转换为无符号整数并转十六进制
  return (hash >>> 0).toString(16)
}
/**
 * 收集设备指纹信息
 * @returns {string} 拼接后的特征字符串
 */
const getDeviceFingerprint = () => {
  const features = []

  // 1. 浏览器 UserAgent
  features.push(navigator.userAgent || 'unknown')

  // 2. 屏幕分辨率与色深
  features.push(`${screen.width}x${screen.height}`)
  features.push(`${screen.colorDepth}`)

  // 3. 硬件平台 (e.g., Win32, MacIntel)
  features.push(navigator.platform || 'unknown')

  return features.join('|')
}
