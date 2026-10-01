# Meu Império Financeiro — versão 2.2

Financeiro familiar com aporte único, potes, metas, contas e extrato. Esta versão prioriza o uso no iPhone e substitui o login Google pelo acesso com perfil e senha numérica.

## Mudanças desta versão

- Configuração inicial em quatro etapas: contas fixas/dívidas, aporte inicial, montagem dos potes e confirmação animada.
- Nosso Patrimônio e Patrimônio Manuela são calculados sobre o aporte bruto; contas do período são reservadas; os demais potes recebem percentuais apenas sobre o valor restante.
- Seletor de porcentagem circular com gesto ao redor do anel, passos de 2 pontos percentuais e bloqueio para impedir mais de 100% em cada base de distribuição.
- Dashboard mais compacto, com os dois patrimônios em linhas protegidas abaixo dos saldos principais.
- Gastos manuais são sempre pagos no ato, usam um único pote e são bloqueados se o pote não tiver saldo suficiente. Potes protegidos não aparecem como origem normal de gasto ou transferência.
- Contas recorrentes ficam separadas dos potes de consumo e continuam como pendentes até a confirmação de pagamento.
- Saldo não alocado exclui valores comprometidos com contas e pode ser direcionado, por decisão do usuário, para patrimônios, metas ou para os potes de uso.
- Nova área Meu Perfil com leitura de evolução financeira, tendências e pontos de atenção, sem medalhas, pontuação ou gamificação.
- Tema escuro mantém a identidade, mas usa grafite, azul e verde/sálvia para criar hierarquia entre fundos, cartões e ações.
- Microanimações em dashboard, potes, perfil e finalização do planejamento; respeita `prefers-reduced-motion`.
- A barra inferior móvel permanece com a mesma estrutura de navegação. O perfil é acessado pelo chip do usuário no topo.
- Escolha de perfil Você / Sua esposa e senha numérica validada no servidor, autoria de movimentações, backup e reset recuperável continuam preservados.

## Como publicar

Leia primeiro **CONFIGURAR-ACESSO.md**. Esta atualização exige duas variáveis privadas na Vercel, APP_PIN e FIREBASE_SERVICE_ACCOUNT_JSON, além das regras Firestore novas. Não publique esperando que o login Google ou o PIN do código antigo continuem funcionando.

Guarde a versão anterior e exporte o documento `imperio_finance/familia_imperio` pela sua rotina de backup antes de atualizar. Coloque os conteúdos desta pasta na raiz do repositório existente. A Vercel usa Vite, `npm ci`, `npm run build` e saída `dist`; a rota `/api/login` é atendida pela função de servidor, sem ser reescrita para a página principal.

O projeto usa Node.js 22; para testes locais, use 22.22.2 ou posterior da série 22, ou 24.15+ em ambiente de teste. O deploy de produção configura a série 22.

O arquivo de regras é um modelo para o financeiro. Ele nega acesso a outras coleções; se outras aplicações usarem o mesmo Firebase, integre os blocos financeiros sem apagar as regras específicas dessas aplicações.

## Uso no iPhone

Depois de publicar, abra o endereço no Safari e use Compartilhar → Adicionar à Tela de Início. O app tem ícone, margens seguras e navegação inferior. Os ajustes têm como alvo Safari de iOS 16 ou posterior. Login e salvamento na nuvem exigem internet; não há promessa de funcionamento offline.

A implementação tem CSS responsivo e os fluxos foram testados em DOM simulado. **Não houve teste em iPhone físico nem em Safari real nesta entrega.** A validação final de teclado, gesto de arrastar, tamanho dos textos e abertura pela tela inicial deve ser feita no seu dispositivo.

## Regras financeiras preservadas

Saldo em conta = aportes pagos com data até hoje − gastos pagos com data até hoje.

Reservado = saldos positivos dos potes protegidos.

Livre para gastar = saldo em conta − reservas protegidas − despesas pendentes com vencimento até o mês atual.

Em cada aporte, os potes `Nosso Patrimônio` e `Patrimônio Manuela` usam o valor bruto como base. Depois, as contas pendentes do período são reservadas. Somente o restante vira base para os demais potes. O dinheiro reservado para contas permanece no saldo sem distribuição até o pagamento e não é contado como saldo não alocado.

