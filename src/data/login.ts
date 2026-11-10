import type { User } from '@/types'

const mockUser: User = {
  _id: 'user_001',
  _openid: 'mock-openid',
  nickname: '阿岚',
  avatar: '',
  totalPoints: 126,
  weeklyPoints: 19,
  completedCount: 18,
  level: 4,
  createTime: Date.now() - 30 * 24 * 3600 * 1000
}

export default function login(_data?: any): User {
  console.info('[Mock] login 返回默认用户')
  return mockUser
}
