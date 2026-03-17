import { Client } from '@stomp/stompjs'
import { useUserStore } from '../stores/user'
import { SOCKET_SUBSCRIBE_PATH, SOCKET_TYPE } from '../constant/socket-constant'

let stompClient = null
let reconnectCount = 0
let maxReconnectAttempts = 5

// 仅保留用户专属配置
const CHAT_CONFIG_MAP = {
  [SOCKET_TYPE.USER]: {
    listenerMap: new Map(),
    destGenerator: (userId) => SOCKET_SUBSCRIBE_PATH.USER(userId),
    messageHandler: (message) => {},
    callbackHandler: (message, callback) => {
      message.chatMessageType = SOCKET_TYPE.USER
      callback(message)
    },
  },
}

export const socketCenter = {
  init: init,
  afterInit: afterInit,
  destroy: destroy,
  registerUserCallback: (userId, callback) => registerChatCallback(SOCKET_TYPE.USER, userId, callback),
  unregisterUserCallback: (userId, callback) => unregisterChatCallback(SOCKET_TYPE.USER, userId, callback),
}

// 通用回调注册
function registerChatCallback(chatType, userId, callback) {
  const config = CHAT_CONFIG_MAP[chatType]
  if (!config) {
    console.warn(`未知的消息类型：${chatType}`)
    return
  }
  userId = String(userId)
  const listenerMap = config.listenerMap
  if (!listenerMap.has(userId)) {
    const callbackSet = new Set()
    callbackSet.add(callback)
    listenerMap.set(userId, callbackSet)
  } else {
    listenerMap.get(userId).add(callback)
  }
}

// 通用回调取消
function unregisterChatCallback(chatType, userId, callback) {
  const config = CHAT_CONFIG_MAP[chatType]
  if (!config) {
    console.warn(`未知的消息类型：${chatType}`)
    return
  }
  userId = String(userId)
  const listenerMap = config.listenerMap
  if (listenerMap.has(userId)) {
    const callbackSet = listenerMap.get(userId)
    if (!callbackSet.has(callback)) {
      console.warn(`取消${chatType}回调：回调函数不存在`)
      return
    }
    callbackSet.delete(callback)
    if (callbackSet.size === 0) {
      listenerMap.delete(userId)
    }
  } else {
    console.warn(`取消${chatType}回调：无组件注册该用户的消息回调`)
  }
}

// 向后端注册用户路径订阅
function registerSocketSubscribe(chatType, userId, callback) {
  const config = CHAT_CONFIG_MAP[chatType]
  if (!config) {
    console.warn(`未知的消息类型：${chatType}`)
    return
  }
  userId = String(userId)
  const listenerMap = config.listenerMap
  const dest = config.destGenerator(userId)
  if (!listenerMap.has(userId)) {
    stompClient.subscribe(dest, (message) => handleReceiveMessage(chatType, JSON.parse(message.body)), { id: dest })
    const callbackSet = new Set()
    callbackSet.add(callback)
    listenerMap.set(userId, callbackSet)
  }
}

// 向后端取消用户路径订阅
function unregisterSocketSubscribe(chatType, userId) {
  const config = CHAT_CONFIG_MAP[chatType]
  if (!config) {
    console.warn(`未知的消息类型：${chatType}`)
    return
  }
  userId = String(userId)
  const listenerMap = config.listenerMap
  const dest = config.destGenerator(userId)
  if (listenerMap.has(userId)) {
    listenerMap.delete(userId)
    stompClient.unsubscribe(dest)
  }
}

// 通用消息处理
function handleReceiveMessage(chatType, res) {
  if (res.status !== '200') {
    console.error('接收到错误消息')
    return
  }
  const message = res.data
  const config = CHAT_CONFIG_MAP[chatType]
  const userId = String(message.userId)
  if (userId) {
    const listenerSet = config.listenerMap.get(userId)
    if (!listenerSet) {
      config.messageHandler(message)
    } else {
      listenerSet.forEach((callback) => {
        config.callbackHandler(message, callback)
      })
    }
  } else {
    console.warn('接收到未知格式的消息')
  }
}

