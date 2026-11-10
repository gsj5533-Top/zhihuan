import type { PointRecord } from '@/types'

const now = Date.now()

const records: PointRecord[] = [
  {
    _id: 'p_001',
    openid: 'mock-openid',
    exchangeId: 'exc_azhou',
    type: 'feedback',
    points: 2,
    status: 'active',
    createTime: now - 10 * 60 * 1000
  },
  {
    _id: 'p_002',
    openid: 'mock-openid',
    exchangeId: 'exc_lin',
    type: 'lecture',
    points: 2,
    status: 'active',
    createTime: now - 2 * 3600 * 1000
  },
  {
    _id: 'p_003',
    openid: 'mock-openid',
    exchangeId: 'exc_lin',
    type: 'knowledge',
    points: 1,
    status: 'active',
    createTime: now - 2.5 * 3600 * 1000
  },
  {
    _id: 'p_004',
    openid: 'mock-openid',
    exchangeId: 'exc_qy',
    type: 'retell',
    points: 2,
    status: 'active',
    createTime: now - 2 * 24 * 3600 * 1000
  },
  {
    _id: 'p_005',
    openid: 'mock-openid',
    exchangeId: 'exc_qy',
    type: 'lecture',
    points: 2,
    status: 'revoked',
    createTime: now - 2.2 * 24 * 3600 * 1000
  },
  {
    _id: 'p_006',
    openid: 'mock-openid',
    exchangeId: 'exc_qy',
    type: 'feedback',
    points: 2,
    status: 'active',
    createTime: now - 2 * 24 * 3600 * 1000
  },
  {
    _id: 'p_007',
    openid: 'mock-openid',
    exchangeId: 'exc_momo',
    type: 'retell',
    points: 2,
    status: 'pending',
    createTime: now - 5 * 3600 * 1000
  }
]

export default function getPoints(_data?: any): PointRecord[] {
  console.info('[Mock] getPoints 返回', records.length, '条')
  return records
}
