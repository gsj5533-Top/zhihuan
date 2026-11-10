import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

export default function MinePage() {
  const { user, points } = useAppStore()
  useDidShow(() => { console.info('[Mine] 用户 =', user) })

  const goHome = () => Taro.switchTab({ url: '/pages/home/index' })
  const goPoints = () => Taro.switchTab({ url: '/pages/points/index' })
  const goAdmin = () => Taro.navigateTo({ url: '/pages/admin/index' })
  const showToast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' })

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={`${styles.paddingH}`}></View>

      <View className={styles.meCard}>
        <View className={styles.meAv}>{user?.nickname?.slice(-1) || '我'}</View>
        <View className={styles.meInfo}>
          <View className={styles.meName}>{user?.nickname || '微信用户'}</View>
          <View className={styles.meDesc}>累计完成 {user?.completedCount || 18} 次交换 · 积分 {points}</View>
        </View>
        <View className={styles.meLevel}>Lv.{user?.level || 4}</View>
      </View>

      <View className={styles.menu}>
        <View className={styles.menuRow} onClick={goHome}>
          <View className={styles.menuIcon}>⇄</View>
          <View className={styles.menuText}>我的交换</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuRow} onClick={goPoints}>
          <View className={styles.menuIcon}>◎</View>
          <View className={styles.menuText}>积分明细</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuRow} onClick={() => showToast('暂无举报记录')}>
          <View className={styles.menuIcon}>!</View>
          <View className={styles.menuText}>举报记录</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuRow} onClick={() => showToast('黑名单为空')}>
          <View className={styles.menuIcon}>⊘</View>
          <View className={styles.menuText}>黑名单</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuRow} onClick={goAdmin}>
          <View className={styles.menuIcon}>⚙</View>
          <View className={styles.menuText}>管理后台（演示）</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={`${styles.paddingH} ${styles.note}`}>
        <Text>无公开内容流：他人内容只在 1 对 1 交换内可见。</Text>
        <Text>{'\n'}文本、图片、白板截图、语音全部经过机审。</Text>
      </View>
    </ScrollView>
  )
}
