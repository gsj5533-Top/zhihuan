const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const exchange = await db.collection('exchanges').doc(event.exchangeId).get()
    const d = exchange.data
    if (d.initiatorOpenid !== openid && d.receiverOpenid !== openid) {
      return { code: -3, message: '无权访问', data: null }
    }
    return { code: 0, message: 'success', data: d }
  } catch (err) {
    console.error('[getExchangeDetail] error:', err)
    return { code: -1, message: err.message, data: null }
  }
}
