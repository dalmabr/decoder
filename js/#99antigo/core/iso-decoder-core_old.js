// ========== VARIÁVEIS GLOBAIS ==========
let currentPos = 44;
let hex = '';
let valorAscii = '-';
let tamanho = '-';
let valorHex = '-';

// Flags para evitar reextração e remontagem
let de60Hex = '';
let de60Capturado = false;
let de62Hex = '';
let de62Capturado = false;
let de63Hex = '';
let de63Capturado = false;
let de104Hex = '';
let de104Capturado = false;
let de120Hex = '';
let de120Capturado = false;
let de123Hex = '';
let de123Capturado = false;
let de125Hex = '';
let de125Capturado = false;

// lista de bits que devem aparecer vermelhos
const dangerBits = [10002, 100035, 100045, 100052, 100055, 1000123, 1000125, 1000126];

// Configuração dos Data Elements
const deConfig = {
    0: { name: 'MTI', type: 'Fixo', size: 4, format: 'n' },
    2: { name: 'PAN', type: 'LLVAR', size: 19, format: 'n' },
    3: { name: 'Processing Code', type: 'Fixo', size: 3, format: 'n' },
    4: { name: 'Amount', type: 'Fixo', size: 6, format: 'n' },
    5: { name: 'Amount, Settlement', type: 'Fixo', size: 6, format: 'ans' },
    6: { name: 'Amount, Cardholder Billing', type: 'Fixo', size: 6, format: 'ans' },
    7: { name: 'Transmission DT', type: 'Fixo', size: 5, format: 'n' },
    9: { name: 'Conversion Rate, Settlement', type: 'Fixo', size: 8, format: 'ans' },
    10: { name: 'Conversion Rate, Cardholder Billing', type: 'Fixo', size: 4, format: 'ans' },
    11: { name: 'STAN', type: 'Fixo', size: 3, format: 'n' },
    12: { name: 'Local Time', type: 'Fixo', size: 6, format: 'n' },
    13: { name: 'Local Date', type: 'Fixo', size: 4, format: 'n' },
    14: { name: 'Date, Expiration', type: 'Fixo', size: 2, format: 'ans' },
    15: { name: 'Date, Settlement', type: 'Fixo', size: 2, format: 'ans' },
    16: { name: 'Date, Conversion', type: 'Fixo', size: 4, format: 'ans' },
    18: { name: 'Merchant Type', type: 'Fixo', size: 2, format: 'ans' },
    19: { name: 'Acquiring Institution Country Code', type: 'Fixo', size: 2, format: 'ans' },
    20: { name: 'PAN Extended, Country Code', type: 'Fixo', size: 3, format: 'ans' },
    22: { name: 'Point-of-Service Entry Mode Code', type: 'Fixo', size: 2, format: 'ans' },
    23: { name: 'Card Sequence Number', type: 'Fixo', size: 3, format: 'ans' },
    25: { name: 'Point-of-Service Condition Code', type: 'Fixo', size: 1, format: 'ans' },
    26: { name: 'Point-of-Service PIN Capture Code', type: 'Fixo', size: 2, format: 'ans' },
    28: { name: 'Amount, Transaction Fee', type: 'Fixo', size: 18, format: 'ans' },
    32: { name: 'Acquiring Institution Identification Code', type: 'LLVAR', size: 11, format: 'ans' },
    33: { name: 'Forwarding Institution Identification Code', type: 'LLVAR', size: 11, format: 'b' },
    34: { name: 'Acceptance Environment Data (TLV Format)', type: 'LLLVAR', size: 255, format: 'b' },
    35: { name: 'Track 2 Data', type: 'LLVAR', size: 37, format: 'ans' },
    37: { name: 'Retrieval Reference Number', type: 'Fixo', size: 12, format: 'e' },
    38: { name: 'Authorization Identification Response', type: 'Fixo', size: 6, format: 'ans' },
    39: { name: 'Response Code', type: 'Fixo', size: 2, format: 'e' },
    41: { name: 'Terminal ID', type: 'Fixo', size: 8, format: 'e' },
    42: { name: 'Card Acceptor Identification Code', type: 'Fixo', size: 15, format: 'e' },
    43: { name: 'Card Acceptor Name/Location', type: 'Fixo', size: 40, format: 'e' },
    44: { name: 'Additional Response Data', type: 'LLVAR', size: 25, format: 'e' },
    45: { name: 'Track 1 Data', type: 'LLVAR', size: 77, format: 'ans' },
    46: { name: 'Expanded Additional Amounts', type: 'LLLVAR', size: 217, format: 'ans' },
    48: { name: 'Additional Data—Private', type: 'LLLVAR', size: 256, format: 'ans' },
    49: { name: 'Currency Code', type: 'Fixo', size: 2, format: 'n' },
    50: { name: 'Currency Code, Sett', type: 'Fixo', size: 2, format: 'n' },
    51: { name: 'Currency Code, Cardholder Billing', type: 'Fixo', size: 2, format: 'n' },
    52: { name: 'PIN Block', type: 'Fixo', size: 8, format: 'b' },
    53: { name: 'Security-Related Control Information', type: 'Fixo', size: 8, format: 'n' },
    54: { name: 'Additional Amounts', type: 'LLLVAR', size: 121, format: 'ans' },
    55: { name: 'ICC Data', type: 'LLLVAR', size: 999, format: 'b' },
    56: { name: 'Customer Related Data', type: 'LLLVAR', size: 256, format: 'ans' },
    58: { name: 'National POS Geographic Data', type: 'LLVAR', size: 60, format: 'ans' },
    59: { name: 'National POS Geographic Data', type: 'LLVAR', size: 14, format: 'e' },
    60: { name: 'Additional POS Information', type: 'LLVAR', size: 12, format: 'e' },
    61: { name: 'Other Amount, Transaction', type: 'LLVAR', size: 36, format: 'ans' },
    62: { name: 'Custom Payment Service', type: 'LLLVAR', size: 255, format: 'ans' },
    63: { name: 'VIP Private-Use Field', type: 'LLLVAR', size: 255, format: 'ans' },
    64: { name: 'Message Authentication Code', type: 'Fixo', size: 16, format: 'ans' },
    70: { name: 'Network Management Information Code', type: 'Fixo', size: 2, format: 'n' },
    73: { name: 'Date, Action', type: 'Fixo', size: 6, format: 'ans' },
    90: { name: 'Original Data Elements', type: 'Fixo', size: 21, format: 'n' },
    91: { name: 'File Update Code', type: 'Fixo', size: 1, format: 'ans' },
    92: { name: 'File Security Code', type: 'Fixo', size: 2, format: 'ans' },
    95: { name: 'Replacement Amounts', type: 'Fixo', size: 42, format: 'ans' },
    96: { name: 'Reserved for Future Use', type: 'Fixo', size: 64, format: 'ans' },
    100: { name: 'Receiving Institution Identification Code', type: 'LLVAR', size: 11, format: 'ans' },
    101: { name: 'File Name', type: 'LLVAR', size: 11, format: 'e' },
    102: { name: 'Account Identification 1', type: 'LLVAR', size: 29, format: 'ans' },
    104: { name: 'Transaction Description and Transaction-Specific Data', type: 'LLVAR', size: 255, format: 'ans' },
    105: { name: 'Double-Length DES Key (Triple DES)', type: 'Fixo', size: 128, format: 'ans' },
    106: { name: 'Fleet Service Data', type: 'LLLVAR', size: 999, format: 'ans' },
    107: { name: 'Reserved for Future Use', type: 'LLLVAR', size: 999, format: 'ans' },
    108: { name: 'Data in Local Language', type: 'LLLVAR', size: 999, format: 'ans' },
    110: { name: 'Encryption Data (TLV Format)', type: 'LLLVAR', size: 999, format: 'ans' },
    111: { name: 'Additional Transaction Specific Data (TLV Format)', type: 'LLLVAR', size: 999, format: 'ans' },
    112: { name: 'Additional Data [National Use', type: 'LLLVAR', size: 999, format: 'ans' },
    114: { name: 'Domestic and Localized Data (TLV Format)', type: 'LLLVAR', size: 999, format: 'ans' },
    120: { name: 'Auxiliary Transaction Data', type: 'LLLVAR', size: 9999, format: 'ans' },
    121: { name: 'Issuing Institution Identification Code', type: 'LLLVAR', size: 999, format: 'ans' },
    122: { name: 'Reserved for Future Use', type: 'LLLVAR', size: 999, format: 'ans' },
    123: { name: 'Reserved for Future Use', type: 'LLLVAR', size: 999, format: 'ans' },
    124: { name: 'Reserved for Future Use', type: 'LLLVAR', size: 999, format: 'ans' },
    125: { name: 'Supporting Information', type: 'LLLVAR', size: 999, format: 'ans' },
    126: { name: 'Private Data', type: 'LLLVAR', size: 255, format: 'ans' },
    127: { name: 'Private Data', type: 'LLLVAR', size: 999, format: 'ans' },
    128: { name: 'MAC', type: 'Fixo', size: 16, format: 'ans' }
};


