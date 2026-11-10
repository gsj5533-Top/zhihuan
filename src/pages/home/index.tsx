import React, { useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import appProfile from '@/config/profile'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

const topicColor: Record<string, string> = {
  专业: '专业',
  诗歌: '诗歌',
  菜谱: '菜谱',
  冷知识: '冷知识'
}

export default function HomePage() {
  const { user, points, exchanges, pendingConfirmations, completedExchanges, refreshHome } = useAppStore()

  useDidShow(() => { refreshHome() })

  useEffect(() => {
    console.info('[Home] 渲染首页，积分 =', points)
  }, [points])

  const onGoCreate = () => Taro.navigateTo({ url: '/pages/create/index' })
  const onGoDetail = (exchangeId: string) => Taro.navigateTo({ url: `/pages/detail/index?exchangeId=${exchangeId}` })
  const onGoConfirm = () => {
    if (pendingConfirmations.length > 0) {
      Taro.navigateTo({ url: `/pages/detail/index?exchangeId=${pendingConfirmations[0]._id}&mode=confirm` })
    } else {
      Taro.showToast({ title: '暂无待确认', icon: 'none' })
    }
  }

  return (
    <ScrollView scrollY className={styles.page}>
      {/* Header */}
      <View className={styles.header}>
        <View>
          <View className={styles.headerTitle}>知换</View>
          <View className={styles.headerSub}>1 对 1 知识交换 · 双方各 +7 积分</View>
          {appProfile.showTrialBadge && (
            <View className={styles.trialTag}>{appProfile.label} · 演示数据仅存本机</View>
          )}
        </View>
        <View className={styles.ptChip} onClick={() => Taro.switchTab({ url: '/pages/points/index' })}>
          <Text>◎</Text><Text>{points}</Text>
        </View>
      </View>

      {/* Hero */}
      <View className={styles.hero}>
        <View className={styles.heroLabel}>START A SWAP</View>
        <View className={styles.heroTitle}>把你的知识讲给对方</View>
        <View className={styles.heroDesc}>
          对方复述并确认后，你会得到教学反馈 +2。一次完整交换，双方各 +7 积分。
        </View>
        <View className={styles.heroFoot}>
          <View className={styles.heroDot} />
          <Text>一次完整交换，双方各 +7 积分</Text>
        </View>
        <View className={styles.heroBtn} onClick={onGoCreate}>发起交换</View>
      </View>

      {/* 待我确认 */}
      {pendingConfirmations.length > 0 && (
        <>
          <View className={styles.sectionHead}>
            <Text>待我确认</Text>
            <Text>{pendingConfirmations.length} 个</Text>
          </View>
          {pendingConfirmations.map(exchange => {
            const retell = exchange.retellAtoB?.confirmStatus === 'pending'
              ? exchange.retellAtoB
              : exchange.retellBtoA
            const confirmTo = exchange.retellAtoB?.confirmStatus === 'pending' ? 'AtoB' : 'BtoA'
            const partnerName = confirmTo === 'AtoB' ? exchange.receiverName || '对方' : exchange.initiatorName
            return (
              <View key={exchange._id} className={`${styles.card} ${styles.cardConfirm}`} onClick={onGoConfirm}>
                <View className={styles.cardTop}>
                  <View className={styles.avatars}>
                    <View className={styles.av}>{partnerName.slice(-1)}</View>
                    <View className={`${styles.av} ${styles.avMe}`}>我</View>
                  </View>
                  <View className={styles.cardInfo}>
                    <View className={styles.cardName}>{partnerName} 复述了你的知识</View>
                    <View className={styles.cardTopic}>{exchange.topic} · 已通过机审{retell?.duration ? ' · ' + Math.floor(retell.duration / 60) + ':' + String(retell.duration % 60).padStart(2,'0') : ''}</View>
                  </View>
                  <View className={`${styles.status} ${styles.statusGreen}`}>待确认</View>
                </View>
                <View className={styles.cardFoot}>
                  <View className={styles.cardFootDesc}>确认后，双方 +2 同时到账，不可撤回</View>
                  <View className={`${styles.btnSmall}`} onClick={(e) => { e.stopPropagation(); onGoConfirm() }}>去确认</View>
                </View>
              </View>
            )
          })}
        </>
      )}

      {/* 进行中 */}
      <View className={styles.sectionHead}>
        <Text>进行中</Text>
        <Text>{exchanges.length} 个</Text>
      </View>
      {exchanges.length === 0 ? (
        <View className={styles.empty}>暂无进行中的交换</View>
      ) : exchanges.map(exchange => {
        const myOpenid = user?._openid || 'mock-openid'
        const isInitiator = exchange.initiatorOpenid === myOpenid
        const partnerName = isInitiator ? (exchange.receiverName || '等待对方接受') : exchange.initiatorName
        const hasRetell = (isInitiator ? exchange.retellBtoA : exchange.retellAtoB)?.auditStatus === 'passed'
        const retellConfirmed = (isInitiator ? exchange.retellBtoA : exchange.retellAtoB)?.confirmStatus === 'confirmed'
        const progress = retellConfirmed ? 5 : hasRetell ? 4 : 3
        return (
          <View key={exchange._id} className={styles.card} onClick={() => onGoDetail(exchange._id!)}>
            <View className={styles.cardTop}>
              <View className={styles.avatars}>
                <View className={styles.av}>{partnerName.slice(-1)}</View>
                <View className={`${styles.av} ${styles.avMe}`}>我</View>
              </View>
              <View className={styles.cardInfo}>
                <View className={styles.cardName}>和 {partnerName} 的交换</View>
                <View className={styles.cardTopic}>
                  {isInitiator ? `我发起 → 等对方复述` : `${exchange.topic} · 我来复述`}
                </View>
              </View>
              <View className={styles.status}>{hasRetell ? '已复述 · 待确认' : '进行中'}</View>
            </View>
            <View className={styles.progressRow}>
              <View className={styles.progressBar}>
                <View className={styles.progressFill} style={{ width: `${progress * 20}%` }} />
              </View>
              <Text className={styles.progressText}>{progress} / 5</Text>
            </View>
            <View className={styles.cardFoot}>
              <View className={styles.cardFootDesc}>
                {isInitiator
                  ? (hasRetell ? '等待对方确认你的复述' : '等待对方接受交换并复述')
                  : '下一步：复述对方的知识'}
              </View>
              <View className={`${styles.btnSmall} ${styles.btnGhost}`} onClick={(e) => { e.stopPropagation(); onGoDetail(exchange._id!) }}>查看</View>
            </View>
          </View>
        )
      })}

      {/* 最近完成 */}
      <View className={styles.sectionHead}>
        <Text>最近完成</Text>
        <Text>全部 ›</Text>
      </View>
      {completedExchanges.length === 0 && (
        <View className={styles.doneRow}>
          <View className={styles.doneOk}>✓</View>
          <View className={styles.doneInfo}>
            <View className={styles.doneName}>和清野的交换</View>
            <View className={styles.doneDesc}>冷知识 ↔ 菜谱 · 双方各 +7</View>
          </View>
          <View className={styles.donePt}>+7</View>
        </View>
      )}
      {completedExchanges.map(exchange => {
        const partnerName = exchange.initiatorOpenid === (user?._openid || 'mock-openid')
          ? exchange.receiverName : exchange.initiatorName
        return (
          <View key={exchange._id} className={styles.doneRow}>
            <View className={styles.doneOk}>✓</View>
            <View className={styles.doneInfo}>
              <View className={styles.doneName}>和 {partnerName} 的交换</View>
              <View className={styles.doneDesc}>{exchange.topic} · 双方各 +7</View>
            </View>
            <View className={styles.donePt}>+7</View>
          </View>
        )
      })}
    </ScrollView>
  )
}
