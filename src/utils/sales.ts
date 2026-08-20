import { collection, deleteDoc, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, SaleRecord } from '../types';

const SALES='sales', INVENTORY='inventory';

export async function getSales():Promise<SaleRecord[]>{
 const s=await getDocs(collection(db,SALES));
 return s.docs.map(d=>d.data() as SaleRecord).sort((a,b)=>b.soldAt.localeCompare(a.soldAt));
}

export async function saveSale(input:Partial<SaleRecord>&Pick<SaleRecord,'inventoryId'|'quantity'|'source'|'salePriceUnit'|'receivedAmount'|'soldAt'>):Promise<SaleRecord>{
 const invRef=doc(db,INVENTORY,input.inventoryId), invSnap=await getDoc(invRef);
 if(!invSnap.exists()) throw new Error('SKU não encontrado.');
 const inv=invSnap.data() as InventoryItem;
 const qty=Math.max(1,Math.floor(Number(input.quantity)||1)), now=new Date().toISOString();
 let old:SaleRecord|undefined;
 if(input.id){const s=await getDoc(doc(db,SALES,input.id));if(s.exists())old=s.data() as SaleRecord;}
 const next={...inv};
 // Restore old sale first when editing.
 if(old){
   if(old.source==='LOCAL') next.localStock+=old.quantity; else next.fullStock+=old.quantity;
 }
 if(input.source==='LOCAL'){
   if(next.localStock<qty) throw new Error(`Estoque Local insuficiente. Disponível: ${next.localStock}.`);
   next.localStock-=qty;
 }else{
   if(next.fullStock<qty) throw new Error(`Estoque Full insuficiente. Disponível: ${next.fullStock}.`);
   next.fullStock-=qty;
 }
 next.updatedAt=now;
 const id=input.id||`sale-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
 const costSnapshot=old?.unitCostSnapshot ?? inv.unitCost;
 const sale:SaleRecord={
   id, orderNumber:(input.orderNumber||'').trim(), soldAt:input.soldAt,
   inventoryId:inv.id, sku:inv.sku, productName:inv.name, quantity:qty, source:input.source,
   salePriceUnit:Math.max(0,Number(input.salePriceUnit)||0),
   receivedAmount:Math.max(0,Number(input.receivedAmount)||0),
   unitCostSnapshot:costSnapshot, cmv:costSnapshot*qty,
   extraCosts:Math.max(0,Number(input.extraCosts)||0), note:(input.note||'').trim(),
   createdAt:old?.createdAt||now, updatedAt:now
 };
 const b=writeBatch(db); b.set(invRef,next); b.set(doc(db,SALES,id),sale); await b.commit(); return sale;
}

export async function deleteSale(id:string):Promise<void>{
 const ref=doc(db,SALES,id), snap=await getDoc(ref); if(!snap.exists())return;
 const sale=snap.data() as SaleRecord, invRef=doc(db,INVENTORY,sale.inventoryId), invSnap=await getDoc(invRef);
 const b=writeBatch(db);
 if(invSnap.exists()){
   const inv=invSnap.data() as InventoryItem, next={...inv};
   if(sale.source==='LOCAL')next.localStock+=sale.quantity;else next.fullStock+=sale.quantity;
   next.updatedAt=new Date().toISOString(); b.set(invRef,next);
 }
 b.delete(ref); await b.commit();
}
