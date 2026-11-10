import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Canvas, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import useAppStore from '@/store/useAppStore'
import useVoice from '@/hooks/useVoice'
import { classNames, formatDuration } from '@/utils'
import type { Exchange, Retell } from '@/types'
import styles from './index.module.scss'

type Tab = 'knowledge' | 'lecture' | 'retell'

export default function DetailPage() {
  const demoMedia = useAppStore(s => s.demoMedia)
  const voice = useVoice()
  const [tab, setTab] = useState<Tab>('lecture')
  const [exchange, setExchange] = useState<Exchange | null>(null)
  const [isOwner, setIsOwner] = useState(false) // true = 我是知识发送方
  const [pendingConfirm, setPendingConfirm] = useState(false)

  const images = exchange?.knowledgeA?.images?.length
    ? exchange.knowledgeA.images
    : demoMedia.images
  const lectureVoice = exchange?.knowledgeA?.lectureVoice || demoMedia.voiceUrl
  const lectureDuration = exchange?.knowledgeA?.lectureDuration || demoMedia.voiceDuration || 84

  const onPlayLecture = () => {
    if (!lectureVoice) {
      Taro.showToast({ title: '示例数据暂无真实录音，可先在发起页录一段', icon: 'none' })
      return
    }
    if (voice.playing) {
      voice.stopAll()
      return
    }
    voice.playUrl(lectureVoice, lectureDuration)
  }

  useEffect(() => { loadDetail() }, [])

  const loadDetail = async () => {
    try {
      const res = await callFunction<Exchange>('getExchangeDetail', { exchangeId: 'exc_lin' })
      setExchange(res)
      const myOpenid = 'mock-openid'
      setIsOwner(res?.initiatorOpenid === myOpenid)
      // 检查是否有待确认的复述（对方复述了我的知识）
      if (res && res.receiverOpenid === myOpenid && res.retellAtoB?.confirmStatus === 'pending') {
        setPendingConfirm(true)
      }
    } catch (err) {
      console.error('[Detail] 加载失败：', err)
    }
  }

  const onConfirm = () => {
    Taro.showModal({
      title: '确认已查看？',
      content: '确认后，对方复述 +2 与你 +2 教学反馈同时到账，不可撤回。',
      success: async r => {
        if (!r.confirm) return
        try {
          await callFunction('confirmRetell', { exchangeId: exchange?._id, retellerOpenid: exchange?.receiverOpenid, direction: 'AtoB' })
          Taro.showToast({ title: '+2 已到账', icon: 'success' })
          setPendingConfirm(false)
          loadDetail()
        } catch (err) {
          console.error('[Detail] 确认失败：', err)
        }
      }
    })
  }

  const onRetell = () => Taro.navigateTo({ url: `/pages/retell/index?exchangeId=${exchange?._id}&knowledgeId=${exchange?.knowledgeA?._id}` })

  return (
    <ScrollView scrollY className={styles.page}>
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24rpx' }}>
        <Text style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
          {isOwner ? '我的知识包' : `和 ${exchange?.receiverName || '林'} 的交换`}
        </Text>
        <View className={styles.badge}>3 / 5</View>
      </View>
      <View style={{ fontSize: 22, color: '#8A9A92', marginBottom: 8 }}>
        {exchange?.topic || '专业'} · {exchange?.status === 'in_progress' ? '进行中' : exchange?.status}
        <Text className={styles.badgeCoral} style={{ marginLeft: 16 }} onClick={() => Taro.showToast({ title: '已进入举报流程', icon: 'none' })}>举报</Text>
      </View>

      <View className={styles.seg}>
        <View className={classNames(styles.segBtn, tab === 'knowledge' && styles.active)} onClick={() => setTab('knowledge')}>知识内容</View>
        <View className={classNames(styles.segBtn, tab === 'lecture' && styles.active)} onClick={() => setTab('lecture')}>讲解</View>
        <View className={classNames(styles.segBtn, tab === 'retell' && styles.active)} onClick={() => setTab('retell')}>复述</View>
      </View>

      {tab === 'knowledge' && exchange?.knowledgeA && (
        <View className={styles.card}>
          <View className={styles.knowTitle}>{exchange.knowledgeA.title}</View>
          <View className={styles.knowContent}>{exchange.knowledgeA.content}</View>
          {images.length > 0 && (
            <View className={styles.knowImgs}>
              {images.map((src, i) => (
                <Image
                  key={src + i}
                  className={styles.knowImg}
                  src={src}
                  mode='aspectFill'
                  onClick={() => Taro.previewImage({ current: src, urls: images })}
                />
              ))}
            </View>
          )}
          <View className={styles.quote}>用户承诺原创或已获授权；专业标签只做学习交流，不提供官方报名、真题或押题。</View>
        </View>
      )}

      {tab === 'lecture' && (
        <View className={styles.card}>
          <View className={styles.board}>
            <Canvas type="2d" style="width:100%;height:100%" />
          </View>
          <View className={styles.voiceBar}>
            <View
              className={styles.btnFoot}
              style={{ height: 68, width: 68, borderRadius: 50, fontSize: 28 }}
              onClick={onPlayLecture}
            >
              {voice.playing ? '⏸' : '▶'}
            </View>
            <View style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const active =
                  voice.playing &&
                  lectureDuration > 0 &&
                  (i / 28) * lectureDuration <= voice.playSec
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      minWidth: 4,
                      borderRadius: 2,
                      background: active ? '#0B9E5F' : '#C6D8CF',
                      height: `${30 + (i % 6) * 12}%`
                    }}
                  />
                )
              })}
            </View>
            <Text style={{ fontSize: 24, color: '#8A9A92', minWidth: 72, textAlign: 'right' }}>
              {voice.playing ? formatDuration(voice.playSec) : formatDuration(lectureDuration)}
            </Text>
          </View>
        </View>
      )}

      {tab === 'retell' && (
        <View className={styles.card}>
          {pendingConfirm && isOwner && exchange?.retellAtoB?.auditStatus === 'passed' ? (
            <>
              <View className={styles.confirmStrip}>
                <View className={styles.confirmText}>
                  <Text style={{ fontWeight: 700, color: '#066B41', display: 'block' }}>对方已复述你的知识</Text>
                  <Text>确认后，双方 +2 同时到账，不可撤回</Text>
                </View>
                <View className={styles.btnFoot} style={{ width: 180, height: 72, fontSize: 24, padding: '0 24rpx' }} onClick={onConfirm}>
                  确认已查看
                </View>
              </View>
              <View className={styles.quote}>
                对方复述内容：用范围管理的三个判断讲了一遍（语音 36s）
              </View>
            </>
          ) : !isOwner ? (
            <>
              <View style={{ fontSize: 26, fontWeight: 500, textAlign: 'center', padding: '20rpx 0', color: '#8A9A92' }}>
                看完知识内容和讲解后，用自己的话复述一遍
              </View>
            </>
          ) : (
            <View style={{ textAlign: 'center', padding: '40rpx 0', color: '#8A9A92' }}>等待对方复述你的知识</View>
          )}
        </View>
      )}

      <View className={styles.ptsPanel}>
        <View className={styles.ptsHead}>
          <Text className={styles.ptsHeadText}>本交换我可获得</Text>
          <Text className={styles.ptsHeadNum}>+7</Text>
        </View>
        <View className={styles.pcRow}>
          <View className={styles.pc}>知识内容 +1</View>
          <View className={styles.pc}>讲解 +2</View>
          <View className={classNames(styles.pc, isOwner ? styles.wait : styles.on)}>复述 +2</View>
          <View className={classNames(styles.pc, !isOwner ? styles.wait : styles.on)}>教学反馈 +2</View>
        </View>
      </View>

      <View className={styles.foot}>
        <View
          className={pendingConfirm && isOwner ? styles.btnFoot : styles.btnFoot}
          onClick={isOwner ? (pendingConfirm ? onConfirm : () => Taro.showToast({ title: '等待对方复述', icon: 'none' })) : onRetell}
        >
          {isOwner
            ? (pendingConfirm ? '确认已查看 +2' : '等待对方复述')
            : '我来复述 +2'}
        </View>
      </View>
    </ScrollView>
  )
}
