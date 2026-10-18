import { NextResponse } from 'next/server';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5648575195';
export async function POST(req) {
  try {
    const data = await req.json();
    const orderCode = data.orderCode || `RF-${Date.now().toString().slice(-6)}`;
    const message = `🔥 NUEVO PEDIDO RECARGAS FAST 🔥\n\n🧾 Código: ${orderCode}\n🎮 Juego: ${data.game || 'N/A'}\n🆔 ID: ${data.playerId || 'N/A'}\n📦 Paquete: ${data.packageName || 'N/A'}\n💰 Monto: ${data.amount || 'N/A'}\n🔢 Ref: ${data.reference || 'Sin ref'}\n🧾 Comprobante: ${data.hasReceipt ? 'SI' : 'NO'}\n⏰ Fecha: ${new Date().toLocaleString('es-CO')}`;
    if (TELEGRAM_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
      });
    }
    return NextResponse.json({ ok: true, orderCode });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ ok: true, status: 'API funcionando' });
}
