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
    { nome: "HorÃ¡rio GMT", tamanho: 6 },
    { nome: "Cód.  do Cliente", tamanho: 20 },
    { nome: "Conta cartão", tamanho: 40 },
    { nome: "ID Transação Externa", tamanho: 32 },
    { nome: "PAN", tamanho: 19 },
    { nome: "Tipo de Origem da Transação", tamanho: 1 },
    { nome: "Tipo de Dispositivo", tamanho: 2 },
    { nome: "Sistema Requisitor do Token", tamanho: 11 },
    { nome: "Forma de solicitaÇão de Tokenização", tamanho: 1 },
    { nome: "Número de Tokens Ativos do PAN", tamanho: 2 },
    { nome: "Tipo do Mapeamento do Token", tamanho: 1 },
    { nome: "Tipo de Verif. de Endereço", tamanho: 2 },
    { nome: "Recom. Serv Wallet Tokenização", tamanho: 1 },
    { nome: "Pont. Wallet para Disposito", tamanho: 1 },
    { nome: "Pont. Wallet Conta do Serv Carteira", tamanho: 1 },
    { nome: "Últimos 4 Dígitos do Telefone", tamanho: 4 },
    { nome: "MÉtodo de AtivaÇão Preferencial", tamanho: 1 },
    { nome: "Data de Val. do Token", tamanho: 4 },
    { nome: "Cód. do Idioma de Pref. do Cliente", tamanho: 2 },
    { nome: "Decisão Final da Tokenização", tamanho: 1 },
    { nome: "Indicador Decisão Final Tokenização", tamanho: 1 },
    { nome: "Número de Tent. AtivaÇão do Token", tamanho: 1 },
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
    { nome: "Resultado ValidaÇão 3D Secure", tamanho: 1 },
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
    { nome: "Data de Exp.da AÇão", tamanho: 8 },
    { nome: "Filler", tamanho: 19 },
    { nome: "CHIP SDA ", tamanho: 1 },
    { nome: "CHIP DDA ", tamanho: 1 },
    { nome: "Reservado 02", tamanho: 1 },
    { nome: "Verifica Titularidade", tamanho: 1 },
    { nome: "Risco", tamanho: 1 },
    { nome: "Autenticar Emissor", tamanho: 1 },
    { nome: "CHIP CDA", tamanho: 1 },
    { nome: "Filler", tamanho: 53 },
    { nome: "SituaÇão CVV2", tamanho: 1 },
    { nome: "Resposta CVV2", tamanho: 1 },
    { nome: "Resposta AVS", tamanho: 1 },
    { nome: "Categoria da Operação", tamanho: 1 },
    { nome: "Cód.  do Adquirente", tamanho: 12 },
    { nome: "País do Adquirente", tamanho: 3 },
    { nome: "Cód.  do Terminal", tamanho: 16 },
    { nome: "Tipo de Terminal", tamanho: 1 },
    { nome: "Capacidade de Leitura do Terminal", tamanho: 1 },
    { nome: "CondiÇão da Transação", tamanho: 2 },
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
    { nome: "Cód. de Motivo de Autorização", tamanho: 5 },
    { nome: "Aviso Stand-in", tamanho: 1 },
    { nome: "Cód. Comerciante", tamanho: 16 },
    { nome: "Filler", tamanho: 1 },
    { nome: "Valor da Operação em Dolar", tamanho: 13 },
    { nome: "Valor da Operação em Real", tamanho: 13 },
    { nome: "Dados Usuário 07", tamanho: 40 },
    { nome: "Instrumento Pagamento", tamanho: 30 },
    { nome: "SolicitaÇão AVS", tamanho: 1 },
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
    { nome: "Verif. SecundÃ¡ria", tamanho: 1 },
    { nome: "Cód. de Resposta da Autorização", tamanho: 1 },
    { nome: "Wallet ID Hash", tamanho: 64 },
    { nome: "Nome do Portador do Cartão", tamanho: 27 },
    { nome: "Id. do Aplic. Pagamento", tamanho: 48 },
    { nome: "Endereço IP do Disp.", tamanho: 12 },
    { nome: "Mot Recom. Serv Wallet Tokenização", tamanho: 6 },
    { nome: "Localização do Disp.", tamanho: 9 },
    { nome: "Correlation ID", tamanho: 14 },
    { nome: "Data e Hora Val. do Cód. AtivaÇão", tamanho: 10 },
    { nome: "Número Unico de Ref. do Token", tamanho: 48 },
    { nome: "Cód. de Config do Prod Emissor ", tamanho: 10 },
    { nome: "Nome do Disp.", tamanho: 20 },
    { nome: "Cód. Termos Cond Cont Tokenização", tamanho: 32 },
    { nome: "Data Hora Aceit Cli Termos", tamanho: 10 },
    { nome: "Número do Token", inicio: 1362, tamanho: 19 },
    { nome: "Cód. Único Cartão Tokenizado", inicio: 1381, tamanho: 48 },
    { nome: "Indicador do Tipo de Atualização", tamanho: 1 },
    { nome: "Cód. do Motivo da Atualização", tamanho: 2 },
    { nome: "Ator que Solicitou a Atualização", tamanho: 1 },
    { nome: "MÉtodo Autenticação 3DS", tamanho: 2 },
    { nome: "Digital Transaction Insights", tamanho: 99 },
    { nome: "Tipo de Token", tamanho: 2 },
    { nome: "Origem do Cartão", tamanho: 2 },
    { nome: "Indicador Comércio EletrÔnico", tamanho: 9 },
    { nome: "Dados Adicionais de Autenticação", tamanho: 100 },
    { nome: "Indicador Bit55", tamanho: 1 },
    { nome: "Motivo de Negativa ", tamanho: 4 },
    { nome: "Marca do cartão", tamanho: 2 },
    { nome: "Tipo do cartão", tamanho: 2 },
    { nome: "Cód. Resolução SIA", tamanho: 3 },
    { nome: "Cód. Resolução SAT", tamanho: 3 },
    { nome: "SCORE-VISA-ELEGTOKEN", tamanho: 2 },     
    { nome: "VRS-PRT-3DS-SEC", tamanho: 8 },   
    { nome: "IND-ENV", tamanho: 2 },     
    { nome: "PRG-AUT", tamanho: 2 },     
    { nome: "ID-DISP", tamanho: 64 },  
    { nome: "TP-DISP", tamanho: 2 },     
    { nome: "ID-APP-SDK", tamanho: 37 },  
    { nome: "END-IP-DISP", tamanho: 39 },  
    { nome: "CT-VEL-END-IP", tamanho: 2  },    
    { nome: "CT-VEL-ID-DISP", tamanho: 2 },     
    { nome: "VS-CAVV", tamanho: 2  },    
    { nome: "TP-CAVV", tamanho: 2  },    
    { nome: "PT-SV-VCAS", tamanho: 2  },    
    { nome: "COD-RES-CYBS", tamanho: 2   },   
    { nome: "TRANSACTION-ID", tamanho: 40 },  
    { nome: "DECIS-FRAUD", tamanho: 1   },       
    { nome: "DEVICE-SCORE", tamanho: 2  },       
    { nome: "ACCOUNT-SCORE", tamanho: 2  },       
    { nome: "Código de Razão",tamanho: 4  },               
    { nome: "B34-01-C1", tamanho: 1  },       
    { nome: "B34-01-89", tamanho: 45  },       
    { nome: "B34-01-92", tamanho: 45  },       
    { nome: "B34-56-DF21", tamanho: 1  },       
    { nome: "B34-56-81", tamanho: 32  },       
    { nome: "B34-56-9F22", tamanho: 1  },       
    { nome: "CODPRC", tamanho: 2  },       
    { nome: "FILLER", tamanho: 64  },   
];

