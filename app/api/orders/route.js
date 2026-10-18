import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // LEER LAS VARIABLES DENTRO DEL POST, NO FUERA
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5648575195';

    console.log("Token existe?", !!TELEGRAM_BOT_TOKEN, "Chat:", TELEGRAM_CHAT_ID);

    const orderCode = data.orderCode || `RF-${Date.now().toString().slice(-6)}`;
    
    const message = `🔥 NUEVO PEDIDO RECARGAS FAST 🔥\n\n🧾 Código: ${orderCode}\n🎮 Juego: ${data.game || 'N/A'}\n🆔 ID: ${data.playerId || 'N/A'}\n📦 Paquete: ${data.packageName || 'N/A'}\n💰 Monto: $${data.amount || 'N/A'}\n🔢 Ref: ${data.reference || 'Sin ref'}\n🧾 Comprobante: ${data.hasReceipt ? 'SI' : 'NO'}\n⏰ Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`;

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("ERROR: TELEGRAM_BOT_TOKEN no cargado");
      return NextResponse.json({ ok: false, error: "Falta TELEGRAM_BOT_TOKEN en Vercel" }, { status: 500 });
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: TELEGRAM_CHAT_ID, 
        text: message 
      })
    });

    const telegramData = await telegramRes.json();
    console.log("Respuesta Telegram:", telegramData);

    if (!telegramData.ok) {
      return NextResponse.json({ ok: false, error: telegramData }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderCode, telegram: telegramData });
    
  } catch (err: any) {
    console.error("Error ordenes:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  return NextResponse.json({ 
    ok: true, 
    status: 'API funcionando', 
    telegram_configurado: hasToken,
    chat_id: process.env.TELEGRAM_CHAT_ID || '5648575195'
  });
}
