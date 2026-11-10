import React from 'react'
import { View, Text, ScrollView, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import styles from './index.module.scss'

export default function ConfirmPage() {
  const onConfirm = () => {
    Taro.showModal({
      title: '确认已查看？',
      content: '确认后，对方复述 +2 与你 +2 教学反馈同时到账，不可撤回。',
      success: async r => {
        if (!r.confirm) return
        try {
          await callFunction('confirmRetell', { exchangeId: 'exc_azhou', retellerOpenid: 'mock-openid', direction: 'BtoA' })
          Taro.showToast({ title: '+2 教学反馈已到账', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1000)
        } catch {
          Taro.showToast({ title: '+2 已到账（演示）', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1000)
        }
      }
    })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <Text className={styles.title}>阿舟 复述了你的知识</Text>
      <Text className={styles.sub}>诗歌 ↔ 诗歌 · 已通过机审 · 等你确认</Text>

      <View className={styles.card}>
        <View className={styles.cardLabel}>复述内容</View>
        <View className={styles.cardText}>“把诗句拆成意象、节奏和情绪三层，再串回去就能读懂。”</View>
        <View className={styles.voiceBar}>
          <View className={styles.playBtn}>▶</View>
          <View className={styles.bars}>
            {Array.from({ length: 28 }).map((_, i) => (
              <View key={i} className={styles.barLine} style={{ height: `${30 + (i % 6) * 10}%` }} />
            ))}
          </View>
          <Text className={styles.time}>00:36</Text>
        </View>
      </View>

      <View className={styles.board}>
        <Canvas type="2d" style="width:100%;height:100%" />
      </View>

      <View className={styles.ptsPanel}>
        <View className={styles.ptsHead}>
          <Text className={styles.ptsLabel}>确认后同时到账</Text>
          <Text className={styles.ptsNum}>+2</Text>
        </View>
        <View className={styles.pcRow}>
          <View className={styles.pc}>你的教学反馈 +2</View>
          <View className={styles.pc}>对方复述 +2</View>
        </View>
      </View>

      <Text className={styles.note}>确认只生效一次，不可撤回。若交换到期仍未确认，双方都不计分。</Text>

      <View className={styles.foot}>
        <View className={styles.btnMain} onClick={onConfirm}>确认已查看</View>
      </View>
    </ScrollView>
  )
}
