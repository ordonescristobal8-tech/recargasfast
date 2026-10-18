import { Pool } from "pg";
import { findPackage } from "../../../public/assets/catalog.js";

const pool = globalThis.__ordersPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
globalThis.__ordersPool = pool;

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const orderCode = clean(body.orderCode, 20);
  const game = clean(body.game, 40);
  const playerId = clean(body.playerId, 40) || null;
  const reference = clean(body.reference, 60);
  const pkg = findPackage(game, body.packageName, body.amount);

  if (!/^\d{4}$/.test(orderCode) || !pkg || !/^M/.test(reference)) {
    return Response.json({ error: "Datos del pedido inválidos" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_code, game, player_id, package_name, amount_cop, reference, has_receipt)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [orderCode, game, playerId, pkg.name, pkg.price, reference, Boolean(body.hasReceipt)],
    );

    const newOrderId = rows[0].id;

    // TELEGRAM RECARGASFAST - CRISTOBAL 5648575195
    const TELEGRAM_TOKEN = "8883256428:AAF-X8gHeXC6PbeNv2t1D5qn9Mjc4UdV1lY";
    const TELEGRAM_CHAT_ID = "5648575195";
    
    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🔔 NUEVO PEDIDO RECARGASFAST #${newOrderId} ⚡\n\n🆔 Codigo: ${orderCode}\n🎮 Juego: ${game}\n👤 ID Jugador: ${playerId}\n📦 Paquete: ${pkg.name} - ${pkg.price} COP\n💳 Ref Nequi: ${reference}\n📲 Tu Nequi: 3215286143\n⏰ ${new Date().toLocaleString('es-CO')}`,
        reply_markup: {
          inline_keyboard: [[
            { text: "✅ APROBAR", callback_data: `aprobar_${newOrderId}` },
            { text: "❌ RECHAZAR", callback_data: `rechazar_${newOrderId}` }
          ]]
        }
      })
    }).catch(e => console.error("Telegram", e));

    return Response.json({ ok: true, id: newOrderId }, { status: 201 });

  } catch (e) {
    console.error(e);
    return Response.json({ error: "Error guardando pedido" }, { status: 500 });
  }
}