// Flags para evitar re-extração e remontagem
const de62SubConfig = {
    1: { name: 'Authorization Characteristics Indicator', size: 2 },
    2: { name: 'Transaction Identifier', size: 16 },
    3: { name: 'Validation Code', size: 8 },
    5: { name: 'Duration', size: 4 },
    7: { name: 'Purchase Identifier', size: 52 },
    16: { name: 'Reserved', size: 4 },
    17: { name: 'Mastercard Interchange Compliance', size: 30 },
    21: { name: 'Online Risk Assessment', size: 8 },
    22: { name: 'Condition Codes', size: 12 },
    23: { name: 'Product ID', size: 4 },
    24: { name: 'Program Identifier', size: 12 },
    25: { name: 'Spend Qualified Indicator', size: 4 },
    26: { name: 'Account Status', size: 4 }
};

// Tratamentos especiais
const specialHandlers = {
    48: decodeDE48,
    60: decodeDE60,
    62: decodeDE62,
    63: decodeDE63,
    104: decodeDE104,
    120: decodeDE120,
    123: decodeDE123,
    125: decodeDE125,
    126: decodeDE126,
};

// ========== FUNÇÕES AUXILIARES ==========
function hexToBin(hex, len = 8) {
    return parseInt(hex, 16).toString(2).padStart(len, '0');
}

function getBCDLength(hexLen) {
    return parseInt(hexLen, 16);
}

function getBytes(hex, state, len) {
    if (typeof hex !== 'string') {
        throw new Error('getBytes: hex inválido');
    }
    if (!state || typeof state.pos !== 'number') {
        throw new Error('getBytes: state inválido');
    }

    const out = hex.slice(state.pos, state.pos + len);
    state.pos += len;
    return out;
}



function decodeISO8583({hex, ui}) {
    const primaryBits = [];
    const secondaryHex = [];
    if (!hex) {
        throw new Error('Hexadecimal inválido, mesagem vazia');
    }
    let currentPos = 0;
    const state = {
        pos: 44
    };
    console.log('decodeISO8583 → hex:', hex);
    const mti = getBytes(hex, state, 2);
    if (ui?.mtiValue) {
        ui.mtiValue.textContent = mti;
    }
    displayBits(primaryBits, ui.primary, mti, false);
    displayBits(secondaryHex, ui.secondary, mti, true);

    currentPos = 44;

    // Reseta flags ao carregar nova mensagem
    de48Capturado = false;
    de62Capturado = false;
    de63Capturado = false;
    de104Capturado = false;
    de120Capturado = false;
    de123Capturado = false;
    de125Capturado = false;
    de126Capturado = false;

    decodeISO8583Internal(hex);
}

function decodeISO8583Internal(hex) {
    const state = { pos: 44 };
    const result = {
        mti: null,
        primaryBits: [],
        secondaryBits: [],
        dataElements: []
    };

    console.log('decodeISO8583Internal → hex:', hex, state);
    const primaryHex = getBytes(hex, state, 8);
    result.primaryBits = hexToBin(primaryHex);
    
    const hasSecondary = result.primaryBits[0] === '1';
    if (hasSecondary){
        console.log('decodeISO8583Internal → hasSecondary:', hasSecondary);
        const secondaryHex = getBytes(hex, state, 8);
        result.secondaryBits = hexToBin(secondaryHex);
    }

    result.dataElements = decodeDataElements(
        hex,
        state,
        [...result.primaryBits, ...result.secondaryBits]
    );

    return result;
}

function displayBits(bits, container, mti, isSecondary=false) {
    if (!container || !bits) return;

    let html = '<div class="bit-row">';
    bits.forEach((bit, idx) => {
        const bitNumber = (isSecondary ? 65 : 1) + idx;   // ⬅️ correção
        //const isOn = bit === '1';
        //const label = isOn ? bitNumber : '·';
        //const danger = isOn && dangerBits.includes(bitNumber);
        //const cls = isOn ? (danger ? 'on danger' : 'on') : 'off';
        const cls = bit === '1' ? 'on' : 'off'; 
        //html += `<div class="bit ${cls}" title="Bit ${bitNumber}">${label}</div>`;
        html += `<div class="bit ${cls}">${bit === '1' ? bitNumber : '·'}</div>`;
        if ((idx + 1) % 16 === 0) html += '</div><div class="bit-row">';
    });decodeISO8583
    html += '</div>';
    container.innerHTML = html;
}

function decodeDataElements(hex, state, bits) {
    const elements = [];

    bits.forEach((bit, idx) => {
        if (bit !== '1') return;

        const de = idx + 1;

        // exemplo (simplificado)
        const value = readFixed(hex, state, 10);

        elements.push({
            de,
            value
        });
    });

    return elements;
}


function decodeDataElements_old(bits) {
    const tbody = document.querySelector('#deTable tbody');
    tbody.innerHTML = '';

    const state = {
        pos: 44
    };    

    document.addEventListener('click', e => {
        if (!e.target.classList.contains('expand-btn')) return;
        const de = e.target.dataset.de;
        const targetId = e.target.dataset.target;
        const container = document.getElementById(targetId);
        if (!container) return;

        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';

        // Preenche só se ainda não foi montado
        if (isHidden && de === '120' && !de120Capturado) {
            const tbody = container.querySelector('tbody');
            tbody.innerHTML = decodeDE120Dataset(de120Hex);
            de120Capturado = true;
        }

        if (isHidden && de === '123' && !de123Capturado) {
            const tbody = container.querySelector('tbody');
            tbody.innerHTML = decodeDE123Dataset(de123Hex);
            de123Capturado = true;
        }

        if (isHidden && de === '125' && !de125Capturado) {
            const tbody = container.querySelector('tbody');
            tbody.innerHTML = decodeDE125Dataset(de125Hex);
            de125Capturado = true;
        }

        if (isHidden && de === '126' && !de126Capturado) {
            const tbody = container.querySelector('tbody');
            tbody.innerHTML = decodeDE126Dataset(de126Hex);
            de126Capturado = true;
        }

        const arrow = e.target.querySelector('.arrow');
        if (arrow) {
            arrow.textContent = isHidden ? '▼' : '▶';
            e.target.classList.toggle('open', isHidden);
        }
    });

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            const de = i + 1;
            if (de === 1) continue;

            const config = deConfig[de];
            if (!config) {
                tbody.innerHTML += `<tr><td>${de}</td><td colspan="4">[DE ${de} não mapeado]</td></tr>`;
                continue;
            }

            let tipo = config.type;
            try {
                let byteCount;

                if (config.type === 'LLVAR') {
                    const handler = specialHandlers[de];
                    if (handler) {
                        handler(hex, config);
                    } else {
                        const lenHex = getBytes(hex, state, 1);
                        const len = getBCDLength(lenHex);
                        if (config.format !== 'e') byteCount = Math.ceil(len / 2);
                        else byteCount = len;
                        valorHex = getBytes(hex, state, byteCount);
                        valorAscii = config.format === 'e' ? ebcdicToAscii(valorHex) : bcdToString(valorHex);
                        tamanho = `${len} dígitos`;
                    }
                } else if (config.type === 'LLLVAR') {
                    const handler = specialHandlers[de];
                    if (handler) {
                        handler(hex, config);
                    } else {
                        const lenHex = getBytes(hex, state, 2);
                        const len = parseInt(lenHex, 16);
                        const byteCount = len;
                        valorHex = getBytes(hex, state, byteCount);
                        valorAscii = config.format === 'e' ? ebcdicToAscii(valorHex) : hexToAscii(valorHex);
                        tamanho = `${len} bytes`;
                    }
                } else if (config.type === 'LLLLVAR') {
                    const handler = specialHandlers[de];
                    if (handler) {
                        handler(hex, config);
                    } else {
                        const lenHex = getBytes(hex, state, 2);
                        const len = parseInt(lenHex, 16);
                        const byteCount = len;
                        valorHex = getBytes(hex, state, byteCount);
                        valorAscii = config.format === 'e' ? ebcdicToAscii(valorHex) : hexToAscii(valorHex);
                        tamanho = `${len} bytes`;
                    }    
                } else if (config.type === 'Fixo') {
                    byteCount = config.size;
                    valorHex = getBytes(hex, state, byteCount);
                    valorAscii = config.format === 'e' ? ebcdicToAscii(valorHex) : hexToAscii(valorHex);
                    tamanho = `${config.size} bytes`;
                }

                if (valorHex.length > 128) {
                    valorHex = valorHex.slice(0, 128) + '...';
                    valorAscii = valorAscii.slice(0, 64) + '...';
                }
            } catch (e) {
                console.log('ERRO no DE', de, ':', e.message);
                valorHex = '[ERRO]';
                valorAscii = '[ERRO]';
            }

            const hasDetail = specialHandlers[de];
            const detailId = hasDetail ? `de${de}Detail` : '';
            const btn = hasDetail
                ? `<button class="expand-btn" data-de="${de}" data-target="${detailId}">
                    <span class="arrow">▶</span>
                </button>`
                : '';
            const fieldName = config.name;
            const hexLine = valorHex;
            const ebcdicLine = config.format === 'e' ? valorAscii : '';

            const singleBlock = `
                <span class="fld-name">${fieldName}</span>${btn}<br>
                ${hexLine}<br>
                ${ebcdicLine}`;

            const row = `
                <tr>
                    <td>${de}</td>
                    <td>${tipo}</td>
                    <td>${tamanho}</td>
                    <td class="multi-line">${singleBlock}</td>
                </tr>`;
            tbody.innerHTML += row;

            if (hasDetail) {
                const container = document.createElement('div');
                container.id = detailId;
                container.className = 'sub-table';
                container.innerHTML = `
                    <h4>DE${de} - ${config.name} (Detalhe)</h4>
                    <table class="table table-sm" id="de${de}Table">
                        <thead>
                            <tr>
                                <th>Sub-campo</th>
                                <th>Nome</th>
                                <th>Tamanho</th>
                                <th>Conteúdo (HEX - EBCDIC)</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>`;
                document.getElementById('detail-containers').appendChild(container);
                specialHandlers[de](hex, config);

            }
        }
    }
}

