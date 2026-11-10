const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const records = await db.collection('point_records')
      .where({ openid })
      .orderBy('createTime', 'desc')
      .limit(50)
      .get()
    return { code: 0, message: 'success', data: records.data }
  } catch (err) {
    console.error('[getPoints] error:', err)
    return { code: -1, message: err.message, data: [] }
  }
}
