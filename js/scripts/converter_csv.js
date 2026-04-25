const fs = require('fs');
const csvtojson = require('csvtojson');

// Nome do arquivo CSV de entrada e saída
const arquivoEntrada = 'dados.csv';
const arquivoSaida = 'saida.js';

// Converte CSV para JSON e salva como um objeto JavaScript
csvtojson()
  .fromFile(arquivoEntrada)
  .then(json => {
    const conteudoJS = `const dados = ${JSON.stringify(json)};\nmodule.exports = dados;`;
    fs.writeFileSync(arquivoSaida, conteudoJS);
    console.log(`Arquivo ${arquivoSaida} criado com sucesso!`);
  })
  .catch(err => {
    console.error('Erro ao converter CSV:', err);
  });