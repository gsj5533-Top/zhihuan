import React, { useRef, useState } from 'react'
import { View, Text, ScrollView, Input, Textarea, Image, Button, Canvas } from '@tarojs/components'
import Taro, { useShareAppMessage } from '@tarojs/taro'
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

/**
 * 生成邀请码（体验版：固定码；正式版：应从云函数 createExchange 返回）
 */
function makeInviteCode(exchangeId?: string): string {
  if (exchangeId) return `ZH-${exchangeId.slice(-6).toUpperCase()}`
  // 体验版 fallback：时间戳 + 随机 4 位
  const t = Date.now().toString(36).slice(-4).toUpperCase()
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ZH-${t}${r}`
}

export default function CreatePage() {
  const setDemoMedia = useAppStore(s => s.setDemoMedia)
  const [title, setTitle] = useState('#专业 范围管理的三个关键判断')
  const [content, setContent] = useState('先定边界，再拆工作包，最后写验收标准。三者缺一，项目就会在变更里失控。')
  const [images, setImages] = useState<string[]>([])
  const [inkCount, setInkCount] = useState(0)
  const [inviteCode, setInviteCode] = useState('')
  const [showShareSheet, setShowShareSheet] = useState(false)

  const posterCanvasId = 'poster_canvas'
  const voice = useVoice()
  const topic = parseTopic(title)

  // -------- 分享卡片给好友（微信官方分享机制）--------
  useShareAppMessage(() => ({
    title: `【知换】${topic ? '#' + topic : ''}${title.replace(/^#\S+\s*/, '').trim()}`,
    path: `/pages/home/index?inviteCode=${inviteCode}`
  }))

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

    let exchangeId: string | undefined
    try {
      const res = await callFunction<{ _id?: string }>('createExchange', {
        topic,
        title: title.replace(/^#\S+\s*/, '').trim(),
        content,
        images,
        lectureVoice: voice.url,
        lectureDuration: voice.duration,
        boardStrokes: inkCount
      })
      exchangeId = res?._id
    } catch (e) {
      console.warn('[Create] createExchange 降级：', e)
    }

    // 生成邀请码 + 打开分享面板
    const code = makeInviteCode(exchangeId)
    setInviteCode(code)
    setShowShareSheet(true)
  }

  // -------- 复制邀请码 --------
  const copyInviteCode = () => {
    const text = `【知换】${title.replace(/^#\S+\s*/, '').trim()}\n邀请码：${inviteCode}\n打开微信搜索「知换」小程序，首页输入邀请码即可接收到我的知识交换邀请。`
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: '邀请码已复制', icon: 'success' })
      }
    })
  }

  // -------- 生成海报并保存到相册 --------
  const savePoster = async () => {
    try {
      // 先请求相册权限
      const auth = await Taro.getSetting()
      if (!auth.authSetting['scope.writePhotosAlbum']) {
        await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
      }

      // 获取 canvas 节点
      const canvasRes = await Taro.createSelectorQuery()
        .select('#' + posterCanvasId)
        .fields({ node: true, size: true })
        .exec()

      const canvas = canvasRes[0]?.node
      if (!canvas) {
        Taro.showToast({ title: '海报生成失败', icon: 'none' })
        return
      }
      const ctx = canvas.getContext('2d')
      const dpr = Taro.getSystemInfoSync().pixelRatio || 2
      const W = 600
      const H = 900
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)

      // 背景
      ctx.fillStyle = '#0B9E5F'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      ctx.fillRect(20, 20, W - 40, H - 40)

      // 标题
      ctx.fillStyle = '#0B9E5F'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('知 换', W / 2, 80)

      // 主题 + 知识标题
      ctx.fillStyle = '#1F2D28'
      ctx.font = 'bold 24px sans-serif'
      const displayTopic = topic ? '#' + topic : ''
      const displayTitle = title.replace(/^#\S+\s*/, '').trim() || '知识交换'
      ctx.fillText(`${displayTopic} ${displayTitle}`.trim(), W / 2, 140)

      // 邀请码大字
      ctx.fillStyle = '#0B9E5F'
      ctx.font = 'bold 48px monospace'
      ctx.fillText(inviteCode, W / 2, 260)

      // 副标题
      ctx.fillStyle = '#8A9A92'
      ctx.font = '20px sans-serif'
      ctx.fillText('扫码或复制邀请码，一起交换知识', W / 2, 320)

      // 占位：模拟二维码区域（没有后端无法生成真实小程序码）
      ctx.fillStyle = '#F2F6F4'
      ctx.fillRect(W / 2 - 100, 380, 200, 200)
      ctx.strokeStyle = '#0B9E5F'
      ctx.lineWidth = 2
      ctx.strokeRect(W / 2 - 100, 380, 200, 200)
      ctx.fillStyle = '#0B9E5F'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText('知换', W / 2, 490)
      ctx.fillStyle = '#8A9A92'
      ctx.font = '16px sans-serif'
      ctx.fillText('（小程序码·正式版生成）', W / 2, 520)

      // 底部提示
      ctx.fillStyle = '#8A9A92'
      ctx.font = '18px sans-serif'
      ctx.fillText('微信搜索「知换」· 邀请码可直接输入', W / 2, 820)

      // 导出图片
      const tempRes = await Taro.canvasToTempFilePath({
        canvas,
        fileType: 'jpg',
        quality: 0.9
      } as any)

      await Taro.saveImageToPhotosAlbum({ filePath: tempRes.tempFilePath })
      Taro.showToast({ title: '海报已保存到相册', icon: 'success' })
    } catch (err: any) {
      if (err?.errMsg?.includes('auth deny') || err?.errMsg?.includes('authorize')) {
        Taro.showModal({
          title: '需要相册权限',
          content: '请在设置中允许保存图片到相册',
          confirmText: '去设置',
          success: r => {
            if (r.confirm) Taro.openSetting()
          }
        })
      } else {
        console.error('[Create] 生成海报失败：', err)
        Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    }
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

      {/* 分享面板 */}
      {showShareSheet && (
        <View className={styles.shareMask} onClick={() => setShowShareSheet(false)}>
          <View className={styles.shareSheet} onClick={e => e.stopPropagation()}>
            <View className={styles.shareTitle}>交换已创建，邀请对方加入</View>
            <View className={styles.shareCode}>
              <Text className={styles.shareCodeLabel}>邀请码</Text>
              <Text className={styles.shareCodeValue}>{inviteCode}</Text>
            </View>
            <View className={styles.shareActions}>
              {/* 方式 1：微信官方分享卡片（open-type=share） */}
              <Button
                className={styles.shareBtn}
                openType='share'
                onClick={() => {
                  Taro.showToast({ title: '请在系统面板点发送', icon: 'none' })
                }}
              >
                <Text className={styles.shareBtnIcon}>💬</Text>
                <Text>分享给微信好友</Text>
              </Button>

              {/* 方式 2：复制邀请码 */}
              <View className={styles.shareBtn} onClick={copyInviteCode}>
                <Text className={styles.shareBtnIcon}>📋</Text>
                <Text>复制邀请码</Text>
              </View>

              {/* 方式 3：保存海报到相册 */}
              <View className={styles.shareBtn} onClick={savePoster}>
                <Text className={styles.shareBtnIcon}>🖼</Text>
                <Text>保存海报到相册</Text>
              </View>

              <View
                className={styles.shareCancel}
                onClick={() => {
                  setShowShareSheet(false)
                  setTimeout(() => Taro.navigateBack(), 150)
                }}
              >
                完成，返回
              </View>
            </View>
            <View className={styles.shareTip}>
              体验版提示：分享卡片仅体验成员间可互相打开；未认证用户建议用邀请码或海报分享
            </View>
          </View>
        </View>
      )}

      {/* 离屏 Canvas：用于生成海报 */}
      <Canvas
        canvasId={posterCanvasId}
        type="2d"
        style={{ position: 'fixed', left: -9999, top: -9999, width: 600, height: 900 }}
      />
    </ScrollView>
  )
}
