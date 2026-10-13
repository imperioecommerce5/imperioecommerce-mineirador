# Meu Império Financeiro — V5.2

## O que mudou

### Início: dashboard objetivo
- Indicadores **Livre para gastar** e **Saldo em conta** compactados; ambos usam `balances(f)` e continuam respeitando o recurso de ocultar valores.
- **Patrimônio familiar** e **Patrimônio Manuela** continuam separados, lado a lado, com ícones 3D e acesso aos detalhes.
- **Reserva Mercado Livre** preservada e agora visível em bloco próprio do Início, com saldo real `b.marketplace`, percentual atual e acesso às opções empresariais existentes.
- **Próximos pagamentos** mantidos, com até três pendências e ação direta para registrar pagamento; a lista completa permanece em Contas.
- Acesso discreto ao **Perfil** e evolução da família.
- Removidos da página Início: lista completa de potes, resumo de movimentos do mês e a lista repetida de últimas transações. Essas informações continuam acessíveis em suas páginas próprias.
- Recomendações de saldo não alocado e alertas de saldo negativo foram preservados.

### Extrato: linha do tempo financeira
- Agrupamento por **Hoje**, **Ontem** e data por extenso, usando o registro real de cada lançamento.
- Ícone discreto, título, contexto, valor alinhado, cor por tipo e indicador de lançamento pendente/agendado/excluído.
- Toque em uma movimentação para abrir **detalhes, autor, status e ações** (editar, repetir, excluir, restaurar e marcar pagamento quando cabível).
- Transferências internas são identificadas e mostradas sem sinal de entrada/saída, para **não confundirem aportes entre potes com novas receitas**.
- Filtros, busca, CSV e o acesso a movimentações do Mercado Livre foram preservados.

## O que não foi alterado
- `src/finance/model.ts`: cálculo dos saldos, distribuição dos aportes, separação de Mercado Livre, proteção de reservas e histórico.
- `src/finance/useFinance.ts`, integrações Firebase, regras de login existentes, estrutura de armazenamento, fechamento e migração.
- Os 15 ícones 3D e o desenho da página Potes V5.1.
- Contas, Metas, Perfil e navegação do V5.

## Arquivos principais alterados
- `src/components/FinanceCenterView.tsx`
- `src/finance/dashboard-v5-2.css` (novo)
- `tests/dashboard-v5-2.test.ts` (novo)

## Verificações desta entrega
- **37 testes locais aprovados**: lógica financeira, evolução, acesso, assets, cards de potes e verificações estáticas das alterações V5.2.
- **41 arquivos TS/TSX** verificados sem erro de sintaxe com o transpiler TypeScript.
- Nova folha de estilo passou no parser PostCSS.
- **Limitação**: não foi possível executar o build Vite nem o teste E2E/interface baseado em jsdom neste ambiente; a instalação `npm ci` falhou. Essas etapas precisam ser executadas em um ambiente com dependências disponíveis (ex.: Preview da Vercel).

## Como publicar com segurança
1. Fazer backup dos dados atuais e manter o deploy em produção intacto.
2. Publicar este projeto em um branch de teste/Preview usando a configuração já existente. Não criar outro banco Firebase.
3. Executar `npm ci`, `npm run lint`, `npm run build` e `npm test` no ambiente adequado. Verificar a versão do Node requisitada pelas dependências.
4. Testar no **iPhone e iPad** os dois temas, ocultar valores, patrimônio, Reserva Mercado Livre, pagar conta, filtros, abrir/editar/repetir registros e exportar CSV.
5. Confirmar que os valores do Firebase são idênticos antes/depois e só então promover o Preview a produção.

**Atenção ao acesso**: o usuário optou por manter seleção simples de perfis, sem nova senha. Essa escolha não equivale a autenticação forte e não deve ser tratada como proteção de dados financeiros contra terceiros.
