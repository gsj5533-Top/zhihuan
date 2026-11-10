import trialConfig from './trial'
import releaseConfig from './release'

export type ProfileName = 'trial' | 'release'

/**
 * 应用运行形态配置。
 * 通过构建时的 APP_PROFILE 环境变量选择，默认 release（正式版）。
 * - trial   体验版：数据源为本地 mock，不依赖云开发，供体验成员试用
 * - release 正式版：数据源为微信云开发，云不可用时报错，绝不伪造数据
 */
export interface AppProfile {
  /** 配置名 */
  name: ProfileName
  /** 界面展示用名称 */
  label: string
  /** 数据源 */
  dataSource: 'mock' | 'cloud'
  /** 是否初始化微信云开发 */
  cloudInit: boolean
  /** 微信云开发环境 ID（正式版填写；留空则使用开发者工具当前默认环境） */
  cloudEnv: string
  /** 云登录失败时是否允许使用本地演示用户（正式版必须为 false） */
  allowMockUser: boolean
  /** 首页是否显示体验版标识 */
  showTrialBadge: boolean
}

/** 构建期常量，由 config/index.ts 的 defineConstants 注入，未注入时按 release 处理 */
const profileName: ProfileName = APP_PROFILE === 'trial' ? 'trial' : 'release'

const appProfile: AppProfile = profileName === 'trial' ? trialConfig : releaseConfig

export default appProfile
