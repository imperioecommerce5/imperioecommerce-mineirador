# Atualização do Meu Império Financeiro — 12/10/2026

## Aplicar mantendo os dados

1. No aplicativo atual, abra Ajustes (Configurações) e use **Exportar backup**. Guarde o JSON fora da pasta do projeto.
2. Atualize os arquivos do mesmo repositório/projeto que já está conectado à Vercel, usando o conteúdo deste ZIP. Não crie outro projeto Firebase.
3. Mantenha as variáveis de ambiente que já estão na Vercel. Este ZIP não contém nem exige novas chaves privadas.
4. Execute `npm ci`, `npm run lint` e `npm test` com Node 22. O deploy usa `npm run build` e a pasta `dist`, conforme a configuração existente.
5. Após publicar, entre como Rhuan ou Anne e confira saldo em conta, os dois patrimônios, Mercado Livre e últimas movimentações com a versão anterior. Se aparecer configuração inicial em uma família já configurada, pare e confira a conexão/ambiente; não registre um novo aporte inicial.

Não use “Resetar e configurar do zero” nem importe um backup para fazer uma simples atualização visual. Restaurar backup substitui dados e não faz parte deste procedimento.

Não foi acessado o Firebase real nem feito deploy nesta entrega. O backup de produção ainda precisa ser exportado pelo aplicativo atual. O ZIP contém código, não os valores atuais da família.

## Preservação

- Mesmo projeto Firebase e documento `imperio_finance/familia_imperio`.
- Modelo financeiro, distribuição, migração, autenticação e regras de acesso preservados.
- Nenhuma nova migração, reset, limpeza ou gravação de XP na nuvem.
- O único ajuste em `useFinance.ts` normaliza dados antigos exclusivamente na demonstração local. O caminho de produção permanece igual.
- Perfil e conquistas são calculados em memória a partir dos registros existentes. Consultá-los não grava dados financeiros.
- Autoria Rhuan/Anne mantida; evolução é conjunta.

## Mudanças

- Patrimônios lado a lado, valores sem quebra e fonte que se adapta ao comprimento. Toque para ver saldo e últimos registros.
- Campos de texto com 16 px, largura limitada, painel inferior adaptado à altura visível e sem foco automático que abre teclado ao entrar.
- Painel de ações pelo botão + central, preservando a navegação existente.
- Confirmação somente após salvar, mostrando movimentação, destino e saldo atual; destaque discreto para Mercado Livre.
- Contadores animados, anéis dos potes, transições rápidas, resposta ao toque e respeito a movimento reduzido.
- Extrato agrupado por data e metas com etapas de 0 a 100%.
- Perfil conjunto com níveis, XP, conquistas e critérios explicados na própria tela.
- Gráfico de aportes aos patrimônios somente no perfil, seleção de mês e de 6/12 meses. Ocultar valores também oculta o gráfico.
- Coroa discreta na abertura durante o carregamento e no acesso ao perfil; sem mascote.
- Glass Premium não foi acrescentado. Superfícies e temas existentes foram mantidos.

## Critérios do ranking

20 XP pela configuração inicial. Por mês completo, no máximo 80 XP: aporte pessoal, distribuição aos patrimônios, gastos pagos até o total aportado e presença de contas recorrentes sem pendências registradas (20 XP por critério).

Sem XP por quantidade de transações, tamanho do patrimônio, movimentações empresariais ou transferências. Mês em andamento ainda não pontua. Alterações e exclusões recalculam o histórico e podem remover conquistas.

Os registros atuais não guardam todas as datas originais de vencimento, metas mensais de aporte ou saldo devedor por dívida. Por isso, esta versão não inventa pontualidade passada, cumprimento de metas não cadastradas nem quitação de dívidas. O diagnóstico se limita aos dados disponíveis.

## Verificação

Testes de cálculos, acesso, preservação de histórico, operações e novo perfil. Verificação visual em navegador local com dados fictícios, incluindo largura móvel e campos de movimentação. Isso não substitui testar o teclado no Safari de um iPhone/iPad real nem valida credenciais da sua Vercel.

Arquivos principais: `FinanceCenterView.tsx`, `AnimatedMoney.tsx`, `FamilyProfile.tsx`, `evolution.ts`, `refinements.css`, `useFinance.ts` (demo) e `App.tsx` (importação de estilos).
