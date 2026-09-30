# Referência do projeto

Data desta entrega: 30/09/2026.

Aplicação: Meu Império Financeiro, hospedada pelo usuário em Vercel, com repositório GitHub e dados Firebase. Base desta edição: ZIP `imperioecommerce-mineirador-main (1).zip`, commit de origem indicado no ZIP `e8e57f0c25df595e8f53ba071321984bf319bc1d`.

Objetivo autorizado: aprimorar primeiro o financeiro; remover duplicidade entre estimativa e aporte; permitir aportes de qualquer data; conservar configuração inicial dos potes; renovar design; implementar as ideias financeiras propostas.

Identidade: fundo suave ou grafite, verde sóbrio, tipografia limpa, poucos elementos decorativos, navegação responsiva, foco em saldo e ação.

Dados existentes: documento Firestore `imperio_finance/familia_imperio`. Nova estrutura `financeV2`, mantendo campos antigos para rollback. Valores inteiros em centavos. Política de distribuição registrada em cada aporte. Datas financeiras em calendário de São Paulo.

Autenticação preparada: Google, restrita nas regras à conta familiar existente. Ativação e domínio autorizado precisam ser confirmados no Firebase antes do deploy.

Entrega: código e demonstração local com dados fictícios. Nenhuma edição na base de produção e nenhum deploy realizado.

Pendências externas: configurar/verificar Firebase Authentication; aplicar/revisar regras; publicar no repositório GitHub/Vercel; revisar avisos de migração depois da primeira entrada.

Limites conhecidos: sem notificações externas ou tarefas no servidor; meses futuros de recorrências gerados durante uso; histórico legado sem percentuais anteriores; migração de metas genéricas exige conferência; crescimento do histórico exige futura divisão por documentos.

O código de mineração e estoque segue preservado, sem integração nesta etapa. Consulte README para instalação, validação e decisões financeiras.
