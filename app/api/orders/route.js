import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5648575195';
    const orderCode = data.orderCode || `RF-${Date.now().toString().slice(-6)}`;
    const message = `NUEVO PEDIDO ${orderCode} Juego:${data.game} ID:${data.playerId} Paq:${data.packageName} Monto:${data.amount}`;

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ ok: false, error: "Falta TOKEN" }, { status: 500 });
    }

    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    });
    const j = await r.json();
    return NextResponse.json({ ok: true, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
