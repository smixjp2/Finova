import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'data', 'transactions.json')

export async function GET() {
  try {
    const file = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(file)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tx = await req.json()
    let data = []
    try {
      const file = fs.readFileSync(filePath, 'utf-8')
      data = JSON.parse(file)
    } catch {}
    data.unshift(tx)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save transaction' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    let data = []
    try {
      const file = fs.readFileSync(filePath, 'utf-8')
      data = JSON.parse(file)
    } catch {}
    data = data.filter((t: any) => t.id !== id)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