// ========== DECODIFICAÇÃO DOS DE COM SUB-CAMPOS ==========
function decodeDE48_old(hex, config) {
    if (de48Capturado) return;
    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de48Hex = hex.substr(currentPos, len * 2 + 2);
    currentPos += 2 + len * 2;
    valorHex = de48Hex.slice(0, 128) + (de48Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    setTimeout(() => {
        fillDE48Table(); // ✅ não atribui – só executa
    }, 0);
    de48Capturado = true;
}

// ========== DECODIFICAÇÃO DE DE48 – Usage 2 (Unformatted Text) ==========
function decodeDE48(hex, config) {
    if (de48Capturado) return;          // evita re-extração
    const lenHex = hex.substr(currentPos, 2);   // 1-byte binary length
    const len = parseInt(lenHex, 16);           // 0x15 = 21, etc.
    const payloadStart = currentPos + 2;
    de48Hex = hex.substr(payloadStart, len * 2);
    currentPos += 2 + len * 2;

    // ---- identificador ----
    const identifierHex = de48Hex.substr(0, 2);
    const identifierAscii = ebcdicToAscii(identifierHex); // 1 byte

    // ---- texto livre ----
    const textHex = de48Hex.substr(2);
    const textAscii = ebcdicToAscii(textHex);

    // ---- preenche célula principal ----
    valorHex = de48Hex.slice(0, 128) + (de48Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;

    // ---- monta html bonito ----
    setTimeout(() => {
        const container = document.getElementById('de48Detail');
        if (!container) return;
        const tbody = container.querySelector('tbody');
        tbody.innerHTML = `
            <tr>
                <td>48.1</td>
                <td>Identifier</td>
                <td>1</td>
                <td class="multi-line">${identifierHex}<br>${identifierAscii}</td>
            </tr>
            <tr>
                <td>48.2</td>
                <td>Unformatted Text</td>
                <td>${textHex.length / 2}</td>
                <td class="multi-line">${textHex}<br>${textAscii}</td>
            </tr>`;

        // validação reject code 0061
        if (identifierAscii !== '*') {
            tbody.innerHTML += `
                <tr style="background:#ffeaea;">
                    <td colspan="4"><strong>Reject Code 0061 – Invalid value in position 1</strong></td>
                </tr>`;
        }
    }, 0);

    de48Capturado = true;
}

function decodeDE60(hex, config) {
    if (de60Capturado) return;
    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de60Hex = hex.substr(currentPos, len * 2 + 2);
    currentPos += 2 + len * 2;
    valorHex = de60Hex.slice(0, 128) + (de60Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    setTimeout(() => {
        fillDE60Table(); // ✅ não atribui – só executa
    }, 0);
    de60Capturado = true;
}

function decodeDE62(hex, config) {
    if (de62Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de62Hex = hex.substr(currentPos, len * 2 + 2);
    currentPos += 2 + len * 2;

    valorHex = de62Hex.slice(0, 128) + (de62Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    setTimeout(() => {
        fillDE62Table(); // ✅ não atribui – só executa
    }, 0);
    de62Capturado = true;
}

function decodeDE63(hex, config) {
    if (de63Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de63Hex = hex.substr(currentPos + 2, len * 2);
    currentPos += 2 + len * 2;

    valorHex = de63Hex.slice(0, 128) + (de63Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    de63Capturado = true;
    setTimeout(() => {
        fillDE63Table(); // ✅ não atribui – só executa
    }, 0);
}

function decodeDE104(hex, config) {
    if (de104Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de104Hex = hex.substr(currentPos + 2, len * 2); // valor PURO
    currentPos += 2 + len * 2;

    valorHex = de104Hex.slice(0, 128) + (de104Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    de104Capturado = true;

    setTimeout(() => {
        const tbody = document.querySelector('#de104Table tbody');
        if (!tbody) return;
        tbody.innerHTML = decodeDE104Dataset(de104Hex);
    }, 0);

}

function decodeDE120(hex, config) {
    if (de120Capturado) return;

    const lenHex = hex.substr(currentPos + 6, 2);
    const len = parseInt(lenHex, 16);
    de120Hex = hex.substr(currentPos + 8, len * 2); // valor PURO

    currentPos += 8 + len * 2;

    valorHex = de120Hex.slice(0, 128) + (de120Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    de120Capturado = true;

    setTimeout(() => {
        const tbody = document.querySelector('#de120Table tbody');
        if (!tbody) return;
        tbody.innerHTML = decodeDE123Dataset(de120Hex);
    }, 0);

}

function decodeDE123(hex, config) {
    if (de123Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de123Hex = hex.substr(currentPos + 2, len * 2); // valor PURO
    currentPos += 2 + len * 2;

    valorHex = de123Hex.slice(0, 128) + (de123Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    de123Capturado = true;

    setTimeout(() => {
        const tbody = document.querySelector('#de123Table tbody');
        if (!tbody) return;
        tbody.innerHTML = decodeDE123Dataset(de123Hex);
    }, 0);

}

function decodeDE125(hex, config) {
    if (de125Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de125Hex = hex.substr(currentPos + 2, len * 2); // valor PURO
    currentPos += 2 + len * 2;

    valorHex = de125Hex.slice(0, 128) + (de125Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    de125Capturado = true;

    setTimeout(() => {
        const tbody = document.querySelector('#de125Table tbody');
        if (!tbody) return;
        tbody.innerHTML = decodeDE125Dataset(de125Hex);
    }, 0);

}

function decodeDE126(hex, config) {
    if (de126Capturado) return;

    const lenHex = hex.substr(currentPos, 2);
    const len = parseInt(lenHex, 16);
    de126Hex = hex.substr(currentPos, len * 2 + 2);
    currentPos += 2 + len * 2;

    valorHex = de126Hex.slice(0, 128) + (de126Hex.length > 128 ? '...' : '');
    valorAscii = '';
    tamanho = `${len} bytes`;
    setTimeout(() => {
        fillDE126Table(); // ✅ não atribui – só executa
    }, 0);
    de126Capturado = true;
}

// ========== MONTAGEM DAS SUB-TABELAS ==========
function fillDE48Table() {
    const container = document.getElementById('de48Detail');
    if (!container) return '';
    const tbody = container.querySelector('tbody');
    tbody.innerHTML = '';
    let pos = 2;
    const first = parseInt(de48Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 16 : 16;
    const bmpHex = de48Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;
    const bits = [];
    for (let i = 0; i < bmpHex.length; i += 1) {
        bits.push(...bmpHex.substr(i, 1));
    }

    const map = {
        1: { name: 'Terminal Type', size: 1, format: 'n' },
        2: { name: 'Terminal Entry Capabilit', size: 1, format: 'n' },
        3: { name: 'Chip Condition Code', size: 1, format: 'n' },
        4: { name: 'Special Condition Indicator', size: 1, format: 'n' },
        5: { name: 'Merchant Group Indicator', size: 2, format: 'n' },
        6: { name: 'Chip Transaction Indicator', size: 1, format: 'n' },
        7: { name: 'Chip Card Authentic Reliability Ind', size: 1, format: 'n' },
        8: { name: 'Mail/Phone/Elec Comm and Payment Ind', size: 2, format: 'n' },
        9: { name: 'Cardholder ID Method Indicator', size: 1, format: 'n' },
        10: { name: 'Additional Authorization Indicators', size: 1, format: 'n' },
    };
    pos = 2;
    let sub = 1;
    if (bits.length === 10) bits.length = 8
    for (let bitIndex = 1; bitIndex <= bits.length; bitIndex++) {
        const cfg = map[sub];
        const hexVal = de48Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>48.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
        sub += 1;
    }
}

function fillDE60Table() {
    const container = document.getElementById('de60Detail');
    if (!container) return '';
    const tbody = container.querySelector('tbody');
    tbody.innerHTML = '';
    let pos = 2;
    const first = parseInt(de60Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 16 : 16;
    const bmpHex = de60Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;
    const bits = [];
    for (let i = 0; i < bmpHex.length; i += 1) {
        bits.push(...bmpHex.substr(i, 1));
    }

    const map = {
        1: { name: 'Terminal Type', size: 1, format: 'n' },
        2: { name: 'Terminal Entry Capabilit', size: 1, format: 'n' },
        3: { name: 'Chip Condition Code', size: 1, format: 'n' },
        4: { name: 'Special Condition Indicator', size: 1, format: 'n' },
        5: { name: 'Merchant Group Indicator', size: 2, format: 'n' },
        6: { name: 'Chip Transaction Indicator', size: 1, format: 'n' },
        7: { name: 'Chip Card Authentic Reliability Ind', size: 1, format: 'n' },
        8: { name: 'Mail/Phone/Elec Comm and Payment Ind', size: 2, format: 'n' },
        9: { name: 'Cardholder ID Method Indicator', size: 1, format: 'n' },
        10: { name: 'Additional Authorization Indicators', size: 1, format: 'n' },
    };
    pos = 2;
    let sub = 1;
    if (bits.length === 10) bits.length = 8
    for (let bitIndex = 1; bitIndex <= bits.length; bitIndex++) {
        const cfg = map[sub];
        const hexVal = de60Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>60.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
        sub += 1;
    }
}

function fillDE62Table() {
    const container = document.getElementById('de62Detail');
    if (!container) return '';

    const tbody = container.querySelector('tbody');
    tbody.innerHTML = '';
    let pos = 2;
    const first = parseInt(de62Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 16 : 16;
    const bmpHex = de62Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;
    const bits = [];
    for (let i = 0; i < bmpHexLen; i += 2) {
        bits.push(...hexToBin(bmpHex.substr(i, 2), 8).split(''));
    }

    const map = {
        0: { name: 'Field 62 Bitmap', size: 16, format: 'n' },
        1: { name: 'Authorization Characteristics Indicator', size: 2, format: 'e' },
        2: { name: 'Transaction Identifier', size: 16, format: 'n' },
        3: { name: 'Validation Code', size: 8, format: 'n' },
        5: { name: 'Duration', size: 4, format: 'n' },
        6: { name: 'Reserved', size: 2, format: 'n' },
        7: { name: 'Purchase Identifier', size: 52, format: 'n' },
        16: { name: 'Reserved', size: 4, format: 'n' },
        17: { name: 'Mastercard Interchange Compliance', size: 30, format: 'n' },
        21: { name: 'Online Risk Assessment', size: 8, format: 'e' },
        22: { name: 'Condition Codes', size: 12, format: 'e' },
        23: { name: 'Product ID', size: 4, format: 'n' },
        24: { name: 'Program Identifier', size: 12, format: 'n' },
        25: { name: 'Spend Qualified Indicator', size: 4, format: 'n' },
        26: { name: 'Account Status', size: 4, format: 'n' },
        28: { name: 'Custom Field 28', size: 16, format: 'n' }
    };

    for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        if (bits[bitIndex] !== '1') continue;
        const sub = bitIndex + 1;
        const cfg = map[sub];
        if (!cfg) continue;
        const hexVal = de62Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>62.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size / 2}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
    }
}

function fillDE63Table() {
    const container = document.getElementById('de63Detail');
    if (!container) return '';

    const table = container.querySelector('table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    let pos = 0;
    const first = parseInt(de63Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 6 : 6;
    const bmpHex = de63Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;

    const bits = [];
    for (let i = 0; i < bmpHexLen; i += 2) {
        bits.push(...hexToBin(bmpHex.substr(i, 2), 8).split(''));
    }

    const map = {
        0: { name: 'Field 63 Bitmap', size: 16, format: 'n' },
        1: { name: 'Network Identification Code', size: 4, format: 'n' },
        2: { name: 'Time (Preauth Time Limit)', size: 4, format: 'n' },
        3: { name: 'Message Reason Code', size: 4, format: 'n' },
        4: { name: 'STIP/Switch Reason Code', size: 4, format: 'n' },
        5: { name: 'Duration', size: 2, format: 'n' },
        21: { name: 'Online Risk Assessment Risk Score and Reason Codes', size: 8, format: 'e' },
        22: { name: 'Online Risk Assessment Condition Codes', size: 12, format: 'n' },
        24: { name: 'Program Identifier', size: 12, format: 'n' },
        25: { name: 'Spend Qualified Indicator', size: 4, format: 'n' }
    };

    for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        if (bits[bitIndex] !== '1') continue;
        const sub = bitIndex + 1;
        const cfg = map[sub];



        if (!cfg) continue;
        const hexVal = de63Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>63.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size / 2}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
    }
}

function fillDE63Table() {
    const container = document.getElementById('de63Detail');
    if (!container) return '';

    const table = container.querySelector('table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    let pos = 0;
    const first = parseInt(de63Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 6 : 6;
    const bmpHex = de63Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;

    const bits = [];
    for (let i = 0; i < bmpHexLen; i += 2) {
        bits.push(...hexToBin(bmpHex.substr(i, 2), 8).split(''));
    }

    const map = {
        0: { name: 'Field 63 Bitmap', size: 16, format: 'n' },
        1: { name: 'Network Identification Code', size: 4, format: 'n' },
        2: { name: 'Time (Preauth Time Limit)', size: 4, format: 'n' },
        3: { name: 'Message Reason Code', size: 4, format: 'n' },
        4: { name: 'STIP/Switch Reason Code', size: 4, format: 'n' },
        5: { name: 'Duration', size: 2, format: 'n' },
        21: { name: 'Online Risk Assessment Risk Score and Reason Codes', size: 8, format: 'e' },
        22: { name: 'Online Risk Assessment Condition Codes', size: 12, format: 'n' },
        24: { name: 'Program Identifier', size: 12, format: 'n' },
        25: { name: 'Spend Qualified Indicator', size: 4, format: 'n' }
    };

    for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        if (bits[bitIndex] !== '1') continue;
        const sub = bitIndex + 1;
        const cfg = map[sub];



        if (!cfg) continue;
        const hexVal = de63Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>63.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size / 2}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
    }
}

function decodeDE104Dataset(hex104) {
    const map = {
        '66-C0': 'Postal Code',
        '1A-80': 'Fuel Indicator',
        '1A-81': 'Service Type',
        '1A-83': 'Product Code',
        '1A-84': 'Product Category/Description',
        '1A-88': 'Unit Price',
        '1A-89': 'Unit Price Minor Unit',
        '1A-8A': 'Unit of Measure',
        '1A-8B': 'Product Quantity',
        '1A-8C': 'Quantity Minor Unit',
        '1A-8D': 'Total Time Plugged In',
        '1A-8E': 'Total Charging Time',
        '1A-8F': 'Start Time of Charge',
        '1A-90': 'Finish Time of Charge',
        '1A-91': 'Total Amount Including tax (Gross Price)',
        '1A-93': 'Discount Rate - Percentage',
        '1A-94': 'Discount Rate - Unit Discount',
        '1A-95': 'Discount Rate - Flat Rate per transaction',
        '1A-96': 'Total Discount Amount',
        '1A-97': 'Net Amount (Net Price)',
        '1A-98': 'Non-Taxable Indicator',
        '1A-99': 'Local Tax Included Indicator',
        '1A-9A': 'Local Tax Amount',
        '1A-9B': 'Local Tax Rate',
        '1A-9C': 'National Tax Included Indicator',
        '1A-9D': 'National Tax Amount',
        '1A-9E': 'National Tax Rate',
        '1A-9F': 'Other Tax Included Indicator',
        '1A-9F': 'Other Tax Amount',
        '1A-9F': 'Other Tax Rate',
        '02-05': 'Pre-Tax Amount',
        '02-07': 'Tax Rate',
        '02-08': 'Discount Amount',
        '02-09': 'Prohibited Item Indicator',
        '18-80': 'Recurring Payment Type',
        '18-81': 'Payment Amount Indicator Per Transaction',
        '18-82': 'Number of Recurring Payment',
        '18-83': 'Frequency of Recurring Payment',
        '18-84': 'Registration Reference Number',
        '18-85': 'Maximum Recurring Payment Amount',
        '18-86': 'Validation Indicator',
        '56-01': 'Payment Facilitator ID',
        '56-02': 'Sub-Merchant ID',
        '56-03': 'Independent Sales Organization ID',
        '56-04': 'Foreign Retailer Indicator',
        '56-81': 'Acceptor Legal Business Name',
        '56-82': 'Payment Facilitator Name',
        '56-83': 'Marketplace ID',
        '56-84': 'Gateway ID',
        '56-85': 'Staged Digital Wallet ID',
        '56-86': 'Ramp Provider ID',
        '57-01': 'Business Application Identifier',
        '57-80': 'Service Processing Type',
        '57-81': 'Deferred OCT Date/Time Value',
        '57-82': 'Purpose of Payment',
        '57-83': 'Maximum Processing Date',
        '57-02': 'Source of Funds',
        '57-84': 'Scheme Identifier',
        '58-01': 'Benefit Administrator ID',
        '58-02': 'Service Type Code',
        '58-03': 'Payer ID/ Carrier ID',
        '58-04': 'Approval or Reject Reason Code',
        '59-01': 'Promotion Type',
        '59-02': 'Promotion Code',
        '59-03': 'Promotion Description',
        '59-04': 'Receipt Data',
        '59-05': 'Merchant Indicator',
        '59-06': 'Discount Indicator',
        '59-07': 'Unit Discount',
        '59-08': 'Unit Quantity',
        '5B-01': 'Risk Score',
        '5B-02': 'Risk Condition Code',
        '5B-80': 'Authorization Posting Score',
        '5B-84': 'Watch List Results Code',
        '5B-85': 'Visa Account Attack Intelligence Score',
        '5B-86': 'Visa Deep Authorization Score',
        '5C-01': 'Type of Purchase',
        '5C-02': 'Service Type',
        '5C-03': 'Fuel Type',
        '5C-04': 'Unit of Measure',
        '5C-05': 'Quantity',
        '5C-06': 'Unit Cost',
        '5C-07': 'Gross Fuel Price',
        '5C-08': 'Net Fuel Price',
        '5C-09': 'Gross Non-Fuel Price',
        '5C-10': 'Estimated Km/Miles Added',
        '5C-11': 'Carbon Footprint',
        '5C-12': 'Estimated Vehicle Km/Miles Available',
        '5C-13': 'Local Tax Included',
        '5C-14': 'Local Tax',
        '5C-15': 'National Tax Included',
        '5C-16': 'National Tax',
        '5C-17': 'Other Tax',
        '5C-18': 'Merchant VAT Registration/Single Business Reference Number',
        '5C-19': 'Customer VAT Registration Number',
        '5C-0A': 'Net Non-Fuel Price',
        '5C-0B': 'Odometer Reading',
        '5C-0C': 'Charging Power Output Capacity',
        '5C-0D': 'Charging Reason Code',
        '5C-0E': 'VAT/Tax Rate',
        '5C-0F': 'Miscellaneous Fuel Tax Exemption Status',
        '5C-1A': 'Customer Reference Number',
        '5C-1B': 'Message Identifier',
        '5C-1C': 'Additional Data Indicator',
        '5C-1D': 'Maximum Power Dispensed',
        '5C-1E': 'Summary Commodity Code',
        '5C-1F': 'Non-Fuel Product Code 1',
        '5C-1F02': 'Non-Fuel Product Code 2',
        '5C-1F03': 'Non-Fuel Product Code 3',
        '5C-1F04': 'Non-Fuel Product Code 4',
        '5C-1F05': 'Non-Fuel Product Code 5',
        '5C-1F06': 'Non-Fuel Product Code 6',
        '5C-1F07': 'Non-Fuel Product Code 7',
        '5C-1F08': 'Non-Fuel Product Code 8',
        '5C-1F09': 'Fuel Brand',
        '5C-1F0A': 'Fuel Transaction Validation Results',
        '5C-1F0B': 'Fuel Acceptance Mode',
        '5C-1F10': 'Expanded Fuel Type',
        '5C-1F11': 'Fleet Employee Number',
        '5C-1F12': 'Fleet Trailer Number',
        '5C-1F13': 'Fleet Additional Prompted Data 1',
        '5C-1F14': 'Fleet Additional Prompted Data 2',
        '5C-1F27': 'Connector Type',
        '5C-1F28': 'Discount Method',
        '5C-1F29': 'Discount Agent',
        '5C-1F2A': 'Discount Plan ID',
        '5C-1F2B': 'Client ID',
        '5C-1F2C': 'National Tax Rate',
        '5C-1F2D': 'Other Tax Included',
        '5C-1F2E': 'Other Tax Rate',
        '5D-01': 'Total Installment Amount',
        '5D-02': 'Installment Payment Currency',
        '5D-03': 'Number of Installments',
        '5D-04': 'Amount of Each Installment',
        '5D-51': 'Installment Payment Number',
        '5D-62': 'Frequency of Installments',
        '5D-73': 'Date of First Installment',
        '5D-08': 'Total Amount Funded',
        '5D-09': 'Percent of Amount Requested',
        '5D-0A': 'Total Expenses',
        '5D-0B': 'Percent of Total Expenses',
        '5D-0C': 'Total Fees',
        '5D-0D': 'Percent of Total Fees',
        '5D-0E': 'Total Taxes',
        '5D-0F': 'Percent of Total taxes',
        '5D-10': 'Total Insurance',
        '5D-11': 'Percent of Total Insurance',
        '5D-12': 'Total Other Costs',
        '5D-13': 'Percent of Total Other Costs',
        '5D-14': 'Monthly Interest Rates',
        '5D-15': 'Annual Interest Rate',
        '5D-16': 'Annual Total Cost of Financing',
        '5D-17': 'Installment Payment Type',
        '5D-18': 'Grace Period',
        '5D-19': 'Installment Payment Interest',
        '5D-1A': 'VAT for Installment Payment Interest',
        '5D-80': 'Plan Owner',
        '5D-82': 'Plan Registration System Identifier',
        '5F-01': 'Sender Reference Number',
        '5F-02': 'Sender Account Number',
        '5F-03': 'Sender Name',
        '5F-04': 'Sender Address',
        '5F-05': 'Sender City',
        '5F-06': 'Sender State',
        '5F-07': 'Sender Country',
        '5F-08': 'Source of Funds',
        '5F-09': 'Claim Code',
        '5F-0A': 'Recipient Name',
        '5F-0B': 'Confirmation Number',
        '5F-0C': 'Recipient City',
        '5F-0D': 'Recipient Country',
        '5F-0E': 'Proprietary Amount Type',
        '5F-0F': 'Proprietary Amount',
        '5F-10': 'Sender Postal Code',
        '60-01': 'Fare Basis Code-Leg 1',
        '60-02': 'Fare Basis Code-Leg 2',
        '60-03': 'Fare Basis Code-Leg 3',
        '60-04': 'Fare Basis Code-Leg 4',
        '60-05': 'Computerized Res System',
        '60-06': 'Flight Number-Leg 1',
        '60-07': 'Flight Number-Leg 2',
        '60-08': 'Flight Number-Leg 3',
        '60-09': 'Flight Number-Leg 4',
        '60-0A': 'Credit Reason Indicator',
        '60-0B': 'Ticket Change Indicator',
        '61-01': 'Days Rented',
        '61-02': 'Daily Rental Rate',
        '61-03': 'Weekly Rental Rate',
        '61-04': 'Insurance Charges',
        '61-05': 'Fuel Charges',
        '61-06': 'Car Class Code',
        '61-07': 'One-Way Drop-Off Charges',
        '61-08': 'Renter Name',
        '62-01': 'Daily Room Rate',
        '62-02': 'Total Tax',
        '62-03': 'Prepaid Expenses',
        '62-04': 'Food/Bev Charges',
        '62-05': 'Folio Cash Advances',
        '62-06': 'Room Nights',
        '62-07': 'Total Room Tax',
        '63-01': 'Local Tax Indicator',
        '63-02': 'Local Tax',
        '63-03': 'National Tax Indicator',
        '63-04': 'National Tax',
        '63-05': 'Merchant VAT Registration/Single Business Reference Number',
        '63-06': 'Customer VAT Registration Number',
        '63-07': 'Summary Commodity Code',
        '63-08': 'Other Tax',
        '63-09': 'Message Identifier',
        '63-0A': 'Time of Purchase',
        '63-0B': 'Customer Reference Number',
        '63-13': 'Merchant Postal Code',
        '63-15': 'Additional Data Indicator',
        '63-80': 'Merchant Reference Number',
        '63-82': 'VAT Documentation Indicator',
        '64-01': 'Compromised Account Risk Condition Code (CARCC)',
        '64-02': 'VAA Risk Score',
        '65-01': 'n/a',
        '65-02': 'Client-defined data',
        '65-03': 'Mastercard Data Element DE121-Authorizing Agent ID Code',
        '65-04': 'Mastercard Data Element DE48, Subelement 23- Payment Initiation Channel',
        '65-05': 'Mastercard Data Element DE48, Subelement 95- Promotion Code',
        '65-06': 'Mastercard Data Element DE112',
        '65-07': 'Mastercard Data Element DE48, Subelement 32- Mastercard Assigned ID',
        '65-09': 'Mastercard Data Element DE48, Subelement 64- Transit Program',
        '65-11': 'Mastercard Data Element DE54',
        '65-12': 'Mastercard Data Element DE48, Subelement 61, Subfield 5',
        '65-13': 'Mastercard Data Element DE61, Subelement 11',
        '65-14': 'Mastercard Data Element DE48, Subelement 74, Subfield 1, Subfield 2',
        '65-15': 'Mastercard Data Element DE48, Subelement 42- Electronic Commerce Indicators, Subfield 1 (Electronic Commerce Security Level Indicator and UCAF Collection Indicator), position 2',
        '65-16': 'Mastercard Data Element DE61, Subfield 3',
        '65-18': 'Mastercard Data Element DE48, Subelement 57, Subfield 1, Subfield 2',
        '65-19': 'Mastercard Data Element DE48, Subelement 65- Terminal Compliant Indicator, Subfield 1 (Terminal Line Encryption), Subfield 2 (UKPT/DUKPT Compliant)',
        '65-20': 'Mastercard Data Element DE48, Subelement 48- Mobile Program Indicators, Subfield 2 (Mastercard Mobile Remote Payment Transaction Types)',
        '65-21': 'Mastercard Data Element DE48, Subelement 37- Mastercard Mobile Remote Payment Transaction Types, Subfield 1 (Payment Facilitator ID), Subfield 2 (Independent Sales Organization ID), Subfield 3 (Sub-Merchant ID)',
        '65-22': 'Mastercard Data Element DE48, Subelement 17',
        '65-23': 'Reserved',
        '65-24': 'Mastercard Data Element DE22, Subelement 1',
        '65-25': 'Mastercard Data Element DE48, Subelement 33, Subfield 5',
        '65-26': 'Mastercard Data Element DE48, Subelement 33, Subfield 6',
        '65-28': 'Mastercard Data Element (DE) 48, Subelement 52',
        '65-29': 'Mastercard Data Element (DE) 61, Subelement 7',
        '65-30': 'Mastercard Data Element (DE) 48, Subelement 61, Subfield 4',
        '65-31': 'Mastercard Data Element (DE) 48, Subelement 55, Subfield 1, Subfield 2',
        '65-32': 'Mastercard Data Element (DE) 48, Subelement 77',
        '65-33': 'Mastercard Data Element (DE) 48, Subelement 14',
        '65-34': 'Mastercard Data Element (DE) 48, Subelement 14',
        '65-35': 'Mastercard Data Element DE48, Subelement 53, Subfield 1 (E-ID Request Value)',
        '65-36': 'Mastercard Data Element DE48, Subelement 21',
        '65-37': 'Mastercard Data Element DE48, Subelement 66',
        '65-38': 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 01 (Low-Risk Merchant Indicator)',
        '65-39': 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 02 (Single tap indicator)',
        '65-40': 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 03 (Response to PIN request)',
        '65-41': 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 04 (Issuer PIN request in a single tap mode)',
        '65-42': 'Acquiring Institution ID Code',
        '65-43': 'Digital Secure Remote Payment (DSRP) (Token) Cryptogram',
        '65-44': 'Remote Commerce Acceptor Identifier',
        '65-46': 'Mastercard Data Element DE48, Subelement 03, Subfield 04 (Merchant Country of Origin Indicator)',
        '65-47': 'Mastercard Data Element DE48, Subelement 24',
        '65-48': 'Data Element (DE) 39 and Data Element (DE) 48, Subelement 84 — Merchant Advice Code',
        '65-49': 'Data Element (DE) 48, Subelement 22, Subfield 05 - Cardholder/Merchant Initiated Transaction Indicator',
        '65-51': 'Mastercard Data Element DE108, Subelement 3, Subfield 01 (Sender Reference Number)',
        '65-56': 'Mastercard Data Element DE48, Subelement 37, Subfield 05 (Merchant Payment Gateway ID)',
        '65-0A': 'Mastercard Data Element DE39, Value 34 (Suspect fraud)',
        '65-0B': 'Mastercard Data Element DE48, Subelement 18- Service Parameters, Subfield 1 (Canada Domestic Indicator)',
        '65-0C': 'Mastercard Data Element DE48, Subelement 26-Wallet Program Data, Subfield 1 Wallet Identifier)',
        '65-0D': 'Mastercard Data Element DE123 Receipt Free Text',
        '65-0E': 'Mastercard Data Element DE48, Subelement 25- Prepaid Activation/Load, Subfield 1 (Message Identifier)',
        '65-0F': 'Mastercard Data element DE48',
        '66-01': 'American Express Data Field (DF) 48, Additional Data ',
        '66-05': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-06': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-07': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-08': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-09': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-10': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-11': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-12': 'American Express Data Field (DF) 22, POS Data Code, position 4',
        '66-13': 'MCIT Indicator',
        '66-14': 'American Express Data Element DE 112, Subelement 001- Payment Account Reference',
        '66-15': 'American Express Data Field 113, Subfield 5',
        '66-16': 'American Express Data Field 60, Subfield 8',
        '66-17': 'Indirect Model Type Indicator',
        '66-0A': 'American Express Data Field 22, Subfield 5',
        '66-0B': 'Not applicable',
        '66-0C': 'Seller ID',
        '66-0D': 'American Express Data Field 60, Subfield 6',
        '66-0E': 'Not applicable',
        '66-0F': 'American Express Data Field 60, Subfield 5',
        '67-01': 'Country Code',
        '67-02': 'Installment',
        '67-03': 'Consumer Deferred Sale',
        '67-04': 'POS Web',
        '67-05': 'Installment Inquiry Response',
        '67-06': 'Issuer Installments',
        '67-80': 'Type of Installment',
        '67-81': 'Number of Installments',
        '67-82': 'Amount of Each Installment',
        '67-83': 'Transaction Rate',
        '67-84': 'Deferred Period ID',
        '67-85': 'Amount of Installments 1',
        '67-86': 'Transaction Rate 1',
        '67-87': 'Deferred Period ID 1',
        '67-88': 'Amount of Installments 2',
        '67-89': 'Transaction Rate 2',
        '67-90': 'Deferred Period ID 2',
        '67-91': 'Amount of Installments 3',
        '67-92': 'Transaction Rate 3',
        '67-93': 'Deferred Period ID 3',
        '67-94': 'Simulation Flag',
        '67-95': 'Gracia Flag',
        '67-96': 'Deferred Flag',
        '67-97': 'Domestic E-commerce Tool',
        '67-98': 'Domestic E-commerce Tool Data',
        '69-01': 'Number of Payment Forms',
        '6C-01': 'Travel Tag Codes',
        '6D-01': 'Authentication Alert',
        '6E-01': 'Cardholder Tax ID Type',
        '6E-02': 'Cardholder Tax ID',
        '6E-03': 'Asset Indicator',
        '6E-04': 'Loan Type',
        '6E-05': 'Merchant Program Identifier',
        '70-01': 'Transaction Statement 1',
        '70-02': 'Transaction Statement 2',
        '70-03': 'Transaction Statement 3',
        '70-04': 'Transaction Statement 4',
        '70-05': 'Transaction Statement 5',
        '71-01': 'Free-form data',
    };

    let pos = 0;
    const rows = [];

    while (pos + 6 <= hex104.length) {
        const datasetId = hex104.substr(pos, 2);
        pos += 2;
        const datasetLen = parseInt(hex104.substr(pos, 4), 16);
        pos += 4;
        const datasetEnd = pos + datasetLen * 2;

        const datasetLabel = datasetId;
        rows.push(`<tr><td colspan="4" style="background:#f1f3f5;font-weight:600">
            Dataset ${datasetId} – ${datasetLabel} (${datasetLen} bytes)
        </td></tr>`);

        while (pos + 6 <= datasetEnd) {
            const tagFirst = hex104.substr(pos, 2);
            let tagLen = (tagFirst === '9F' || tagFirst === 'CF' || tagFirst === 'DF') ? 4 : 2;
            let tag = hex104.substr(pos, tagLen);

            if (tagLen === 4 && !map[`${datasetId}-${tag}`]) {
                tagLen = 2;
                tag = hex104.substr(pos, 2);
            }
            pos += tagLen;

            const len = parseInt(hex104.substr(pos, 2), 16);
            pos += 2;

            const valueHex = hex104.substr(pos, len * 2);
            pos += len * 2;

            const key = `${datasetId}-${tag}`;
            const desc = map[key] || `Tag-${tag} (fora do padrão)`;
            let valueTxt = '';
            if (valueHex.charAt(0) === 'F') {
                valueTxt = ebcdicToAscii(valueHex);
            }
            rows.push(`
                <tr>
                    <td>104.${datasetLabel}-${tag}</td>
                    <td>${desc}</td>
                    <td>${len}</td>
                    <td class="multi-line">${valueHex}<br>${valueTxt}</td>
                </tr>`);
        }
    }
    return rows.join('');
}

function decodeDE120Dataset(hex120) {
    const map = {
	    '01-80': { name: 'Settlement Service ID', format: 'n' },	
	    '01-81': { name: 'Settlement Date (CPD)', format: 'n' },	
	    '01-82': { name: 'Cut-off Time (GMT)', format: 'n' },	
	    '01-83': { name: 'Settlement Reporting Entity (SRE) ID', format: 'n' },	
	    '01-84': { name: 'Settlement Currency Code', format: 'n' },	
	    '01-85': { name: 'Settlement Currency Minor Unit', format: 'n' },	
	    '01-86': { name: 'Settlement Position Sign', format: 'n' },	
	    '01-87': { name: 'Settlement Position Amount', format: 'n' },	
	    '01-88': { name: 'Position Type', format: 'n' },	
	    '56-01': { name: 'Device IMEI', format: 'n' },	
	    '56-02': { name: 'OS ID', format: 'n' },	
	    '56-03': { name: 'Provisioning attempts on the device', format: 'n' },	
	    '56-04': { name: 'Account-to-device bonding age', format: 'n' },	
	    '56-05': { name: 'Device country', format: 'n' },	
	    '56-06': { name: 'Token protection method', format: 'n' },	
	    '56-07': { name: 'Presentation type', format: 'n' },	
	    '56-08': { name: 'Device serial number', format: 'n' },	
	    '56-09': { name: 'Location source', format: 'n' },	
	    '56-0A': { name: 'Device time zone', format: 'n' },	
	    '56-0B': { name: 'Device time zone setting', format: 'n' },	
	    '56-0C': { name: 'Device bluetooth media access control (MAC)', format: 'n' },	
	    '56-0D': { name: 'OS type', format: 'n' },	
	    '57-01': { name: 'Wallet provider PAN age', format: 'n' },	
	    '57-02': { name: 'User account age', format: 'n' },	
	    '57-03': { name: 'Wallet account age', format: 'n' },	
	    '57-04': { name: 'Days since last activity', format: 'n' },	
	    '57-05': { name: 'Number of transactions, last 12 months', format: 'n' },	
	    '57-06': { name: 'Days since last account change', format: 'n' },	
	    '57-07': { name: 'Suspended cards in account', format: 'n' },	
	    '57-08': { name: 'Wallet account country', format: 'n' },	
	    '57-09': { name: 'Number of active tokens', format: 'n' },	
	    '57-0A': { name: 'Number of devices with active tokens', format: 'n' },	
	    '57-0B': { name: 'Number of active tokens on all devices', format: 'n' },	
	    '57-0C': { name: 'Consumer entry mode', format: 'n' },	
	    '57-80': { name: 'Wallet account email address age', format: 'n' },	
	    '57-81': { name: 'Wallet provider phone score', format: 'n' },	
	    '57-01': { name: 'PAN Issued Date', format: 'n' },	
	    '57-02': { name: 'PAN Activation Date', format: 'n' },	
	    '57-80': { name: 'Original Token', format: 'n' },	
	    '57-81': { name: 'Original Token Assurance Method', format: 'n' },	
	    '57-82': { name: 'Original Token Requestor ID', format: 'n' },	
	    '57-83': { name: 'Original Token Reference', format: 'n' },	
	    '57-84': { name: 'Original Token Type', format: 'n' },	
	    '57-85': { name: 'Original Token Device Type', format: 'n' },	
	    '57-86': { name: 'Original Device ID', format: 'n' }
    };

    let pos = 0;
    const rows = [];

    while (pos + 6 <= hex120.length) {
        const datasetId = hex120.substr(pos, 2);
        pos += 2;
        const datasetLen = parseInt(hex120.substr(pos, 4), 16);
        pos += 4;
        const datasetEnd = pos + datasetLen * 2;

        const datasetLabel = datasetId;
        rows.push(`<tr><td colspan="4" style="background:#f1f3f5;font-weight:600">
            Dataset ${datasetId} – ${datasetLabel} (${datasetLen} bytes)
        </td></tr>`);

        while (pos + 6 <= datasetEnd) {
            const tagFirst = hex120.substr(pos, 2);
            let tagLen = (tagFirst === '9F' || tagFirst === 'CF' || tagFirst === 'DF') ? 4 : 2;
            let tag = hex120.substr(pos, tagLen);

            if (tagLen === 4 && !map[`${datasetId}-${tag}`]) {
                tagLen = 2;
                tag = hex120.substr(pos, 2);
            }
            pos += tagLen;

            const len = parseInt(hex120.substr(pos, 2), 16);
            pos += 2;

            const valueHex = hex120.substr(pos, len * 2);
            pos += len * 2;

            const key = `${datasetId}-${tag}`;
            const desc = map[key] || `Tag-${tag} (fora do padrão)`;
            let valueTxt = '';
            if (valueHex.charAt(0) === 'F') {
                valueTxt = ebcdicToAscii(valueHex);
            }
            rows.push(`
                <tr>
                    <td>120.${datasetLabel}-${tag}</td>
                    <td>${desc}</td>
                    <td>${len}</td>
                    <td class="multi-line">${valueHex}<br>${valueTxt}</td>
                </tr>`);
        }
    }
    return rows.join('');
}

function decodeDE123Dataset(hex123) {
    const map = {
        '66-C0': { name: 'Postal Code', format: 'n' },
        '66-CF': { name: 'Street Address', format: 'n' },
        '66-D0': { name: 'Compressed AVS Data', format: 'n' },
        '66-D4': { name: 'Cardholder Name', format: 'n' },
        '66-D6': { name: 'Cardholder Shipping Hash', format: 'n' },

        '67-03': { name: 'Result', format: 'n' },
        '67-04': { name: 'Active Account Management Velocity Checking Result', format: 'n' },
        '67-05': { name: 'Cardholder Verification Methods Identified by Cardholder Device', format: 'b' },
        '67-07': { name: 'Issuer Special Condition Code', format: 'n' },
        '67-08': { name: 'Token Verification Result Code', format: 'n' },
        '67-84': { name: 'Other Phone Number Verification Result', format: 'n' },
        '67-85': { name: 'Other Email Address Verification Result', format: 'n' },

        '68-01': { name: 'Token', format: 'n' },
        '68-02': { name: 'Token Assurance Method', format: 'n' },
        '68-03': { name: 'Token Requestor ID', format: 'n' },
        '68-04': { name: 'Primary Account Number, Account Range', format: 'n' },
        '68-05': { name: 'Token Reference ID', format: 'n' },
        '68-06': { name: 'Token Expiration Date', format: 'n' },
        '68-07': { name: 'Token Type', format: 'n' },
        '68-08': { name: 'Token Status', format: 'n' },
        '68-0B': { name: 'PAN Reference ID', format: 'n' },
        '68-0A': { name: 'Last Updated By', format: 'n' },
        '68-10': { name: 'Visa Token Score', format: 'n' },
        '68-11': { name: 'Visa Token Decisioning', format: 'n' },
        '68-12': { name: 'Number of Active Tokens', format: 'n' },
        '68-13': { name: 'Number of Inactive Tokens', format: 'n' },
        '68-14': { name: 'Number of Suspended Tokens', format: 'n' },
        '68-80': { name: 'Bound Device Index', format: 'n' },
        '68-81': { name: 'Token User Identifier', format: 'n' },
        '68-82': { name: 'Token User Application Type', format: 'n' },
        '68-83': { name: 'Token Authentication Factor A', format: 'n' },
        '68-86': { name: 'Token Requestor - TSP ID', format: 'n' },
        '68-88': { name: 'Token Expiration Date', format: 'n' },
        '68-89': { name: 'Token Status', format: 'n' },
        '68-0B': { name: 'PAN Reference ID', format: 'n' },
        '68-0D': { name: 'Auto Fill Indicator', format: 'n' },
        '68-0E': { name: 'Token VDCU Update First Use Indicator', format: 'n' },
        '68-0F': { name: 'PAN/Token Update Channel', format: 'n' },
        '68-1A': { name: 'Activation Code', format: 'n' },
        '68-1B': { name: 'Activation Code Expiry Date/Time', format: 'n' },
        '68-1C': { name: 'Activation Code Verification Attempts', format: 'n' },
        '68-1D': { name: 'Number of Activation Codes Issued', format: 'n' },
        '68-1E': { name: 'Token activation date/time', format: 'n' },
        '68-1F31': { name: 'Elapsed Time To Live', format: 'n' },
        '68-1F321': { name: 'Count of Number of Transactions', format: 'n' },
        '68-1F331': { name: 'Cumulative transaction Amount', format: 'n' },
        '68-1F35': { name: 'Total Number of Tokens for Token Inquiry Criteria', format: 'n' },
        '68-1F37': { name: 'Issuer Custom Data for File Control Information (FCI) Template', format: 'n' },
        '68-1F38': { name: 'Issuer Custom Data for Issuer Application Data (IAD)', format: 'n' },
        '68-1F7F': { name: 'PAN Expiration Date', format: 'n' }
    };

    let pos = 0;
    const rows = [];

    while (pos + 6 <= hex123.length) {
        const datasetId = hex123.substr(pos, 2);
        pos += 2;
        const datasetLen = parseInt(hex123.substr(pos, 4), 16);
        pos += 4;
        const datasetEnd = pos + datasetLen * 2;

        const datasetMap = {
            66: 'Verification Data',
            67: 'Activation Verification Data',
            68: 'Token Data',
            69: 'Account Lookup Results',
            70: 'Customer ID Data Verification Result'
        };

        const datasetLabel = datasetMap[datasetId] || `Dataset ${datasetId}`;

        rows.push(`<tr><td colspan="4" style="background:#f1f3f5;font-weight:600">
            Dataset ${datasetId} – ${datasetLabel} (${datasetLen} bytes)
        </td></tr>`);



        while (pos + 6 <= datasetEnd) {

            const tagFirst = hex123.substr(pos, 2);
            let tagLen = (tagFirst === '9F' || tagFirst === 'CF' || tagFirst === 'DF') ? 4 : 2;
            let tag = hex123.substr(pos, tagLen);

            if (tagLen === 4 && !map[`${datasetId}-${tag}`]) {
                tagLen = 2;
                tag = hex123.substr(pos, 2);
            }
            pos += tagLen;

            const len = parseInt(hex123.substr(pos, 2), 16);
            pos += 2;

            const valueHex = hex123.substr(pos, len * 2);
            let pos1 = pos;
            pos += len * 2;

            const key = `${datasetId}-${tag}`;
            const desc = map[key].name || `Tag-${tag} (fora do padrão)`;

            let valueTxt = '';
            if (valueHex.charAt(0) === 'F' || ['CF', 'D4', '0B', '05', '02'].includes(tag)) {
                valueTxt = ebcdicToAscii(valueHex);
            }
            if (map[key].format === 'b') {
                const byteHex = hex123.substr(pos1, 2);

                const bits = Array.from(byteHex)           // cada nibble
                    .map(h => parseInt(h, 16).toString(2).padStart(4, '0'))
                    .join('');                              // 32 bits (mas só 8 nos interessam)

                const used = [];
                if (bits[0] === '1') used.push('Unknown');
                if (bits[1] === '1') used.push('None');
                if (bits[2] === '1') used.push('Signature');
                if (bits[3] === '1') used.push('Online PIN');
                if (bits[4] === '1') used.push('Passcode');
                if (bits[5] === '1') used.push('Device code');
                if (bits[6] === '1') used.push('Fingerprint');
                if (bits[7] === '1') used.push('Device pattern');

                valueTxt = used.length ? used.join(', ') : 'Nenhum';
            }
            rows.push(`
                <tr>
                    <td>123.${datasetId}-${tag}</td>
                    <td>${desc}</td>
                    <td>${len}</td>
                    <td class="multi-line">${valueHex}<br>${valueTxt}</td>
                </tr>`);
        }
    }
    return rows.join('');
}

function decodeDE125Dataset(hex125) {
    const map = {
        '01-01': 'Device Type',
        '01-02': 'Device Language Code',
        '01-03': 'Device ID',
        '01-04': 'Device Number',
        '01-05': 'Device Name',
        '01-06': 'Device Location',
        '01-07': 'IP Address',
        '02-03': 'Wallet Provider Risk Assessment',
        '02-04': 'Wallet Provider Risk Assessment Version',
        '02-05': 'Wallet Provider Device Score',
        '02-06': 'Wallet Provider Account Score',
        '02-07': 'Wallet Provider Reason Codes',
        '02-08': 'PAN Source',
        '02-09': 'Wallet Account ID',
        '02-0A': 'Wallet Account E-mail Address',
        '02-80': 'Overall Assessment',
        '03-03': 'Original Transaction Identifier',
        '03-80': 'Original Transaction Date Time',
        '03-81': 'Original Purchase Identifier',
        '03-82': 'Original POS Environment',
        '03-83': 'Original POS Entry Mode',
        '03-84': 'Original POS Condition Code',
        '03-85': 'Original Response Code',
        '03-86': 'Original Additional Authorization Indicators',
        '03-87': 'Original Delegated Authentication Indicator',
        '03-88': 'Original CAVV Results Code',
        '03-89': 'Original CVV2/dCVV2 Results Code',
        '03-8A': 'Original AVS Results Code',
        '03-8B': 'Original Card Authentication Results Code',
        '03-8C': 'Original CVV/dCVV Results Code',
        '03-8D': 'Original Token VerificationVerification Result',
        '03-8E': 'Original Cardholder ID Method',
        '03-8F': 'Original CDCVM',
        '03-90': 'Total Number of Original Transaction Details',
        '67-D0': 'MagnePrint Data',
        '69-80': 'Internal Transfer Pricing',
        '69-81': 'Number of Settlement Positions',
        '70-01': 'Transaction Statement 1',
        '70-02': 'Transaction Statement 2',
        '70-03': 'Transaction Statement 3',
        '70-04': 'Transaction Statement 4',
        '70-05': 'Transaction Statement 5',
        '6B-0D': 'Purchase Restriction Flag',
        '6B-0E': 'Host-Based Purchase Restrictions',
    };

    let pos = 0;
    const rows = [];

    while (pos + 6 <= hex125.length) {
        const datasetId = hex125.substr(pos, 2);
        pos += 2;
        const datasetLen = parseInt(hex125.substr(pos, 4), 16);
        pos += 4;
        const datasetEnd = pos + datasetLen * 2;

        const datasetLabel = datasetId;
        rows.push(`<tr><td colspan="4" style="background:#f1f3f5;font-weight:600">
            Dataset ${datasetId} – ${datasetLabel} (${datasetLen} bytes)
        </td></tr>`);

        while (pos + 6 <= datasetEnd) {
            const tagFirst = hex125.substr(pos, 2);
            let tagLen = (tagFirst === '9F' || tagFirst === 'CF' || tagFirst === 'DF') ? 4 : 2;
            let tag = hex125.substr(pos, tagLen);

            if (tagLen === 4 && !map[`${datasetId}-${tag}`]) {
                tagLen = 2;
                tag = hex125.substr(pos, 2);
            }
            pos += tagLen;

            const len = parseInt(hex125.substr(pos, 2), 16);
            pos += 2;

            const valueHex = hex125.substr(pos, len * 2);
            pos += len * 2;

            const key = `${datasetId}-${tag}`;
            const desc = map[key] || `Tag-${tag} (fora do padrão)`;

            let valueTxt = '';
            if (valueHex.charAt(0) === 'F' || ['CF', 'D4', '0B', '05', '02'].includes(tag)) {
                valueTxt = ebcdicToAscii(valueHex);
            } else {
                valueTxt = hexToAscii(valueHex);
            }

            rows.push(`
                <tr>
                    <td>125.${datasetLabel}-${tag}</td>
                    <td>${desc}</td>
                    <td>${len}</td>
                    <td class="multi-line">${valueHex}<br>${valueTxt}</td>
                </tr>`);
        }
    }
    return rows.join('');
}

function fillDE126Table() {
    const container = document.getElementById('de126Detail');
    if (!container) return '';

    const tbody = container.querySelector('tbody');
    tbody.innerHTML = '';
    let pos = 2;
    const first = parseInt(de126Hex.substr(pos, 2), 16);
    const extended = (first & 0x80) !== 0;
    const bmpHexLen = extended ? 16 : 16;
    const bmpHex = de126Hex.substr(pos, bmpHexLen);
    pos += bmpHexLen;
    const bits = [];
    for (let i = 0; i < bmpHexLen; i += 2) {
        bits.push(...hexToBin(bmpHex.substr(i, 2), 8).split(''));
    }

    const map = {
        0: { name: 'Field 126 Bitmap', size: 16, format: 'n' },
        5: { name: 'Visa Merchant Identifier', size: 16, format: 'e' },
        6: { name: 'Cardholder Certificate Serial Number', size: 32, format: 'n' },
        7: { name: 'Merchant Certificate Serial Number', size: 32, format: 'n' },
        8: { name: 'transaction Id(XID)', size: 40, format: 'n' },
        9: { name: 'CAVV Data', size: 40, format: 'n' },
        10: { name: 'CVV2 Authorization Request Data and American Express CID Datar', size: 12, format: 'e' },
        12: { name: 'Service Indicators', size: 6, format: 'n' },
        13: { name: 'POS Environment', size: 2, format: 'e' },
        15: { name: 'Mastercard UCAF Collection Indicator', size: 2, format: 'n' },
        16: { name: 'Mastercard UCAF Field', size: 66, format: 'n' },
        18: { name: 'Agent Unique Account Result', size: 24, format: 'n' },
        19: { name: 'Dynamic Currency Conversion Indicator', size: 2, format: 'e' },
        20: { name: '3-D Secure Indicator', size: 2, format: 'e' },
    };

    for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        if (bits[bitIndex] !== '1') continue;
        const sub = bitIndex + 1;
        const cfg = map[sub];
        if (!cfg) continue;
        const hexVal = de126Hex.substr(pos, cfg.size);
        const txtVal = cfg.format === 'e' ? ebcdicToAscii(hexVal) : hexToAscii(hexVal);

        const fieldName = cfg.name;
        const hexLine = hexVal;
        const ebcdicLine = cfg.format === 'e' ? txtVal : '';

        const singleBlock = `
                <span class="fld-name">${hexLine}</span><br>
                ${ebcdicLine}`;

        const row = `
            <tr>
                <td>126.${sub}</td>
                <td>${cfg.name}</td>
                <td>${cfg.size / 2}</td>
                    <td class="multi-line">${singleBlock}</td>
            </tr>`;
        tbody.innerHTML += row;
        pos += cfg.size;
    }
}


// ========== CONVERSÕES ==========
function ebcdicToAscii(hex) {
    const map = {
        'F0': '0', 'F1': '1', 'F2': '2', 'F3': '3', 'F4': '4',
        'F5': '5', 'F6': '6', 'F7': '7', 'F8': '8', 'F9': '9',
        'C1': 'A', 'C2': 'B', 'C3': 'C', 'C4': 'D', 'C5': 'E',
        'C6': 'F', 'C7': 'G', 'C8': 'H', 'C9': 'I',
        'D1': 'J', 'D2': 'K', 'D3': 'L', 'D4': 'M', 'D5': 'N',
        'D6': 'O', 'D7': 'P', 'D8': 'Q', 'D9': 'R',
        'E2': 'S', 'E3': 'T', 'E4': 'U', 'E5': 'V', 'E6': 'W',
        'E7': 'X', 'E8': 'Y', 'E9': 'Z',
        '40': ' ', '4B': '.', '4C': '<', '4D': '(', '4E': '+', '50': '&',
        '5A': '!', '5B': '$', '5C': '*', '5D': ')', '5E': ';', '5F': '¬',
        '60': '-', '61': '/', '6B': ',', '6C': '%', '6D': '_', '6E': '>',
        '6F': '?', '7A': ':', '7B': '#', '7C': '@', '7D': "'", '7E': '=',
        '81': 'a', '82': 'b', '83': 'c', '84': 'd', '85': 'e',
        '86': 'f', '87': 'g', '88': 'h', '89': 'i',
        '91': 'j', '92': 'k', '93': 'l', '94': 'm', '95': 'n',
        '96': 'o', '97': 'p', '98': 'q', '99': 'r',
        'A2': 's', 'A3': 't', 'A4': 'u', 'A5': 'v', 'A6': 'w',
        'A7': 'x', 'A8': 'y', 'A9': 'z'
    };

    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const byte = hex.substr(i, 2).toUpperCase();
        str += map[byte] || '?';
    }
    return str;
}

function hexToAscii(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        if (code >= 32 && code <= 126) str += String.fromCharCode(code);
        else str += '.';
    }
    return str;
}

function bcdToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        str += byte.toString(10).padStart(2, '0');
    }
    return str;
}

// clique NA SETA abre/fecha
document.addEventListener('click', e => {
    if (!e.target.closest('.expand-btn')) return;
    e.preventDefault();
    const btn = e.target.closest('.expand-btn');
    const targetId = btn.dataset.target;
    const container = document.getElementById(targetId);
    if (!container) return;

    const isOpen = container.style.display === 'block';
    container.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('open', !isOpen);
    btn.querySelector('.arrow').textContent = isOpen ? '▶' : '▼';

    // preenche só 1ª vez
    const de = btn.dataset.de;
    const tbody = container.querySelector('tbody');
    /*if (!tbody.dataset.filled) {
        tbody.innerHTML = window['decodeDE' + de + 'Dataset'](window['de' + de + 'Hex']);
        tbody.dataset.filled = '1';
    }*/
});

window.decodeISO8583 = decodeISO8583;   