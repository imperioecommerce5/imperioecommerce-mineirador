# Meu Império Financeiro — versão 2

Financeiro familiar em React, TypeScript, Vite e Firebase. O código de mineração, estoque e comparação foi preservado no projeto; a navegação principal continua dedicada ao financeiro.

## O que mudou

- Entrada única de dinheiro: aporte com valor e data, sem duplicidade de valor estimado e aporte inicial.
- Configuração inicial de porcentagens e primeiro aporte no mesmo fluxo.
- Distribuição registrada por aporte; alterações de potes só afetam entradas novas. Editar o valor de uma entrada conserva a política original.
- Valores calculados em centavos inteiros, com distribuição exata dos resíduos de arredondamento.
- Saldo em conta, reservas e valor livre apresentados separadamente. Transferências internas não são despesas.
- Potes percentuais ou fixos, prioridade, reserva protegida, saldo acumulativo e arquivamento sem apagar histórico.
- Recorrências e parcelas com geração idempotente; vencimentos no dia 31 são ajustados ao último dia de meses menores.
- Pagamentos pendentes, alertas de vencimento, limites de 80% e 100%, sugestão de categoria por descrição e regras configuráveis.
- Metas com pote próprio, contribuições extras, porcentagem automática e estimativa pela média dos últimos três meses.
- Extrato com busca, filtros, edição, repetição, exclusão recuperável e CSV.
- Resumo mensal, fechamento e reabertura; redistribuição das sobras dos potes que não acumulam.
- Backup JSON, validação de importação e exportação anterior à recuperação.
- Design responsivo, claro ou escuro, com navegação lateral no computador e barra inferior no celular.
- Google Authentication e modelo de regras restrito à conta da família. O PIN fixo foi removido.
- Gravação transacional com revisão para detectar alterações concorrentes.

## Regras financeiras

**Saldo em conta** = aportes pagos com data até hoje − gastos pagos com data até hoje.

**Reservado** = saldos positivos dos potes marcados como reserva.

**Livre para gastar** = saldo em conta − reservado − despesas pendentes com vencimento até o final do mês atual.

Uma pendência de meses futuros fica no calendário e não diminui o livre deste mês. Um aporte futuro aparece no extrato, mas não é usado antes da data informada. Confirmar uma conta como paga registra o pagamento na data de hoje; é possível editar a data pelo extrato.

Potes de valor fixo recebem primeiro, na ordem de prioridade; as porcentagens dividem o restante de **cada aporte**. Esses valores fixos não são tetos mensais. Por exemplo: num aporte de R$ 1.000, um pote fixo de R$ 200 recebe R$ 200; uma reserva de 10% recebe R$ 80 do restante. Se o aporte não cobrir todos os valores fixos, os potes de menor prioridade recebem apenas o restante disponível.

Metas recebem dinheiro em potes internos. O saldo anterior externo de uma meta é informativo: não cria dinheiro na conta atual. Bens e investimentos externos também são informativos. Gastar acima de um pote pode deixá-lo negativo; o app evidencia o limite. Transferir exige saldo suficiente na origem na data escolhida.

## Antes de publicar

1. Guarde o ZIP original e exporte uma cópia do documento `imperio_finance/familia_imperio` no Firestore, pela sua rotina de backup.
2. Em Firebase Console → Authentication → Sign-in method, ative Google.
3. Em Authentication → Settings → Authorized domains, adicione `imperioecommerce-mineirador.vercel.app`. Adicione também o domínio de produção personalizado, se houver.
4. Acesse usando `imperioecommerce5@gmail.com`. O modelo de regras permite apenas essa conta verificada. Sua esposa pode usar a mesma conta, conforme o funcionamento atual.
5. Em Firestore → Rules, revise e publique as regras de `firestore.rules`. **O arquivo é um modelo para a aplicação financeira e nega acesso às outras coleções.** Se houver outras aplicações usando o mesmo Firebase, preserve suas regras específicas e integre somente o bloco de `imperio_finance/familia_imperio`.
6. Substitua os arquivos do projeto na raiz do repositório GitHub. Não coloque a pasta `imperio-financeiro` dentro da raiz existente: use seus conteúdos.
7. Na Vercel, mantenha framework Vite, build `npm run build` e saída `dist`. O `vercel.json` já contém esses valores.
8. Confira o acesso em uma implantação de teste antes de promover a versão de produção. Use `?demo=1` para avaliar o visual sem acessar os dados financeiros reais.
9. Após entrar na versão nova, confira os avisos de migração e registre uma alteração de teste. Verifique que o estado indica “Salvo”.

