# Acesso por perfil — versão final

O aplicativo não pede senha. Na entrada existem somente os perfis **Rhuan** e **Anne**. O perfil selecionado é gravado como autor das movimentações e os dois acessam o mesmo planejamento no Firebase.

## Importante ao publicar na Vercel

Publique a atualização **no mesmo projeto Vercel que já está funcionando com o Firebase**. Criar um projeto Vercel diferente não copia automaticamente as variáveis privadas do projeto anterior.

O backend da versão final procura a credencial nestes nomes, nesta ordem:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_SERVICE`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

Se você já usa `FIREBASE_SERVICE_ACCOUNT_JSON`, não precisa trocar o conteúdo da variável.

A função `/api/login` foi reescrita como função Node padrão da Vercel. Ela aceita o JSON da conta de serviço normal, JSON salvo como string e também JSON em Base64.

## Como conferir depois do deploy

1. Abra **Vercel → seu projeto existente → Settings → Environment Variables** e confirme que a variável de serviço continua presente para o ambiente em que você publicou.
2. Em **Functions**, confirme a rota `/api/login`.
3. Abra o app e toque em **Rhuan** ou **Anne**. Não existe PIN ou senha.
4. Registre uma movimentação como Rhuan, saia, entre como Anne e confira no extrato a autoria.

As sessões Firebase continuam usando `imperio-familia-voce` e `imperio-familia-esposa`, preservando compatibilidade com os dados e regras existentes.
