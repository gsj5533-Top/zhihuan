const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const { targetType, targetId, reason, detail } = event

    const result = await db.collection('reports').add({
      data: {
        reporterOpenid: openid,
        targetType, targetId, reason, detail: detail || '',
        status: 'pending',
        createTime: Date.now()
      }
    })
    return { code: 0, message: 'success', data: { reportId: result._id } }
  } catch (err) {
    console.error('[report] error:', err)
    return { code: -1, message: err.message, data: null }
  }
}