Não publique a autenticação nova sem ativar Google e autorizar o domínio: o PIN antigo deixa de existir nesta versão.

## Migração dos dados existentes

A leitura usa o mesmo documento familiar existente. Os dados novos são escritos apenas em `financeV2`; os campos antigos permanecem no documento para recuperação. A migração é calculada ao carregar e persistida na primeira alteração salva. Não há substituição automática dos campos legados.

- O aporte inicial vira uma entrada única com ID estável `legacy-opening`.
- `rendaMensal`, que era uma estimativa, não é usada como entrada de dinheiro.
- A data do aporte inicial é inferida do primeiro lançamento ou da data da migração, pois não existia uma data própria. Confira e ajuste no extrato.
- O app antigo não guardava percentuais históricos: as entradas anteriores usam os percentuais encontrados no momento da migração. A partir da versão 2, cada aporte possui seu histórico de distribuição.
- Reservas extras identificadas pelo código anterior são convertidas em transferências internas.
- Depósitos de metas com identificação explícita são ligados à meta. Movimentos genéricos sem identificação suficiente continuam como despesas, com aviso para conferência. O saldo anterior das metas é preservado como valor externo quando não há vínculo seguro. Essa limitação exige revisão manual; não foi inventada uma atribuição entre metas.
- Contas parceladas antigas são preservadas pausadas, com a quantidade de parcelas restantes. Confira o primeiro vencimento antes de ativá-las.
- Itens de patrimônio externo são preservados.

Se voltar ao código antigo, ele continuará vendo somente os dados legados: **as movimentações feitas na versão 2 não aparecerão na versão antiga**. Antes de qualquer retorno, exporte o backup novo.

## Automatizações e limites

Recorrências são geradas ao abrir o app e durante o uso, até o mês atual. Parcelas futuras são geradas nos meses seguintes; não há servidor agendado, push externo nem pagamento automático. Editar uma recorrência altera apenas as parcelas ainda não geradas; ajuste pendências existentes no extrato. Pausar não apaga pendências.

Fechamentos são confirmados manualmente; o resumo mensal é calculado automaticamente. Meses fechados bloqueiam novas movimentações e alterações retroativas. Para reabrir vários meses, comece pelo mais recente.

A gravação usa transações e controle de revisão. Alterações concorrentes não são sobrescritas silenciosamente: um conflito pede atualização da página. Não há fila de gravações offline; a aplicação mostra a cópia local disponível, mas a nuvem precisa aceitar a transação para uma alteração ser considerada salva.

O financeiro continua em um documento para preservar compatibilidade com a estrutura atual. Existe um limite preventivo de aproximadamente 850 KB de JSON, considerando os campos legados e novos. Quando o histórico crescer, a próxima etapa será migrar lançamentos para documentos individuais. A cópia local é auxiliar; exporte backups periódicos.

## Desenvolvimento e verificações

Requer Node.js 22.13+ e npm.

```bash
npm ci
npm run dev
npm run lint
npm run test
```

`npm run test` faz a compilação e executa os testes de cálculo e interface em DOM simulado, usando dados fictícios. `npm run build` gera `dist`. `npm run format` formata os arquivos novos. `npm run demo` gera `demonstracao.html`, uma demonstração independente com dados fictícios.

Foram verificados: centavos, políticas históricas, aporte único, transferência, migração, parcelas idempotentes, fechamento, exclusão/restauração, configuração inicial, navegação e pagamento de recorrências.

**Não foram validados nesta entrega:** login Google real, aplicação das regras no seu Firebase, gravação na sua base de produção e layout em um navegador gráfico. O navegador remoto bloqueou o servidor local. Os fluxos foram testados em DOM simulado e a demonstração HTML usa os mesmos arquivos compilados da versão entregue.

## Documentação oficial

- [Transações do Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Acesso Google no Firebase](https://firebase.google.com/docs/auth/web/google-signin)

## Arquivos principais

- `src/finance/model.ts`: valores, distribuição, migração, fechamento e recorrências.
- `src/finance/useFinance.ts`: leitura, backup auxiliar e gravações transacionais.
- `src/components/FinanceCenterView.tsx`: interface e formulários financeiros.
- `src/finance/finance.css`: identidade visual responsiva.
- `src/App.tsx`: autenticação e demonstração local.
- `firestore.rules`: modelo de acesso para o documento financeiro.
- `tests/`: testes do financeiro e fluxos da interface.