Cada pote de consumo tem saldo independente. Um gasto manual é considerado pago no momento do registro e só pode usar o pote escolhido; se o valor exceder o saldo disponível, a operação é bloqueada. O sistema não completa automaticamente um pote usando dinheiro de outro. Patrimônios protegidos não são origem normal de gasto ou transferência.

As porcentagens configuradas pela interface avançam de 2 em 2 e a soma não pode ultrapassar 100% em sua respectiva base. Valores fixos, quando usados, continuam atendidos por prioridade. Cada aporte guarda a política usada; novas configurações valem para novos aportes.

Contas recorrentes ou parceladas são geradas como pendentes e ficam fora dos potes de consumo. Confirmar uma conta como paga reduz o saldo em conta. Aporte futuro só passa a compor os saldos na data informada. Bens externos e saldo anterior externo de metas são informativos.

As automatizações de recorrências geram pendências até o mês atual ao abrir ou usar o app. Elas não fazem pagamentos, não enviam notificações externas e não executam tarefas com o app fechado.

## Migração e recuperação

Os dados novos são escritos em `financeV2` no documento familiar já existente. Campos legados ficam preservados. O aporte inicial vira uma única entrada; a estimativa `rendaMensal` não vira dinheiro recebido.

A data do aporte antigo é inferida do primeiro lançamento ou da data da migração, pois não existia uma data própria. Percentuais históricos também não existiam: os aportes antigos usam a configuração encontrada na migração. Confira os avisos apresentados no app.

Depósitos de metas identificados explicitamente são ligados à meta. Movimentos sem vínculo identificável permanecem como saída, com aviso para conferência; não é inventada uma atribuição entre metas. Contas antigas são preservadas pausadas, para revisão de vencimentos antes de ativar.

O reset substitui somente o financeiro novo por uma configuração vazia. Antes disso, guarda a cópia antiga no Firestore na mesma transação; se a gravação da cópia falhar, o reset não ocorre. Na demonstração, a cópia é local. A recuperação do último reset mantém a autoria dos registros antigos. Se voltar ao código v1, ele verá os campos legados, não as movimentações novas; exporte o backup v2 antes de retornar.

As transações usam controle de revisão para recusar sobrescritas por outro dispositivo. O histórico continua em um documento, com limite preventivo de aproximadamente 850 KB considerando campos antigos e novos. Quando crescer, a próxima etapa será separar os lançamentos em documentos individuais.

## Desenvolvimento

```bash
npm ci
npm run lint
npm run test
npm run dev
```

`npm run test` compila e executa os testes financeiros, do fluxo de login e da interface em DOM simulado. `npm run demo` cria `demonstracao.html` com dados fictícios. O Vite local não fornece `/api/login`; use `vercel dev` com as variáveis privadas para testar o backend completo ou uma implantação Preview da Vercel. Para testar apenas as telas no Vite, use `?demo=1`.

Verificações: autoria, edição por outro perfil, PIN inválido, perfil inválido, limite de tentativas, origem recusada, ausência de configuração, sliders, reset/recuperação, centavos, migração, transferências e recorrências. A validação do backend usou serviços simulados, sem acessar a base de produção.

Não foram testados nesta entrega: emissão real de tokens com sua conta de serviço, regras no seu projeto, transações na base de produção e interface em navegador gráfico. Nenhum deploy foi realizado.

## Estrutura

- `src/App.tsx`: perfil e login numérico.
- `api/login.ts`: função Vercel e autenticação Firebase por token personalizado.
- `server/login-handler.ts`: validação de senha, origem e limite de tentativas.
- `src/finance/model.ts`: cálculos, migração, autoria e reset.
- `src/finance/useFinance.ts`: sincronização, transações e cópias de reset.
- `src/finance/PotSymbol.tsx`: símbolos vetoriais com volume.
- `src/finance/PercentageControl.tsx`: porcentagens arrastáveis.
- `src/components/FinanceCenterView.tsx`: telas e formulários.
- `src/finance/finance.css`: visual responsivo e ajustes de iOS.
- `firestore.rules`: acesso dos dois perfis e cópias de recuperação.

Os módulos anteriores de mineração, estoque e comparação continuam no código, sem integração nesta etapa.

Documentação oficial: [autenticação personalizada do Firebase](https://firebase.google.com/docs/auth/admin/create-custom-tokens), [transações Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions), [funções Node.js na Vercel](https://vercel.com/docs/functions/runtimes/node-js).
