import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import useVoice from '@/hooks/useVoice'
import WhiteBoard from '@/components/WhiteBoard'
import { classNames, formatDuration } from '@/utils'
import styles from './index.module.scss'

export default function RetellPage() {
  const [mode, setMode] = useState<'voice' | 'board'>('voice')
  const [inkCount, setInkCount] = useState(0)

  const voice = useVoice()

  const submit = async () => {
    if (mode === 'voice' && !voice.hasVoice) {
      return Taro.showToast({ title: '请先录语音', icon: 'none' })
    }
    if (mode === 'board' && inkCount < 3) {
      return Taro.showToast({ title: '白板至少写 3 笔', icon: 'none' })
    }
    if (voice.recording) {
      return Taro.showToast({ title: '正在录音，请先结束录音', icon: 'none' })
    }
    voice.stopAll()
    try {
      await callFunction('submitRetell', {
        exchangeId: 'exc_lin',
        knowledgeId: 'ka_lin',
        form: mode,
        voicePath: voice.url,
        duration: voice.duration,
        boardStrokes: inkCount
      })
      Taro.showToast({ title: '已提交，等待对方确认', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 900)
    } catch (err) {
      console.error('[Retell] 提交失败：', err)
      Taro.showToast({ title: '已提交（演示）', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 900)
    }
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.modeSwitch}>
        <View
          className={classNames(styles.modeBtn, mode === 'voice' && styles.active)}
          onClick={() => setMode('voice')}
        >
          语音复述
        </View>
        <View
          className={classNames(styles.modeBtn, mode === 'board' && styles.active)}
          onClick={() => setMode('board')}
        >
          白板复述
        </View>
      </View>

      {mode === 'voice' ? (
        <View className={styles.recCard}>
          <Text className={styles.recLine}>
            {voice.recording
              ? `录音中… ${formatDuration(voice.duration)}`
              : voice.hasVoice
                ? `已录制 ${formatDuration(voice.duration)}`
                : '未开始'}
          </Text>
          <View
            className={classNames(styles.bigMic, voice.recording && styles.rec)}
            onClick={voice.toggleRecord}
          >
            {voice.recording ? '■' : '●'}
          </View>
          <Text className={styles.tip}>点击开始录音，再次点击结束；建议 30 秒以上</Text>

          {voice.hasVoice && (
            <>
              <View className={styles.voiceBar}>
                <View className={styles.playBtn} onClick={voice.togglePlay}>
                  {voice.playing ? '⏸' : '▶'}
                </View>
                <View className={styles.bars}>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const active =
                      voice.playing &&
                      voice.duration > 0 &&
                      (i / 28) * voice.duration <= voice.playSec
                    return (
                      <View
                        key={i}
                        className={styles.barLine}
                        style={{
                          height: `${20 + (i % 6) * 12}%`,
                          background: active ? '#0B9E5F' : '#C6D8CF',
                          animation: voice.playing
                            ? 'wobble 0.6s ease-in-out infinite alternate'
                            : undefined
                        } as any}
                      />
                    )
                  })}
                </View>
                <Text className={styles.time}>
                  {voice.playing ? formatDuration(voice.playSec) : formatDuration(voice.duration)}
                </Text>
              </View>
              <View className={styles.voiceActions}>
                <View className={styles.actionBtn} onClick={voice.togglePlay}>
                  {voice.playing ? '暂停回放' : '回放录音'}
                </View>
                <View className={styles.actionBtnDanger} onClick={voice.deleteVoice}>
                  删除录音
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <View className={styles.boardCard}>
          <WhiteBoard
            id='board_retell'
            height={380}
            tip='至少写 3 笔，用图示讲清你的理解'
            onStrokeCountChange={setInkCount}
          />
        </View>
      )}

      <Text className={styles.note}>
        复述通过机审后进入「待对方确认」。对方确认已查看后，你 +2、对方 +2
        教学反馈同时到账；交换过期未确认则双方都不计分。
      </Text>

      <View className={styles.foot}>
        <View className={styles.btnGhost} onClick={voice.deleteVoice}>
          重录
        </View>
        <View className={styles.btnMain} onClick={submit}>
          提交复述 +2
        </View>
      </View>
    </ScrollView>
  )
}
