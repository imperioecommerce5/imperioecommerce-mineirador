# V5.3 — Código completo pronto para validar

Esta pasta contém todo o projeto atualizado. Não é necessário juntar arquivos de versões anteriores.

## Arquivos principais
- `src/components/FinanceCenterView.tsx` — botões, formulário, extrato e indicadores 3D.
- `src/finance/model.ts` — regra de Entrada direta, Aporte distribuído e validação.
- `src/finance/refinements.css` — correções de zoom, painel móvel, sombras/ícones.
- `public/potes-3d/` — os 15 ícones 3D foscos.
- `tests/movement-v5-3.test.ts` — testes dos novos fluxos.
- `ALTERACOES-V5.3.md` — especificação e checklist de publicação.

## Importante
Mantenha o mesmo repositório e Firebase. Faça backup antes de atualizar e use a Vercel **Preview** primeiro. Este código foi validado com testes locais de lógica, mas o build da aplicação web e os testes reais em iOS/iPadOS ainda precisam ser executados com dependências instaladas.
