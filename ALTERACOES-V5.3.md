# Meu Império Financeiro — V5.3

Atualização completa a partir da V5.2 (que já inclui a Home compacta, Reserva Mercado Livre, extrato em linha do tempo e potes 3D circulares).

## Botão + — três movimentações distintas

1. **Entrada:** dinheiro novo que entra na conta e é colocado **100% em um único destino**, escolhido pelo usuário: Saldo livre, um pote ativo (inclusive patrimônios) ou a Reserva Mercado Livre. Não aplica percentuais automáticos. Registra lançamento `kind: income` com `incomeMode: direct` e uma única alocação.
2. **Saída:** dinheiro gasto do pote escolhido. Mantida a verificação existente de saldo para impedir saldos negativos e cruzamento indevido de potes. Registra `kind: expense`.
3. **Aporte:** dinheiro novo (salário, vendas da semana/mês, etc.) distribuído segundo os percentuais configurados, com a precedência existente de patrimônios, contas pendentes, Mercado Livre e demais potes. Registra `kind: income` com `incomeMode: distributed` e alocações efetivas.

**Transferências internas** continuam disponíveis nas ações dos potes, saldo livre e metas; não são confundidas com dinheiro novo e não aumentam o saldo em conta. O painel `+` não apresenta transferências como “Aporte”.

## Compatibilidade e segurança financeira

- `Finance.version` continua 2 e o Firebase continua usando a estrutura anterior; o único campo adicionado em `Entry` é `incomeMode?`, opcional e compatível com registros antigos.
- Lançamentos de renda antigos sem `incomeMode` continuam tratados como distribuídos; os vinculados ao Mercado Livre preservam o destino em caso de edição.
- A entrada direta mantém um único destino, sem redistribuir aos patrimônios automaticamente.
- A distribuição automática de um aporte reutiliza `allocateContribution` e `pendingCommitmentsForMonth`.
- O extrato identifica “Entrada · [pote]”, “Aporte · divisão automática”, “Saída · [pote]” e “Transferência interna”.
- Ao editar registros, não duplica os lançamentos e mantém os meses fechados bloqueados.
- Corrigidas variáveis do resumo mensal da tela Ajustes (`currentEntries`, `income`, `expense`) que estavam ausentes na V5.2.

## Correção mobile / iOS

- Campos de valor, data, descrição e seleção têm fonte de pelo menos 16px, para evitar zoom automático do Safari.
- O modal de movimentações limita a largura à viewport, bloqueia overflow horizontal, acompanha `visualViewport` e o teclado virtual.
- A página de fundo fica travada enquanto o painel estiver aberto e restaura sua posição ao fechar.
- Campos, abas e rodapé do formulário têm dimensionamento responsivo e áreas de toque adequadas.

## 3D fosco integrado

Reutiliza os **15 assets WebP transparentes** presentes em `public/potes-3d/`, sem alterar sua identidade. Os ícones aparecem também nas três abas da movimentação, nas linhas do extrato, nos pequenos saldos do Início e, de forma seletiva, em Metas, Contas e Perfil. Navegação e controles secundários continuam com ícones lineares para evitar excesso visual.

## Validação executada neste ambiente

- 46 testes locais via Node/TypeScript: **46 passaram** (incluindo 9 testes específicos de V5.3).
- 42 arquivos TypeScript/TSX analisados: **nenhum erro de sintaxe**.
- `model.ts` analisado por `tsc --noEmit`: **aprovado**.
- **Build completo do Vite e testes de interface reais não concluídos** neste ambiente, porque as dependências de frontend não estão instaladas. O pacote **não deve ser publicado diretamente em Production sem Preview**.

### Procedimento recomendado

1. Antes do deploy, faça backup dos dados financeiros via exportação dentro do aplicativo. Não limpe o Firestore e não reinicialize o planejamento.
2. Suba **o projeto inteiro deste ZIP** para a branch de teste do mesmo repositório GitHub (evite combinar fontes de versões diferentes).
3. Na Vercel, gere uma implantação Preview com as variáveis Firebase já configuradas para o ambiente de teste. Para não modificar registros reais durante os testes, prefira uma cópia dos dados ou projeto de teste separado.
4. Em ambiente Node 22: `npm ci`, `npm run build`, `npm run lint` e `npm test`.
5. Confira no iPhone/iPad: teclado aberto no painel `+`, rolagem vertical, fechamento, trocas de abas, Entrada com escolha de pote, Saída, Aporte, extrato, Reserva Mercado Livre e lançamento de contas.
6. Publique a branch em Production somente após conferir o Preview e confirmar que Firebase/rules permanecem corretos.

**Aviso de segurança:** a escolha de Rhuan/Anne sem autenticação foi mantida a pedido do usuário; sozinha, ela não protege os dados contra acesso não autorizado. Não publique uma instância aberta com permissões amplas no Firestore.
