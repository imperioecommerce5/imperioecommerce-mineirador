# Referência do projeto

Entrega: 30/09/2026, versão 2.1.

Meu Império Financeiro, código GitHub, hospedagem Vercel, dados Firebase. Base: ZIP original do minerador, commit de origem `e8e57f0c25df595e8f53ba071321984bf319bc1d`.

Escopo autorizado: melhorar primeiro o financeiro; aporte único com data; preservar configuração inicial; automatizações, novo design, sem Google; escolha Rhuan/Anne sem senha; autoria no extrato; tema escuro mais neutro; prioridade de uso iOS; símbolos com volume nos potes; sliders de porcentagem; reset para reconfigurar do zero.

Chave administrativa Firebase: somente na variável FIREBASE_SERVICE_ACCOUNT_JSON da Vercel. O app não usa senha de acesso. Nenhum valor privado fica cadastrado neste documento.

Sessões: `imperio-familia-voce` e `imperio-familia-esposa`, com claims familyFinance e actor. Perfil representa a seleção Rhuan/Anne feita na entrada. Identificação anterior desconhecida fica marcada como anterior; pendências geradas automaticamente como sistema.

Dados: `imperio_finance/familia_imperio`, estrutura `financeV2`, valores inteiros em centavos, política registrada por aporte. Reset preserva snapshot em `imperio_finance_backups` antes da substituição. Campos legados permanecem intactos e não são reutilizados depois de um reset v2.

Identidade: tema claro suave e tema escuro grafite/azul, símbolos vetoriais com volume e sombra, botões de toque e porcentagens arrastáveis. Safari iPhone é o alvo principal, sem validação física nesta entrega.

Validação: compilação TypeScript/Vite; testes unitários de cálculo e login com serviços simulados; testes de interface com DOM simulado. Produção não foi alterada.

Pendências externas: cadastrar variáveis Vercel; revisar/publicar regras Firebase; publicar código no GitHub/Vercel; verificar login real e salvamento; conferir migração; validar Safari no iPhone.

Mineração e estoque permanecem preservados e fora desta etapa. Consulte README e CONFIGURAR-ACESSO para procedimentos completos.
