# Configurar o acesso por perfil na Vercel

O acesso não usa senha. Na tela inicial há apenas dois perfis: **Rhuan** e **Anne**. Ao tocar em um deles, o servidor cria uma sessão Firebase específica para aquele perfil. As duas pessoas acessam o mesmo planejamento e cada movimentação registra quem fez a ação.


## Correção da versão 2.4

A versão 2.4 remove o rewrite genérico da SPA que podia fazer `/api/login` responder com `index.html` em vez da função da Vercel. O acesso continua sem senha e usa apenas a variável `FIREBASE_SERVICE_ACCOUNT_JSON`.

Se a tela disser que a função de acesso não respondeu corretamente, publique novamente esta versão e confirme em **Vercel → Functions** que existe uma função em `/api/login`.

## Variável necessária

Na Vercel, mantenha somente a variável privada:

- `FIREBASE_SERVICE_ACCOUNT_JSON`: JSON completo da conta de serviço do projeto Firebase `imperioecommerce-mineirador`.

A variável `APP_PIN` não é mais usada e pode ser removida da Vercel.

## Como a autoria funciona

Internamente os perfis continuam usando os identificadores `voce` e `esposa` para manter compatibilidade com o histórico existente. Na interface eles aparecem como **Rhuan** e **Anne**. Assim, lançamentos antigos continuam válidos e os novos extratos mostram os nomes corretos.

As sessões Firebase continuam sendo `imperio-familia-voce` e `imperio-familia-esposa`, com as claims `familyFinance` e `actor` exigidas pelas regras do Firestore.

## Teste depois do deploy

1. Entre como Rhuan e registre uma movimentação de teste.
2. Saia do perfil.
3. Entre como Anne.
4. Confira se o mesmo extrato aparece e se a autoria da movimentação mostra Rhuan.
5. Registre outra movimentação como Anne e confira a identificação.

A demonstração `?demo=1` usa dados fictícios locais e também entra apenas tocando em Rhuan ou Anne.
