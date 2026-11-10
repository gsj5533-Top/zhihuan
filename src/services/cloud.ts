import Taro from '@tarojs/taro'
import appProfile from '@/config/profile'
import loginMock from '@/data/login'
import getExchangesMock from '@/data/getExchanges'
import getExchangeDetailMock from '@/data/getExchangeDetail'
import createExchangeMock from '@/data/createExchange'
import submitRetellMock from '@/data/submitRetell'
import confirmRetellMock from '@/data/confirmRetell'
import getPointsMock from '@/data/getPoints'
import reportMock from '@/data/report'

type MockFn = (data?: Record<string, any>) => any

// 静态映射：webpack 不支持动态表达式 import，必须显式列出
const mockMap: Record<string, MockFn> = {
  login: loginMock,
  getExchanges: getExchangesMock,
  getExchangeDetail: getExchangeDetailMock,
  createExchange: createExchangeMock,
  submitRetell: submitRetellMock,
  confirmRetell: confirmRetellMock,
  getPoints: getPointsMock,
  report: reportMock
}

const isWeapp = process.env.TARO_ENV === 'weapp'

/** 云环境是否可用（小程序端且 Taro.cloud 已挂载） */
function hasCloud(): boolean {
  if (!isWeapp) return false
  const cloud = (Taro as any).cloud
  return !!cloud && typeof cloud.callFunction === 'function'
}

function runMock<T>(name: string, data?: Record<string, any>): T {
  const fn = mockMap[name]
  if (!fn) {
    throw new Error(`[Cloud] 本地 mock 不存在: ${name}`)
  }
  return fn(data) as T
}

/**
 * 调用云函数。
 *
 * 行为由构建形态决定（src/config/profile.ts）：
 * - 体验版（trial）：直接使用本地 mock，不发任何云端请求
 * - H5 等非小程序端：使用本地 mock
 * - 正式版（release）：必须走云端；云未初始化或调用失败时直接抛错，
 *   绝不回落到 mock，避免正式环境出现假数据
 */
export async function callFunction<T = any>(
  name: string,
  data?: Record<string, any>
): Promise<T> {
  if (appProfile.dataSource === 'mock' || !isWeapp) {
    return runMock<T>(name, data)
  }

  if (!hasCloud()) {
    throw new Error('[Cloud] 云开发未初始化，正式版必须配置云环境')
  }

  const res = await Taro.cloud.callFunction({ name, data })
  const result = res.result as { code: number; message: string; data: T }
  if (result.code !== 0) {
    console.error(`[Cloud] ${name} failed:`, result.message)
    throw new Error(result.message || '请求失败')
  }
  return result.data
}

export function getDatabase() {
  if (appProfile.dataSource === 'mock' || !hasCloud()) {
    return null
  }
  return Taro.cloud.database()
}