function processText() {
    const inputEl = document.getElementById('hexInput');
    const resultDiv = document.getElementById('result');
    if (!inputEl || !resultDiv) return;

    let txt = inputEl.value;
    

    /* 2) Nao remove espacos/quebras: fazem parte do layout */
    resultDiv.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'de-table antifraud-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Campo</th>
                <th>Início</th>
                <th>Tamanho</th>
                <th>Conteúdo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    let currentPos = 0;
    let posicao = 1;
    fields.forEach(f => {
        const content = txt.substr(currentPos, f.tamanho);   // pega exatos N caracteres
        const fieldName = normalizeLabel(f.nome);
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="fld-name">${escapeHtml(fieldName)}</span></td>
            <td>${posicao}</td>
            <td>${f.tamanho}</td>
            <td><pre>${escapeHtml(content)}</pre></td>   <!-- pre preserva espacos/quebras -->
        `;
        currentPos += f.tamanho;   // avanca exatos N caracteres (incluindo espacos)
        posicao  += f.tamanho;   // avanca exatos N caracteres (incluindo espacos)
    });

    resultDiv.appendChild(table);
}

function normalizeLabel(value) {
    const text = String(value || '');
    try {
        return decodeURIComponent(escape(text));
    } catch (_) {
        return text;
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function filterResults() {
    const query = document.getElementById('searchField').value.toLowerCase();
    const cards = document.querySelectorAll('.field-card');
    cards.forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
    });
}

function normalizeHexInput(txt) {
    return txt
        .replace(/<INI>|<FIN>/gi, '')   // remove marcadores
        .toUpperCase();
}

function bindPaste(hexInput) {
    hexInput.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        hexInput.value = normalizeHexInput(pasted);
        hexInput.dispatchEvent(new Event('input'));
    });
}

window.processText = processText;

