const API_BASE_URL = 'https://api.qedu.org.br/v1';
const IBGE_API_BASE_URL = 'https://servicodados.ibge.gov.br/api';

// Dados fictícios para fallback
const MOCK_DATA = {
  ideb: {
    2019: {
      '7': { nacional: 5.5, melhorEstado: { name: 'São Paulo', ideb: 6.2 }, piorEstado: { name: 'Amapá', ideb: 3.9 } },
      '35': { nacional: 6.2, melhorEstado: { name: 'São Paulo', ideb: 6.2 }, piorEstado: { name: 'Amapá', ideb: 3.9 } },
      '2111300': { nacional: 5.0, melhorEstado: { name: 'São Paulo', ideb: 6.2 }, piorEstado: { name: 'Amapá', ideb: 3.9 } },
    },
    2018: {
      '7': { nacional: 5.4, melhorEstado: { name: 'São Paulo', ideb: 6.1 }, piorEstado: { name: 'Amapá', ideb: 3.8 } },
      '35': { nacional: 6.1, melhorEstado: { name: 'São Paulo', ideb: 6.1 }, piorEstado: { name: 'Amapá', ideb: 3.8 } },
      '2111300': { nacional: 4.9, melhorEstado: { name: 'São Paulo', ideb: 6.1 }, piorEstado: { name: 'Amapá', ideb: 3.8 } },
    },
  },
  estudantes: {
    2019: {
      '7': { total: 45678900, publicas: 38500000, privadas: 7178900 },
      '35': { total: 12000000, publicas: 10000000, privadas: 2000000 },
      '2111300': { total: 50000, publicas: 42000, privadas: 8000 },
    },
    2018: {
      '7': { total: 45000000, publicas: 38000000, privadas: 7000000 },
      '35': { total: 11800000, publicas: 9900000, privadas: 1900000 },
      '2111300': { total: 49000, publicas: 41000, privadas: 7900 },
    },
  },
  infraestrutura: {
    2019: {
      '7': { internet: 80, labs: 25, bibliotecas: 55 },
      '35': { internet: 85, labs: 35, bibliotecas: 65 },
      '2111300': { internet: 75, labs: 20, bibliotecas: 50 },
    },
    2018: {
      '7': { internet: 78, labs: 23, bibliotecas: 53 },
      '35': { internet: 83, labs: 33, bibliotecas: 63 },
      '2111300': { internet: 73, labs: 18, bibliotecas: 48 },
    },
  },
  evasao: {
    2019: {
      '7': { taxaGeral: 5.0, motivoPrincipal: 'Falta de interesse', regiaoMaiorEvasao: 'Norte', taxaRegiaoMaiorEvasao: 8.0 },
      '35': { taxaGeral: 3.9, motivoPrincipal: 'Falta de interesse', regiaoMaiorEvasao: 'Sudeste', taxaRegiaoMaiorEvasao: 3.9 },
      '2111300': { taxaGeral: 5.8, motivoPrincipal: 'Falta de recursos', regiaoMaiorEvasao: 'Norte', taxaRegiaoMaiorEvasao: 5.8 },
    },
    2018: {
      '7': { taxaGeral: 4.9, motivoPrincipal: 'Falta de interesse', regiaoMaiorEvasao: 'Norte', taxaRegiaoMaiorEvasao: 7.8 },
      '35': { taxaGeral: 3.8, motivoPrincipal: 'Falta de interesse', regiaoMaiorEvasao: 'Sudeste', taxaRegiaoMaiorEvasao: 3.8 },
      '2111300': { taxaGeral: 5.6, motivoPrincipal: 'Falta de recursos', regiaoMaiorEvasao: 'Norte', taxaRegiaoMaiorEvasao: 5.6 },
    },
  },
  regioes: {
    ideb: [
      { name: 'Norte', value: 3.9 },
      { name: 'Nordeste', value: 4.2 },
      { name: 'Centro-Oeste', value: 5.0 },
      { name: 'Sudeste', value: 5.5 },
      { name: 'Sul', value: 5.4 },
    ],
    evasao: [
      { name: 'Norte', value: 8.0 },
      { name: 'Nordeste', value: 7.5 },
      { name: 'Centro-Oeste', value: 6.0 },
      { name: 'Sudeste', value: 4.9 },
      { name: 'Sul', value: 4.7 },
    ],
    infraestrutura: [
      { name: 'Norte', value: 5.0 },
      { name: 'Nordeste', value: 5.5 },
      { name: 'Centro-Oeste', value: 6.5 },
      { name: 'Sudeste', value: 7.0 },
      { name: 'Sul', value: 6.8 },
    ],
  },
};

