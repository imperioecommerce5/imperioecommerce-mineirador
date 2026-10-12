# Atualização visual V3 — preservar identidade original

Esta atualização parte da versão de potes segmentados e mantém as cores e o layout financeiro do projeto.

## Alterado nesta versão
- Botão Nova movimentação integrado à barra inferior mobile, entre Potes e Contas, sem botão flutuante duplicado.
- Barra inferior redistribuída para 7 ações, com área de toque e safe-area iOS.
- Cartões de patrimônio com números em uma linha, fonte adaptativa e layout lado a lado.
- Acabamento sólido discreto: bordas, estados de toque e sem brilho excessivo.
- Em desktop o botão rápido permanece disponível fora da barra móvel.

## Funcionalidades mantidas da base recebida
- Potes com anéis segmentados, valores e animações.
- Confirmações de aporte/gasto/pagamento e XP quando aplicável.
- Perfil familiar com ranking, medalhas e gráficos.
- Extrato cronológico, transições, privacidade de valores e metas.
- Formulários com tamanho de fonte apropriado para iOS e modal responsivo.
- Firebase, regras financeiras, temas e navegação atual.

## Validação pendente
- O ambiente de dependências disponibilizado está incompleto (faltam @types). npm run lint falha antes de verificar o projeto. Executar npm ci, npm run lint e npm run build em ambiente com acesso ao registro npm antes de publicar.
