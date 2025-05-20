Projeto de Dashboard Educacional com Landing Page Institucional

Este projeto foi desenvolvido por uma equipe de 6 alunos (3 de Front-end e 2 de UX) como parte de um estudo para criar uma landing page institucional e um dashboard educacional interativo. A landing page apresenta o projeto, destaca sua importância e incentiva os usuários a explorarem os dados educacionais disponíveis no dashboard. O dashboard exibe indicadores como IDEB, matrículas, infraestrutura escolar, evasão e desigualdades regionais, obtidos por meio da API QEdu e IBGE.

Objetivo do Projeto

O objetivo principal é desenvolver uma landing page institucional que explique a proposta do dashboard educacional, enfatize sua relevância para a análise de dados educacionais no Brasil e convide os usuários a explorarem a plataforma interativa. O dashboard permite visualizar e comparar indicadores educacionais de estados e municípios, promovendo uma melhor compreensão das condições educacionais do país.

Importância do Projeto

Acesso a Dados Educacionais: Facilita a visualização de indicadores como IDEB, matrículas e infraestrutura escolar, ajudando educadores, pesquisadores e cidadãos a entenderem o cenário educacional.
Conscientização: Destaca desigualdades regionais e desafios como evasão escolar, incentivando debates e ações para melhoria da educação.
Experiência de Usuário: Combina design UX com desenvolvimento Front-end para criar uma interface intuitiva e informativa.

Estrutura do Projeto
A estrutura de diretórios e arquivos do projeto é a seguinte:
projeto/
├── index.html              # Landing page institucional
├── dashboard.html          # Dashboard interativo com os dados educacionais
├── assets/
│   ├── js/
│   │   ├── api.js         # Lógica para integração com a API QEdu e IBGE
│   │   ├── charts.js      # Funções para geração de gráficos e visualizações
│   │   └── main.js        # Arquivo principal de JavaScript para inicialização
│   ├── css/
│   │   ├── style.css      # Estilos gerais do projeto
│   │   ├── landing.css    # Estilos específicos para a landing page
│   │   └── dashboard.css  # Estilos específicos para o dashboard
│   └── imagens/           # Pasta para imagens e recursos visuais
├── proxy-server/           # Pasta contendo o servidor proxy local (Node.js)
│   ├── node_modules/      # Dependências do Node.js para o servidor
│   ├── package-lock.json  # Arquivo de bloqueio de dependências do Node.js
│   ├── package.json       # Configuração e dependências do servidor
│   └── server.js          # Script do servidor proxy para contornar CORS localmente
└── README.md               # Documentação do projeto

Descrição dos Arquivos

index.html: Landing page institucional que apresenta o projeto, explica sua proposta e importância, e inclui um botão ou link para acessar o dashboard.
dashboard.html: Página do dashboard interativo, onde os dados educacionais são exibidos em gráficos e tabelas.
assets/js/:
api.js: Gerencia requisições à API QEdu (https://api.qedu.org.br/v1) e à API do IBGE para obter dados dinâmicos, como matrículas, infraestrutura e IDEB.
charts.js: Contém funções para criar visualizações de dados (ex.: gráficos de barras, linhas, etc.).
main.js: Inicializa o dashboard e conecta os scripts de API e gráficos.


assets/css/:
style.css: Estilos globais aplicados ao projeto.
landing.css: Estilos específicos para a landing page.
dashboard.css: Estilos personalizados para o layout do dashboard.


assets/imagens/: Armazena imagens usadas no projeto, como ícones, logotipos ou gráficos estáticos.
proxy-server/: Contém um servidor proxy local baseado em Node.js (server.js), usado durante o desenvolvimento para contornar restrições CORS. Embora o projeto agora use requisições diretas HTTPS, essa pasta foi mantida para referência. As dependências são gerenciadas por package.json e package-lock.json, com node_modules contendo as bibliotecas necessárias.

Pré-requisitos

Um navegador web moderno (Chrome, Firefox, Edge, etc.).
Acesso à internet para carregar dados da API QEdu e IBGE.
(Opcional) Node.js e npm instalados localmente para executar o servidor proxy, caso necessário.

Como Executar o Projeto

Localmente:

Clone o repositório ou abra os arquivos localmente.
Use um servidor local simples (como Live Server no VS Code) para abrir index.html.
Acesse http://127.0.0.1:5500 no navegador para visualizar a landing page e navegar até o dashboard.
(Opcional) Para usar o proxy local, navegue até proxy-server/, instale as dependências com npm install e inicie o servidor com node server.js. Acesse o dashboard via o endereço fornecido pelo servidor (geralmente http://localhost:3000).


Online:

O projeto está hospedado no GitHub Pages em https://kinoyaba.github.io/Projeto/.
Acesse o link, explore a landing page e navegue até o dashboard para visualizar os dados.



Funcionalidades do Dashboard

IDEB: Exibe o Índice de Desenvolvimento da Educação Básica por estado e município.
Estudantes: Mostra o número de matrículas em escolas públicas e privadas.
Infraestrutura: Apresenta dados sobre acesso a internet, laboratórios de ciências e bibliotecas nas escolas.
Evasão Escolar: Fornece estatísticas de evasão, aprovação e reprovação.
Desigualdades Regionais: Compara indicadores entre as regiões do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul).

Integração com API
O dashboard utiliza a API QEdu (https://api.qedu.org.br/v1) para obter dados educacionais em tempo real, autenticada com um token. As requisições são feitas diretamente via HTTPS, garantindo acesso dinâmico aos dados. A API IBGE é usada para obter nomes de estados e municípios.

Equipe do Projeto
O projeto foi desenvolvido por uma equipe composta por 3 alunos de Front-end e 2 de UX:

Front-end

LEONARDO FARIAS SOUZA - https://www.linkedin.com/in/leonardo-farias-souza-a48616320
ARTHUR LIMA SILVA
FRANCIELLEN COSTA SANTOS


UX

DANIEL DUTRA VALE
JOAO WILSON OLIVEIRA GUIMARAES

Contribuindo
Este é um projeto de estudo, mas sugestões são bem-vindas! Para contribuir:

Abra uma issue no repositório para relatar problemas ou propor melhorias.
Envie um pull request com suas alterações, se desejar.

Licença
Este projeto é de uso educacional e não possui uma licença formal. Sinta-se à vontade para usá-lo e modificá-lo para fins de aprendizado.
Agradecimentos

À API QEdu por fornecer os dados educacionais.
À API IBGE por disponibilizar dados geográficos.
Ao GitHub Pages por permitir a hospedagem gratuita do projeto.
Aos professores e colegas que apoiaram o desenvolvimento deste projeto.



