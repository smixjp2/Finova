import fs from 'fs'
import path from 'path'
import TransactionsClient from '@/components/modules/TransactionsClient'

export default async function TransactionsPage() {
  // Read transactions from local JSON file
  const filePath = path.join(process.cwd(), 'data', 'transactions.json')
  let txs = []
  try {
    const file = fs.readFileSync(filePath, 'utf-8')
    txs = JSON.parse(file)
  } catch (e) {
    txs = []
  }
  // No userId needed anymore
  return <TransactionsClient initialTxs={txs} userId={''} />
}
