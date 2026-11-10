export default function submitRetell(_data?: any): { retellId: string } {
  console.info('[Mock] submitRetell 成功')
  return { retellId: 'retell_' + Date.now() }
}
