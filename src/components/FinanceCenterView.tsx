// Potes Disponíveis (100% Finanças Pessoais / Negócios Gerais)
  const todosPotesDisponiveis: Pote[] = [
    { id: 'reserva', nome: 'Reserva', percentual: 30, cor: '#10B981', iconeEmoji: '🐷' },
    { id: 'transporte', nome: 'Transporte', percentual: 10, cor: '#3B82F6', iconeEmoji: '🚗' },
    { id: 'supermercado', nome: 'Supermercado', percentual: 20, cor: '#F97316', iconeEmoji: '🧺' },
    { id: 'desfrute_marido', nome: 'Desfrute ele', percentual: 10, cor: '#8B5CF6', iconeEmoji: '🎮' },
    { id: 'desfrute_esposa', nome: 'Desfrute ela', percentual: 10, cor: '#EC4899', iconeEmoji: '🛍️' },
    { id: 'dividas', nome: 'Dívidas & Contas Fixas', percentual: 15, cor: '#EF4444', iconeEmoji: '💳', contasFixas: [
      { id: '1', nome: 'Luz & Água', valor: 150 },
      { id: '2', nome: 'Cartão de Crédito', valor: 150 }
    ]},
    { id: 'dizimo', nome: 'Dízimo', percentual: 5, cor: '#84CC16', iconeEmoji: '✉️' },
    { id: 'investimentos', nome: 'Investimentos Gerais', percentual: 10, cor: '#F59E0B', iconeEmoji: '📈' },
  ];
