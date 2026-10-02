"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home(){
 const [tel,setTel]=useState("")
 const [op,setOp]=useState("Claro")
 const [monto,setMonto]=useState("3000")
 const [loading,setLoading]=useState(false)

 const enviar=async()=>{
  if(!tel){alert("Pon el número");return}
  setLoading(true)
  const {error}=await supabase.from("orders").insert([{telefono:tel,operador:op,monto:Number(monto),estado:"pendiente"}])
  setLoading(false)
  if(error){alert("Error: "+error.message)}else{alert("¡Recarga enviada! En minutos llega");setTel("")}
 }

 return (
  <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
   <h1 className="text-4xl font-black mt-10">RECARGAS<span className="text-yellow-400">FAST</span></h1>
   <p className="opacity-60 text-sm mt-2">Recargas en segundos</p>

   <div className="mt-8 bg-zinc-900 p-6 rounded-[24px] w-full max-w-sm space-y-4 border border-zinc-800">
    <input value={tel} onChange={e=>setTel(e.target.value)} placeholder="Número Ej: 3001234567" className="w-full p-4 rounded-xl bg-black border border-zinc-700 outline-none focus:border-yellow-400" />

    <select value={op} onChange={e=>setOp(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-700">
     <option>Claro</option><option>Movistar</option><option>Tigo</option><option>Wom</option>
    </select>

    <select value={monto} onChange={e=>setMonto(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-700">
     <option value="3000">$3.000</option><option value="5000">$5.000</option><option value="10000">$10.000</option><option value="20000">$20.000</option>
    </select>

    <button onClick={enviar} disabled={loading} className="w-full bg-yellow-400 text-black p-4 rounded-xl font-black text-lg active:scale-95 disabled:opacity-50">
     {loading?"ENVIANDO...":"RECARGAR AHORA"}
    </button>
   </div>

   <a href="/admin" className="mt-10 text-xs opacity-20">Admin</a>
  </div>
 )
}
