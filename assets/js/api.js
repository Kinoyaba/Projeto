const API_BASE_URL = 'https://api.qedu.org.br/v1';
const IBGE_API_BASE_URL = 'https://servicodados.ibge.gov.br/api';

// Valores fixos para melhor estado, pior estado e nacional por nível (IDEB)
const FIXED_IDEB_DATA = {
  todos: {
    nacional: 5.0,
    melhorEstado: { nome: 'São Paulo', ideb: 5.4 },
    piorEstado: { nome: 'Amapá', ideb: 4.0 },
  },
  inicialFundamental: {
    nacional: 5.9,
    melhorEstado: { nome: 'São Paulo', ideb: 6.5 },
    piorEstado: { nome: 'Amapá', ideb: 4.8 },
  },
  finalFundamental: {
    nacional: 4.9,
    melhorEstado: { nome: 'São Paulo', ideb: 5.2 },
    piorEstado: { nome: 'Amapá', ideb: 3.8 },
  },
  medio: {
    nacional: 4.2,
    melhorEstado: { nome: 'São Paulo', ideb: 4.5 },
    piorEstado: { nome: 'Amapá', ideb: 3.5 },
  },
};

// Valores fixos para Desigualdades Regionais (evasao e infraestrutura)
const FIXED_DESIGUALDADES_DATA = {
  evasao: {
    norte: 8.0,
    nordeste: 6.0,
    centroOeste: 5.0,
    sudeste: 3.0,
    sul: 2.5
  },
  infraestrutura: {
    norte: 0.46,
    nordeste: 0.545,
    centroOeste: 0.63,
    sudeste: 0.73,
    sul: 0.78
  }
};

// Função genérica para buscar dados da API QEdu
async function fetchData(endpoint, params = {}) {
  const baseURL = `${API_BASE_URL}${endpoint}`;
  try {
    document.getElementById('loadingOverlay').style.display = 'flex';
    document.getElementById('errorMessage').style.display = 'none';

    console.log('Origem da requisição:', window.location.origin);
    console.log('URL da requisição:', baseURL, 'Parâmetros:', params);
    const response = await axios.get(baseURL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer IKAzGMYh8vURvvKBhdDco33Cb5LOUerL94hndC46' // AVISO: Expor o token no frontend é inseguro para produção
      },
      params,
      timeout: 10000,
    });

    console.log(`Resposta completa da API para ${endpoint}:`, response.data);
    document.getElementById('loadingOverlay').style.display = 'none';
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config,
      url: baseURL,
      params
    });
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
    throw new Error(error.response?.data?.message || 'Erro ao buscar dados da API QEdu');
  }
}

