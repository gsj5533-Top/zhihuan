import { create } from 'zustand'
import appProfile from '@/config/profile'
import { Exchange, PointRecord, User } from '@/types'

interface DemoMedia {
  images: string[]
  voiceUrl: string
  voiceDuration: number
}

interface AppState {
  user: User | null
  points: number
  weeklyPoints: number
  exchanges: Exchange[]
  pendingConfirmations: Exchange[]
  completedExchanges: Exchange[]
  pointRecords: PointRecord[]
  initialized: boolean
  /** 本机最近的演示媒体（云未部署时用于详情页展示图片与播放录音） */
  demoMedia: DemoMedia

  initialize: () => Promise<void>
  setUser: (user: User) => void
  setPoints: (points: number) => void
  setExchanges: (list: Exchange[]) => void
  setPointRecords: (list: PointRecord[]) => void
  setDemoMedia: (media: Partial<DemoMedia>) => void
  refreshHome: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  points: 0,
  weeklyPoints: 0,
  exchanges: [],
  pendingConfirmations: [],
  completedExchanges: [],
  pointRecords: [],
  initialized: false,
  demoMedia: { images: [], voiceUrl: '', voiceDuration: 0 },

  initialize: async () => {
    try {
      const { callFunction } = await import('@/services/cloud')
      const user = await callFunction<User>('login')
      set({ user, points: user.totalPoints, weeklyPoints: user.weeklyPoints, initialized: true })
      await get().refreshHome()
    } catch (err) {
      console.error('[Store] initialize 失败：', err)
      if (appProfile.allowMockUser) {
        // 体验版：登录不可用时给演示用户，保证页面可浏览
        set({
          user: {
            _openid: 'mock-openid',
            nickname: '阿岚',
            avatar: '',
            totalPoints: 126,
            weeklyPoints: 19,
            completedCount: 18,
            level: 4,
            createTime: Date.now()
          },
          points: 126,
          weeklyPoints: 19,
          initialized: true
        })
      } else {
        // 正式版：不伪造用户与积分，交由页面展示空态
        set({ user: null, points: 0, weeklyPoints: 0, initialized: true })
      }
      await get().refreshHome()
    }
  },

  setUser: (user) => set({ user }),
  setPoints: (points) => set({ points }),

  setExchanges: (list) => {
    const meOpenid = get().user?._openid || 'mock-openid'
    set({
      exchanges: list.filter(e => e.status === 'in_progress'),
      pendingConfirmations: list.filter(e =>
        e.status === 'in_progress' &&
        (e.retellAtoB?.retellerOpenid !== meOpenid &&
          e.retellAtoB?.auditStatus === 'passed' &&
          e.retellAtoB?.confirmStatus === 'pending') ||
        (e.retellBtoA?.retellerOpenid !== meOpenid &&
          e.retellBtoA?.auditStatus === 'passed' &&
          e.retellBtoA?.confirmStatus === 'pending')
      ),
      completedExchanges: list.filter(e => e.status === 'completed')
    })
  },

  setPointRecords: (list) => set({ pointRecords: list }),

  setDemoMedia: (media) => set(state => ({ demoMedia: { ...state.demoMedia, ...media } })),

  refreshHome: async () => {
    try {
      const { callFunction } = await import('@/services/cloud')
      const exchanges = await callFunction<Exchange[]>('getExchanges')
      get().setExchanges(exchanges)
    } catch (err) {
      console.error('[Store] refreshHome 失败：', err)
    }
  }
}))

export default useAppStore
