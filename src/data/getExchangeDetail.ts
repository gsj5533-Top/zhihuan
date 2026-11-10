import type { Exchange } from '@/types'

export default function getExchangeDetail(data: { exchangeId?: string }): Exchange | null {
  console.info('[Mock] getExchangeDetail:', data?.exchangeId)
  const now = Date.now()
  return {
    _id: data?.exchangeId || 'exc_lin',
    initiatorOpenid: 'mock-openid',
    initiatorName: '阿岚',
    initiatorAvatar: '',
    receiverOpenid: 'openid_lin',
    receiverName: '林',
    receiverAvatar: '',
    topic: '专业',
    status: 'in_progress',
    knowledgeA: {
      _id: 'ka_lin',
      topic: '专业',
      title: '范围管理的三个关键判断',
      content: '先定边界，再拆工作包，最后写验收标准。三者缺一，项目就会在变更里失控。边界决定谁负责，工作包决定能不能验收，验收标准决定变更是否成立。',
      images: [],
      lectureVoice: '',
      lectureDuration: 84,
      lectureBoard: '',
      status: 'lectured',
      createTime: now - 2 * 3600 * 1000,
      sentTime: now - 2 * 3600 * 1000,
      lectureTime: now - 2 * 3600 * 1000
    },
    retellAtoB: {
      _id: 'ra_lin',
      knowledgeId: 'ka_lin',
      retellerOpenid: 'openid_lin',
      form: 'voice',
      duration: 36,
      auditStatus: 'passed',
      confirmStatus: 'pending',
      createTime: now - 30 * 60 * 1000
    },
    createTime: now - 3 * 3600 * 1000,
    acceptTime: now - 2.5 * 3600 * 1000,
    expireTime: now + 7 * 24 * 3600 * 1000
  }
}
