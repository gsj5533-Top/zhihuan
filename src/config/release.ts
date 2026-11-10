import type { AppProfile } from './profile'

/**
 * 正式版（提审 / 上线）配置
 * - 数据源为微信云开发（cloudfunctions 下 8 个云函数 + 数据库集合）
 * - 云开发未初始化或调用失败时直接抛错，**不回落 mock、不伪造用户**
 * - 不含任何体验版标识
 *
 * 构建：npm run build:weapp:release（或默认的 npm run build:weapp）
 */
const releaseConfig: AppProfile = {
  name: 'release',
  label: '正式版',
  dataSource: 'cloud',
  cloudInit: true,
  /** 开通云开发后，把环境 ID 填在这里 */
  cloudEnv: '',
  allowMockUser: false,
  showTrialBadge: false
}

export default releaseConfig
