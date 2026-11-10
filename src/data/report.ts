export default function report(_data?: any): { success: boolean; reportId: string } {
  console.info('[Mock] report 成功')
  return { success: true, reportId: 'report_' + Date.now() }
}
