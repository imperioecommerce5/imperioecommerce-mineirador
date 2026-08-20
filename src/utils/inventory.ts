import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem } from '../types';

const COLLECTION = 'inventory';
export async function getInventory(): Promise<InventoryItem[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => d.data() as InventoryItem).sort((a,b) => a.sku.localeCompare(b.sku));
}
export async function saveInventoryItem(data: Omit<InventoryItem,'id'|'createdAt'|'updatedAt'> & {id?:string}): Promise<InventoryItem> {
  const now = new Date().toISOString();
  const id = data.id || `sku-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  let createdAt = now;
  if (data.id) { const old = await getDoc(doc(db,COLLECTION,id)); if(old.exists()) createdAt=(old.data() as InventoryItem).createdAt || now; }
  const item: InventoryItem = {...data, id, createdAt, updatedAt:now};
  await setDoc(doc(db,COLLECTION,id), item);
  return item;
}
export async function deleteInventoryItem(id:string){ await deleteDoc(doc(db,COLLECTION,id)); }
