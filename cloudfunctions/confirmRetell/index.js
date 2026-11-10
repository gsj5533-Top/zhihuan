const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const openid = cloud.getWXContext().OPENID
    const { exchangeId, retellerOpenid, direction } = event
    // direction: 'AtoB' 或 'BtoA'
    const now = Date.now()

    await db.collection('exchanges').doc(exchangeId).update({
      data: {
        [`retell${direction}.confirmStatus`]: 'confirmed',
        [`retell${direction}.confirmTime`]: now
      }
    })

    // 加分：复述方 +2、发送方 +2 教学反馈
    await db.collection('users').where({ _openid: retellerOpenid }).update({
      data: { totalPoints: db.command.inc(2), weeklyPoints: db.command.inc(2) }
    })
    await db.collection('users').where({ _openid: openid }).update({
      data: { totalPoints: db.command.inc(2), weeklyPoints: db.command.inc(2) }
    })

    return { code: 0, message: 'success', data: { retellerDelta: 2, senderDelta: 2 } }
  } catch (err) {
    console.error('[confirmRetell] error:', err)
    return { code: -1, message: err.message, data: null }
  }
}
