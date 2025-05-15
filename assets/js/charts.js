let estudantesChart, regioesChart, infraestruturaChart, evasaoChart, idebChart;

// Função para buscar municípios com base no estado selecionado
async function updateCityFilter(stateFilterId, cityListId) {
  const stateId = document.getElementById(stateFilterId).value;
  const cityInput = document.getElementById(cityListId.replace('List', 'Filter'));
  const cityList = document.getElementById(cityListId);
  cityList.innerHTML = '<option value="0">Todos os Municípios</option>';
  cityInput.value = '0';

  if (stateId === '0') return;

  try {
    const cities = await fetchIBGEData(`/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
    if (!cities) {
      console.error('Nenhum município retornado pela API do IBGE.');
      return;
    }

    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.id;
      option.textContent = city.nome;
      cityList.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
  }
}

// Atualizar seção de IDEB
async function updateIdebSection() {
  const stateId = document.getElementById('stateFilterIdeb').value;
  const cityId = document.getElementById('cityFilterIdeb').value;
  const nivel = document.getElementById('nivelIdeb').value;
  const data = await getIdebData(stateId, cityId, nivel);
  if (!data) {
    console.error('Nenhum dado de IDEB disponível.');
    return;
  }

  // Atualizar cards
  document.getElementById('idebNacional').textContent = data.nacional.toFixed(1);
  document.getElementById('melhorEstado').textContent = data.melhorEstado;
  document.getElementById('idebMelhorEstado').textContent = data.idebMelhorEstado.toFixed(1);
  document.getElementById('piorEstado').textContent = data.piorEstado;
  document.getElementById('idebPiorEstado').textContent = data.idebPiorEstado.toFixed(1);

  // Comparação com meta
  const meta = 6.0;
  const comp = (data.nacional - meta).toFixed(1);
  document.getElementById('compIdeb').textContent = `${comp > 0 ? '+' : ''}${comp}`;
  document.getElementById('compIdeb').className = comp >= 0 ? 'positive' : 'negative';

  // Atualizar gráfico
  if (idebChart) idebChart.destroy();
  const ctx = document.getElementById('idebChart').getContext('2d');
  idebChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nacional', data.melhorEstado, data.piorEstado],
      datasets: [{
        label: 'IDEB',
        data: [data.nacional, data.idebMelhorEstado, data.idebPiorEstado],
        backgroundColor: ['#2563eb', '#10b981', '#ef4444'],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 10 },
      },
    },
  });

  // Exportar dados
  document.getElementById('exportIdeb').onclick = () => {
    exportToCSV(
      [
        { Indicador: 'Nacional', IDEB: data.nacional },
        { Indicador: data.melhorEstado, IDEB: data.idebMelhorEstado },
        { Indicador: data.piorEstado, IDEB: data.idebPiorEstado },
      ],
      `ideb_${nivel}_${stateId}_${cityId}.csv`
    );
  };
}

// Atualizar seção de estudantes
async function updateEstudantesSection() {
  const stateId = document.getElementById('stateFilterEstudantes').value;
  const cityId = document.getElementById('cityFilterEstudantes').value;
  const data = await getEstudantesData(stateId, cityId);
  if (!data) return;

  // Atualizar cards
  document.getElementById('totalEstudantes').textContent = data.total.toLocaleString('pt-BR');
  document.getElementById('estudantesPublicas').textContent = data.publicas.toLocaleString('pt-BR');
  document.getElementById('estudantesPrivadas').textContent = data.privadas.toLocaleString('pt-BR');
  document.getElementById('percEstudantesPublicas').textContent = `${data.percPublicas}%`;
  document.getElementById('percEstudantesPrivadas').textContent = `${data.percPrivadas}%`;

  // Comparação com ano anterior
  const prevYearData = await getEstudantesDataForComparison(stateId, cityId, 2018);
  if (prevYearData) {
    const comp = ((data.total - prevYearData.total) / prevYearData.total * 100).toFixed(1);
    document.getElementById('compEstudantes').textContent = `${comp > 0 ? '+' : ''}${comp}%`;
    document.getElementById('compEstudantes').className = comp >= 0 ? 'positive' : 'negative';
  }

  // Atualizar gráfico
  if (estudantesChart) estudantesChart.destroy();
  const ctx = document.getElementById('estudantesDistribuicaoChart').getContext('2d');
  estudantesChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Públicas', 'Privadas'],
      datasets: [{
        data: [data.publicas, data.privadas],
        backgroundColor: ['#2563eb', '#f97316'],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });

  // Exportar dados
  document.getElementById('exportEstudantes').onclick = () => {
    exportToCSV(
      [
        { Tipo: 'Públicas', Quantidade: data.publicas, Percentual: data.percPublicas },
        { Tipo: 'Privadas', Quantidade: data.privadas, Percentual: data.percPrivadas },
      ],
      `estudantes_${stateId}_${cityId}.csv`
    );
  };
}

// Atualizar seção de regiões
async function updateRegioesSection() {
  const indicador = document.getElementById('indicadorRegional').value;
  const data = await getRegioesData(indicador);
  if (!data) return;

  // Atualizar gráfico
  if (regioesChart) regioesChart.destroy();
  const ctx = document.getElementById('regioesComparisonChart').getContext('2d');
  regioesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: indicador.toUpperCase(),
        data: data.map(d => d.value),
        backgroundColor: '#2563eb',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Exportar dados
  document.getElementById('exportRegioes').onclick = () => {
    exportToCSV(data, `regioes_${indicador}.csv`);
  };
}

// Atualizar seção de infraestrutura
async function updateInfraestruturaSection() {
  const stateId = document.getElementById('stateFilterInfraestrutura').value;
  const cityId = document.getElementById('cityFilterInfraestrutura').value;
  const tipo = document.getElementById('tipoInfraestrutura').value;
  const data = await getInfraestruturaData(stateId, cityId, tipo, 2019);
  if (!data) return;

  // Atualizar cards
  document.getElementById('internetAccess').textContent = `${data.internet}%`;
  document.getElementById('scienceLabs').textContent = `${data.labs}%`;
  document.getElementById('libraries').textContent = `${data.bibliotecas}%`;

  // Comparação com ano anterior
  const prevYearData = await getInfraestruturaData(stateId, cityId, tipo, 2018);
  if (prevYearData) {
    document.getElementById('compInternet').textContent = `${(data.internet - prevYearData.internet).toFixed(1)}%`;
    document.getElementById('compInternet').className = data.internet >= prevYearData.internet ? 'positive' : 'negative';
    document.getElementById('compLabs').textContent = `${(data.labs - prevYearData.labs).toFixed(1)}%`;
    document.getElementById('compLabs').className = data.labs >= prevYearData.labs ? 'positive' : 'negative';
    document.getElementById('compLibraries').textContent = `${(data.bibliotecas - prevYearData.bibliotecas).toFixed(1)}%`;
    document.getElementById('compLibraries').className = data.bibliotecas >= prevYearData.bibliotecas ? 'positive' : 'negative';
  }

  // Atualizar gráfico
  if (infraestruturaChart) infraestruturaChart.destroy();
  const ctx = document.getElementById('infraestruturaChart').getContext('2d');
  infraestruturaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Internet', 'Laboratórios', 'Bibliotecas'],
      datasets: [{
        label: 'Percentual de Escolas (%)',
        data: [data.internet, data.labs, data.bibliotecas],
        backgroundColor: ['#2563eb', '#f97316', '#10b981'],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
    },
  });

  // Exportar dados
  document.getElementById('exportInfraestrutura').onclick = () => {
    exportToCSV(
      [
        { Item: 'Internet', Percentual: data.internet },
        { Item: 'Laboratórios', Percentual: data.labs },
        { Item: 'Bibliotecas', Percentual: data.bibliotecas },
      ],
      `infraestrutura_${tipo}_${stateId}_${cityId}.csv`
    );
  };
}

// Atualizar seção de evasão
async function updateEvasaoSection() {
  const stateId = document.getElementById('stateFilterEvasao').value;
  const cityId = document.getElementById('cityFilterEvasao').value;
  const nivel = document.getElementById('nivelEvasao').value;
  const data = await getEvasaoData(stateId, cityId, nivel, 2019);
  if (!data) return;

  // Atualizar cards
  document.getElementById('taxaEvasao').textContent = `${data.taxaGeral}%`;
  document.getElementById('motivoEvasao').textContent = data.motivoPrincipal;
  document.getElementById('regiaoEvasao').textContent = data.regiaoMaiorEvasao;
  document.getElementById('taxaRegiaoEvasao').textContent = `${data.taxaRegiaoMaiorEvasao}%`;

  // Comparação com ano anterior
  const prevYearData = await getEvasaoData(stateId, cityId, nivel, 2018);
  if (prevYearData) {
    const comp = (data.taxaGeral - prevYearData.taxaGeral).toFixed(1);
    document.getElementById('compEvasao').textContent = `${comp > 0 ? '+' : ''}${comp}%`;
    document.getElementById('compEvasao').className = comp <= 0 ? 'positive' : 'negative';
  }

  // Atualizar gráfico
  if (evasaoChart) evasaoChart.destroy();
  const ctx = document.getElementById('evasaoChart').getContext('2d');
  const years = [2017, 2018, 2019];
  const taxas = [];
  for (let y of years) {
    const d = await getEvasaoData(stateId, cityId, nivel, y);
    taxas.push(d ? d.taxaGeral : 0);
  }
  evasaoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Taxa de Evasão (%)',
        data: taxas,
        borderColor: '#2563eb',
        fill: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Exportar dados
  document.getElementById('exportEvasao').onclick = () => {
    exportToCSV(
      [
        { Ano: 2019, Taxa: data.taxaGeral, Motivo: data.motivoPrincipal, 'Região Maior Evasão': data.regiaoMaiorEvasao },
      ],
      `evasao_${nivel}_${stateId}_${cityId}.csv`
    );
  };
}

// Adicionar eventos aos filtros
document.getElementById('stateFilterEstudantes').addEventListener('change', () => {
  updateCityFilter('stateFilterEstudantes', 'cityListEstudantes');
  updateEstudantesSection();
});
document.getElementById('cityFilterEstudantes').addEventListener('change', updateEstudantesSection);
document.getElementById('stateFilterInfraestrutura').addEventListener('change', () => {
  updateCityFilter('stateFilterInfraestrutura', 'cityListInfraestrutura');
  updateInfraestruturaSection();
});
document.getElementById('cityFilterInfraestrutura').addEventListener('change', updateInfraestruturaSection);
document.getElementById('tipoInfraestrutura').addEventListener('change', updateInfraestruturaSection);
document.getElementById('stateFilterEvasao').addEventListener('change', () => {
  updateCityFilter('stateFilterEvasao', 'cityListEvasao');
  updateEvasaoSection();
});
document.getElementById('cityFilterEvasao').addEventListener('change', updateEvasaoSection);
document.getElementById('nivelEvasao').addEventListener('change', updateEvasaoSection);
document.getElementById('stateFilterIdeb').addEventListener('change', () => {
  updateCityFilter('stateFilterIdeb', 'cityListIdeb');
  updateIdebSection();
});
document.getElementById('cityFilterIdeb').addEventListener('change', updateIdebSection);
document.getElementById('nivelIdeb').addEventListener('change', updateIdebSection);
document.getElementById('indicadorRegional').addEventListener('change', updateRegioesSection);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
});