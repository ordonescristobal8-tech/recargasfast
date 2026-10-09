/**
 * Catálogo único de juegos y paquetes.
 *
 * Este módulo lo usan tanto la página (para dibujar las tarjetas) como la
 * función /api/orders (para validar que el paquete y el precio reportados
 * existen de verdad). Para cambiar precios, edita SOLO este archivo.
 */

export const NEQUI_NUMBER = "3215286143";
export const WHATSAPP_NUMBER = "573146243162";

export const GAMES = {
  "free-fire": {
    name: "Free Fire",
    heading: "Recarga Free Fire 💎",
    requiresPlayerId: true,
    packages: [
      { name: "110 diamantes", price: 3500, icon: "💎" },
      { name: "341 diamantes", price: 11000, icon: "💎" },
      { name: "572 diamantes", price: 17000, icon: "💎" },
      { name: "620 diamantes", price: 20200, icon: "💎" },
      { name: "1.166 diamantes", price: 34000, icon: "💎" },
      { name: "2.376 diamantes", price: 63000, icon: "💎" },
      { name: "3.220 diamantes", price: 90000, icon: "💎" },
      { name: "4.320 diamantes", price: 118000, icon: "💎" },
      { name: "6.138 diamantes", price: 157000, icon: "💎" },
      { name: "11.200 diamantes", price: 280000, icon: "💎" },
      { name: "Membresía básica", price: 1800, icon: "⭐" },
      { name: "Membresía semanal", price: 6500, icon: "📆" },
      { name: "Pase Booyah", price: 9500, icon: "🎫" },
      { name: "Membresía mensual", price: 35000, icon: "📅" },
    ],
  },
  "blood-strike": {
    name: "Blood Strike",
    heading: "Recarga Blood Strike 🪙",
    requiresPlayerId: true,
    packages: [
      { name: "105 Oro", price: 3300, icon: "🪙", group: "gold" },
      { name: "320 Oro", price: 10000, icon: "🪙", group: "gold", popular: true },
      { name: "540 Oro", price: 16000, icon: "🪙", group: "gold" },
      { name: "646 Oro", price: 18000, icon: "🪙", group: "gold" },
      { name: "1.205 Oro", price: 36000, icon: "🪙", group: "gold" },
      { name: "2.260 Oro", price: 60000, icon: "🪙", group: "gold" },
      { name: "2.580 Oro", price: 73000, icon: "🪙", group: "gold" },
      { name: "3.120 Oro", price: 85000, icon: "🪙", group: "gold" },
      { name: "5.060 Oro", price: 135000, icon: "🪙", group: "gold" },
      { name: "10.320 Oro", price: 149000, icon: "🪙", group: "gold" },
      { name: "11.600 Oro", price: 292000, icon: "🪙", group: "gold" },
      { name: "Level Up Pass", price: 7500, icon: "🎟️", group: "pass" },
      { name: "Pase de Batalla Elite", price: 14000, icon: "🎟️", group: "pass", popular: true },
      { name: "Pase de Batalla Premium", price: 30000, icon: "🎟️", group: "pass" },
    ],
  },
  roblox: {
    name: "Roblox",
    heading: "Recarga Roblox 🎮",
    requiresPlayerId: false,
    packages: [
      { name: "50 Robux", price: 2250, icon: "◈" },
      { name: "100 Robux", price: 4300, icon: "◈" },
      { name: "150 Robux", price: 6600, icon: "◈" },
      { name: "200 Robux", price: 8600, icon: "◈" },
      { name: "300 Robux", price: 12700, icon: "◈" },
      { name: "400 Robux", price: 17000, icon: "◈", popular: true },
      { name: "500 Robux", price: 20500, icon: "◈" },
      { name: "600 Robux", price: 24800, icon: "◈" },
      { name: "800 Robux", price: 33100, icon: "◈" },
      { name: "1000 Robux", price: 40900, icon: "◈", popular: true },
      { name: "1200 Robux", price: 49500, icon: "◈" },
      { name: "1300 Robux", price: 53600, icon: "◈" },
      { name: "1500 Robux", price: 61300, icon: "◈" },
      { name: "1700 Robux", price: 69900, icon: "◈" },
      { name: "2000 Robux", price: 81800, icon: "◈" },
      { name: "2500 Robux", price: 102200, icon: "◈" },
      { name: "2800 Robux", price: 114900, icon: "◈" },
      { name: "3000 Robux", price: 122600, icon: "◈" },
    ],
  },
};

/** Devuelve el paquete del catálogo que coincide en nombre y precio, o null. */
export function findPackage(game, name, price) {
  const entry = GAMES[game];
  if (!entry) return null;
  return entry.packages.find((item) => item.name === name && item.price === Number(price)) ?? null;
}

export const money = (value) => "COP$ " + new Intl.NumberFormat("es-CO").format(Number(value));
