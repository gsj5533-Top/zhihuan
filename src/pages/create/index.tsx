import React, { useState } from 'react'
import { View, Text, ScrollView, Input, Textarea, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import useAppStore from '@/store/useAppStore'
import useVoice from '@/hooks/useVoice'
import WhiteBoard from '@/components/WhiteBoard'
import { classNames, formatDuration } from '@/utils'
import styles from './index.module.scss'

/**
 * 从标题中解析自定义主题：
 * 形如 "#专业 范围管理的三个关键判断" → 主题为 "专业"
 * 形如 "#诗歌" → 主题为 "诗歌"
 * 没有 # 则返回空串
 */
function parseTopic(title: string): string {
  const m = title.match(/^#([^\s#]+)/)
  return m ? m[1] : ''
}

export default function CreatePage() {
  const setDemoMedia = useAppStore(s => s.setDemoMedia)
  const [title, setTitle] = useState('#专业 范围管理的三个关键判断')
  const [content, setContent] = useState('先定边界，再拆工作包，最后写验收标准。三者缺一，项目就会在变更里失控。')
  const [images, setImages] = useState<string[]>([])
  const [inkCount, setInkCount] = useState(0)

  const voice = useVoice()

  const topic = parseTopic(title)

  const pickImages = async () => {
    if (images.length >= 6) {
      Taro.showToast({ title: '最多 6 张图片', icon: 'none' })
      return
    }
    try {
      const res = await Taro.chooseImage({
        count: 6 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const paths = (res.tempFilePaths || []) as string[]
      if (paths.length) {
        setImages(prev => [...prev, ...paths].slice(0, 6))
      }
    } catch (err) {
      console.warn('[Create] 选择图片取消或失败：', err)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const previewImage = (current: string) => {
    Taro.previewImage({ current, urls: images })
  }

  const send = async () => {
    if (!title.trim()) return Taro.showToast({ title: '请填写标题', icon: 'none' })
    if (!content.trim()) return Taro.showToast({ title: '请填写知识内容', icon: 'none' })
    if (!topic) return Taro.showToast({ title: '请在标题开头用 # 设置主题', icon: 'none' })
    if (!voice.hasVoice && inkCount === 0) {
      return Taro.showToast({ title: '讲解需要至少一段语音或一页白板', icon: 'none' })
    }
    if (voice.recording) {
      Taro.showToast({ title: '正在录音，请先结束录音', icon: 'none' })
      return
    }

    // 云未部署时，把本次媒体暂存到本地，详情页可直接查看/试听
    setDemoMedia({
      images,
      voiceUrl: voice.url,
      voiceDuration: voice.duration
    })

    try {
      await callFunction('createExchange', {
        topic,
        title: title.replace(/^#\S+\s*/, '').trim(),
        content,
        images,
        lectureVoice: voice.url,
        lectureDuration: voice.duration,
        boardStrokes: inkCount
      })
    } catch (e) {
      console.warn('[Create] createExchange 降级：', e)
    }
    Taro.showActionSheet({
      itemList: ['分享卡片给微信好友', '复制邀请链接', '邀请码发送'],
      success: () => {
        Taro.showToast({ title: '邀请已发送', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 800)
      }
    })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.blockCard}>
        <View className={styles.blockHead}>
          <Text className={styles.blockTitle}>知识内容</Text>
          <Text className={styles.blockTag}>文字 + 图片 · +1</Text>
        </View>
        <Input
          className={styles.inputTitle}
          value={title}
          onInput={e => setTitle(e.detail.value)}
          placeholder='#主题 给知识起一个标题（5-40字）'
          maxlength={40}
        />
        {topic ? (
          <View className={styles.topicHint}>
            <Text className={styles.topicHash}>#</Text>
            <Text className={styles.topicText}>{topic}</Text>
            <Text className={styles.topicDesc}>将作为本交换的主题标签</Text>
          </View>
        ) : (
          <View className={styles.topicHintEmpty}>在标题开头输入 #主题 来自定义分类，如 #诗歌、#菜谱</View>
        )}
        <Textarea
          className={styles.inputContent}
          value={content}
          onInput={e => setContent(e.detail.value)}
          placeholder='写下你要讲的核心内容（20-2000字）'
          maxlength={2000}
        />
        <View className={styles.imgRow}>
          {images.map((src, i) => (
            <View key={src + i} className={styles.imgThumb} onClick={() => previewImage(src)}>
              <Image className={styles.imgThumbInner} src={src} mode='aspectFill' />
              <View
                className={styles.imgDel}
                onClick={e => {
                  e.stopPropagation()
                  removeImage(i)
                }}
              >
                ×
              </View>
            </View>
          ))}
          {images.length < 6 && (
            <View className={`${styles.imgBox} ${styles.add}`} onClick={pickImages}>
              +
            </View>
          )}
        </View>
      </View>

      <View className={styles.blockCard}>
        <View className={styles.blockHead}>
          <Text className={styles.blockTitle}>讲解</Text>
          <Text className={styles.blockTag}>语音 + 白板 + 图片 · +2</Text>
        </View>

        <WhiteBoard
          id='board_create'
          height={360}
          tip='在框内手写、画图'
          onStrokeCountChange={setInkCount}
        />

        <View className={styles.voice}>
          <View
            className={classNames(styles.mic, voice.recording && styles.rec)}
            onClick={voice.toggleRecord}
          >
            {voice.recording ? '■' : '●'}
          </View>
          <View className={styles.bars}>
            {Array.from({ length: 28 }).map((_, i) => {
              const active =
                voice.playing && voice.duration > 0 && (i / 28) * voice.duration <= voice.playSec
              return (
                <View
                  key={i}
                  className={styles.barLine}
                  style={{
                    height: `${20 + (i % 5) * 15 + (voice.recording || voice.playing ? 30 : 0)}%`,
                    background: active ? '#0B9E5F' : '#C6D8CF',
                    animationDelay: `${(i * 42) % 400}ms`,
                    animation:
                      voice.recording || voice.playing
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

        {voice.hasVoice && (
          <View className={styles.voiceActions}>
            <View className={styles.actionBtn} onClick={voice.togglePlay}>
              {voice.playing ? '⏸ 暂停回放' : '▶ 回放录音'}
            </View>
            <View className={styles.actionBtnDanger} onClick={voice.deleteVoice}>
              删除录音
            </View>
          </View>
        )}
      </View>

      <Text className={styles.note}>
        对方接受交换后，知识内容 +1、讲解 +2 生效；讲解必须至少有一段语音或一页白板。{' '}
        内容提交后将经过机审，违规内容会被拦截。
      </Text>

      <View className={styles.foot}>
        <View className={styles.btnFoot} onClick={send}>
          发送给对方
        </View>
      </View>
    </ScrollView>
  )
}
