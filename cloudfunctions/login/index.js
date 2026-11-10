const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const users = db.collection('users')
    const existed = await users.where({ _openid: openid }).get()
    let user
    if (existed.data.length > 0) {
      user = existed.data[0]
    } else {
      const now = Date.now()
      const res = await users.add({ data: {
        _openid: openid, nickname: event.nickname || '微信用户', avatar: event.avatar || '',
        totalPoints: 0, weeklyPoints: 0, completedCount: 0, level: 1, createTime: now
      }})
      user = { _id: res._id, totalPoints: 0, weeklyPoints: 0, completedCount: 0, level: 1, createTime: now }
    }
    return { code: 0, message: 'success', data: user }
  } catch (err) {
    console.error('[login] error:', err)
    return { code: -1, message: err.message || '服务异常', data: null }
  }
}
