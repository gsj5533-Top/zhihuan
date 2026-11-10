const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  try {
    const openid = cloud.getWXContext().OPENID
    const mine = await db.collection('exchanges').where({
      $or: [{ initiatorOpenid: openid }, { receiverOpenid: openid }]
    }).orderBy('createTime', 'desc').limit(30).get()
    return { code: 0, message: 'success', data: mine.data }
  } catch (err) {
    console.error('[getExchanges] error:', err)
    return { code: -1, message: err.message, data: [] }
  }
}
