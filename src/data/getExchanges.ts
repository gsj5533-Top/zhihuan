import type { Exchange } from '@/types'

const now = Date.now()

const exchanges: Exchange[] = [
  {
    _id: 'exc_lin',
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
      content: '先定边界，再拆工作包，最后写验收标准。三者缺一，项目就会在变更里失控。',
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
  },
  {
    _id: 'exc_azhou',
    initiatorOpenid: 'openid_azhou',
    initiatorName: '阿舟',
    initiatorAvatar: '',
    receiverOpenid: 'mock-openid',
    receiverName: '阿岚',
    receiverAvatar: '',
    topic: '诗歌',
    status: 'in_progress',
    knowledgeA: {
      _id: 'ka_azhou',
      topic: '诗歌',
      title: '用意象拆解一首古诗',
      content: '把诗句拆成意象、节奏和情绪三层，再串回去就能读懂。',
      images: [],
      lectureVoice: '',
      lectureDuration: 60,
      lectureBoard: '',
      status: 'lectured',
      createTime: now - 5 * 3600 * 1000,
      sentTime: now - 4 * 3600 * 1000,
      lectureTime: now - 4 * 3600 * 1000
    },
    createTime: now - 6 * 3600 * 1000,
    acceptTime: now - 4.5 * 3600 * 1000,
    expireTime: now + 6 * 24 * 3600 * 1000
  },
  {
    _id: 'exc_momo',
    initiatorOpenid: 'mock-openid',
    initiatorName: '阿岚',
    receiverOpenid: 'openid_momo',
    receiverName: 'Momo',
    receiverAvatar: '',
    topic: '菜谱',
    status: 'in_progress',
    createTime: now - 1.5 * 3600 * 1000,
    acceptTime: now - 1 * 3600 * 1000,
    expireTime: now + 7 * 24 * 3600 * 1000
  },
  {
    _id: 'exc_qy',
    initiatorOpenid: 'openid_qy',
    initiatorName: '清野',
    initiatorAvatar: '',
    receiverOpenid: 'mock-openid',
    receiverName: '阿岚',
    receiverAvatar: '',
    topic: '冷知识',
    status: 'completed',
    createTime: now - 3 * 24 * 3600 * 1000,
    acceptTime: now - 3 * 24 * 3600 * 1000,
    completeTime: now - 2 * 24 * 3600 * 1000,
    expireTime: now + 4 * 24 * 3600 * 1000
  }
]

export default function getExchanges(_data?: any): Exchange[] {
  console.info('[Mock] getExchanges 返回 4 条')
  return exchanges
}
