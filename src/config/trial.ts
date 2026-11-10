import type { AppProfile } from './profile'

/**
 * 体验版配置
 * 用于未开通云开发、未提交审核的内测场景：
 * - 全部数据来自 src/data 下的本地 mock
 * - 不初始化云开发，不发起任何云端请求
 * - 数据仅存在本机，换设备 / 换人看不到彼此的记录
 *
 * 构建：npm run build:weapp:trial
 */
const trialConfig: AppProfile = {
  name: 'trial',
  label: '体验版',
  dataSource: 'mock',
  cloudInit: false,
  cloudEnv: '',
  allowMockUser: true,
  showTrialBadge: true
}

export default trialConfig