// Função genérica para buscar dados da API QEdu
async function fetchData(endpoint, params = {}) {
  const baseURL = `${API_BASE_URL}${endpoint}`;
  try {
    document.getElementById('loadingOverlay').style.display = 'flex';
    document.getElementById('errorMessage').style.display = 'none';

    const response = await axios.get(baseURL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer IKAzGMYh8vURvvKBhdDco33Cb5LOUerL94hndC46',
      },
      params,
    });

    document.getElementById('loadingOverlay').style.display = 'none';
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    document.getElementById('loadingOverlay').style.display = 'none';
    return null;
  }
}

// Função genérica para buscar dados da API IBGE
async function fetchIBGEData(endpoint) {
  const baseURL = `${IBGE_API_BASE_URL}${endpoint}`;
  try {
    const response = await axios.get(baseURL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do IBGE:', error);
    return null;
  }
}

// Função para buscar dados de IDEB
async function getIdebData(stateId, cityId, nivel = 'todos') {
  const cicloMap = {
    todos: null,
    inicialFundamental: 'AI',
    finalFundamental: 'AF',
    medio: 'EM',
  };
  const ciclo_id = cicloMap[nivel];
  const year = 2019;

  const params = {
    ano: year,
    dependencia_id: 2,
  };
  const id = cityId !== '0' ? cityId : stateId !== '0' ? stateId : '7';
  params.id = parseInt(id);
  if (ciclo_id) params.ciclo_id = ciclo_id;

  const data = await fetchData('/ideb', params);

  if (!data || !data.data || data.data.length === 0) {
    console.warn('Nenhum dado retornado pela API, usando dados fictícios.');
    const mock = MOCK_DATA.ideb[year][id] || MOCK_DATA.ideb[year]['7'];
    return {
      nacional: parseFloat(mock.nacional) || 0,
      melhorEstado: mock.melhorEstado.name || 'Não informado',
      idebMelhorEstado: parseFloat(mock.melhorEstado.ideb) || 0,
      piorEstado: mock.piorEstado.name || 'Não informado',
      idebPiorEstado: parseFloat(mock.piorEstado.ideb) || 0,
    };
  }

  const idebData = data.data[0];
  let nacional = parseFloat(idebData.ideb) || 0;

  let melhorEstado = { name: 'Não informado', ideb: 0 };
  let piorEstado = { name: 'Não informado', ideb: 0 };
  if (params.id === 7 && !ciclo_id) {
    const estadosData = await fetchData('/ideb', { ano: year, dependencia_id: 2 });
    if (estadosData && estadosData.data) {
      const estados = estadosData.data.filter(d => d.id.toString().length === 2);
      if (estados.length > 0) {
        melhorEstado = estados.reduce((max, curr) => (parseFloat(curr.ideb) || 0) > (parseFloat(max.ideb) || 0) ? curr : max, estados[0]);
        piorEstado = estados.reduce((min, curr) => (parseFloat(min.ideb) || 0) < (parseFloat(curr.ideb) || 0) ? min : curr, estados[0]);
      }
    }
  } else {
    melhorEstado = MOCK_DATA.ideb[year][id]?.melhorEstado || MOCK_DATA.ideb[year]['7'].melhorEstado;
    piorEstado = MOCK_DATA.ideb[year][id]?.piorEstado || MOCK_DATA.ideb[year]['7'].piorEstado;
  }

  return {
    nacional,
    melhorEstado: melhorEstado.name || 'Não informado',
    idebMelhorEstado: parseFloat(melhorEstado.ideb) || 0,
    piorEstado: piorEstado.name || 'Não informado',
    idebPiorEstado: parseFloat(piorEstado.ideb) || 0,
  };
}

// Função para buscar dados de estudantes (matrículas)
async function getEstudantesData(stateId, cityId, year = 2019) {
  const params = { ano: year };
  const id = cityId !== '0' ? cityId : stateId !== '0' ? stateId : '7';
  params.id = parseInt(id);

  const data = await fetchData('/matriculas', params);
  if (!data || !data.data || data.data.length === 0) {
    console.warn('Nenhum dado retornado pela API, usando dados fictícios.');
    const mockData = MOCK_DATA.estudantes[year][id] || MOCK_DATA.estudantes[year]['7'];
    return {
      total: mockData.total || 0,
      publicas: mockData.publicas || 0,
      privadas: mockData.privadas || 0,
      percPublicas: mockData.publicas ? (mockData.publicas / mockData.total * 100).toFixed(1) : 0,
      percPrivadas: mockData.privadas ? (mockData.privadas / mockData.total * 100).toFixed(1) : 0,
    };
  }

  const matriculaData = data.data[0];
  const total = parseInt(matriculaData.total) || 0;
  const publicas = parseInt(matriculaData.publicas) || 0;
  const privadas = parseInt(matriculaData.privadas) || 0;

  return {
    total,
    publicas,
    privadas,
    percPublicas: total ? (publicas / total * 100).toFixed(1) : 0,
    percPrivadas: total ? (privadas / total * 100).toFixed(1) : 0,
  };
}

async function getEstudantesDataForComparison(stateId, cityId, year) {
  const params = { ano: year };
  const id = cityId !== '0' ? cityId : stateId !== '0' ? stateId : '7';
  params.id = parseInt(id);

  const data = await fetchData('/matriculas', params);
  if (!data || !data.data || data.data.length === 0) {
    const mockData = MOCK_DATA.estudantes[year][id] || MOCK_DATA.estudantes[year]['7'];
    return {
      total: mockData.total || 0,
      publicas: mockData.publicas || 0,
      privadas: mockData.privadas || 0,
    };
  }

  const matriculaData = data.data[0];
  return {
    total: parseInt(matriculaData.total) || 0,
    publicas: parseInt(matriculaData.publicas) || 0,
    privadas: parseInt(matriculaData.privadas) || 0,
  };
}

// Função para buscar dados de evasão
async function getEvasaoData(stateId, cityId, nivel = 'todos', year) {
  const params = { ano: year };
  const id = cityId !== '0' ? cityId : stateId !== '0' ? stateId : '7';
  params.id = parseInt(id);
  if (nivel !== 'todos') params.nivel = nivel;

  const data = await fetchData('/evasao', params);
  if (!data || !data.data || data.data.length === 0) {
    console.warn('Nenhum dado retornado pela API, usando dados fictícios.');
    const mockData = MOCK_DATA.evasao[year][id] || MOCK_DATA.evasao[year]['7'];
    return {
      taxaGeral: mockData.taxaGeral || 0,
      motivoPrincipal: mockData.motivoPrincipal || 'Não informado',
      regiaoMaiorEvasao: mockData.regiaoMaiorEvasao || 'Não informado',
      taxaRegiaoMaiorEvasao: mockData.taxaRegiaoMaiorEvasao || 0,
    };
  }

  const evasaoData = data.data[0];
  let regiaoMaiorEvasao = { name: 'Não informado', taxa: 0 };
  if (params.id === 7) {
    const regioesData = await fetchData('/evasao', { ano: year });
    if (regioesData && regioesData.data) {
      const regioes = regioesData.data.filter(d => d.regiao);
      if (regioes.length > 0) {
        regiaoMaiorEvasao = regioes.reduce((max, curr) => (parseFloat(curr.taxa) || 0) > (parseFloat(max.taxa) || 0) ? curr : max, regioes[0]);
      }
    }
  } else {
    regiaoMaiorEvasao = { name: evasaoData.regiao || 'Não informado', taxa: parseFloat(evasaoData.taxa) || 0 };
  }

  return {
    taxaGeral: parseFloat(evasaoData.taxa) || 0,
    motivoPrincipal: evasaoData.motivo || 'Não informado',
    regiaoMaiorEvasao: regiaoMaiorEvasao.name,
    taxaRegiaoMaiorEvasao: parseFloat(regiaoMaiorEvasao.taxa) || 0,
  };
}

// Função para buscar dados de infraestrutura
async function getInfraestruturaData(stateId, cityId, tipo = 'todas', year) {
  const params = { ano: year };
  const id = cityId !== '0' ? cityId : stateId !== '0' ? stateId : '7';
  params.id = parseInt(id);
  if (tipo !== 'todas') params.tipo = tipo;

  const data = await fetchData('/infraestrutura', params);
  if (!data || !data.data || data.data.length === 0) {
    console.warn('Nenhum dado retornado pela API, usando dados fictícios.');
    const mockData = MOCK_DATA.infraestrutura[year][id] || MOCK_DATA.infraestrutura[year]['7'];
    return {
      internet: mockData.internet || 0,
      labs: mockData.labs || 0,
      bibliotecas: mockData.bibliotecas || 0,
    };
  }

  const infraData = data.data[0];
  return {
    internet: parseFloat(infraData.internet) || 0,
    labs: parseFloat(infraData.labs) || 0,
    bibliotecas: parseFloat(infraData.bibliotecas) || 0,
  };
}

// Função para buscar dados regionais (para gráfico)
async function getRegioesData(indicador) {
  const endpointMap = {
    ideb: '/ideb',
    evasao: '/evasao',
    infraestrutura: '/infraestrutura',
  };
  const endpoint = endpointMap[indicador];
  const data = await fetchData(endpoint, { ano: 2019 });

  if (!data || !data.data || data.data.length === 0) {
    console.warn('Nenhum dado retornado pela API, usando dados fictícios.');
    return MOCK_DATA.regioes[indicador] || [];
  }

  const regioes = data.data.filter(d => d.regiao);
  return regioes.map(r => ({
    name: r.regiao,
    value: parseFloat(r[indicador === 'ideb' ? 'ideb' : indicador === 'evasao' ? 'taxa' : 'indice']) || 0,
  }));
}

// Função para exportar dados como CSV
function exportToCSV(data, filename) {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Evento de retry
document.getElementById('btnRetry').addEventListener('click', () => {
  document.getElementById('errorMessage').style.display = 'none';
  initializeDashboard();
});

// Inicializar dashboard
async function initializeDashboard() {
  try {
    // Carregar estados do IBGE
    const estados = await fetchIBGEData('/v1/localidades/estados?orderBy=nome');
    if (estados) {
      ['stateFilterEstudantes', 'stateFilterInfraestrutura', 'stateFilterEvasao', 'stateFilterIdeb'].forEach(filterId => {
        const select = document.getElementById(filterId);
        estados.forEach(estado => {
          const option = document.createElement('option');
          option.value = estado.id;
          option.textContent = estado.nome;
          select.appendChild(option);
        });
      });
    }

    await updateEstudantesSection();
    await updateInfraestruturaSection();
    await updateEvasaoSection();
    await updateIdebSection();
    await updateRegioesSection();
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
  }
}
