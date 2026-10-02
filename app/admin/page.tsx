"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
type Pedido = { id:string, telefono:string, operador:string, monto:string, estado:string, created_at:string }
export default function Admin(){
  const [pedidos,setPedidos]=useState<Pedido[]>([])
  const [filtro,setFiltro]=useState<"pendientes"|"completados"|"todos">("pendientes")
  const cargar=async()=>{const {data}=await supabase.from("orders").select("*").order("created_at",{ascending:false});setPedidos(data as any||[])}
  useEffect(()=>{cargar()},[])
  const completar=async(id:string)=>{await supabase.from("orders").update({estado:"completado"}).eq("id",id);cargar()}
  const borrar=async(id:string)=>{if(!confirm("Borrar?"))return;await supabase.from("orders").delete().eq("id",id);cargar()}
  const pendientes=pedidos.filter(p=>p.estado!=="completado")
  const completados=pedidos.filter(p=>p.estado==="completado")
  const lista=filtro==="pendientes"?pendientes:filtro==="completados"?completados:pedidos
  return <div className="min-h-screen bg-black text-white p-4"><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-black">ADMIN - RECARGAS FAST</h1><p className="text-xs opacity-60 mt-1">Total: {pedidos.length} | Pendientes: {pendientes.length} | Historial: {completados.length}</p><div className="flex gap-2 mt-6"><button onClick={()=>setFiltro("pendientes")} className={`px-4 py-2 rounded-full text-sm font-bold ${filtro==="pendientes"?"bg-yellow-400 text-black":"bg-zinc-800"}`}>Pendientes ({pendientes.length})</button><button onClick={()=>setFiltro("completados")} className={`px-4 py-2 rounded-full text-sm font-bold ${filtro==="completados"?"bg-green-500 text-black":"bg-zinc-800"}`}>Historial ({completados.length})</button><button onClick={()=>setFiltro("todos")} className={`px-4 py-2 rounded-full text-sm font-bold ${filtro==="todos"?"bg-white text-black":"bg-zinc-800"}`}>Todos</button></div><div className="grid gap-3 mt-6">{lista.map(p=><div key={p.id} className={`p-4 rounded-xl flex justify-between items-center ${p.estado==="completado"?"bg-zinc-900 opacity-60":"bg-zinc-900 border border-yellow-500/30"}`}><div><p className="font-bold">{p.telefono} - {p.operador} - ${p.monto}</p><p className="text-[11px] opacity-50">{new Date(p.created_at).toLocaleString()} - {p.estado}</p></div>{p.estado!=="completado"?<button onClick={()=>completar(p.id)} className="bg-green-500 text-black px-4 py-2 rounded-full text-xs font-black">COMPLETAR</button>:<button onClick={()=>borrar(p.id)} className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs">X</button>}</div>)}</div></div></div>
}
