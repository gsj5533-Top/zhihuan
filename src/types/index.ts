// ============================================
// 知换 · 核心类型定义
// ============================================

export interface User {
  _id?: string
  _openid?: string
  nickname: string
  avatar: string
  totalPoints: number
  weeklyPoints: number
  completedCount: number
  level: number
  createTime: number
}

// 主题由用户在标题处通过 # 自定义，如 "#专业 范围管理的三个关键判断"
export type TopicTag = string

export type ExchangeStatus =
  | 'pending_accept' | 'in_progress' | 'completed'
  | 'rejected' | 'cancelled' | 'expired'

export type KnowledgeStatus =
  | 'draft' | 'sent' | 'lectured' | 'retelled' | 'retell_confirmed'

export interface Knowledge {
  _id?: string
  topic: TopicTag
  title: string
  content: string
  images: string[]
  lectureVoice: string
  lectureDuration: number
  lectureBoard: string
  status: KnowledgeStatus
  createTime: number
  sentTime?: number
  lectureTime?: number
}

export interface Retell {
  _id?: string
  knowledgeId: string
  retellerOpenid: string
  form: 'voice' | 'board'
  voicePath?: string
  duration?: number
  boardData?: string
  auditStatus: 'pending' | 'passed' | 'rejected'
  confirmStatus: 'pending' | 'confirmed' | 'expired'
  createTime: number
  confirmTime?: number
}

export interface PointRecord {
  _id?: string
  openid: string
  exchangeId: string
  knowledgeId?: string
  type: 'knowledge' | 'lecture' | 'retell' | 'feedback'
  points: number
  status: 'pending' | 'active' | 'revoked'
  createTime: number
}

export type PointFilter = 'all' | 'active' | 'pending' | 'revoked'

export interface Exchange {
  _id?: string
  initiatorOpenid: string
  initiatorName: string
  initiatorAvatar: string
  receiverOpenid: string
  receiverName: string
  receiverAvatar: string
  topic: TopicTag
  status: ExchangeStatus
  knowledgeA?: Knowledge
  knowledgeB?: Knowledge
  retellAtoB?: Retell
  retellBtoA?: Retell
  createTime: number
  acceptTime?: number
  completeTime?: number
  expireTime: number
}

export interface Report {
  _id?: string
  reporterOpenid: string
  targetType: 'knowledge' | 'lecture' | 'retell' | 'user'
  targetId: string
  reason: string
  detail?: string
  status: 'pending' | 'processed' | 'ignored'
  result?: string
  createTime: number
}