// 初始化WebSocket连接
function init() {
  connectWebSocket()
}

// 连接成功后初始化
async function afterInit() {
  const userStore = useUserStore()
  const userId = userStore.userId
  registerSocketSubscribe(SOCKET_TYPE.USER, userId, () => {})
}

// 销毁WebSocket
function destroy() {
  const userStore = useUserStore()
  const userId = userStore.userId
  if (userId && stompClient) {
    unregisterSocketSubscribe(SOCKET_TYPE.USER, userId)
  }
  disconnectWebSocket()
  CHAT_CONFIG_MAP[SOCKET_TYPE.USER].listenerMap.clear()
}

// WebSocket连接核心逻辑
export function connectWebSocket(customConfig) {
  let onMaxReconnect = () => {}
  if (customConfig) {
    if (customConfig.onMaxReconnect) {
      onMaxReconnect = customConfig.onMaxReconnect
    }
    if (customConfig.maxReconnectAttempts) {
      maxReconnectAttempts = customConfig.maxReconnectAttempts
    }
  }

  const userStore = useUserStore()
  reconnectCount = 0 // 每次连接重置计数

  const addr = import.meta.env.VITE_WEBSOCKET_SERVER_URL
  const baseUrl = `http://${addr}:8080/ws`
  const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
  const webSocketFactory = () => new WebSocket(wsUrl)

  stompClient = new Client({
    webSocketFactory,
    connectHeaders: {
      'user-auth-token': userStore.userAuthToken,
    },
    reconnectDelay: 2000, // 初始重连间隔2秒
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  // 连接成功：重置重连计数
  stompClient.onConnect = async () => {
    reconnectCount = 0
    await afterInit()
  }

  // STOMP协议错误：触发重连计数
  stompClient.onStompError = (error) => {
    console.error('STOMP连接错误:', error)
    if (reconnectCount < maxReconnectAttempts) {
      handleReconnect(onMaxReconnect)
    }
  }

  // WebSocket底层连接错误：触发重连计数（新增覆盖场景）
  stompClient.onWebSocketError = (error) => {
    console.error('WebSocket底层连接错误:', error)
    if (reconnectCount < maxReconnectAttempts) {
      handleReconnect(onMaxReconnect)
    }
  }

  // 连接断开：仅在未达上限时触发重连（避免死循环）
  stompClient.onDisconnect = (frame) => {
    console.warn('STOMP连接已断开')
    if (stompClient && reconnectCount < maxReconnectAttempts) {
      handleReconnect(onMaxReconnect)
    }
  }

  stompClient.activate()
}

// 重连逻辑
function handleReconnect(onMaxReconnect) {
  reconnectCount++
  if (reconnectCount >= maxReconnectAttempts) {
    console.error(`已超过最大重连次数(${maxReconnectAttempts})，停止重连`)
    // 禁用stompjs内置自动重连
    if (stompClient) {
      stompClient.reconnectDelay = 0
    }
    disconnectWebSocket()
    if (typeof onMaxReconnect === 'function') {
      onMaxReconnect()
    }
  }
}

// 断开WebSocket连接（仅处理用户订阅）
export function disconnectWebSocket() {
  if (stompClient) {
    const userStore = useUserStore()
    const userId = userStore.userId
    if (userId) {
      unregisterSocketSubscribe(SOCKET_TYPE.USER, userId)
    }
    stompClient.deactivate()
    stompClient = null
    reconnectCount = 0
  }
}

// 发送用户消息（更名，移除群聊消息发送）
export function sendUserMessage(userId, senderId, receiverId, sendDatetime, content, atList = []) {
  if (stompClient && stompClient.connected) {
    const message = {
      data: {
        userId,
        senderId,
        receiverId,
        sendDatetime,
        content,
        atList,
      },
      status: '200',
      message: '用户消息已发送',
    }
    stompClient.publish({
      destination: '/app/user',
      body: JSON.stringify(message),
    })
  } else {
    console.error('WebSocket未连接，无法发送消息')
  }
}
