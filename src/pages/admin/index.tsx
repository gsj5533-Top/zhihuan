import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

export default function AdminPage() {
  return (
    <View className={styles.page}>
      <Text className={styles.title}>举报与处置后台</Text>
      <Text className={styles.desc}>
        功能正在开发中…{'\n'}
        管理员将在此处理举报、复核机审拦截的内容、下架违规讲解并撤销对应积分。
      </Text>
    </View>
  )
}
