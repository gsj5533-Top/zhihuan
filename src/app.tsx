import React, { useEffect } from 'react'
import Taro from '@tarojs/taro'
import appProfile from '@/config/profile'
import useAppStore from '@/store/useAppStore'
import './app.scss'

function App(props: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp' && appProfile.cloudInit && (Taro as any).cloud) {
      try {
        Taro.cloud.init({ env: appProfile.cloudEnv || undefined, traceUser: true })
        console.info('[Cloud] 微信云开发初始化成功')
      } catch (err) {
        console.error('[Cloud] 初始化失败：', err)
      }
    } else {
      console.info(`[Cloud] 当前为${appProfile.label}，数据源：${appProfile.dataSource}`)
    }
    useAppStore.getState().initialize()
  }, [])

  return <>{props.children}</>
}

export default App
