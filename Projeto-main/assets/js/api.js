function getMockIdebData(params = {}) {
    const nivel = params.nivel || 'todos';

    // Different education levels for IDEB data
    const nivelData = {
        'todos': {
            idebNacional: 5.3,
            meta: 5.5,
            comparacao: '-0.2',
            melhorEstado: 'São Paulo',
            idebMelhorEstado: 6.1,
            piorEstado: 'Amapá',
            idebPiorEstado: 4.4,
            historico: [
                { ano: '2013', ideb: 4.9, meta: 4.9 },
                { ano: '2015', ideb: 5.0, meta: 5.1 },
                { ano: '2017', ideb: 5.1, meta: 5.3 },
                { ano: '2019', ideb: 5.2, meta: 5.4 },
                { ano: '2021', ideb: 5.2, meta: 5.5 },
                { ano: '2023', ideb: 5.3, meta: 5.5 }
            ],
            porNivel: [
                { nivel: 'Anos Iniciais - Fundamental', ideb: 5.8, meta: 5.9 },
                { nivel: 'Anos Finais - Fundamental', ideb: 5.1, meta: 5.2 },
                { nivel: 'Ensino Médio', ideb: 4.5, meta: 4.7 }
            ]
        }
    };

    return nivelData[nivel] || nivelData['todos'];
}
function getMockIdebData(params = {}) {
    const nivel = params.nivel || 'todos';

    // Different education levels for IDEB data
    const nivelData = {
        'todos': {
            idebNacional: 5.3,
            meta: 5.5,
            comparacao: '-0.2',
            melhorEstado: 'São Paulo',
            idebMelhorEstado: 6.1,
            piorEstado: 'Amapá',
            idebPiorEstado: 4.4,
            historico: [
                { ano: '2013', ideb: 4.9, meta: 4.9 },
                { ano: '2015', ideb: 5.0, meta: 5.1 },
                { ano: '2017', ideb: 5.1, meta: 5.3 },
                { ano: '2019', ideb: 5.2, meta: 5.4 },
                { ano: '2021', ideb: 5.2, meta: 5.5 },
                { ano: '2023', ideb: 5.3, meta: 5.5 }
            ],
            porNivel: [
                { nivel: 'Anos Iniciais - Fundamental', ideb: 5.8, meta: 5.9 },
                { nivel: 'Anos Finais - Fundamental', ideb: 5.1, meta: 5.2 },
                { nivel: 'Ensino Médio', ideb: 4.5, meta: 4.7 }
            ]
        }
    };

    return nivelData[nivel] || nivelData['todos'];
}
function getMockIdebData(params = {}) {
    const nivel = params.nivel || 'todos';

    // Different education levels for IDEB data
    const nivelData = {
        'todos': {
            idebNacional: 5.3,
            meta: 5.5,
            comparacao: '-0.2',
            melhorEstado: 'São Paulo',
            idebMelhorEstado: 6.1,
            piorEstado: 'Amapá',
            idebPiorEstado: 4.4,
            historico: [
                { ano: '2013', ideb: 4.9, meta: 4.9 },
                { ano: '2015', ideb: 5.0, meta: 5.1 },
                { ano: '2017', ideb: 5.1, meta: 5.3 },
                { ano: '2019', ideb: 5.2, meta: 5.4 },
                { ano: '2021', ideb: 5.2, meta: 5.5 },
                { ano: '2023', ideb: 5.3, meta: 5.5 }
            ],
            porNivel: [
                { nivel: 'Anos Iniciais - Fundamental', ideb: 5.8, meta: 5.9 },
                { nivel: 'Anos Finais - Fundamental', ideb: 5.1, meta: 5.2 },
                { nivel: 'Ensino Médio', ideb: 4.5, meta: 4.7 }
            ]
        }
    };

    return nivelData[nivel] || nivelData['todos'];
}
