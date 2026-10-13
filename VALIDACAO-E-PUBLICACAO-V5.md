# Meu Império Financeiro — V5 | Código completo

Este ZIP reúne o código-fonte completo do aplicativo, os 15 ícones 3D foscos com transparência, as funcionalidades anteriores preservadas e as alterações V5.

## Implementado no código

- Menu inferior: Início | Potes | + | Extrato | Menu (Perfil, Contas, Metas, Ajustes).
- + abre diretamente Nova movimentação com Entrada, Gasto e Aporte.
- Arcos contínuos no estilo Modelo 1, 15 ícones WebP 3D foscos, saldos e percentuais dinâmicos.
- Patrimônios separados/protegidos; renda, Mercado Livre, despesas, metas, contas e fechamento mensal preservados.
- Extrato agrupado por data; detalhes dos potes com opções e histórico.
- Perfil familiar com indicadores de evolução e gráficos exclusivos dessa seção.
- Ajustes responsivos para teclado e navegação de iPhone e iPad, temas claro e escuro.
- Seleção de perfil Rhuan/Anne SEM senha, conforme solicitado.

## Validação realizada aqui

- 39 arquivos TS/TSX/JS analisados sintaticamente: sem erros de parsing.
- 51 caminhos de imports relativos verificados: nenhum arquivo ausente.
- 27 testes da lógica de finanças, evolução e handler de acesso: aprovados.
- 2 testes sobre presença dos ícones 3D e elementos V5: aprovados.
- Todos os 15 WebP confirmados 384x384 com transparência.

## Não validado aqui

- npm ci falhou porque o ambiente não conseguiu acessar o registry do npm (EAI_AGAIN).
- Logo, NÃO foram executados build Vite, verificação tipada via tsc, testes de interface em navegador ou testes reais com Firebase/Vercel.
- Este projeto contém o código completo, mas NÃO é um deploy homologado. Não publicar diretamente sobre a versão em uso antes dos testes em Preview.

## Como validar e publicar (no mesmo projeto)

1. Descompactar este ZIP e enviar o conteúdo da pasta `imperioecommerce-mineirador-main` ao repositório atual em uma branch `v5-preview` (sem substituir a branch de produção).
2. Em PC ou CI com Node 22 atualizado e acesso à internet, executar: `npm ci`, `npm run lint`, `npm run build`, `npm test`.
3. Abrir deploy Preview da Vercel vinculado ao repositório atual. NÃO criar outro projeto Firebase.
4. Testar com dados fictícios, sem modificar as finanças da família. Conferir configuração de variáveis de ambiente em Preview.
5. Antes de quaisquer testes com dados reais, exportar um backup em Ajustes e verificar como restaurá-lo.
6. Validar em iPhone e iPad: login, todos os tipos de movimentação, contas, Metas, Potes, histórico, saldos protegidos, edição/exclusão/desfazer, tema e teclado.
7. Apenas depois promover a branch homologada à produção.

## Aviso de segurança importante

O aplicativo mantém a escolha livre entre Rhuan e Anne, sem senha, conforme solicitado. Essa seleção NÃO verifica a identidade de quem acessa a URL. O endpoint `/api/login` emite um token Firebase válido para o perfil informado. Um link público pode expor dados financeiros a outras pessoas. Evite publicação pública sem restringir quem acessa a aplicação na infraestrutura (por exemplo, proteção de implantação ou rede privada). Este ponto NÃO foi resolvido na V5 porque você optou por não acrescentar senha ao aplicativo.

Nenhum dado financeiro de produção, token privado ou chave de conta de serviço está incluído no ZIP. Preserve as credenciais exclusivamente nas variáveis seguras da Vercel. Não as envie ao GitHub.
