import React, { useEffect, useRef, useState } from 'react'
import { Canvas, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { classNames } from '@/utils'
import styles from './index.module.scss'

type Tool = 'pen' | 'marker' | 'eraser'

interface Point {
  x: number
  y: number
}

interface Stroke {
  color: string
  width: number
  mode: 'draw' | 'erase'
  points: Point[]
}

const TOOL_STYLE: Record<Tool, { color: string; width: number; mode: 'draw' | 'erase' }> = {
  pen: { color: '#1F2D28', width: 3, mode: 'draw' },
  marker: { color: 'rgba(11, 158, 95, 0.45)', width: 16, mode: 'draw' },
  eraser: { color: 'rgba(0, 0, 0, 1)', width: 20, mode: 'erase' }
}

interface Props {
  /** canvas 唯一 id（同一页面内不可重复） */
  id: string
  /** 画布高度（rpx） */
  height?: number
  /** 画布提示文案 */
  tip?: string
  /** 笔画数变化回调 */
  onStrokeCountChange?: (count: number) => void
}

/**
 * 可手写白板：支持笔 / 荧光笔 / 橡皮，撤销与清空。
 * 使用 Canvas 2D 接口真实绘制，触摸事件实时落笔。
 */
export default function WhiteBoard({ id, height = 360, tip, onStrokeCountChange }: Props) {
  const [tool, setTool] = useState<Tool>('pen')
  const [ready, setReady] = useState(false)
  const canvasRef = useRef<any>(null)
  const ctxRef = useRef<any>(null)
  const strokesRef = useRef<Stroke[]>([])
  const drawingRef = useRef<Stroke | null>(null)
  const toolRef = useRef<Tool>('pen')

  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  useEffect(() => {
    const init = () => {
      const query = Taro.createSelectorQuery()
      query
        .select('#' + id)
        .fields({ node: true, size: true })
        .exec((res: any[]) => {
          const info = res && res[0]
          let canvas: any = info && info.node
          if (!canvas && process.env.TARO_ENV === 'h5') {
            canvas = (globalThis as any).document?.getElementById(id)
          }
          if (!canvas || !info) {
            console.warn('[WhiteBoard] 未获取到 canvas 节点')
            return
          }
          const dpr = Taro.getSystemInfoSync().pixelRatio || 1
          canvas.width = info.width * dpr
          canvas.height = info.height * dpr
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.scale(dpr, dpr)
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          canvasRef.current = canvas
          ctxRef.current = ctx
          setReady(true)
        })
    }
    const timer = setTimeout(init, 80)
    return () => clearTimeout(timer)
  }, [id])

  const paintStroke = (ctx: any, stroke: Stroke) => {
    if (!stroke.points.length) return
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = stroke.width
    ctx.globalCompositeOperation = stroke.mode === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = stroke.color
    const first = stroke.points[0]
    if (stroke.points.length === 1) {
      ctx.beginPath()
      ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2)
      ctx.fillStyle = stroke.color
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  const redraw = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    strokesRef.current.forEach(s => paintStroke(ctx, s))
  }

  const getPoint = (e: any): Point | null => {
    const touch = (e && e.touches && e.touches[0]) || (e && e.changedTouches && e.changedTouches[0])
    if (!touch) return null
    if (typeof touch.x === 'number' && typeof touch.y === 'number') {
      return { x: touch.x, y: touch.y }
    }
    const el = canvasRef.current
    if (el && typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect()
      return { x: (touch.clientX || 0) - rect.left, y: (touch.clientY || 0) - rect.top }
    }
    return null
  }

  const onTouchStart = (e: any) => {
    const ctx = ctxRef.current
    const p = getPoint(e)
    if (!ctx || !p) return
    const cfg = TOOL_STYLE[toolRef.current]
    const stroke: Stroke = { color: cfg.color, width: cfg.width, mode: cfg.mode, points: [p] }
    drawingRef.current = stroke
    strokesRef.current.push(stroke)
    paintStroke(ctx, stroke)
    onStrokeCountChange && onStrokeCountChange(strokesRef.current.length)
  }

  const onTouchMove = (e: any) => {
    const ctx = ctxRef.current
    const stroke = drawingRef.current
    if (!ctx || !stroke) return
    const p = getPoint(e)
    if (!p) return
    const prev = stroke.points[stroke.points.length - 1]
    if (Math.abs(p.x - prev.x) < 0.6 && Math.abs(p.y - prev.y) < 0.6) return
    stroke.points.push(p)
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = stroke.width
    ctx.globalCompositeOperation = stroke.mode === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = stroke.color
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.restore()
  }

  const onTouchEnd = () => {
    drawingRef.current = null
  }

  const undo = () => {
    if (!strokesRef.current.length) return
    strokesRef.current.pop()
    redraw()
    onStrokeCountChange && onStrokeCountChange(strokesRef.current.length)
  }

  const clear = () => {
    strokesRef.current = []
    redraw()
    onStrokeCountChange && onStrokeCountChange(0)
    Taro.showToast({ title: '已清空白板', icon: 'none' })
  }

  return (
    <View>
      <View className={styles.stage} style={{ height: `${height}rpx` }}>
        <Canvas
          id={id}
          canvasId={id}
          type="2d"
          className={styles.canvas}
          disableScroll
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        />
        {!ready && <View className={styles.mask}>画布加载中…</View>}
        {tip && <View className={styles.tip}>{tip}</View>}
      </View>
      <View className={styles.toolbar}>
        {(['pen', 'marker', 'eraser'] as const).map(t => (
          <View
            key={t}
            className={classNames(styles.tool, tool === t && styles.active)}
            onClick={() => setTool(t)}
          >
            {t === 'pen' ? '✎ 笔' : t === 'marker' ? '▮ 荧光' : '◻ 橡皮'}
          </View>
        ))}
        <View className={styles.tool} onClick={undo}>↶ 撤销</View>
        <View className={styles.tool} onClick={clear}>清空</View>
      </View>
    </View>
  )
}
