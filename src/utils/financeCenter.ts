import {collection,deleteDoc,doc,getDoc,getDocs,setDoc,writeBatch} from 'firebase/firestore';import{db}from'../firebase';import{CashEntry,DebtRecord,FinancePlan}from'../types';
const PLAN='financePlan',MOV='cashEntries',DEBT='debts';
export const defaultPlan:FinancePlan={id:'main',mercadoPagoBalance:0,businessCash:0,personalCash:0,personalSpendPct:40,debtPct:35,reservePct:15,investPct:10,businessReinvestPct:70,businessReservePct:15,businessWithdrawalPct:10,businessOtherPct:5,personalEssentialPct:40,personalFreePct:10,businessMinCash:0,updatedAt:new Date().toISOString()};
export async function getFinanceCenter(){const[p,m,d]=await Promise.all([getDoc(doc(db,PLAN,'main')),getDocs(collection(db,MOV)),getDocs(collection(db,DEBT))]);return{plan:p.exists()?{...defaultPlan,...(p.data()as FinancePlan)}:defaultPlan,entries:m.docs.map(x=>x.data()as CashEntry).sort((a,b)=>b.date.localeCompare(a.date)),debts:d.docs.map(x=>x.data()as DebtRecord)}}
export async function savePlan(p:FinancePlan){const x={...p,id:'main',updatedAt:new Date().toISOString()};await setDoc(doc(db,PLAN,'main'),x);return x}
export async function saveCashEntry(x:Omit<CashEntry,'id'|'createdAt'>){const id=`cash-${Date.now()}`,v={...x,id,createdAt:new Date().toISOString()};await setDoc(doc(db,MOV,id),v);return v}
export async function deleteCashEntry(id:string){await deleteDoc(doc(db,MOV,id))}
export async function saveDebt(x:Partial<DebtRecord>&Pick<DebtRecord,'name'|'balance'>){const id=x.id||`debt-${Date.now()}`,now=new Date().toISOString(),v={id,name:x.name,balance:Number(x.balance)||0,installment:Number(x.installment)||0,dueDay:Number(x.dueDay)||1,note:x.note||'',createdAt:x.createdAt||now,updatedAt:now};await setDoc(doc(db,DEBT,id),v);return v}
export async function deleteDebt(id:string){await deleteDoc(doc(db,DEBT,id))}

export async function transferBetweenCashboxes(direction:'BUSINESS_TO_PERSONAL'|'PERSONAL_TO_BUSINESS',amount:number,date:string,note=''){
 const value=Math.max(0,Number(amount)||0); if(!value)throw new Error('Informe um valor válido.');
 const pref=doc(db,PLAN,'main'),ps=await getDoc(pref),p=ps.exists()?{...defaultPlan,...ps.data()as FinancePlan}:{...defaultPlan};
 if(direction==='BUSINESS_TO_PERSONAL'&&p.businessCash<value)throw new Error('Caixa da empresa insuficiente.');
 if(direction==='PERSONAL_TO_BUSINESS'&&p.personalCash<value)throw new Error('Caixa pessoal insuficiente.');
 if(direction==='BUSINESS_TO_PERSONAL'){p.businessCash-=value;p.personalCash+=value}else{p.personalCash-=value;p.businessCash+=value}
 p.updatedAt=new Date().toISOString(); const pair=`transfer-${Date.now()}`,now=new Date().toISOString();
 const fromArea=direction==='BUSINESS_TO_PERSONAL'?'BUSINESS':'PERSONAL',toArea=direction==='BUSINESS_TO_PERSONAL'?'PERSONAL':'BUSINESS';
 const label=direction==='BUSINESS_TO_PERSONAL'?'Retirada para pessoal':'Aporte na empresa';
 const b=writeBatch(db);b.set(pref,p);
 b.set(doc(db,MOV,`${pair}-out`),{id:`${pair}-out`,area:fromArea,kind:'TRANSFER',category:'Transferência',description:note||label,amount:value,date,createdAt:now,transferPairId:pair,transferDirection:direction});
 b.set(doc(db,MOV,`${pair}-in`),{id:`${pair}-in`,area:toArea,kind:'TRANSFER',category:'Transferência',description:note||label,amount:value,date,createdAt:now,transferPairId:pair,transferDirection:direction});
 await b.commit();
}
