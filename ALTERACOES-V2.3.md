# Meu Império Financeiro v2.3

- Potes exibidos como círculos, inclusive no mobile.
- Login sem senha.
- Dois acessos diretos: Rhuan e Anne.
- Autoria das movimentações e do extrato exibida como Rhuan ou Anne.
- Identificadores internos antigos (`voce` e `esposa`) foram mantidos para não quebrar o histórico existente.
- `APP_PIN` deixou de ser necessário; o deploy usa apenas `FIREBASE_SERVICE_ACCOUNT_JSON` para emitir a sessão Firebase do perfil escolhido.
