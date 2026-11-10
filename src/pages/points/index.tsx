import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import useAppStore from '@/store/useAppStore'
import type { PointRecord } from '@/types'
import { formatRelative } from '@/utils'
import styles from './index.module.scss'

const typeMap: Record<string, { label: string; icon: string }> = {
  knowledge: { label: '发送知识内容', icon: '✎' },
  lecture: { label: '讲解', icon: '♪' },
  retell: { label: '复述对方知识', icon: '⇄' },
  feedback: { label: '教学反馈', icon: '★' }
}

export default function PointsPage() {
  const { points, weeklyPoints } = useAppStore()
  const [records, setRecords] = useState<PointRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'revoked'>('all')

  useDidShow(() => { fetchPoints() })
  useEffect(() => { fetchPoints() }, [])

  const fetchPoints = async () => {
    try {
      const data = await callFunction<PointRecord[]>('getPoints')
      setRecords(data || [])
    } catch (err) {
      console.error('[PointsPage] 加载失败：', err)
    }
  }

  const filtered = records.filter(r => filter === 'all' ? true : r.status === filter)

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.balance}>
        <View className={styles.balanceSmall}>当前积分</View>
        <View className={styles.balanceTitle}>{points}<em>分</em></View>
        <View className={styles.balanceRow}>
          <Text>本周 +{weeklyPoints}</Text>
          <Text>累计 132</Text>
          <Text>已撤销 2</Text>
        </View>
      </View>

      <View className={styles.filters}>
        {(['all', 'active', 'pending', 'revoked'] as const).map(f => (
          <View key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? '全部' : f === 'active' ? '已生效' : f === 'pending' ? '待确认' : '已撤销'}
          </View>
        ))}
      </View>

      <View className={styles.txList}>
        {filtered.length === 0 ? (
          <View className={styles.empty}>没有符合条件的积分记录</View>
        ) : filtered.map(r => {
          const info = typeMap[r.type] || { label: r.type, icon: '•' }
          return (
            <View key={r._id} className={styles.tx}>
              <View className={`${styles.txIcon} ${r.status === 'pending' ? styles.txIconPending : r.status === 'revoked' ? styles.txIconUndo : ''}`}>{info.icon}</View>
              <View className={styles.txInfo}>
                <View className={styles.txTitle}>{info.label}</View>
                <View className={styles.txSub}>
                  {formatRelative(r.createTime)} · {r.status === 'active' ? '已生效' : r.status === 'pending' ? '待确认' : '已撤销'}
                </View>
              </View>
              <View className={`${styles.txPts} ${r.status === 'pending' ? styles.txPtsPending : r.status === 'revoked' ? styles.txPtsUndo : ''}`}>
                {r.points > 0 ? '+' : ''}{r.points}
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
