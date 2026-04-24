const fields = [
    { nome: 'Tamanho da Área de Comunicação', tamanho: 8 },
    { nome: 'Tamanho da Área da Id.  Operação', tamanho: 4 },
    { nome: 'Cód. da Transação', tamanho: 9 },
    { nome: 'Origem', tamanho: 10 },
    { nome: 'Tipo de Transação', tamanho: 10 },
    { nome: 'Cód. de Erro', tamanho: 10 },
    { nome: 'Reservado', tamanho: 1 },
    { nome: 'Elemento SIA de Origem', tamanho: 6 },
    { nome: 'Sessão SIA', tamanho: 4 },
    { nome: 'Última Operação do Elemento', tamanho: 9 },
    { nome: 'Tipo de Mensagem', tamanho: 4 },
    { nome: 'Reservado', tamanho: 17 },
    { nome: 'Fluxo', tamanho: 16 },
    { nome: 'Tipo de Protocolo', tamanho: 8 },
    { nome: 'Versão Interface', tamanho: 5 },
    { nome: 'Cód.  Interface', tamanho: 16 },
    { nome: 'Data da Mensagem', tamanho: 8 },
    { nome: 'Hora da Mensagem', tamanho: 6 },
    { nome: "Milissegundo da Hora da Mensagem", tamanho: 3 },
    { nome: "Horário GMT", tamanho: 6 },
    { nome: "Cód.  do Cliente", tamanho: 20 },
    { nome: "Conta cartão", tamanho: 40 },
    { nome: "ID Transação Externa", tamanho: 32 },
    { nome: "PAN", tamanho: 19 },
    { nome: "Tipo de Origem da Transação", tamanho: 1 },
    { nome: "Tipo de Dispositivo", tamanho: 2 },
    { nome: "Sistema Requisitor do Token", tamanho: 11 },
    { nome: "Forma de solicitação de Tokenização", tamanho: 1 },
    { nome: "Número de Tokens Ativos do PAN", tamanho: 2 },
    { nome: "Tipo do Mapeamento do Token", tamanho: 1 },
    { nome: "Tipo de Verif. de Endereço", tamanho: 2 },
    { nome: "Recom. Serv Wallet Tokenização", tamanho: 1 },
    { nome: "Pont. Wallet para Disposito", tamanho: 1 },
    { nome: "Pont. Wallet Conta do Serv Carteira", tamanho: 1 },
    { nome: "Últimos 4 Dígitos do Telefone", tamanho: 4 },
    { nome: "Método de Ativação Preferencial", tamanho: 1 },
    { nome: "Data de Val. do Token", tamanho: 4 },
    { nome: "Cód. do Idioma de Pref. do Cliente", tamanho: 2 },
    { nome: "Decisão Final da Tokenização", tamanho: 1 },
    { nome: "Indicador Decisão Final Tokenização", tamanho: 1 },
    { nome: "Número de Tent. Ativação do Token", tamanho: 1 },
    { nome: "Filler", tamanho: 1 },
    { nome: "Data de Validade", tamanho: 8 },
    { nome: "Último Disponível", tamanho: 10 },
    { nome: "Cadeado", tamanho: 4 },
    { nome: "Filler", tamanho: 30 },
    { nome: "Data da Operação", tamanho: 8 },
    { nome: "Hora da Operação", tamanho: 6 },
    { nome: "Valor da Operação", tamanho: 13 },
    { nome: "Moeda", tamanho: 3 },
    { nome: "Taxa de Conversão", tamanho: 13 },
    { nome: "Decisão de Autorização", tamanho: 1 },
    { nome: "Tipo de Transação", tamanho: 1 },
    { nome: "Atividade", tamanho: 4 },
    { nome: "Cód.  Postal Estabelecimento", tamanho: 9 },
    { nome: "País Estabelecimento", tamanho: 3 },
    { nome: "Verif. de PIN", tamanho: 1 },
    { nome: "Verif. CVV", tamanho: 1 },
    { nome: "Modo de Entrada", tamanho: 1 },
    { nome: "Data Postagem", tamanho: 8 },
    { nome: "Indicador 3D Secure", tamanho: 1 },
    { nome: "Resultado Validação 3D Secure", tamanho: 1 },
    { nome: "Token", tamanho: 1 },
    { nome: "Indicador 1", tamanho: 1 },
    { nome: "Indicador 2", tamanho: 1 },
    { nome: "Dados Usuário 1", tamanho: 10 },
    { nome: "Dados Usuário 2", tamanho: 10 },
    { nome: "Filler", tamanho: 12 },
    { nome: "Pont.1", tamanho: 4 },
    { nome: "Pont.2", tamanho: 4 },
    { nome: "Pont.3", tamanho: 4 },
    { nome: "Titular Presente", tamanho: 1 },
    { nome: "Nível de Segurança", tamanho: 1 },
    { nome: "Dígitos Randômicos", tamanho: 2 },
    { nome: "Portfolio", tamanho: 14 },
    { nome: "Filler", tamanho: 20 },
    { nome: "Nome do Estabelecimento", tamanho: 40 },
    { nome: "Cidade do Estabelecimento", tamanho: 30 },
    { nome: "Estado ou País do Estabelecimento", tamanho: 3 },
    { nome: "Reservado", tamanho: 1 },
    { nome: "Tipo Transação Token", tamanho: 5 },
    { nome: "Carteira Digital", tamanho: 11 },
    { nome: "Análise da Transação - Visão Geral", tamanho: 2 },
    { nome: "Análise da Transação - Resultado do Teste", tamanho: 73 },
    { nome: "Tempo Real de Resposta", tamanho: 1 },
    { nome: "Resposta Pad", tamanho: 1 },
    { nome: "Data de Exp.da Ação", tamanho: 8 },
    { nome: "Filler", tamanho: 19 },
    { nome: "CHIP SDA ", tamanho: 1 },
    { nome: "CHIP DDA ", tamanho: 1 },
    { nome: "Reservado 02", tamanho: 1 },
    { nome: "Verifica Titularidade", tamanho: 1 },
    { nome: "Risco", tamanho: 1 },
    { nome: "Autenticar Emissor", tamanho: 1 },
    { nome: "CHIP CDA", tamanho: 1 },
    { nome: "Filler", tamanho: 53 },
    { nome: "Situação CVV2", tamanho: 1 },
    { nome: "Resposta CVV2", tamanho: 1 },
    { nome: "Resposta AVS", tamanho: 1 },
    { nome: "Categoria da Operação", tamanho: 1 },
    { nome: "Cód.  do Adquirente", tamanho: 12 },
    { nome: "País do Adquirente", tamanho: 3 },
    { nome: "Cód.  do Terminal", tamanho: 16 },
    { nome: "Tipo de Terminal", tamanho: 1 },
    { nome: "Capacidade de Leitura do Terminal", tamanho: 1 },
    { nome: "Condição da Transação", tamanho: 2 },
    { nome: "ID ATM", tamanho: 1 },
    { nome: "Reservado 01", tamanho: 1 },
    { nome: "Número Checagem", tamanho: 6 },
    { nome: "Resultado Verif. Terminal", tamanho: 10 },
    { nome: "Resultado Verif. Cartão", tamanho: 10 },
    { nome: "Resultado Verif. Criptograma", tamanho: 1 },
    { nome: "Contador Transação", tamanho: 5 },
    { nome: "Contador Mantido", tamanho: 5 },
    { nome: "Reservado 03", tamanho: 2 },
    { nome: "Filler", tamanho: 26 },
    { nome: "Cód.  de Motivo de Autorização", tamanho: 5 },
    { nome: "Aviso Stand-in", tamanho: 1 },
    { nome: "Cód.  Comerciante", tamanho: 16 },
    { nome: "Filler", tamanho: 1 },
    { nome: "Valor da Operação em Dolar", tamanho: 13 },
    { nome: "Valor da Operação em Real", tamanho: 13 },
    { nome: "Dados Usuário 07", tamanho: 40 },
    { nome: "Instrumento Pagamento", tamanho: 30 },
    { nome: "Solicitação AVS", tamanho: 1 },
    { nome: "Verif. de PIN Off-line", tamanho: 1 },
    { nome: "Falha na Verif. de PIN Off-line", tamanho: 1 },
    { nome: "Excedido Quantidade de Tentativas", tamanho: 1 },
    { nome: "Ponto de Venda Assistido", tamanho: 1 },
    { nome: "Ponto de Venda On-Premises", tamanho: 1 },
    { nome: "Capacidade de Leitura de Cartão", tamanho: 1 },
    { nome: "Segurança do Ponto de Venda", tamanho: 1 },
    { nome: "Resposta Autenticação", tamanho: 6 },
    { nome: "Dados Usuário 08", tamanho: 10 },
    { nome: "Dados Usuário 09", tamanho: 10 },
    { nome: "Indicador Usuário 05", tamanho: 1 },
    { nome: "Indicador Usuário 06", tamanho: 1 },
    { nome: "Indicador Usuário 07", tamanho: 5 },
    { nome: "Indicador Usuário 08", tamanho: 5 },
    { nome: "Modelo Controle 1", tamanho: 1 },
    { nome: "Modelo Controle 2", tamanho: 1 },
    { nome: "Modelo Controle 3", tamanho: 1 },
    { nome: "Modelo Controle 4", tamanho: 1 },
    { nome: "Verif. da Data de Exp.da Autorização", tamanho: 1 },
    { nome: "Verif. Secundária", tamanho: 1 },
    { nome: "Cód.  de Resposta da Autorização", tamanho: 1 },
    { nome: "Wallet ID Hash", tamanho: 64 },
    { nome: "Nome do Portador do Cartão", tamanho: 27 },
    { nome: "Id. do Aplic. Pagamento", tamanho: 48 },
    { nome: "Endereço IP do Disp.", tamanho: 12 },
    { nome: "Mot Recom. Serv Wallet Tokenização", tamanho: 6 },
    { nome: "Localização do Disp.", tamanho: 9 },
    { nome: "Correlation ID", tamanho: 14 },
    { nome: "Data e Hora Val. do Cód. Ativação", tamanho: 10 },
    { nome: "Número Unico de Ref. do Token", tamanho: 48 },
    { nome: "Cód. de Config do Prod Emissor ", tamanho: 10 },
    { nome: "Nome do Disp.", tamanho: 20 },
    { nome: "Cód. Termos Cond Cont Tokenização", tamanho: 32 },
    { nome: "Data Hora Aceit Cli Termos", tamanho: 10 },
    { nome: "Número do Token", inicio: 1362, tamanho: 19 },
    { nome: "Cód. Único Cartão Tokenizado", inicio: 1381, tamanho: 48 },
    { nome: "Indicador do Tipo de Atualização", tamanho: 1 },
    { nome: "Cód.  do Motivo da Atualização", tamanho: 2 },
    { nome: "Ator que Solicitou a Atualização", tamanho: 1 },
    { nome: "Método Autenticação 3DS", tamanho: 2 },
    { nome: "Digital Transaction Insights", tamanho: 99 },
    { nome: "Tipo de Token", tamanho: 2 },
    { nome: "Origem do Cartão", tamanho: 2 },
    { nome: "Indicador Comércio Eletrônico", tamanho: 9 },
    { nome: "Dados Adicionais de Autenticação", tamanho: 100 },
    { nome: "Indicador Bit55", tamanho: 1 },
    { nome: "Motivo de Negativa ", tamanho: 4 },
    { nome: "Marca do cartão", tamanho: 2 },
    { nome: "Tipo do cartão", tamanho: 2 },
    { nome: "Cód.  Resolução SIA", tamanho: 3 },
    { nome: "Cód.  Resolução SAT", tamanho: 3 },
    { nome: "VISA Token Score", tamanho: 2 },
    { nome: "Transaction ID", tamanho: 40 },
];

function processText() {
    let txt = document.getElementById('hexInput').value;

    /* 1) remove apenas os delimitadores */
    const ini = txt.indexOf('<INI>');
    if (ini !== -1) txt = txt.substring(ini + 5);
    const fin = txt.indexOf('<FIN>');
    if (fin !== -1) txt = txt.substring(0, fin);

    /* 2) NÃO remove espaços/quebras – eles FAZEM PARTE do layout */

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'data-table-short-af';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome do Campo</th>
                <th>Início</th>
                <th>Tamanho</th>
                <th>Conteúdo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    let currentPos = 0;
    fields.forEach(f => {
        const content = txt.substr(currentPos, f.tamanho);   // pega exatos N caracteres
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="fld-name">${f.nome}</span></td>
            <td>${currentPos}</td>
            <td>${f.tamanho}</td>
            <td><pre>${content}</pre></td>   <!-- pre preserva espaços/quebras -->
        `;
        currentPos += f.tamanho;   // avança exatos N caracteres (incluindo espaços)
    });

    resultDiv.appendChild(table);
}
function filterResults() {
    const query = document.getElementById('searchField').value.toLowerCase();
    const cards = document.querySelectorAll('.field-card');
    cards.forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
    });
}
