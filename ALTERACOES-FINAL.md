# Meu Império Financeiro — versão final 2.5

Alterações desta versão limitadas ao escopo aprovado:

- Login Rhuan/Anne continua sem senha; endpoint da Vercel refeito no formato Node compatível e com suporte a nomes alternativos da variável de service account.
- Contagem animada dos valores principais no dashboard e dos saldos dos potes, respeitando "reduzir movimento" do sistema.
- Botão de editar reposicionado com folga real da borda dos potes circulares.
- Símbolos dos potes mantêm os mesmos significados, com acabamento de volume/sombra mais premium em SVG.
- Layout específico para iPad/touch tablets: mantém a barra inferior, aproveita melhor a largura, usa três colunas de potes quando há espaço e modais centralizados.
- Nenhuma regra financeira, identidade do tema claro, navegação inferior ou estrutura funcional foi redesenhada nesta revisão.

## Deploy

Para o login compartilhar os dados do Firebase, publique esta versão no MESMO projeto Vercel que já contém a credencial de serviço. Um projeto Vercel novo não herda variáveis do projeto anterior.

A função aceita, nesta ordem, qualquer uma destas variáveis já existentes: `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_SERVICE` ou `GOOGLE_SERVICE_ACCOUNT_JSON`.
