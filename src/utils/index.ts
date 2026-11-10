/**
 * 简单的 classnames 工具
 */
export const classNames = (...args: Array<string | false | null | undefined | Record<string, boolean>>): string => {
  const classes: string[] = []
  args.forEach(arg => {
    if (!arg) return
    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, val]) => {
        if (val) classes.push(key)
      })
    }
  })
  return classes.join(' ')
}

/**
 * 格式化秒数为 mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * 相对时间（刚刚 / N 分钟前 / N 小时前 / 今天 HH:mm / MM-DD）
 */
export const formatRelative = (ts: number): string => {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return `今天 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${d.getMonth() + 1}-${d.getDate()}`
}

/**
 * 计算总积分：双方各 7 分
 */
export const EXCHANGE_TOTAL_POINTS = 7
