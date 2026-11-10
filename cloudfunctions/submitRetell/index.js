const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const { exchangeId, knowledgeId, form, voicePath, duration, boardData } = event
    const retell = {
      knowledgeId, retellerOpenid: openid, form,
      voicePath: voicePath || '', duration: duration || 0, boardData: boardData || '',
      auditStatus: 'passed', confirmStatus: 'pending', createTime: Date.now()
    }
    const exchange = await db.collection('exchanges').doc(exchangeId).get()
    let field = null
    if (exchange.data.knowledgeA && exchange.data.knowledgeA._id === knowledgeId) field = { retellAtoB: retell }
    else if (exchange.data.knowledgeB && exchange.data.knowledgeB._id === knowledgeId) field = { retellBtoA: retell }
    if (!field) return { code: -2, message: '知识包不匹配', data: null }
    await db.collection('exchanges').doc(exchangeId).update({ data: field })
    return { code: 0, message: 'success', data: retell }
  } catch (err) {
    console.error('[submitRetell] error:', err)
    return { code: -1, message: err.message, data: null }
  }
}
