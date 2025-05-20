let idebChart;
let estudantesChart;
let infraestruturaChart;
let evasaoChart;
let regioesChart;

// Função para atualizar a lista de cidades
async function updateCityFilter(stateFilterId, cityListId) {
  const stateId = document.getElementById(stateFilterId).value;
  const cityInput = document.getElementById(cityListId.replace('List', 'Filter'));
  const cityList = document.getElementById(cityListId);
  cityList.innerHTML = '<option value="0">Todos os Municípios</option>';
  cityInput.value = '0';

  if (stateId === '0') return;

  try {
    console.log(`Buscando municípios para stateId: ${stateId}`);
    const cities = await fetchIBGEData(`/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
    if (!cities) {
      throw new Error('Nenhum município retornado pela API do IBGE');
    }

    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.id;
      option.textContent = city.nome;
      cityList.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Função para atualizar a seção IDEB
async function updateIdebSection() {
  const stateId = document.getElementById('stateFilterIdeb').value;
  const cityId = document.getElementById('cityFilterIdeb').value;
  const ciclo = document.getElementById('nivelIdeb').value;

  if (!stateId || stateId === '0') {
    console.log('Aguardando seleção de estado para atualizar a seção IDEB.');
    return;
  }

  try {
    const data = await getIdebData(stateId, cityId, ciclo);
    if (!data) {
      throw new Error('Nenhum dado de IDEB disponível');
    }

    const nomeMelhorEstadoCard = document.getElementById('nomeMelhorEstado');
    const melhorEstadoCard = document.getElementById('idebNacional');
    const selectedCard = document.getElementById('melhorEstado');
    const selectedCardValue = document.getElementById('idebMelhorEstado');
    const piorEstadoCard = document.getElementById('piorEstado');
    const piorEstadoCardValue = document.getElementById('idebPiorEstado');

    if (nomeMelhorEstadoCard) {
      nomeMelhorEstadoCard.textContent = data.melhorEstado;
    } else {
      console.error('Elemento nomeMelhorEstado não encontrado no DOM.');
    }
    if (melhorEstadoCard) {
      melhorEstadoCard.textContent = data.idebMelhorEstado.toFixed(1);
    } else {
      console.error('Elemento idebNacional não encontrado no DOM.');
    }
    if (selectedCard) {
      selectedCard.textContent = data.nomeSelecionado;
    } else {
      console.error('Elemento melhorEstado não encontrado no DOM.');
    }
    if (selectedCardValue) {
      selectedCardValue.textContent = data.estadoSelecionado > 0 ? data.estadoSelecionado.toFixed(1) : 'Não disponível';
    } else {
      console.error('Elemento idebMelhorEstado não encontrado no DOM.');
    }
    if (piorEstadoCard) {
      piorEstadoCard.textContent = data.piorEstado;
    } else {
      console.error('Elemento piorEstado não encontrado no DOM.');
    }
    if (piorEstadoCardValue) {
      piorEstadoCardValue.textContent = data.idebPiorEstado.toFixed(1);
    } else {
      console.error('Elemento idebPiorEstado não encontrado no DOM.');
    }

    const chartElement = document.getElementById('idebChart');
    if (!chartElement) {
      console.error('Elemento idebChart não encontrado no DOM.');
      return;
    }
    if (idebChart) idebChart.destroy();
    const ctx = chartElement.getContext('2d');
    idebChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [data.piorEstado, data.melhorEstado, data.nomeSelecionado, 'Nacional'],
        datasets: [{
          label: 'IDEB',
          data: [data.idebPiorEstado, data.idebMelhorEstado, data.estadoSelecionado, data.nacional],
          backgroundColor: ['#ef4444', '#10b981', '#2563eb', '#8b5cf6'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 10 },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => value > 0 ? value.toFixed(1) : 'N/A',
            font: {
              weight: 'bold',
            },
          },
        },
      },
    });

    const exportButton = document.getElementById('exportIdeb');
    if (exportButton) {
      exportButton.onclick = () => {
        exportToCSV(
          [
            { Indicador: 'Nacional', IDEB: data.nacional },
            { Indicador: data.melhorEstado, IDEB: data.idebMelhorEstado },
            { Indicador: data.piorEstado, IDEB: data.idebPiorEstado },
            { Indicador: data.nomeSelecionado, IDEB: data.estadoSelecionado > 0 ? data.estadoSelecionado : 'Não disponível' },
          ],
          `ideb_${ciclo}_${stateId}_${cityId || '0'}.csv`
        );
      };
    } else {
      console.error('Elemento exportIdeb não encontrado no DOM.');
    }
  } catch (error) {
    console.error('Erro ao atualizar seção IDEB:', error);
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').textContent = 'Erro ao carregar dados do IDEB. Tente novamente.';
  }
}

// Função para atualizar a seção Estudantes
async function updateEstudantesSection() {
  const stateId = document.getElementById('stateFilterEstudantes').value;
  const cityId = document.getElementById('cityFilterEstudantes').value;

  if (!stateId || stateId === '0') {
    console.log('Aguardando seleção de estado para atualizar a seção Estudantes.');
    return;
  }

  try {
    const data = await getEstudantesData(stateId, cityId);
    if (!data) {
      throw new Error('Nenhum dado de estudantes disponível');
    }

    const totalEstudantesCard = document.getElementById('totalEstudantes');
    const estudantesPublicasCard = document.getElementById('estudantesPublicas');
    const percEstudantesPublicasCard = document.getElementById('percEstudantesPublicas');
    const estudantesPrivadasCard = document.getElementById('estudantesPrivadas');
    const percEstudantesPrivadasCard = document.getElementById('percEstudantesPrivadas');

    if (totalEstudantesCard) {
      totalEstudantesCard.textContent = data.totalEstudantes.toLocaleString('pt-BR');
    } else {
      console.error('Elemento totalEstudantes não encontrado no DOM.');
    }
    if (estudantesPublicasCard) {
      estudantesPublicasCard.textContent = data.totalPublicas.toLocaleString('pt-BR');
    } else {
      console.error('Elemento estudantesPublicas não encontrado no DOM.');
    }
    if (percEstudantesPublicasCard) {
      percEstudantesPublicasCard.textContent = `${data.percPublicas.toFixed(1)}%`;
    } else {
      console.error('Elemento percEstudantesPublicas não encontrado no DOM.');
    }
    if (estudantesPrivadasCard) {
      estudantesPrivadasCard.textContent = data.totalPrivadas.toLocaleString('pt-BR');
    } else {
      console.error('Elemento estudantesPrivadas não encontrado no DOM.');
    }
    if (percEstudantesPrivadasCard) {
      percEstudantesPrivadasCard.textContent = `${data.percPrivadas.toFixed(1)}%`;
    } else {
      console.error('Elemento percEstudantesPrivadas não encontrado no DOM.');
    }

    const nomeSelecionadoTitle = document.getElementById('nomeSelecionadoTitle');
    if (nomeSelecionadoTitle) {
      nomeSelecionadoTitle.textContent = data.nomeSelecionado;
    } else {
      console.error('Elemento nomeSelecionadoTitle não encontrado no DOM.');
    }

    const chartElement = document.getElementById('estudantesDistribuicaoChart');
    if (!chartElement) {
      console.error('Elemento estudantesDistribuicaoChart não encontrado no DOM.');
      return;
    }
    if (estudantesChart) estudantesChart.destroy();
    const ctx = chartElement.getContext('2d');
    estudantesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Escolas Públicas', 'Escolas Privadas'],
        datasets: [{
          data: [data.totalPublicas, data.totalPrivadas],
          backgroundColor: ['#2563eb', '#8b5cf6'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#fff',
            formatter: (value, ctx) => {
              const label = ctx.chart.data.labels[ctx.dataIndex];
              const percentage = ((value / (data.totalPublicas + data.totalPrivadas)) * 100).toFixed(1) + '%';
              return `${label}: ${percentage}`;
            },
            font: {
              weight: 'bold',
            },
          },
          legend: {
            position: 'top',
          },
        },
      },
    });

    const exportButton = document.getElementById('exportEstudantes');
    if (exportButton) {
      exportButton.onclick = () => {
        exportToCSV(
          [
            { Indicador: 'Total de Estudantes', Valor: data.totalEstudantes },
            { Indicador: 'Estudantes em Escolas Públicas', Valor: data.totalPublicas, Percentual: `${data.percPublicas.toFixed(1)}%` },
            { Indicador: 'Estudantes em Escolas Privadas', Valor: data.totalPrivadas, Percentual: `${data.percPrivadas.toFixed(1)}%` },
          ],
          `estudantes_${stateId}_${cityId || '0'}.csv`
        );
      };
    } else {
      console.error('Elemento exportEstudantes não encontrado no DOM.');
    }
  } catch (error) {
    console.error('Erro ao atualizar seção Estudantes:', error);
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Função para atualizar a seção Infraestrutura
async function updateInfraestruturaSection() {
  const stateId = document.getElementById('stateFilterInfraestrutura').value;
  const cityId = document.getElementById('cityFilterInfraestrutura').value;
  const tipo = document.getElementById('tipoInfraestrutura').value;

  if (!stateId || stateId === '0') {
    console.log('Aguardando seleção de estado para atualizar a seção Infraestrutura.');
    return;
  }

  try {
    const data = await getInfraestruturaData(stateId, cityId, tipo);
    const safeData = data || {
      nomeSelecionado: 'Não informado',
      totalEscolas: 0,
      percInternet: 0,
      percLabsCiencia: 0,
      percBibliotecas: 0,
      dataAvailable: false,
    };

    const noDataMessage = "Dados não disponíveis";
    const internetAccessCard = document.getElementById('internetAccess');
    const scienceLabsCard = document.getElementById('scienceLabs');
    const librariesCard = document.getElementById('libraries');

    if (internetAccessCard) {
      internetAccessCard.textContent = safeData.dataAvailable ? `${safeData.percInternet.toFixed(1)}%` : noDataMessage;
    } else {
      console.error('Elemento internetAccess não encontrado no DOM.');
    }
    if (scienceLabsCard) {
      scienceLabsCard.textContent = safeData.dataAvailable ? `${safeData.percLabsCiencia.toFixed(1)}%` : noDataMessage;
    } else {
      console.error('Elemento scienceLabs não encontrado no DOM.');
    }
    if (librariesCard) {
      librariesCard.textContent = safeData.dataAvailable ? `${safeData.percBibliotecas.toFixed(1)}%` : noDataMessage;
    } else {
      console.error('Elemento libraries não encontrado no DOM.');
    }

    const nomeInfraestruturaTitle = document.getElementById('nomeInfraestruturaTitle');
    if (nomeInfraestruturaTitle) {
      nomeInfraestruturaTitle.textContent = safeData.nomeSelecionado;
    } else {
      console.error('Elemento nomeInfraestruturaTitle não encontrado no DOM.');
    }

    const chartElement = document.getElementById('infraestruturaChart');
    if (!chartElement) {
      console.error('Elemento infraestruturaChart não encontrado no DOM.');
      return;
    }
    if (infraestruturaChart) infraestruturaChart.destroy();
    const ctx = chartElement.getContext('2d');
    infraestruturaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Acesso à Internet', 'Laboratórios de Ciência', 'Bibliotecas'],
        datasets: [{
          label: 'Percentual de Escolas',
          data: [safeData.percInternet, safeData.percLabsCiencia, safeData.percBibliotecas],
          backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'right',
            formatter: (value) => safeData.dataAvailable ? `${value.toFixed(1)}%` : '',
            font: {
              weight: 'bold',
            },
          },
        },
      },
    });

    const exportButton = document.getElementById('exportInfraestrutura');
    if (exportButton) {
      exportButton.onclick = () => {
        exportToCSV(
          [
            { Indicador: 'Acesso à Internet', Percentual: safeData.dataAvailable ? `${safeData.percInternet.toFixed(1)}%` : noDataMessage },
            { Indicador: 'Laboratórios de Ciência', Percentual: safeData.dataAvailable ? `${safeData.percLabsCiencia.toFixed(1)}%` : noDataMessage },
            { Indicador: 'Bibliotecas', Percentual: safeData.dataAvailable ? `${safeData.percBibliotecas.toFixed(1)}%` : noDataMessage },
          ],
          `infraestrutura_${tipo}_${stateId}_${cityId || '0'}.csv`
        );
      };
    } else {
      console.error('Elemento exportInfraestrutura não encontrado no DOM.');
    }
  } catch (error) {
    console.error('Erro ao atualizar seção Infraestrutura:', error);
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Função para atualizar a seção Evasão Escolar
async function updateEvasaoSection() {
  const stateId = document.getElementById('stateFilterEvasao').value;
  const cityId = document.getElementById('cityFilterEvasao').value;
  const nivel = document.getElementById('nivelEvasao').value;

  if (!stateId || stateId === '0') {
    console.log('Aguardando seleção de estado para atualizar a seção Evasão Escolar.');
    return;
  }

  try {
    const data = await getEvasaoData(stateId, cityId, nivel);
    const safeData = data || {
      nomeSelecionado: 'Não informado',
      taxaAbandonoMedia: 0,
      taxaAprovacaoMedia: 0,
      taxaReprovacaoMedia: 0,
      taxasPorDependencia: [],
      dataAvailable: false,
    };

    const noDataMessage = "Dados não disponíveis";

    const nomeEvasaoTitle = document.getElementById('nomeEvasaoTitle');
    if (nomeEvasaoTitle) {
      nomeEvasaoTitle.innerHTML = ` <strong>${safeData.nomeSelecionado}</strong>`;
    } else {
      console.error('Elemento nomeEvasaoTitle não encontrado no DOM.');
    }

    const taxaEvasaoCard = document.getElementById('taxaEvasao');
    const taxaAprovacaoCard = document.getElementById('taxaAprovacao');
    const taxaReprovacaoCard = document.getElementById('taxaReprovacao');

    if (taxaEvasaoCard) {
      taxaEvasaoCard.textContent = safeData.dataAvailable ? `${safeData.taxaAbandonoMedia.toFixed(2)}%` : noDataMessage;
    } else {
      console.error('Elemento taxaEvasao não encontrado no DOM.');
    }
    if (taxaAprovacaoCard) {
      taxaAprovacaoCard.textContent = safeData.dataAvailable ? `${safeData.taxaAprovacaoMedia.toFixed(2)}%` : noDataMessage;
    } else {
      console.error('Elemento taxaAprovacao não encontrado no DOM.');
    }
    if (taxaReprovacaoCard) {
      taxaReprovacaoCard.textContent = safeData.dataAvailable ? `${safeData.taxaReprovacaoMedia.toFixed(2)}%` : noDataMessage;
    } else {
      console.error('Elemento taxaReprovacao não encontrado no DOM.');
    }

    const chartElement = document.getElementById('evasaoChart');
    if (!chartElement) {
      console.error('Elemento evasaoChart não encontrado no DOM.');
      return;
    }
    if (evasaoChart) evasaoChart.destroy();
    const ctx = chartElement.getContext('2d');

    const federalData = {
      evasao: 0.01,
      aprovacao: 95.5,
      reprovacao: 4.49
    };
    const estadualData = {
      evasao: 0.03,
      aprovacao: 94.0,
      reprovacao: 5.97
    };
    const selecionadoData = {
      evasao: safeData.taxaAbandonoMedia,
      aprovacao: safeData.taxaAprovacaoMedia,
      reprovacao: safeData.taxaReprovacaoMedia
    };

    const minValues = [
      federalData.evasao, federalData.reprovacao,
      estadualData.evasao, estadualData.reprovacao,
      selecionadoData.evasao, selecionadoData.reprovacao
    ].filter(val => val > 0);
    const minY = minValues.length > 0 ? Math.min(...minValues) * 0.5 : 0;

    evasaoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Federal', 'Estadual', safeData.nomeSelecionado],
        datasets: [
          {
            label: 'Taxa de Evasão (%)',
            data: [federalData.evasao, estadualData.evasao, selecionadoData.evasao],
            backgroundColor: '#ef4444',
            barThickness: 40,
          },
          {
            label: 'Taxa de Aprovação (%)',
            data: [federalData.aprovacao, estadualData.aprovacao, selecionadoData.aprovacao],
            backgroundColor: '#10b981',
            barThickness: 40,
          },
          {
            label: 'Taxa de Reprovação (%)',
            data: [federalData.reprovacao, estadualData.reprovacao, selecionadoData.reprovacao],
            backgroundColor: '#f59e0b',
            barThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
              callback: (value) => `${value}%`,
            },
          },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => safeData.dataAvailable ? `${value.toFixed(2)}%` : '',
            font: {
              weight: 'bold',
              size: 12,
            },
          },
          legend: {
            position: 'top',
          },
        },
      },
    });

    const exportButton = document.getElementById('exportEvasao');
    if (exportButton) {
      exportButton.onclick = () => {
        const exportData = [
          { Indicador: 'Taxa de Evasão (Federal)', Percentual: `${federalData.evasao.toFixed(2)}%` },
          { Indicador: 'Taxa de Aprovação (Federal)', Percentual: `${federalData.aprovacao.toFixed(2)}%` },
          { Indicador: 'Taxa de Reprovação (Federal)', Percentual: `${federalData.reprovacao.toFixed(2)}%` },
          { Indicador: 'Taxa de Evasão (Estadual)', Percentual: `${estadualData.evasao.toFixed(2)}%` },
          { Indicador: 'Taxa de Aprovação (Estadual)', Percentual: `${estadualData.aprovacao.toFixed(2)}%` },
          { Indicador: 'Taxa de Reprovação (Estadual)', Percentual: `${estadualData.reprovacao.toFixed(2)}%` },
          { Indicador: `Taxa de Evasão (${safeData.nomeSelecionado})`, Percentual: safeData.dataAvailable ? `${safeData.taxaAbandonoMedia.toFixed(2)}%` : noDataMessage },
          { Indicador: `Taxa de Aprovação (${safeData.nomeSelecionado})`, Percentual: safeData.dataAvailable ? `${safeData.taxaAprovacaoMedia.toFixed(2)}%` : noDataMessage },
          { Indicador: `Taxa de Reprovação (${safeData.nomeSelecionado})`, Percentual: safeData.dataAvailable ? `${safeData.taxaReprovacaoMedia.toFixed(2)}%` : noDataMessage },
        ];
        exportToCSV(
          exportData,
          `taxas_educacionais_${nivel}_${stateId}_${cityId || '0'}.csv`
        );
      };
    } else {
      console.error('Elemento exportEvasao não encontrado no DOM.');
    }
  } catch (error) {
    console.error('Erro ao atualizar seção Evasão Escolar:', error);
    document.getElementById('errorMessage').style.display = 'block';
  }
}

// Função para atualizar a seção Desigualdades Regionais
async function updateDesigualdadesSection() {
  const indicador = document.getElementById('indicadorRegional').value;

  if (indicador === 'none') {
    console.log('Nenhum indicador selecionado para Desigualdades Regionais.');
    const chartElement = document.getElementById('regioesComparisonChart');
    if (chartElement) {
      if (regioesChart) regioesChart.destroy();
      const ctx = chartElement.getContext('2d');
      ctx.clearRect(0, 0, chartElement.width, chartElement.height);
    }
    return;
  }

  try {
    const data = await getDesigualdadesData(indicador);
    if (!data) {
      throw new Error('Nenhum dado de desigualdades regionais disponível');
    }

    const chartElement = document.getElementById('regioesComparisonChart');
    if (!chartElement) {
      console.error('Elemento regioesComparisonChart não encontrado no DOM.');
      return;
    }
    if (regioesChart) regioesChart.destroy();
    const ctx = chartElement.getContext('2d');

    const isIdeb = indicador === 'ideb';
    const isEvasao = indicador === 'evasao';
    const isInfra = indicador === 'infraestrutura';

    const label = isIdeb ? 'IDEB' : isEvasao ? 'Taxa de Evasão (%)' : 'Índice de Infraestrutura';
    const maxY = isIdeb ? 10 : isEvasao ? 20 : 1;
    const stepSize = isIdeb ? 1 : isEvasao ? 2 : 0.1;
    const formatter = isIdeb ? (value) => value.toFixed(1) : isEvasao ? (value) => `${value.toFixed(1)}%` : (value) => value.toFixed(2);

    regioesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
        datasets: [{
          label: label,
          data: [data.norte, data.nordeste, data.centroOeste, data.sudeste, data.sul],
          backgroundColor: ['#ef4444', '#10b981', '#2563eb', '#8b5cf6', '#f59e0b'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: maxY,
            ticks: {
              stepSize: stepSize,
              callback: formatter,
            },
          },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: formatter,
            font: {
              weight: 'bold',
            },
          },
        },
      },
    });

    const exportButton = document.getElementById('exportRegioes');
    if (exportButton) {
      exportButton.onclick = () => {
        exportToCSV(
          [
            { Região: 'Norte', Valor: isIdeb ? data.norte.toFixed(1) : isEvasao ? `${data.norte.toFixed(1)}%` : data.norte.toFixed(2) },
            { Região: 'Nordeste', Valor: isIdeb ? data.nordeste.toFixed(1) : isEvasao ? `${data.nordeste.toFixed(1)}%` : data.nordeste.toFixed(2) },
            { Região: 'Centro-Oeste', Valor: isIdeb ? data.centroOeste.toFixed(1) : isEvasao ? `${data.centroOeste.toFixed(1)}%` : data.centroOeste.toFixed(2) },
            { Região: 'Sudeste', Valor: isIdeb ? data.sudeste.toFixed(1) : isEvasao ? `${data.sudeste.toFixed(1)}%` : data.sudeste.toFixed(2) },
            { Região: 'Sul', Valor: isIdeb ? data.sul.toFixed(1) : isEvasao ? `${data.sul.toFixed(1)}%` : data.sul.toFixed(2) },
          ],
          `desigualdades_${indicador}.csv`
        );
      };
    } else {
      console.error('Elemento exportRegioes não encontrado no DOM.');
    }
  } catch (error) {
    console.error('Erro ao atualizar seção Desigualdades Regionais:', error);
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').textContent = 'Erro ao carregar dados de Desigualdades Regionais. Tente novamente.';
  }
}

// Adicionar eventos aos filtros
document.addEventListener('DOMContentLoaded', () => {
  // Eventos para IDEB
  document.getElementById('stateFilterIdeb').addEventListener('change', () => {
    updateCityFilter('stateFilterIdeb', 'cityListIdeb');
    updateIdebSection();
  });
  document.getElementById('cityFilterIdeb').addEventListener('change', () => updateIdebSection());
  document.getElementById('nivelIdeb').addEventListener('change', () => updateIdebSection());

  // Eventos para Estudantes
  document.getElementById('stateFilterEstudantes').addEventListener('change', () => {
    updateCityFilter('stateFilterEstudantes', 'cityListEstudantes');
    updateEstudantesSection();
  });
  document.getElementById('cityFilterEstudantes').addEventListener('change', () => updateEstudantesSection());

  // Eventos para Infraestrutura
  document.getElementById('stateFilterInfraestrutura').addEventListener('change', () => {
    updateCityFilter('stateFilterInfraestrutura', 'cityListInfraestrutura');
    updateInfraestruturaSection();
  });
  document.getElementById('cityFilterInfraestrutura').addEventListener('change', () => updateInfraestruturaSection());
  document.getElementById('tipoInfraestrutura').addEventListener('change', () => updateInfraestruturaSection());

  // Eventos para Evasão
  document.getElementById('stateFilterEvasao').addEventListener('change', () => {
    updateCityFilter('stateFilterEvasao', 'cityListEvasao');
    updateEvasaoSection();
  });
  document.getElementById('cityFilterEvasao').addEventListener('change', () => updateEvasaoSection());
  document.getElementById('nivelEvasao').addEventListener('change', () => updateEvasaoSection());

  // Eventos para Desigualdades Regionais
  document.getElementById('indicadorRegional').addEventListener('change', () => updateDesigualdadesSection());

  // Inicializar seções
  initializeDashboard().then(() => {
    updateIdebSection();
    updateEstudantesSection();
    updateInfraestruturaSection();
    updateEvasaoSection();
    // Não chamar updateDesigualdadesSection automaticamente
  });
});