// Função genérica para buscar dados da API IBGE
async function fetchIBGEData(endpoint) {
  const baseURL = `${IBGE_API_BASE_URL}${endpoint}`;
  try {
    const response = await axios.get(baseURL, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do IBGE:', error);
    throw new Error('Erro ao buscar dados da API IBGE');
  }
}

// Função para buscar dados de IDEB
async function getIdebData(stateId, cityId, ciclo = 'todos') {
  const cicloMap = {
    todos: null,
    inicialFundamental: 'AI',
    finalFundamental: 'AF',
    medio: 'EM',
  };
  const ciclo_id = cicloMap[ciclo];
  const year = 2019;

  const fixedData = FIXED_IDEB_DATA[ciclo] || FIXED_IDEB_DATA['todos'];

  const params = { ano: year };
  const safeStateId = stateId && stateId !== '0' ? stateId : '7';
  const safeCityId = cityId && cityId !== '0' ? cityId : null;
  const id = safeCityId || safeStateId;
  params.id = parseInt(id);

  if (isNaN(params.id)) {
    throw new Error(`ID inválido: stateId=${stateId}, cityId=${cityId}, id=${id}`);
  }

  if (ciclo_id) params.ciclo_id = ciclo_id;

  console.log(`Requisição IDEB: ${API_BASE_URL}/ideb`, params);
  try {
    const data = await fetchData('/ideb', params);
    let estadoSelecionado = 0;
    if (data && data.data && data.data.length > 0) {
      console.log('Dados IDEB retornados:', data.data.map(item => ({
        ibge_id: item.ibge_id,
        ciclo_id: item.ciclo_id,
        dependencia_id: item.dependencia_id,
        ideb: item.ideb,
      })));

      const idebData = data.data.filter(d => !ciclo_id || d.ciclo_id === ciclo_id);
      if (idebData.length === 0) {
        console.warn(`Nenhum dado encontrado para ciclo_id ${ciclo_id || 'todos'} e id ${id}`);
      } else {
        let selectedData;
        if (!safeCityId) {
          selectedData = idebData.find(d => d.ibge_id.toString() === id.toString() && d.dependencia_id === 0) ||
                         idebData.find(d => d.ibge_id.toString() === id.toString());
        } else {
          const validIdebs = idebData
            .filter(d => d.ibge_id.toString() === id.toString() && d.ideb && parseFloat(d.ideb) > 0)
            .map(d => parseFloat(d.ideb));
          if (validIdebs.length > 0) {
            estadoSelecionado = validIdebs.reduce((sum, val) => sum + val, 0) / validIdebs.length;
            console.log(`IDEB médio calculado para município: ${estadoSelecionado} (baseado em ${validIdebs.length} registros)`);
          } else {
            console.warn(`Nenhum IDEB válido encontrado para id ${id} e ciclo ${ciclo_id || 'todos'}`);
          }
        }

        if (selectedData && selectedData.ideb) {
          estadoSelecionado = parseFloat(selectedData.ideb);
          console.log(`IDEB selecionado: ${estadoSelecionado} (dependencia_id: ${selectedData.dependencia_id})`);
        }
      }
    } else {
      console.warn(`Nenhum dado retornado pela API IDEB para id ${id}`);
    }

    const nomeSelecionado = safeCityId
      ? (await fetchIBGEData(`/v1/localidades/municipios/${safeCityId}`))?.nome || 'Não informado'
      : (await fetchIBGEData(`/v1/localidades/estados/${safeStateId}`))?.nome || 'Não informado';

    return {
      nacional: fixedData.nacional,
      estadoSelecionado: estadoSelecionado,
      nomeSelecionado: nomeSelecionado,
      melhorEstado: fixedData.melhorEstado.nome,
      idebMelhorEstado: fixedData.melhorEstado.ideb,
      piorEstado: fixedData.piorEstado.nome,
      idebPiorEstado: fixedData.piorEstado.ideb,
    };
  } catch (error) {
    console.warn(`Erro ao buscar IDEB para id ${id}:`, error.message);
    const nomeSelecionado = safeCityId
      ? (await fetchIBGEData(`/v1/localidades/municipios/${safeCityId}`))?.nome || 'Não informado'
      : (await fetchIBGEData(`/v1/localidades/estados/${safeStateId}`))?.nome || 'Não informado';

    return {
      nacional: fixedData.nacional,
      estadoSelecionado: 0,
      nomeSelecionado: nomeSelecionado,
      melhorEstado: fixedData.melhorEstado.nome,
      idebMelhorEstado: fixedData.melhorEstado.ideb,
      piorEstado: fixedData.piorEstado.nome,
      idebPiorEstado: fixedData.piorEstado.ideb,
    };
  }
}

// Função para buscar dados de estudantes
async function getEstudantesData(stateId, cityId) {
  const year = 2022;
  const params = { ano: year };
  const safeStateId = stateId && stateId !== '0' ? stateId : '7';
  const safeCityId = cityId && cityId !== '0' ? cityId : null;
  const id = safeCityId || safeStateId;
  params.ibge_id = parseInt(id);

  if (isNaN(params.ibge_id)) {
    throw new Error(`ID inválido: stateId=${stateId}, cityId=${cityId}, id=${id}`);
  }

  const nomeSelecionado = safeCityId
    ? (await fetchIBGEData(`/v1/localidades/municipios/${safeCityId}`))?.nome || 'Não informado'
    : (await fetchIBGEData(`/v1/localidades/estados/${safeStateId}`))?.nome || 'Não informado';

  const dependenciaIds = [1, 2, 3, 4];
  let totalPublicas = 0;
  let totalPrivadas = 0;

  for (const depId of dependenciaIds) {
    const requestParams = { ...params, dependencia_id: depId, localizacao_id: null, oferta_id: 'todas' };
    console.log(`${API_BASE_URL}/censo/territorio`, requestParams);
    const data = await fetchData('/censo/territorio', requestParams);

    if (!data || !data.data || data.data.length === 0) {
      console.warn(`Nenhum dado retornado para dependencia_id ${depId}, continuando com valores zerados.`);
      continue;
    }

    const matriculas = data.data.reduce((total, item) => {
      const niveles = [
        item.matriculas_creche || 0,
        item.matriculas_pre_escolar || 0,
        item.matriculas_anos_iniciais || 0,
        item.matriculas_anos_finais || 0,
        item.matriculas_ensino_medio || 0,
        item.matriculas_eja || 0,
        item.matriculas_educacao_especial || 0,
      ];
      return total + niveles.reduce((sum, num) => sum + num, 0);
    }, 0);

    if ([1, 2, 3].includes(depId)) {
      totalPublicas += matriculas;
    } else if (depId === 4) {
      totalPrivadas += matriculas;
    }
  }

  const totalEstudantes = totalPublicas + totalPrivadas;
  const percPublicas = totalEstudantes > 0 ? (totalPublicas / totalEstudantes) * 100 : 0;
  const percPrivadas = totalEstudantes > 0 ? (totalPrivadas / totalEstudantes) * 100 : 0;

  return {
    nomeSelecionado,
    totalEstudantes,
    totalPublicas,
    percPublicas,
    totalPrivadas,
    percPrivadas,
  };
}

// Função para buscar dados de infraestrutura
async function getInfraestruturaData(stateId, cityId, tipo = 'todas') {
  const year = 2022;
  const params = { ano: year };
  const safeStateId = stateId && stateId !== '0' ? stateId : '7';
  const safeCityId = cityId && cityId !== '0' ? cityId : null;
  const id = safeCityId || safeStateId;
  params.ibge_id = parseInt(id);

  if (isNaN(params.ibge_id)) {
    throw new Error(`ID inválido: stateId=${stateId}, cityId=${cityId}, id=${id}`);
  }

  const nomeSelecionado = safeCityId
    ? (await fetchIBGEData(`/v1/localidades/municipios/${safeCityId}`))?.nome || 'Não informado'
    : (await fetchIBGEData(`/v1/localidades/estados/${safeStateId}`))?.nome || 'Não informado';

  let dependenciaIds;
  if (tipo === 'publicas') {
    dependenciaIds = [1, 2, 3];
  } else if (tipo === 'privadas') {
    dependenciaIds = [4];
  } else {
    dependenciaIds = [1, 2, 3, 4];
  }

  let totalEscolas = 0;
  let escolasComInternet = 0;
  let escolasComLabsCiencia = 0;
  let escolasComBibliotecas = 0;

  for (const depId of dependenciaIds) {
    const requestParams = { ...params, dependencia_id: depId, localizacao_id: null, oferta_id: 'todas' };
    console.log(`${API_BASE_URL}/censo/territorio`, requestParams);
    const data = await fetchData('/censo/territorio', requestParams);

    if (!data || !data.data || data.data.length === 0) {
      console.warn(`Nenhum dado retornado para dependencia_id ${depId}, continuando com valores zerados.`);
      continue;
    }

    console.log(`Dados retornados para dependencia_id ${depId}:`, data.data.map(item => ({
      qtd_escolas: item.qtd_escolas,
      tecnologia_internet: item.tecnologia_internet,
      dependencias_lab_ciencias: item.dependencias_lab_ciencias,
      dependencias_biblioteca: item.dependencias_biblioteca,
    })));

    data.data.forEach(item => {
      const qtdEscolas = Number(item.qtd_escolas) || 0;
      totalEscolas += qtdEscolas;

      escolasComInternet += Number(item.tecnologia_internet) || 0;
      escolasComLabsCiencia += Number(item.dependencias_lab_ciencias) || 0;
      escolasComBibliotecas += Number(item.dependencias_biblioteca) || 0;
    });
  }

  const percInternet = totalEscolas > 0 ? (escolasComInternet / totalEscolas) * 100 : 0;
  const percLabsCiencia = totalEscolas > 0 ? (escolasComLabsCiencia / totalEscolas) * 100 : 0;
  const percBibliotecas = totalEscolas > 0 ? (escolasComBibliotecas / totalEscolas) * 100 : 0;

  return {
    nomeSelecionado,
    totalEscolas,
    percInternet,
    percLabsCiencia,
    percBibliotecas,
    dataAvailable: totalEscolas > 0,
  };
}

// Função para buscar dados de evasão escolar, aprovação e reprovação
async function getEvasaoData(stateId, cityId, nivel = 'todos') {
  const year = 2019;
  const params = { ano: year };
  const safeStateId = stateId && stateId !== '0' ? stateId : '7';
  const safeCityId = cityId && cityId !== '0' ? cityId : null;
  const id = safeCityId || safeStateId;
  params.ibge_id = parseInt(id);

  if (isNaN(params.ibge_id)) {
    throw new Error(`ID inválido: stateId=${stateId}, cityId=${cityId}, id=${id}`);
  }

  const nomeSelecionado = safeCityId
    ? (await fetchIBGEData(`/v1/localidades/municipios/${safeCityId}`))?.nome || 'Não informado'
    : (await fetchIBGEData(`/v1/localidades/estados/${safeStateId}`))?.nome || 'Não informado';

  const etapaMap = {
    todos: null,
    inicialFundamental: 'EF1',
    finalFundamental: 'EF2',
    medio: 'EM',
  };
  const etapa_id = etapaMap[nivel];
  if (etapa_id) params.etapa_id = etapa_id;

  let totalMatriculas = 0;
  let totalAbandonos = 0;
  let totalAprovados = 0;
  let totalReprovados = 0;
  let taxasPorDependencia = [];

  const dependenciaIds = [1, 2, 3, 4];
  const localizacaoIds = [1, 2];

  for (const depId of dependenciaIds) {
    let depTotalMatriculas = 0;
    let depTotalAbandonos = 0;
    let depTotalAprovados = 0;
    let depTotalReprovados = 0;

    for (const locId of localizacaoIds) {
      const requestParams = { 
        ibge_id: params.ibge_id,
        ano: params.ano,
        dependencia_id: depId,
        localizacao_id: locId,
        ...(etapa_id && { etapa_id })
      };
      console.log(`Requisição para dependencia_id ${depId}, localizacao_id ${locId}, etapa_id ${etapa_id || 'todos'}: ${API_BASE_URL}/indicador/tr/territorio`, requestParams);
      try {
        const data = await fetchData('/indicador/tr/territorio', requestParams);

        console.log(`Resposta completa para dependencia_id ${depId}, localizacao_id ${locId}, etapa_id ${etapa_id || 'todos'}:`, data);

        if (!data || !data.data || !Array.isArray(data.data)) {
          console.warn(`Nenhum dado retornado para dependencia_id ${depId}, localizacao_id ${locId}, etapa_id ${etapa_id || 'todos'}, continuando com valores zerados.`);
          continue;
        }

        console.log(`Estrutura dos itens retornados para dependencia_id ${depId}, localizacao_id ${locId}, etapa_id ${etapa_id || 'todos'}:`, 
          data.data.map(item => ({ matriculas: item.matriculas, abandonos: item.abandonos, aprovados: item.aprovados, reprovados: item.reprovados }))
        );

        let hasValidData = false;
        data.data.forEach(item => {
          const matriculas = Number(item.matriculas) || 0;
          const abandonos = Number(item.abandonos) || 0;
          const aprovados = Number(item.aprovados) || 0;
          const reprovados = Number(item.reprovados) || 0;

          console.log(`Item processado: matriculas=${matriculas}, abandonos=${abandonos}, aprovados=${aprovados}, reprovados=${reprovados}`);

          depTotalMatriculas += matriculas;
          depTotalAbandonos += abandonos;
          depTotalAprovados += aprovados;
          depTotalReprovados += reprovados;

          if (matriculas > 0 || abandonos > 0 || aprovados > 0 || reprovados > 0) {
            hasValidData = true;
          }
        });

        if (!hasValidData) {
          console.warn(`Nenhum dado válido (matriculas, abandonos, aprovados ou reprovados > 0) para dependencia_id ${depId}, localizacao_id ${locId}, etapa_id ${etapa_id || 'todos'}.`);
        }
      } catch (error) {
        console.warn(`Erro ao buscar evasão para dependencia_id ${depId}, localizacao_id ${locId}:`, error.message);
        continue;
      }
    }

    const taxaAbandonoDep = depTotalMatriculas > 0 ? (depTotalAbandonos / depTotalMatriculas) * 100 : 0;
    const taxaAprovacaoDep = depTotalMatriculas > 0 ? (depTotalAprovados / depTotalMatriculas) * 100 : 0;
    const taxaReprovacaoDep = depTotalMatriculas > 0 ? (depTotalReprovados / depTotalMatriculas) * 100 : 0;

    console.log(`Taxas para dependencia_id ${depId}: Abandono=${taxaAbandonoDep}%, Aprovação=${taxaAprovacaoDep}%, Reprovação=${taxaReprovacaoDep}% (matriculas=${depTotalMatriculas}, abandonos=${depTotalAbandonos}, aprovados=${depTotalAprovados}, reprovados=${depTotalReprovados})`);

    taxasPorDependencia.push({
      dependencia_id: depId,
      taxaAbandono: taxaAbandonoDep,
      taxaAprovacao: taxaAprovacaoDep,
      taxaReprovacao: taxaReprovacaoDep
    });

    totalMatriculas += depTotalMatriculas;
    totalAbandonos += depTotalAbandonos;
    totalAprovados += depTotalAprovados;
    totalReprovados += depTotalReprovados;
  }

  const totalProcessado = totalAbandonos + totalAprovados + totalReprovados;
  if (totalMatriculas > 0) {
    const percentualProcessado = (totalProcessado / totalMatriculas) * 100;
    console.log(`Percentual processado: ${(totalProcessado / totalMatriculas * 100).toFixed(2)}% (totalMatriculas=${totalMatriculas}, totalProcessado=${totalProcessado})`);

    if (percentualProcessado < 90) {
      console.warn(`Inconsistência nos dados: Somatório de abandonos (${totalAbandonos}), aprovados (${totalAprovados}) e reprovados (${totalReprovados}) representa apenas ${percentualProcessado.toFixed(2)}% de matrículas (${totalMatriculas}). Ajustando taxas para compensar.`);

      const fatorAjuste = totalMatriculas > 0 ? (totalMatriculas - totalAbandonos - totalReprovados) / totalMatriculas : 0;
      totalAprovados = totalMatriculas - totalAbandonos - totalReprovados;
      console.log(`Ajuste aplicado: totalAprovados ajustado para ${totalAprovados} (fator de ajuste: ${fatorAjuste * 100}%)`);
    }
  } else {
    console.warn('Nenhuma matrícula registrada. Retornando taxas zeradas.');
  }

  const taxaAbandonoMedia = totalMatriculas > 0 ? (totalAbandonos / totalMatriculas) * 100 : 0;
  const taxaAprovacaoMedia = totalMatriculas > 0 ? (totalAprovados / totalMatriculas) * 100 : 0;
  const taxaReprovacaoMedia = totalMatriculas > 0 ? (totalReprovados / totalMatriculas) * 100 : 0;

  const somaTaxas = taxaAbandonoMedia + taxaAprovacaoMedia + taxaReprovacaoMedia;
  console.log(`Taxas médias gerais após ajuste: Abandono=${taxaAbandonoMedia.toFixed(2)}%, Aprovação=${taxaAprovacaoMedia.toFixed(2)}%, Reprovação=${taxaReprovacaoMedia.toFixed(2)}%, Soma=${somaTaxas.toFixed(2)}%`);

  return {
    nomeSelecionado,
    taxaAbandonoMedia,
    taxaAprovacaoMedia,
    taxaReprovacaoMedia,
    taxasPorDependencia,
    dataAvailable: totalMatriculas > 0 || totalAbandonos > 0 || totalAprovados > 0 || totalReprovados > 0,
  };
}

// Função para buscar dados de desigualdades regionais
async function getDesigualdadesData(indicador = 'ideb') {
  if (indicador === 'evasao' || indicador === 'infraestrutura') {
    return FIXED_DESIGUALDADES_DATA[indicador];
  }

  const year = 2019;
  const estados = await fetchIBGEData('/v1/localidades/estados?orderBy=nome');

  const regioesMap = {
    'Norte': [],
    'Nordeste': [],
    'Centro-Oeste': [],
    'Sudeste': [],
    'Sul': []
  };

  estados.forEach(estado => {
    const regiao = estado.regiao.nome;
    if (regioesMap[regiao]) regioesMap[regiao].push(estado.id);
  });

  const resultados = {
    'Norte': { ideb: 0, total: 0 },
    'Nordeste': { ideb: 0, total: 0 },
    'Centro-Oeste': { ideb: 0, total: 0 },
    'Sudeste': { ideb: 0, total: 0 },
    'Sul': { ideb: 0, total: 0 }
  };

  for (const [regiao, estadoIds] of Object.entries(regioesMap)) {
    for (const stateId of estadoIds) {
      const params = { ano: year, id: stateId };
      try {
        const data = await fetchData('/ideb', params);
        if (data && data.data && data.data.length > 0) {
          const idebData = data.data.filter(d => d.dependencia_id === 0);
          const ideb = idebData.reduce((sum, item) => sum + (parseFloat(item.ideb) || 0), 0);
          if (idebData.length > 0) {
            resultados[regiao].ideb += ideb / idebData.length;
            resultados[regiao].total += 1;
          }
        }
      } catch (error) {
        console.warn(`Erro ao buscar IDEB para estado ${stateId}:`, error.message);
        continue;
      }
    }

    if (resultados[regiao].total > 0) {
      resultados[regiao].ideb = resultados[regiao].total > 0 ? resultados[regiao].ideb / resultados[regiao].total : 0;
    }
  }

  return {
    norte: resultados['Norte'].ideb,
    nordeste: resultados['Nordeste'].ideb,
    centroOeste: resultados['Centro-Oeste'].ideb,
    sudeste: resultados['Sudeste'].ideb,
    sul: resultados['Sul'].ideb
  };
}

// Funções desabilitadas temporariamente
async function getEstudantesDataForComparison() { return null; }
async function getRegioesData() { return []; }

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
    const estados = await fetchIBGEData('/v1/localidades/estados?orderBy=nome');
    if (!estados || estados.length === 0) {
      throw new Error('Não foi possível carregar os estados do IBGE');
    }

    ['stateFilterIdeb', 'stateFilterEstudantes', 'stateFilterInfraestrutura', 'stateFilterEvasao'].forEach(filterId => {
      const select = document.getElementById(filterId);
      select.innerHTML = '<option value="0">Selecione um estado</option>';
      estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.nome;
        select.appendChild(option);
      });
    });

    await updateIdebSection();
    await updateEstudantesSection();
    await updateInfraestruturaSection();
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
    document.getElementById('errorMessage').style.display = 'block';
  }
}
