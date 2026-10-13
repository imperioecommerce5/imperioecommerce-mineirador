# Meu Império Financeiro — V5.1 | Potes circulares refinados

Este pacote contém **o código completo do aplicativo**, partindo da V5 entregue anteriormente e alterando apenas a apresentação dos cards dos potes, além de acrescentar testes de regressão. **Não modifica** o modelo financeiro, a base Firebase, o login por seleção de perfil, as contas ou os 15 ícones 3D originais.

## Alterações visuais

- Mantido o círculo externo e o aro contínuo, com preenchimento derivado dos dados reais.
- Removido o texto apertado no topo dos cards (ex.: `Reserva · 10%`, `Gastos · 0%`).
- Ícone 3D centralizado e selo alinhado abaixo do arco (`Protegido`, `Sem saldo`, `Limite atingido` ou `N% livre`).
- Nome do pote, valor e descrição com hierarquia consistente.
- Removida a barra inferior que ficava cortada dentro da borda circular.
- Rodapé contextual: `Reserva protegida`, `% da meta` (quando houver), `% utilizado` ou `Sem movimentações`.
- Ajustes de espaçamento para celular, tablet e desktop, mantendo temas claro/escuro.
- Editar continua no botão do canto superior, e tocar no círculo continua abrindo os detalhes.
- `AnimatedMoney` e opção de ocultar saldo continuam preservados.

## Arquivos alterados

1. `src/components/FinanceCenterView.tsx` — somente componente `PotCard`.
2. `src/finance/refinements.css` — seção final `V5.1 — Pot cards`.
3. `tests/pot-cards-v5-1.test.ts` — testes para evitar regressões na composição.

## Validação

- 32 testes de lógica/estrutura **aprovados** (29 existentes + 3 de V5.1).
- Sintaxe TSX do componente modificada: sem erros de parsing.
- CSS: analisado sem erros estruturais de parsing.
- **Pendente:** `npm ci`, build do Vite, typecheck integral, teste de tela em navegador e validação iPhone/iPad/Firebase. O ambiente atual não dispõe das dependências instaladas de modo completo para essas etapas.

## Instalação e publicação segura

1. Descompacte e abra a pasta `imperioecommerce-mineirador-main`.
2. Crie uma branch de teste no mesmo GitHub usado pelo projeto Vercel existente.
3. Execute `npm ci`, `npm run lint`, `npm run build` e `npm test` em uma máquina com Node 22 e acesso ao registro npm.
4. Faça deploy Preview na Vercel antes de substituir a publicação atual.
5. Confirme o visual dos cards em tema claro e escuro no iPhone e no iPad. Teste os detalhes e a edição do pote, a atualização de saldo e o funcionamento do restante do app.
6. Faça backup de dados reais antes de qualquer teste de movimentação. Prefira base isolada de teste.

**Aviso:** a seleção entre os perfis Rhuan e Anne, sem senha, foi preservada conforme solicitado; ela não fornece autenticação individual segura para um site público. Veja `VALIDACAO-E-PUBLICACAO-V5.md`.
