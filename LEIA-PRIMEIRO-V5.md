# Meu Império Financeiro — V5 (integração completa de interface)

Data da atualização: 12/10/2026. Projeto derivado da **V5 Integração** fornecida nesta conversa.

## Mudanças aplicadas

- Barra inferior no formato **Início · Potes · + · Extrato · Menu**, com botão central integrado à navegação; Menu abre Perfil, Contas, Metas e Ajustes.
- O **+ abre diretamente** Nova movimentação (abas **Entrada**, **Gasto**, **Aporte**), sem menu intermediário. O valor aparece em destaque antes da descrição, e é mantido quando o tipo é alterado. A opção padrão é **Gasto**. A data é editável para os três tipos.
- **Aporte interno novo somente do saldo livre para um pote**, sem cruzar entre potes. Transferências legadas continuam reconhecidas no histórico; não alteramos o cálculo retrospectivo.
- **Potes Modelo 1**, com arco contínuo fino, preenchimento vinculado a saldo/meta reais, e coleção própria de **15 objetos 3D foscos WebP transparentes** em `public/potes-3d/`.
- Potes protegidos **não mostram progressos fictícios**. Se houver uma meta associada, o arco usa o progresso em relação à meta; caso contrário mostra Protegido.
- Toque no círculo de cada pote abre painel com saldo, aportes, gastos, últimas movimentações e ações de aporte/registro de gasto/edição. As reservas protegidas não oferecem gasto comum.
- Refinamento das linhas do Extrato por dia, microinterações discretas, campo de valor maior, layout responsivo (inclusive viewport/teclado do iPhone e barra inferior integrada).
- Ícones do Patrimônio e Mercado Livre harmonizados com a coleção. Tema escuro é o padrão apenas quando o usuário ainda não salvou uma preferência; modo claro continua disponível.
- O Perfil continua sendo a única área de **gráficos de evolução**; não adicionamos gráficos à tela Inicial.
- `api/login.ts`: checagens complementares de origem/tipo/tamanho de requisição (não equivalem a controle de acesso).

## O que não foi alterado

A lógica financeira em `src/finance/model.ts`, as regras do Firestore, saldos e persistência, divisão dos aportes, separação de Mercado Livre, histórico de lançamentos, metas, parcelas, perfis Rhuan/Anne e mecanismos de backup. **O ZIP não contém seus dados de produção nem suas credenciais.**

## Validações efetuadas neste ambiente

- Análise sintática de **33 arquivos TS/TSX**: sem erros de parsing.
- **29 testes de lógica financeira/evolução/login-handler passaram** usando transpilação local com TypeScript global (sem bibliotecas externas de UI).
- **15 arquivos WebP 384×384** existentes e com canal alfa válido.

**Não foi possível concluir `npm ci`, `npm run build`, `npm run lint` nem executar os testes de interface no navegador neste ambiente:** os pacotes de frontend não puderam ser instalados. **Portanto esta é uma candidata à publicação, não um build homologado.** Não substitua a versão publicada antes de executar o build e conferir as operações em uma implantação de Preview.

## Preparar publicação no mesmo projeto da Vercel

1. Descompacte e envie os arquivos do projeto para o repositório correspondente, sem expor JSON de conta de serviço ou tokens.
2. Execute em ambiente com acesso às dependências: `npm ci`, `npm run build`, `npm run lint` e `npm test`.
3. Implante primeiro em ambiente de **Preview**, com as variáveis de Firebase já existentes. Não troque de projeto Firebase sem querer: os dados estão no projeto conectado.
4. Faça **backup/exportação** dos dados atuais por Ajustes antes de promover o deploy.
5. Em iPhone e iPad, confira: seletor Rhuan/Anne; entrar/sair; aporte externo; gasto; aporte interno do saldo livre; edição/exclusão/desfazer; contas e botão Pagar; Extrato; meta; patrimônio protegido; tema claro/escuro; filtros; teclado; navegação; fechamento do mês.
6. Só então promova o Preview à produção.

### Atenção — privacidade de dados (pendência crítica)

A forma atual de acesso foi preservada por sua escolha anterior (**seleção de perfil sem senha/Google**). No entanto, o endpoint `/api/login` **emite tokens Firebase para quem conseguir chamá-lo como Rhuan ou Anne**, sem confirmar a identidade da pessoa. A checagem de origem não é autenticação. **Não exponha esse deploy publicamente sem uma camada verdadeira de controle de acesso**, por exemplo proteção de implantação na Vercel ou autenticação definida por vocês. Esta é uma pendência de segurança anterior à V5 que precisa ser decidida antes da publicação pública.

## Organização dos arquivos 3D

`public/potes-3d/`: `family`, `car`, `basket`, `market`, `health`, `travel`, `education`, `game`, `debts`, `investment`, `patrimony`, `baby`, `emergency`, `pets`, `gifts` (extensão `.webp`).

Para adicionar outros, acrescente o arquivo com transparência a essa pasta e a chave em `src/finance/PotSymbol.tsx` (`symbols` e `iconFiles`). A imagem não contém os números dos potes, portanto valores/percentuais continuam dinâmicos.
