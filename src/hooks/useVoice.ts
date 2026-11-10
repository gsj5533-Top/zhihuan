import React, { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'

/**
 * 真实录音 + 播放能力封装
 * - 录音：Taro.getRecorderManager()（小程序原生录音，产出真实音频文件）
 * - 播放：Taro.createInnerAudioContext()（真正出声，并关闭静音开关跟随，避免 iPhone 静音键导致无声）
 */

type RecorderHandlers = {
  onStop?: (res: { tempFilePath: string; duration: number }) => void
  onError?: (err: any) => void
}

const handlers: RecorderHandlers = {}
let recorderInited = false

function getRecorder(): any {
  const factory = (Taro as any).getRecorderManager
  if (typeof factory !== 'function') return null
  const rm = factory()
  if (!rm) return null
  if (!recorderInited) {
    recorderInited = true
    rm.onStop((res: any) => handlers.onStop && handlers.onStop(res))
    rm.onError((err: any) => handlers.onError && handlers.onError(err))
  }
  return rm
}

export interface VoiceApi {
  recording: boolean
  hasVoice: boolean
  duration: number
  playing: boolean
  playSec: number
  url: string
  toggleRecord: () => void
  togglePlay: () => void
  deleteVoice: () => void
  playUrl: (url: string, duration?: number) => void
  stopAll: () => void
}

export default function useVoice(): VoiceApi {
  const [recording, setRecording] = useState(false)
  const [hasVoice, setHasVoice] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playSec, setPlaySec] = useState(0)
  const [url, setUrl] = useState('')

  const audioRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const recordingRef = useRef(false)
  const durationRef = useRef(0)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const destroyAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.stop()
        audioRef.current.destroy()
      } catch (e) {
        // ignore
      }
      audioRef.current = null
    }
    setPlaying(false)
    setPlaySec(0)
  }, [])

  useEffect(() => {
    // iOS 静音键下也能出声（部分版本需全局设置）
    try {
      const opt = (Taro as any).setInnerAudioOption
      if (typeof opt === 'function') opt({ obeyMuteSwitch: false })
    } catch (e) {
      // ignore
    }

    handlers.onStop = res => {
      clearTimer()
      recordingRef.current = false
      setRecording(false)
      const sec = Math.max(1, Math.round((res.duration || 0) / 1000))
      if (res.tempFilePath) {
        setUrl(res.tempFilePath)
        setDuration(sec)
        durationRef.current = sec
        setHasVoice(true)
        Taro.showToast({ title: `已录 ${sec}s`, icon: 'none' })
      } else {
        Taro.showToast({ title: '录音失败，请重试', icon: 'none' })
      }
    }

    handlers.onError = err => {
      clearTimer()
      recordingRef.current = false
      setRecording(false)
      console.warn('[Voice] 录音失败：', err)
      Taro.showToast({ title: '录音失败，请检查麦克风权限', icon: 'none' })
    }

    return () => {
      handlers.onStop = undefined
      handlers.onError = undefined
      clearTimer()
      destroyAudio()
      if (recordingRef.current) {
        try {
          getRecorder()?.stop()
        } catch (e) {
          // ignore
        }
        recordingRef.current = false
      }
    }
  }, [destroyAudio])

  const playUrl = useCallback(
    (src: string, dur?: number) => {
      if (!src) {
        Taro.showToast({ title: '暂无录音', icon: 'none' })
        return
      }
      destroyAudio()
      const factory = (Taro as any).createInnerAudioContext
      if (typeof factory !== 'function') {
        Taro.showToast({ title: '当前环境不支持播放', icon: 'none' })
        return
      }
      const audio = factory()
      audioRef.current = audio
      audio.src = src
      audio.autoplay = true
      audio.obeyMuteSwitch = false
      audio.onTimeUpdate(() => {
        try {
          setPlaySec(Math.floor(audio.currentTime || 0))
        } catch (e) {
          // ignore
        }
      })
      audio.onEnded(() => {
        setPlaying(false)
        setPlaySec(dur || durationRef.current || 0)
      })
      audio.onError((err: any) => {
        console.warn('[Voice] 播放失败：', err)
        setPlaying(false)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      })
      audio.play()
      setPlaying(true)
    },
    [destroyAudio]
  )

  const toggleRecord = useCallback(() => {
    const rm = getRecorder()
    if (!rm) {
      Taro.showToast({ title: '当前环境不支持录音，请在微信中使用', icon: 'none' })
      return
    }
    if (recordingRef.current) {
      rm.stop()
      return
    }
    destroyAudio()
    setHasVoice(false)
    setUrl('')
    setDuration(0)
    durationRef.current = 0
    rm.start({
      duration: 300000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
    recordingRef.current = true
    setRecording(true)
    clearTimer()
    timerRef.current = setInterval(() => {
      setDuration(d => {
        const next = Math.min(300, d + 1)
        durationRef.current = next
        return next
      })
    }, 1000)
  }, [destroyAudio])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
        audio.play()
        setPlaying(true)
      }
      return
    }
    if (!url) {
      Taro.showToast({ title: '请先录音', icon: 'none' })
      return
    }
    playUrl(url, durationRef.current)
  }, [playing, url, playUrl])

  const deleteVoice = useCallback(() => {
    destroyAudio()
    setUrl('')
    setHasVoice(false)
    setDuration(0)
    durationRef.current = 0
    Taro.showToast({ title: '已删除录音', icon: 'none' })
  }, [destroyAudio])

  const stopAll = useCallback(() => {
    destroyAudio()
  }, [destroyAudio])

  return {
    recording,
    hasVoice,
    duration,
    playing,
    playSec,
    url,
    toggleRecord,
    togglePlay,
    deleteVoice,
    playUrl,
    stopAll
  }
}
