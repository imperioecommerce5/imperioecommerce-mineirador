# Configurar a senha numérica na Vercel

O usuário entra escolhendo **Você** ou **Sua esposa**, seguido da senha numérica de quatro dígitos. Não há botão Google, conta Google ou autorização Google no fluxo de uso. As duas pessoas acessam o mesmo planejamento e têm sua identificação gravada nas movimentações.

A senha é validada por `api/login.ts` na Vercel. Em seguida, o servidor fornece uma sessão Firebase para o perfil escolhido. O Firebase continua armazenando os dados, sem aparecer na tela de login.

## Configuração única

1. Abra seu projeto na Vercel → Settings → Environment Variables.
2. Crie **APP_PIN** com a senha numérica da família escolhida na conversa. Preserve o zero inicial; informe os quatro números como texto, sem espaços ou aspas.
3. Abra o projeto `imperioecommerce-mineirador` no Firebase Console → Project settings → Service accounts → Firebase Admin SDK.
4. Gere uma chave privada para a conta de serviço. Guarde o arquivo JSON apenas com você.
5. Na Vercel, crie **FIREBASE_SERVICE_ACCOUNT_JSON**. Cole todo o conteúdo desse JSON como valor da variável. Não use prefixo `VITE_` em nenhuma dessas duas variáveis.
6. Aplique as variáveis a Production e ao ambiente Preview que for testar. Faça um novo deploy depois de cadastrá-las.
7. Em Firestore → Rules, revise e publique o arquivo `firestore.rules` entregue. Ele autoriza apenas as sessões dos dois perfis e a leitura/criação das cópias de reset. As coleções auxiliares do limite de login não são acessíveis pelo navegador.
8. Verifique no novo deploy: entrar no perfil Você; registrar um aporte de teste; sair; entrar no perfil Esposa; conferir o mesmo extrato e sua autoria. Exclua o aporte de teste pelo extrato ao terminar.

A coleção `imperio_finance_backups` é criada no primeiro reset. A coleção `imperio_login_limits` é usada pelo servidor para limitar tentativas de senha; não é preciso criá-las manualmente.

Não envie a chave privada por chat, não coloque o JSON dentro do repositório e não cadastre essas variáveis como variáveis de frontend. `.env.example` contém somente os nomes, sem valores privados.

## O que fica registrado

Cada movimentação possui `createdBy` e `updatedBy`. Os valores são `voce`, `esposa`, `sistema` ou `anterior`. Quando a esposa altera um aporte criado pelo titular, o autor original continua sendo o titular e a última alteração é atribuída à esposa. Pendências automáticas são geradas pelo Sistema; a confirmação de pagamento registra o perfil que confirmou.

A identificação representa o perfil selecionado. Como os dois usam a mesma senha, ela não é uma verificação independente da identidade física de cada pessoa. Cada abertura exige selecionar novamente o perfil, mesmo que haja sessão Firebase anterior no navegador.

## Demonstração

`imperio-financeiro-demonstracao.html` e `?demo=1` usam somente dados fictícios locais. Escolha um perfil e digite quaisquer quatro números para entrar. A demonstração não consulta a senha real nem acessa o Firestore da família.

## Se aparecer um erro

- “Acesso por senha precisa ser configurado”: falta APP_PIN ou FIREBASE_SERVICE_ACCOUNT_JSON na implantação em uso.
- “Não foi possível iniciar a sessão”: confira se o JSON pertence ao projeto correto, está completo e foi colocado como variável do servidor.
- “Muitas tentativas”: espere 15 minutos. O limite é de dez tentativas por endereço IP no intervalo.
- “Sem conexão com a nuvem”: confira a conexão e a publicação das regras do Firestore.

Nenhuma conta Google precisa ser escolhida durante o uso. O acesso ao console administrativo para configurar o projeto é separado do login do app.
