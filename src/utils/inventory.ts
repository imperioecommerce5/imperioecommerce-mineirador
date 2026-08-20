import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, InventoryMovement, InventoryMovementType } from '../types';

const COLLECTION = 'inventory';
const MOVEMENTS = 'inventoryMovements';

export async function getInventory(): Promise<InventoryItem[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => d.data() as InventoryItem).sort((a,b) => a.sku.localeCompare(b.sku));
}

export async function saveInventoryItem(data: Omit<InventoryItem,'id'|'createdAt'|'updatedAt'> & {id?:string}): Promise<InventoryItem> {
  const now = new Date().toISOString();
  const id = data.id || `sku-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  let createdAt = now;
  if (data.id) {
    const old = await getDoc(doc(db,COLLECTION,id));
    if(old.exists()) createdAt=(old.data() as InventoryItem).createdAt || now;
  }
  const item: InventoryItem = {...data, id, createdAt, updatedAt:now};
  await setDoc(doc(db,COLLECTION,id), item);
  return item;
}

export async function deleteInventoryItem(id:string){ await deleteDoc(doc(db,COLLECTION,id)); }

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const snap = await getDocs(collection(db, MOVEMENTS));
  return snap.docs
    .map(d => d.data() as InventoryMovement)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

const snapshot = (i: InventoryItem) => ({
  localStock:i.localStock, fullStock:i.fullStock,
  supplierInbound:i.supplierInbound, fullInbound:i.fullInbound,
});

export async function createInventoryMovement(input:{
  inventoryId:string; type:InventoryMovementType; quantity:number; note?:string;
}): Promise<InventoryMovement> {
  const itemRef=doc(db,COLLECTION,input.inventoryId);
  const snap=await getDoc(itemRef);
  if(!snap.exists()) throw new Error('SKU não encontrado.');
  const item=snap.data() as InventoryItem;
  const qty=Math.max(0,Math.floor(Number(input.quantity)||0));
  if(qty<=0) throw new Error('Informe uma quantidade maior que zero.');

  const before=snapshot(item);
  const next={...item};
  const need=(available:number,label:string)=>{
    if(available<qty) throw new Error(`Saldo insuficiente em ${label}. Disponível: ${available}.`);
  };

  switch(input.type){
    case 'PURCHASE_SUPPLIER': next.supplierInbound += qty; break;
    case 'RECEIVE_SUPPLIER':
      need(next.supplierInbound,'A receber do fornecedor');
      next.supplierInbound -= qty; next.localStock += qty; break;
    case 'SEND_TO_FULL':
      need(next.localStock,'Estoque Local');
      next.localStock -= qty; next.fullInbound += qty; break;
    case 'FULL_RECEIVED':
      need(next.fullInbound,'Enviado ao Full');
      next.fullInbound -= qty; next.fullStock += qty; break;
    case 'SALE_LOCAL':
      need(next.localStock,'Estoque Local');
      next.localStock -= qty; break;
    case 'SALE_FULL':
      need(next.fullStock,'Estoque Full');
      next.fullStock -= qty; break;
    case 'RETURN_LOCAL': next.localStock += qty; break;
    case 'RETURN_FULL': next.fullStock += qty; break;
    case 'ADJUST_LOCAL': next.localStock += qty; break;
    case 'ADJUST_FULL': next.fullStock += qty; break;
  }

  const now=new Date().toISOString();
  next.updatedAt=now;
  const id=`mov-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const movement:InventoryMovement={
    id, inventoryId:item.id, sku:item.sku, productName:item.name,
    type:input.type, quantity:qty, note:(input.note||'').trim(),
    createdAt:now, before, after:snapshot(next)
  };

  const batch=writeBatch(db);
  batch.set(itemRef,next);
  batch.set(doc(db,MOVEMENTS,id),movement);
  await batch.commit();
  return movement;
}


export async function deleteInventoryMovement(movementId:string): Promise<void> {
  const movementRef = doc(db, MOVEMENTS, movementId);
  const movementSnap = await getDoc(movementRef);
  if (!movementSnap.exists()) throw new Error('Movimentação não encontrada.');

  const movement = movementSnap.data() as InventoryMovement;
  const itemRef = doc(db, COLLECTION, movement.inventoryId);
  const itemSnap = await getDoc(itemRef);
  if (!itemSnap.exists()) throw new Error('SKU desta movimentação não foi encontrado.');

  const item = itemSnap.data() as InventoryItem;
  const qty = movement.quantity;
  const next = { ...item };

  const need = (available:number, label:string) => {
    if (available < qty) {
      throw new Error(`Não é possível excluir: o saldo atual de ${label} não permite desfazer esta movimentação.`);
    }
  };

  // Reverse exactly the inventory effect created by the movement.
  switch (movement.type) {
    case 'PURCHASE_SUPPLIER':
      need(next.supplierInbound, 'A receber');
      next.supplierInbound -= qty;
      break;
    case 'RECEIVE_SUPPLIER':
      need(next.localStock, 'Estoque Local');
      next.localStock -= qty;
      next.supplierInbound += qty;
      break;
    case 'SEND_TO_FULL':
      need(next.fullInbound, 'Em trânsito Full');
      next.fullInbound -= qty;
      next.localStock += qty;
      break;
    case 'FULL_RECEIVED':
      need(next.fullStock, 'Estoque Full');
      next.fullStock -= qty;
      next.fullInbound += qty;
      break;
    case 'SALE_LOCAL':
      next.localStock += qty;
      break;
    case 'SALE_FULL':
      next.fullStock += qty;
      break;
    case 'RETURN_LOCAL':
    case 'ADJUST_LOCAL':
      need(next.localStock, 'Estoque Local');
      next.localStock -= qty;
      break;
    case 'RETURN_FULL':
    case 'ADJUST_FULL':
      need(next.fullStock, 'Estoque Full');
      next.fullStock -= qty;
      break;
  }

  next.updatedAt = new Date().toISOString();
  const batch = writeBatch(db);
  batch.set(itemRef, next);
  batch.delete(movementRef);
  await batch.commit();
}
