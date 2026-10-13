import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  empty, entry, balances, validateFinance, contributionPolicy,
  allocateContribution, directIncomeAllocations, MARKETPLACE_ID,
} from '../src/finance/model';
const src = fs.readFileSync(path.join(process.cwd(),'src/components/FinanceCenterView.tsx'),'utf8');
const css = fs.readFileSync(path.join(process.cwd(),'src/finance/refinements.css'),'utf8');

const scenario = () => {
  const f = empty(); f.configured = true;
  f.marketplace.percent = 20;
  f.pots = f.pots.map(p => ({...p, value: p.id === 'nosso_patrimonio' || p.id === 'patrimonio_manuela' ? 10 : 0}));
  return f;
};
test('V5.3: entrada manual direciona 100% para pote escolhido, sem dividir', () => {
  const f = scenario();
  const allocations = directIncomeAllocations(12345,'transporte',f);
  assert.deepEqual(allocations,{transporte:12345});
  f.entries.push(entry({kind:'income', incomeMode:'direct', date:'2026-10-12', cents:12345, description:'Devolução',destination:'transporte',allocations,policy:contributionPolicy(f)},f.pots));
  validateFinance(f);
  const b=balances(f,'2026-10-12');
  assert.equal(b.account,12345);
  assert.equal(b.buckets.transporte,12345);
  assert.equal(b.buckets.nosso_patrimonio||0,0);
});
test('V5.3: entrada manual pode ir para saldo livre, patrimônio e reserva Mercado Livre', () => {
  const f=scenario();
  for (const dest of ['free','nosso_patrimonio',MARKETPLACE_ID]) {
    const allocations=directIncomeAllocations(10000,dest,f);
    assert.equal(allocations[dest],10000);
    assert.equal(Object.values(allocations).reduce((s,v)=>s+v,0),10000);
  }
  assert.throws(()=>directIncomeAllocations(10000,'pote_que_nao_existe',f),/destino/);
  assert.throws(()=>directIncomeAllocations(-200,'free',f));
});
test('V5.3: aporte utiliza percentuais automáticos e preserva reserva ML separada',()=>{
  const f=scenario();
  const distributions=allocateContribution(100000,contributionPolicy(f),0);
  assert.equal(distributions.nosso_patrimonio,10000);
  assert.equal(distributions.patrimonio_manuela,10000);
  assert.equal(distributions[MARKETPLACE_ID],16000);
  assert.equal(Object.values(distributions).reduce((s,v)=>s+v,0),100000);
  f.entries.push(entry({kind:'income',incomeMode:'distributed',cents:100000,date:'2026-10-12',description:'Salário',allocations:distributions,policy:contributionPolicy(f)},f.pots));
  validateFinance(f);
  assert.equal(balances(f,'2026-10-12').account,100000);
});
test('V5.3: saída debita exclusivamente o pote de origem, sem mexer em outros saldos',()=>{
  const f=scenario();
  f.entries.push(entry({kind:'income',incomeMode:'direct',date:'2026-10-12',description:'Recebimento',cents:50000,destination:'transporte',allocations:{transporte:50000},policy:contributionPolicy(f)},f.pots));
  f.entries.push(entry({kind:'expense',date:'2026-10-12',description:'Combustível',cents:12000,pot:'transporte'},f.pots));
  const b=balances(f,'2026-10-12');
  assert.equal(b.account,38000);
  assert.equal(b.buckets.transporte,38000);
  assert.equal(b.buckets.nosso_patrimonio||0,0);
});
test('V5.3: edição de histórico antigo mantém modo distribuído por padrão',()=>{
  const f=scenario();
  const old=entry({kind:'income',cents:10000,date:'2026-10-12',description:'Entrada antiga',policy:contributionPolicy(f)},f.pots);
  assert.equal(old.incomeMode,undefined);
  f.entries.push(old);
  validateFinance(f);
  assert.match(src,/old\?\.incomeMode/);
  assert.match(src,/old\?\.source.startsWith\("marketplace:"\) \? "direct" : "distributed"/);
});
test('V5.3: três abas selecionam sem confundir aporte e transferência interna',()=>{
  assert.match(src,/label: "Entrada"/);
  assert.match(src,/label: "Saída"/);
  assert.match(src,/label: "Aporte"/);
  assert.match(src,/key: "distributed", kind: "income"/);
  assert.match(src,/directIncomeAllocations\(amount, directDest, f\)/);
  assert.match(src,/modal.kind === "transfer"/);
  assert.match(src,/setMovementMode\(key\)/);
});
test('V5.3: proteção contra zoom automático do iOS, rolagem lateral e teclado virtual',()=>{
  assert.match(css,/finance-v53-backdrop/);
  assert.match(css,/--visual-height/);
  assert.match(css,/font-size:\s*16px !important/);
  assert.match(css,/overflow-x:\s*clip/);
  assert.match(src,/document.body.style.position = "fixed"/);
});
test('V5.3: 3D fosco também aparece no painel, extrato e títulos de contas, metas e perfil',()=>{
  assert.match(src,/finance-v53-page-icon/);
  assert.match(src,/entrySymbol/);
  assert.match(src,/<PotSymbol symbol=\{entrySymbol\}/);
  assert.match(css,/finance-v5-entry-tabs \.pot-symbol-3d/);
  for (const name of ['pig','basket','market','debts']) assert.ok(src.includes(`"${name}"`));
});
test('V5.3: registros históricos do Mercado Livre abrem em modo de destino único',()=>{
  assert.match(src,/old\?\.source.startsWith\("marketplace:"\) \? "direct" : "distributed"/);
  assert.match(src,/movement\.destination === MARKETPLACE_ID/);
  assert.match(src,/old\?\.source.startsWith\("marketplace:"\)/);
});
