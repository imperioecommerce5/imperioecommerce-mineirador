import React, { useMemo, useState } from 'react';
import { Boxes, PackagePlus, Warehouse, Truck, Store, Pencil, Trash2, X, AlertTriangle, PackageCheck, Coins, ArrowRightLeft, History, ShoppingCart, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { InventoryItem, InventoryMovement, InventoryMovementType } from '../types';

type Draft=Omit<InventoryItem,'id'|'createdAt'|'updatedAt'>&{id?:string};
const blank:Draft={sku:'',name:'',unitCost:0,localStock:0,fullStock:0,supplierInbound:0,fullInbound:0,minStock:5};
const n=(v:string)=>Math.max(0,Number(v)||0);

const labels:Record<InventoryMovementType,string>={
 PURCHASE_SUPPLIER:'Compra do fornecedor', RECEIVE_SUPPLIER:'Recebi do fornecedor',
 SEND_TO_FULL:'Enviar ao Full', FULL_RECEIVED:'Full recebeu',
 SALE_LOCAL:'Venda / saída Local', SALE_FULL:'Venda / saída Full',
 RETURN_LOCAL:'Devolução ao Local', RETURN_FULL:'Devolução ao Full',
 ADJUST_LOCAL:'Ajuste + Local', ADJUST_FULL:'Ajuste + Full'
};
const desc:Record<InventoryMovementType,string>={
 PURCHASE_SUPPLIER:'Adiciona em A receber', RECEIVE_SUPPLIER:'A receber → Local',
 SEND_TO_FULL:'Local → Em trânsito Full', FULL_RECEIVED:'Em trânsito → Full',
 SALE_LOCAL:'Baixa do estoque Local', SALE_FULL:'Baixa do estoque Full',
 RETURN_LOCAL:'Entrada por devolução no Local', RETURN_FULL:'Entrada por devolução no Full',
 ADJUST_LOCAL:'Acrescenta saldo no Local', ADJUST_FULL:'Acrescenta saldo no Full'
};

export const InventoryView:React.FC<{
 items:InventoryItem[]; movements:InventoryMovement[];
 onSave:(d:Draft)=>Promise<void>; onDelete:(id:string)=>Promise<void>;
 onMove:(d:{inventoryId:string;type:InventoryMovementType;quantity:number;note?:string})=>Promise<void>;
}>=({items,movements,onSave,onDelete,onMove})=>{
 const [draft,setDraft]=useState<Draft>(blank),[open,setOpen]=useState(false),[saving,setSaving]=useState(false);
 const [moving,setMoving]=useState<InventoryItem|null>(null),[moveType,setMoveType]=useState<InventoryMovementType>('PURCHASE_SUPPLIER'),[qty,setQty]=useState(1),[note,setNote]=useState(''),[moveSaving,setMoveSaving]=useState(false);
 const [historySku,setHistorySku]=useState<string>('ALL');

 const stats=useMemo(()=>{const local=items.reduce((a,i)=>a+i.localStock,0),full=items.reduce((a,i)=>a+i.fullStock,0),supplier=items.reduce((a,i)=>a+i.supplierInbound,0),toFull=items.reduce((a,i)=>a+i.fullInbound,0);return{local,full,supplier,toFull,total:local+full+supplier+toFull,capital:items.reduce((a,i)=>a+(i.localStock+i.fullStock+i.supplierInbound+i.fullInbound)*i.unitCost,0),low:items.filter(i=>i.localStock+i.fullStock+i.supplierInbound+i.fullInbound<=i.minStock).length}},[items]);
 const filtered=historySku==='ALL'?movements:movements.filter(m=>m.inventoryId===historySku);
 const edit=(i:InventoryItem)=>{setDraft({...i});setOpen(true)};
 const add=()=>{const used=new Set(items.map(i=>i.sku));let x=1;while(used.has(`IMP-${String(x).padStart(4,'0')}`))x++;setDraft({...blank,sku:`IMP-${String(x).padStart(4,'0')}`});setOpen(true)};
 const submit=async()=>{if(!draft.sku.trim()||!draft.name.trim())return;setSaving(true);try{await onSave({...draft,sku:draft.sku.trim().toUpperCase(),name:draft.name.trim()});setOpen(false);setDraft(blank)}finally{setSaving(false)}};
 const startMove=(i:InventoryItem)=>{setMoving(i);setMoveType('PURCHASE_SUPPLIER');setQty(1);setNote('')};
 const submitMove=async()=>{if(!moving||qty<=0)return;setMoveSaving(true);try{await onMove({inventoryId:moving.id,type:moveType,quantity:qty,note});setMoving(null)}finally{setMoveSaving(false)}};

 return <div className="space-y-5 max-w-7xl mx-auto">
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><div className="flex items-center gap-2"><Warehouse className="w-6 h-6 text-amber-500"/><h1 className="text-xl sm:text-2xl font-black">Galpão IMPÉRIO</h1></div><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Estoque por SKU com movimentações e histórico completo.</p></div><button onClick={add} className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl px-4 py-2.5 text-sm"><PackagePlus className="w-4 h-4"/>Cadastrar SKU</button></div>

  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[['SKUs',items.length,Boxes],['Local',stats.local,Store],['Full',stats.full,PackageCheck],['Em trânsito',stats.supplier+stats.toFull,Truck],['Capital estoque',stats.capital.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),Coins]].map(([l,v,I]:any)=><div key={l} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"><div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase"><I className="w-4 h-4"/>{l}</div><div className="text-xl font-black mt-2">{v}</div></div>)}</div>

  {stats.low>0&&<div className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm font-bold"><AlertTriangle className="w-4 h-4 text-amber-600"/>{stats.low} SKU(s) no nível mínimo ou abaixo.</div>}

  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black overflow-hidden">
   <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between text-white"><div><p className="font-black text-sm">VISÃO DO GALPÃO</p><p className="text-xs text-slate-400">Cada box é um SKU. Movimente o estoque sem editar saldos manualmente.</p></div><span className="text-xs bg-slate-800 px-2 py-1 rounded-lg">{stats.total} un.</span></div>
   <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 bg-[linear-gradient(180deg,#111827,#0f172a)]">
    {items.length===0?<button onClick={add} className="min-h-44 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-amber-400 hover:text-amber-400 flex flex-col items-center justify-center gap-2"><PackagePlus className="w-7 h-7"/><span className="text-sm font-bold">Cadastrar primeiro SKU</span></button>:items.map(i=>{const owned=i.localStock+i.fullStock+i.supplierInbound+i.fullInbound,capacity=Math.max(i.minStock*4,50),fill=Math.min(100,Math.round(owned/capacity*100));return <div key={i.id} className="rounded-xl border border-slate-700 bg-slate-800/90 overflow-hidden">
     <div className="h-2 bg-slate-700"><div className="h-full bg-amber-400 transition-all" style={{width:`${fill}%`}}/></div><div className="p-4">
      <div className="flex justify-between gap-2"><div className="min-w-0"><span className="text-2xs font-black text-amber-400">{i.sku}</span><h3 className="text-white font-bold truncate">{i.name}</h3></div><div className="flex"><button onClick={()=>edit(i)} className="p-1.5 text-slate-400 hover:text-white"><Pencil className="w-4 h-4"/></button><button onClick={()=>confirm(`Excluir ${i.sku}?`)&&onDelete(i.id)} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button></div></div>
      <div className="mt-4 h-20 flex items-end gap-1.5 border-b-4 border-slate-600 px-1">{Array.from({length:10}).map((_,x)=><div key={x} className={`flex-1 rounded-t-sm border border-slate-600 ${x<Math.ceil(fill/10)?'bg-amber-400':'bg-slate-700/50'}`} style={{height:`${28+(x%3)*8}px`}}/>)}</div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs"><div className="bg-slate-900 rounded-lg p-2"><span className="text-slate-400">Local</span><b className="block text-white text-base">{i.localStock}</b></div><div className="bg-slate-900 rounded-lg p-2"><span className="text-slate-400">Full</span><b className="block text-white text-base">{i.fullStock}</b></div><div className="bg-slate-900 rounded-lg p-2"><span className="text-slate-400">A receber</span><b className="block text-sky-300">{i.supplierInbound}</b></div><div className="bg-slate-900 rounded-lg p-2"><span className="text-slate-400">→ Full</span><b className="block text-emerald-300">{i.fullInbound}</b></div></div>
      <button onClick={()=>startMove(i)} className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2.5"><ArrowRightLeft className="w-4 h-4"/>Movimentar estoque</button>
     </div></div>})}
   </div>
  </section>

  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
   <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between"><div className="flex items-center gap-2"><History className="w-5 h-5 text-amber-500"/><div><h2 className="font-black">Histórico de movimentações</h2><p className="text-xs text-slate-500">Livro razão do estoque: o que entrou, saiu e foi transferido.</p></div></div><select value={historySku} onChange={e=>setHistorySku(e.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"><option value="ALL">Todos os SKUs</option>{items.map(i=><option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}</select></div>
   <div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.length===0?<div className="p-8 text-center text-sm text-slate-500">Nenhuma movimentação registrada ainda.</div>:filtered.slice(0,100).map(m=><div key={m.id} className="p-4 grid sm:grid-cols-[1fr_auto] gap-2"><div><div className="flex flex-wrap items-center gap-2"><span className="font-black text-xs text-amber-600">{m.sku}</span><span className="font-bold text-sm">{labels[m.type]}</span><span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{m.quantity} un.</span></div><p className="text-xs text-slate-500 mt-1">{m.productName}{m.note?` • ${m.note}`:''}</p></div><div className="text-xs text-slate-500 sm:text-right">{new Date(m.createdAt).toLocaleString('pt-BR')}</div></div>)}</div>
  </section>

  {moving&&<div className="fixed inset-0 z-[80] bg-slate-950/75 p-3 grid place-items-center"><div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between"><div><h2 className="font-black">Movimentar {moving.sku}</h2><p className="text-xs text-slate-500">{moving.name}</p></div><button onClick={()=>setMoving(null)}><X className="w-5 h-5"/></button></div><div className="p-4 space-y-4">
   <label className="text-xs font-bold block">Tipo de movimentação<select value={moveType} onChange={e=>setMoveType(e.target.value as InventoryMovementType)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-3 text-sm">{(Object.keys(labels) as InventoryMovementType[]).map(k=><option key={k} value={k}>{labels[k]} — {desc[k]}</option>)}</select></label>
   <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Quantidade<input type="number" min="1" step="1" value={qty} onChange={e=>setQty(Math.max(1,Math.floor(n(e.target.value))))} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-3 text-sm"/></label><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs"><b>Saldos atuais</b><div className="mt-1 text-slate-500">Local {moving.localStock} • Full {moving.fullStock}<br/>A receber {moving.supplierInbound} • → Full {moving.fullInbound}</div></div></div>
   <label className="text-xs font-bold block">Observação (opcional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: Pedido fornecedor #123" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-3 text-sm"/></label>
   <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs"><b>{labels[moveType]}:</b> {desc[moveType]}. O sistema registra o histórico e atualiza os saldos automaticamente.</div>
   <button disabled={moveSaving} onClick={submitMove} className="w-full rounded-xl bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3">{moveSaving?'Registrando...':'Confirmar movimentação'}</button>
  </div></div></div>}

  {open&&<div className="fixed inset-0 z-[70] bg-slate-950/70 p-3 grid place-items-center"><div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="sticky top-0 bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between"><div><h2 className="font-black">{draft.id?'Editar SKU':'Cadastrar SKU'}</h2><p className="text-xs text-slate-500">Cadastre o saldo inicial; depois prefira usar “Movimentar estoque”.</p></div><button onClick={()=>setOpen(false)}><X className="w-5 h-5"/></button></div><div className="p-5 space-y-4">
   <div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-bold">SKU<input value={draft.sku} onChange={e=>setDraft({...draft,sku:e.target.value})} placeholder="IMP-0001" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm uppercase"/></label><label className="text-xs font-bold">Produto<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"/></label></div>
   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[['Custo unitário','unitCost'],['Estoque mínimo','minStock'],['Estoque Local','localStock'],['Estoque Full','fullStock'],['A receber fornecedor','supplierInbound'],['Enviado ao Full','fullInbound']].map(([l,k])=><label key={k} className="text-xs font-bold">{l}<input type="number" min="0" step={k==='unitCost'?'0.01':'1'} value={(draft as any)[k]} onChange={e=>setDraft({...draft,[k]:n(e.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"/></label>)}</div>
   <button disabled={saving||!draft.sku.trim()||!draft.name.trim()} onClick={submit} className="w-full rounded-xl bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3">{saving?'Salvando...':'Salvar SKU'}</button>
  </div></div></div>}
 </div>;
};
