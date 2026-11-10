const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const { receiverOpenid, topic, knowledge } = event
    if (!receiverOpenid || !topic) return { code: -2, message: '缺少必要参数', data: null }
    const now = Date.now()
    const res = await db.collection('exchanges').add({
      data: {
        initiatorOpenid: openid,
        initiatorName: event.initiatorName || '',
        initiatorAvatar: event.initiatorAvatar || '',
        receiverOpenid, receiverName: '', receiverAvatar: '',
        topic, status: 'pending_accept',
        knowledgeA: { ...knowledge, status: 'sent', createTime: now, sentTime: now },
        createTime: now, expireTime: now + 7 * 24 * 3600 * 1000
      }
    })
    return { code: 0, message: 'success', data: { exchangeId: res._id } }
  } catch (err) {
    console.error('[createExchange] error:', err)
    return { code: -1, message: err.message, data: null }
  }
}
