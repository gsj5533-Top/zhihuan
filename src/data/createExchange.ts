import type { Exchange } from '@/types'

export default function createExchange(data?: any): Exchange {
  console.info('[Mock] createExchange 成功')
  const now = Date.now()
  return {
    _id: 'exc_new_' + now,
    initiatorOpenid: 'mock-openid',
    initiatorName: '阿岚',
    initiatorAvatar: '',
    receiverOpenid: '',
    receiverName: '',
    receiverAvatar: '',
    topic: data?.topic || '专业',
    status: 'pending_accept',
    createTime: now,
    expireTime: now + 7 * 24 * 3600 * 1000
  }
}
