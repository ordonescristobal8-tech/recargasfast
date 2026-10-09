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

  if (!/^K-\d{4}$/.test(orderCode) || !pkg || !/^M/i.test(reference)) {
    return Response.json({ error: "Datos del pedido inválidos" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_code, game, player_id, package_name, amount_cop, reference, has_receipt)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [orderCode, game, playerId, pkg.name, pkg.price, reference, Boolean(body.hasReceipt)],
    );
    return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error guardando pedido:", error);
    return Response.json({ error: "No se pudo guardar el pedido" }, { status: 500 });
  }
}
