import { 
    NETWORK_OVERRIDES,
    NETWORK_CONFIG
}  from '../config/network.js';
import { parseDE } from './parse-de.js';
import { hexToBits } from './bitmaps.js';
import { buildFieldConfig } from '../config/overrides.js';


window.showDecodificarISO = function () {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Decodificador ISO 8583';
    title.style.textAlign = 'left';
    title.style.margin = '0 0 0.5rem 0';
    app.appendChild(title);

    // 1) cria o HTML
    const msgHex = document.createElement('div');
    msgHex.className = 'auto-field';
    msgHex.innerHTML = `
    <label class="label-hex">Mensagem em hexadecimal</label>
    <div class="hex-row">
        <div class="auto-field">
            <textarea 
                class="hex-input input-field textoarea-field"
                rows="1"
                placeholder="Cole aqui a mensagem completa em hexadecimal..."></textarea>
        </div>
        
        <button class="decode-btn btn-primary">Processar Mensagem</button>
    </div>

    <!-- area de resultados escondida -->
    <div class="results-area hidden">

        <div class="mti-box">
            <strong>Tipo de Mensagem (MTI):</strong>
            <span class="mti-value"></span>
        </div>

        <div class="network-box mt-2">
            <strong>Rede Detectada:</strong>
            <span class="network-value text-blue-600 font-semibold"></span>
        </div>
        <div class="bitmap-mode-box mt-1 mb-4">
            <strong>Modo de Bitmap:</strong>
            <span class="bitmap-mode-value text-green-600 font-semibold"></span>
        </div>

        <div class="bitmap-pair">
            <div>
                <h3>Bitmap Primario (64 bits)</h3>
                <div class="primary-bitmap"></div>
            </div>
            <div>
                <h3>Bitmap Secundario (64 bits)</h3>
                <div class="secondary-bitmap"></div>
            </div>
        </div>

        <table class="de-table">
            <colgroup>
                <col class="col-field-c">
                <col class="col-attr-c">
                <col class="col-value-c">
            </colgroup>
            <thead>
                <tr>
                    <th class="col-field-h">Campo</th>
                    <th class="col-attr-h">Atributo</th>
                    <th class="col-value-h">Conteudo</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <div class="detail-containers"></div>
    </div>
`;

    // 2) insere no DOM
    app.appendChild(msgHex);
    if (typeof window.initISODecoder === 'function') {
        window.initISODecoder(msgHex);
    } else {
        console.warn('initISODecoder nao disponivel no escopo global');
    }


};

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-verde text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-terra text-white'
    }`;
    notification.textContent = message;
            
    document.body.appendChild(notification);
            
    // Animação de entrada
    anime({
        targets: notification,
        opacity: [0, 1],
        translateX: [100, 0],
        duration: 300,
        easing: 'easeOutQuart'
    });
            
    setTimeout(() => {
        anime({
            targets: notification,
            opacity: [1, 0],
            translateX: [0, 100],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => notification.remove()
        });
    }, 4000);
}

// ========== FUNÇÕES AUXILIARES ==========
export function hexToBin(hex, len = 8) {
    return parseInt(hex, 16).toString(2).padStart(len, '0');
}

export function getBCDLength(hexLen) {
    // Neste projeto, o "bcd" de tamanho vem como valor binário em hex.
    // Ex.: 0x10 => 16.
    return parseInt(hexLen, 16);
}

export function getBytes(hex, state, len) {
    if (!hex) throw new Error('getBytes: hex undefined');
    const out = hex.slice(state.pos, state.pos + len * 2);
    state.pos += len * 2;
    return out;
}

// ========== CONVERSÕES ==========
export function ebcdicToAscii(hex) {
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

export function hexToAscii(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        if (code >= 32 && code <= 126) str += String.fromCharCode(code);
        else str += '.';
    }
    return str;
}

export function bcdToString(hex) {
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
    btn.querySelector('.arrow').textContent = isOpen ? '>' : 'v';

    // preenche só 1ª vez
    const de = btn.dataset.de;
    const tbody = container.querySelector('tbody');
    /*if (!tbody.dataset.filled) {
        tbody.innerHTML = window['decodeDE' + de + 'Dataset'](window['de' + de + 'Hex']);
        tbody.dataset.filled = '1';
    }*/
});

export function validateConfig(config) {
  for (const [de, c] of Object.entries(config)) {

    if (c.type === 'Fixo') {
      if (typeof c.length !== 'number')
        throw new Error(`DE ${de}: FIXO precisa de length numérico`);

      if (!c.unit)
        throw new Error(`DE ${de}: FIXO precisa de unit`);

      if (!c.format)
        throw new Error(`DE ${de}: FIXO precisa de format`);

      if (c.unit === 'digits' && c.format === 'n' && c.length % 2 !== 0)
        console.warn(`DE ${de}: número ímpar de dígitos em BCD FIXO`);
    }

    if (c.type.startsWith('LL')) {
      if (!c.length)
        throw new Error(`DE ${de}: LLVAR precisa de length (bcd|binary)`);

      if (!c.unit)
        throw new Error(`DE ${de}: LLVAR precisa de unit`);

      if (!c.format)
        throw new Error(`DE ${de}: LLVAR precisa de format`);
    }
  }
}

export function parseTLVDatase_OLD_t(field, options) {
    if (!field?.rawHex) return null;

    const hex = field.rawHex;
    let pos = 0;
    const children = [];
    const map = options?.map || {};
    const maxPos = hex.length;

    if (options?.hasFieldLengthByte) {
        const fieldTotalLen = parseInt(hex.substr(pos, 2), 16);
        pos += 2;
        if (isNaN(fieldTotalLen) || fieldTotalLen <= 0) {
            console.warn("[DE125] Comprimento do campo inv�lido");
            return { value: field.rawHex, children: [] };
        }
        // Opcional: validar se fieldTotalLen * 2 == hex.length - 2
    }

    // ?? Dataset ID fict�cio para TLV direto
    const datasetId = '00';
    const datasetEnd = hex.length;

    const parseDatasetLen = (lenHex) => {
        if (!lenHex) return 0;
        if (options?.datasetLengthType === 'bcd') return parseInt(lenHex, 10);
        return parseInt(lenHex, 16);
    };

    while (pos + 6 <= hex.length) {
        let datasetBoundary = hex.length;

        if (options?.hasDatasetLengthByte) {
            const datasetTotalLen = parseInt(hex.substr(pos, 2), 16);
            pos += 2;
            if (!datasetTotalLen || isNaN(datasetTotalLen)) break;
            datasetBoundary = Math.min(pos + (datasetTotalLen * 2), hex.length);
        }

        const datasetId = hex.substr(pos, 2);
        pos += 2;

        const datasetLen = parseDatasetLen(hex.substr(pos, 4));
        pos += 4;
        if (isNaN(datasetLen) || datasetLen < 0) break;

        const datasetEnd = Math.min(pos + (datasetLen * 2), datasetBoundary);
        
        while (pos + 4 <= datasetEnd) {
            const tag = hex.substr(pos, 2);
            const currentTag = tag; 
            pos += 2;

            // ?? VALIDA��O CR�TICA DE SEGURAN�A
            if (isNaN(len) || len <= 0 || (pos + len * 2) > maxPos) {
                console.warn(`[DE125] TLV inv�lido na pos ${pos}, tag=${tag}, len=${len}`);
                break;
            }        

            const len = parseInt(hex.substr(pos, 2), 16);
            pos += 2;
            if (isNaN(len)) break;

            const valueHex = hex.substr(pos, len * 2);
            pos += len * 2;

            if (field.de === 125) {
                // Dentro do while principal, ap�s ler datasetLen
                console.log(`[DEBUG DE125] Pos: ${pos}, DatasetID: ${datasetId}, LenRaw: ${hex.substr(pos-4, 4)}, LenCalc: ${datasetLen}, DatasetEnd: ${datasetEnd}, TotalHex: ${hex.length}`);                
            }

            if (pos > datasetEnd) {
                console.error(" TLV overflow detectado", pos, datasetEnd);
                break;
            }

            const tagKey = `${datasetId}-${tag}`;
            const cfg = map[tagKey];
            

            children.push({
                field: options?.field ? `${options?.field}.${tagKey}` : tagKey,
                datasetId,
                tag,
                name: cfg?.name || 'Unknown Tag',
                length: len,
                valueHex,
                decoded: cfg ? decodeByType(valueHex, cfg.decoder) : valueHex
            });
        }

        if (options?.hasDatasetLengthByte) {
            pos = datasetBoundary;
        }
    }

    return {
        value: field.decoded?.value ?? field.rawHex,
        children
    };
}

export function parseTLVDataset(field, options) {
    if (!field?.rawHex) return null;

    const hex = field.rawHex;
    let pos = 0;
    const children = [];
    const map = options?.map || {};
    const maxPos = hex.length;

    // ?? 1. Pular 1 byte de comprimento total do campo (se configurado)
    if (options?.hasFieldLengthByte) {
        if (pos + 2 > hex.length) return { value: field.rawHex, children: [] };
        pos += 2; // Pula o byte de length (j� sabemos que � DE125)
    }

    // ?? 2. Loop para ler m�ltiplos DATASETS at� acabar o hex
    while (pos + 3 <= maxPos) {
        // --- Ler cabe�alho do Dataset ---
        const datasetTag = hex.substr(pos, 2);
        pos += 2;

        // Length do dataset: 2 bytes BIG-ENDIAN (ex: 00 1A = 26 bytes)
        if (pos + 4 > maxPos) break;
        const datasetLen = parseInt(hex.substr(pos, 4), 16);
        pos += 4;

        if (isNaN(datasetLen) || datasetLen < 0) {
            console.warn(`[DE] Dataset length inv�lido: ${datasetLen}`);
            break;
        }

        const datasetEnd = pos + (datasetLen * 2);
        if (datasetEnd > maxPos) {
            console.warn(`[DE] Dataset ultrapassa limite: end=${datasetEnd}, max=${maxPos}`);
            break;
        }

        // --- Ler TLVs internos dentro do Dataset ---
        while (pos + 4 <= datasetEnd) {
            const tlvTag = hex.substr(pos, 2);
            pos += 2;

            const tlvLen = parseInt(hex.substr(pos, 2), 16);
            pos += 2;

            // Valida��o de seguran�a
            if (isNaN(tlvLen) || tlvLen <= 0 || (pos + tlvLen * 2) > maxPos) {
                console.warn(`[DE] TLV interno inv�lido: pos=${pos}, tag=${tlvTag}, len=${tlvLen}`);
                break;
            }

            const valueHex = hex.substr(pos, tlvLen * 2);
            pos += tlvLen * 2;

            // ?? Montar tagKey: DatasetTag-TLVTag (ex: "02-09")
            const tagKey = `${datasetTag}-${tlvTag}`;
            const cfg = map[tagKey];

            children.push({
                field: options?.field ? `${options?.field}.${tagKey}` : tagKey,
                datasetId: datasetTag,
                tag: tlvTag,
                name: cfg?.name || `Unknown Tag (${tagKey})`,
                length: tlvLen,
                valueHex,
                decoded: cfg ? decodeByType(valueHex, cfg.decoder) : valueHex
            });
        }

        // Garantir que pos esteja no fim do dataset (caso haja padding)
        pos = Math.max(pos, datasetEnd);
    }

    return {
        value: field.decoded?.value ?? field.rawHex,
        children
    };
}

function decodeByType(hex, type) {
    switch (type) {
        case 'numeric':
            if (!hex) return '';
            if (/^\d+$/.test(hex)) return hex;

            {
                const bcd = unpackBcdDigits(hex);
                if (bcd !== null) return bcd;
            }

            {
                const ascii = hexToAscii(hex);
                if (/^\d+$/.test(ascii)) return ascii;
            }

            {
                const ebcdic = ebcdicToAscii(hex);
                if (/^\d+$/.test(ebcdic)) return ebcdic;
            }

            return hex;

        case 'ebcdic':
            return ebcdicToAscii(hex);

        case 'bytes':
            return hex; // mantem bruto

        case 'bcd':
            return unpackBcdDigits(hex) ?? hex;

        case 'binary':
            return hex;

        default:
            return hex;
    }
}

function unpackBcdDigits(hex) {
    if (!hex || hex.length % 2 !== 0) return null;

    const raw = hex.toUpperCase();
    if (!/^[0-9F]+$/.test(raw)) return null;

    // Allow only filler nibble F at the very end.
    if (/F/.test(raw.slice(0, -1))) return null;

    let out = '';
    for (let i = 0; i < raw.length; i++) {
        const nibble = raw[i];
        if (nibble === 'F') {
            if (i !== raw.length - 1) return null;
            break;
        }
        out += nibble;
    }

    return out.length ? out : null;
}

function parseBitmapFromText(rawHexChunk) {
    if (!rawHexChunk) return null;
    const asEbcidic = ebcdicToAscii(rawHexChunk).toUpperCase();
    if (/^[0-9A-F]{32}$/.test(asEbcidic)) {
        return {
            primaryHex: asEbcidic.slice(0, 16),
            secondaryHex: asEbcidic.slice(16, 32),
            consumedBytes: 32
        };
    }

    const asAscii = hexToAscii(rawHexChunk).toUpperCase();
    if (/^[0-9A-F]{32}$/.test(asAscii)) {
        return {
            primaryHex: asAscii.slice(0, 16),
            secondaryHex: asAscii.slice(16, 32),
            consumedBytes: 32
        };
    }

    return null;
}

function readBitmaps(hex, state, network) {
    // Visa: s� usa modo texto se explicitamente configurado.
    if (network === 'visa' && NETWORK_CONFIG?.visa?.bitmapEncoding === 'text') {
        const probe = hex.slice(state.pos, state.pos + (32 * 2));
        const textBitmap = parseBitmapFromText(probe);
        if (textBitmap) {
            state.pos += textBitmap.consumedBytes * 2;
            const primaryBits = hexToBits(textBitmap.primaryHex);
            const secondaryBits = hexToBits(textBitmap.secondaryHex);
            return { primaryBits, secondaryBits, mode: 'text' };
        }
    }

    // Padr�o bin�rio ISO8583.
    const primaryHex = getBytes(hex, state, 8);
    const primaryBits = hexToBits(primaryHex);
    let secondaryBits = [];

    if (primaryBits[0] === '1') {
        const secondaryHex = getBytes(hex, state, 8);
        secondaryBits = hexToBits(secondaryHex);
    }

    return { primaryBits, secondaryBits, mode: 'binary' };
}

function scoreVisaDataStart(hex, pos, allBits) {
    let score = 0;
    let p = pos;

    const hasDe2 = allBits[1] === '1';
    if (hasDe2) {
        const lenHex = hex.substr(p, 2);
        if (!/^[0-9A-F]{2}$/.test(lenHex)) return Number.NEGATIVE_INFINITY;
        const len = parseInt(lenHex, 16);
        if (len < 12 || len > 19) return Number.NEGATIVE_INFINITY;
        p += 2;

        const de2Bytes = Math.ceil(len / 2);
        const de2Raw = hex.substr(p, de2Bytes * 2);
        if (de2Raw.length !== de2Bytes * 2) return Number.NEGATIVE_INFINITY;
        const de2Digits = toBcdDigits(de2Raw);
        if (!de2Digits || de2Digits.length < len) return Number.NEGATIVE_INFINITY;
        score += 20;
        p += de2Bytes * 2;
    }

    if (allBits[2] === '1') {
        const de3Raw = hex.substr(p, 6);
        const de3Digits = toBcdDigits(de3Raw);
        if (!de3Digits || !/^\d{6}$/.test(de3Digits.slice(0, 6))) return Number.NEGATIVE_INFINITY;
        score += 10;
        p += 6;
    }

    if (allBits[3] === '1') {
        const de4Raw = hex.substr(p, 12);
        const de4Digits = toBcdDigits(de4Raw);
        if (!de4Digits || !/^\d{12}$/.test(de4Digits.slice(0, 12))) return Number.NEGATIVE_INFINITY;
        score += 10;
    }

    return score;
}

function adjustVisaDataStart(hex, pos, allBits) {
    // Testa pequenos deslocamentos de byte para alinhar DE2/DE3/DE4.
    // Evita cen�rios em que existe byte intermedi�rio entre MTI/bitmap/dados.
    const candidates = [0, 2, 4, 6, 8, 10, 12, 14, 16];
    let best = { pos, score: Number.NEGATIVE_INFINITY };

    for (const shift of candidates) {
        const s = scoreVisaDataStart(hex, pos + shift, allBits);
        if (s > best.score) best = { pos: pos + shift, score: s };
    }

    return best.score > Number.NEGATIVE_INFINITY ? best.pos : pos;
}
function normalizeIncomingHex(raw) {
    const src = String(raw || '');

    // Se houver delimitadores, confia neles para n�o truncar mensagem v�lida.
    const ini = src.toUpperCase().indexOf('<INI>');
    const fin = src.toUpperCase().indexOf('<FIN>');
    let payload = src;

    if (ini >= 0 && fin > ini) {
        payload = src.slice(ini + 5, fin);
    } else if (ini >= 0) {
        payload = src.slice(ini + 5);
    }

    // Remove apenas espa�os/quebras. Mant�m conte�do �ntegro.
    payload = payload.replace(/\s+/g, '');

    // M�scaras: Mastercard costuma mascarar bytes EBCDIC inteiros com '*'.
    // Ex.: "****************" (16 bytes) precisa manter 16 bytes => "F0" por byte.
    const upper = payload.toUpperCase();
    const looksLikeMastercard = upper.startsWith('F0F1F0F0') || upper.includes('F0F1F0F0FEE7');
    if (looksLikeMastercard) {
        payload = payload.replace(/[*?]/g, 'F0');
    } else {
        // Visa/geral: mant�m comportamento atual de nibble zero.
        payload = payload.replace(/[*?]/g, '0');
    }

    // Filtra para hex ao final, sem heur�stica de corte por "duplo espa�o".
    payload = payload.replace(/[^0-9A-Fa-f]/g, '');

    return payload.toUpperCase();
}

function isEbcidicMti(hex, pos = 0) {
    const mti = hex.substr(pos, 8);
    return /^[F][0-9][F][0-9][F][0-9][F][0-9]$/.test(mti);
}

function isAsciiMti(hex, pos = 0) {
    const mti = hex.substr(pos, 8);
    return /^[3][0-9][3][0-9][3][0-9][3][0-9]$/.test(mti);
}

function isBcdMti(hex, pos = 0) {
    const mti = hex.substr(pos, 4);
    return /^[0-9]{4}$/.test(mti);
}

function looksLikeIsoAt(hex, pos = 0, mtiBytes = 2) {
    const needed = (mtiBytes + 8) * 2; // MTI + bitmap primário
    if ((hex.length - pos) < needed) return false;

    const bitmapHex = hex.substr(pos + (mtiBytes * 2), 16);
    return /^[0-9A-F]{16}$/.test(bitmapHex);
}

function detectMtiSpecAt(hex, pos = 0) {
    if (isEbcidicMti(hex, pos) && looksLikeIsoAt(hex, pos, 4)) {
        const mti = ebcdicToAscii(hex.substr(pos, 8));
        if (isPlausibleMti(mti)) return { mtiBytes: 4, mtiEncoding: 'ebcdic' };
    }
    if (isAsciiMti(hex, pos) && looksLikeIsoAt(hex, pos, 4)) {
        const mti = hexToAscii(hex.substr(pos, 8));
        if (isPlausibleMti(mti)) return { mtiBytes: 4, mtiEncoding: 'ascii' };
    }
    if (isBcdMti(hex, pos) && looksLikeIsoAt(hex, pos, 2)) {
        const mti = hex.substr(pos, 4);
        if (isPlausibleMti(mti)) return { mtiBytes: 2, mtiEncoding: 'bcd' };
    }
    return null;
}

function isPlausibleMti(mti) {
    if (!/^\d{4}$/.test(String(mti || ''))) return false;

    const known = new Set([
        '0100', '0110', '0120',
        '0200', '0210', '0220',
        '0600', '0610', '0620', '0630',
        '0400', '0410', '0420', '0430',
        '0800', '0810',
        '1100', '1110',
        '1200', '1210', '1220',
        '1420', '1430',
        '1804', '1814'
    ]);
    if (known.has(mti)) return true;

    // fallback conservador: versão 0/1/2 e classes mais comuns.
    const v = mti[0];
    const cls = mti[1];
    const fn = mti[2];
    return /[012]/.test(v) && /[12468]/.test(cls) && /[0-4]/.test(fn);
}

function toBcdDigits(hex) {
    if (!hex || !/^[0-9A-F]+$/i.test(hex)) return null;
    const raw = hex.toUpperCase();
    let out = '';
    for (let i = 0; i < raw.length; i++) {
        const n = raw[i];
        if (n === 'F') {
            if (i !== raw.length - 1) return null;
            break;
        }
        out += n;
    }
    return out || null;
}

function isStrictNumeric(value, len) {
    const s = String(value || '');
    if (!/^\d+$/.test(s)) return false;
    return len ? s.length >= len : true;
}

function scoreVisaOffset(hex, offset) {
    const mtiSpec = detectMtiSpecAt(hex, offset);
    if (!mtiSpec) return Number.NEGATIVE_INFINITY;

    let score = 0;
    let pos = offset + (mtiSpec.mtiBytes * 2);
    const primaryHex = hex.substr(pos, 16);
    if (!/^[0-9A-F]{16}$/.test(primaryHex)) return Number.NEGATIVE_INFINITY;

    const bits = hexToBits(primaryHex);
    pos += 16;

    // DE2 presente aumenta confianca.
    const hasDe2 = bits[1] === '1';
    if (hasDe2) {
        score += 4;

        const de2LenHex = hex.substr(pos, 2);
        if (!/^[0-9A-F]{2}$/.test(de2LenHex)) return Number.NEGATIVE_INFINITY;
        const de2LenDigits = parseInt(de2LenHex, 16);
        pos += 2;

        if (de2LenDigits >= 12 && de2LenDigits <= 19) score += 6;
        else score -= 8;

        const de2ByteLen = Math.ceil(de2LenDigits / 2);
        const de2Raw = hex.substr(pos, de2ByteLen * 2);
        if (de2Raw.length !== de2ByteLen * 2) return Number.NEGATIVE_INFINITY;
        pos += de2ByteLen * 2;

        const de2Digits = toBcdDigits(de2Raw);
        if (de2Digits && de2Digits.length >= 12 && de2Digits.length <= 19) {
            score += 8;
            const panStart = de2Digits[0];
            if (/[3456]/.test(panStart)) score += 4;
        } else {
            return Number.NEGATIVE_INFINITY;
        }
    } else {
        score -= 4;
    }

    // DE3 (Processing Code) costuma estar presente e ser 6 digitos.
    const hasDe3 = bits[2] === '1';
    if (hasDe3) {
        const de3Raw = hex.substr(pos, 6);
        const de3Digits = toBcdDigits(de3Raw);
        if (de3Digits && de3Digits.length >= 6 && /^\d{6}$/.test(de3Digits.slice(0, 6))) {
            score += 8;
            pos += 6; // 3 bytes
        } else {
            return Number.NEGATIVE_INFINITY;
        }
    } else {
        score -= 6;
    }

    // DE4 (Amount) costuma estar presente e ser 12 digitos.
    const hasDe4 = bits[3] === '1';
    if (hasDe4) {
        const de4Raw = hex.substr(pos, 12);
        const de4Digits = toBcdDigits(de4Raw);
        if (de4Digits && de4Digits.length >= 12 && /^\d{12}$/.test(de4Digits.slice(0, 12))) {
            score += 8;
        } else {
            return Number.NEGATIVE_INFINITY;
        }
    }

    // Mensagens financeiras normalmente trazem DE2/DE3/DE4 juntos.
    if (hasDe2 && hasDe3 && hasDe4) score += 6;

    return score;
}

function scoreDecodedVisaMessage(decoded) {
    if (!decoded || !Array.isArray(decoded.dataElements)) return Number.NEGATIVE_INFINITY;

    const byDe = new Map(decoded.dataElements.map(el => [Number(el.de), el]));
    let score = Math.min(decoded.dataElements.length, 30);

    const de2 = byDe.get(2);
    if (de2?.decoded?.value) {
        const pan = String(de2.decoded.value);
        if (isStrictNumeric(pan) && pan.length >= 12 && pan.length <= 19) score += 20;
        else score -= 15;
    } else {
        score -= 10;
    }

    const de3 = byDe.get(3);
    if (de3?.decoded?.value) {
        const pc = String(de3.decoded.value);
        if (isStrictNumeric(pc, 6)) score += 10;
        else score -= 8;
    } else {
        score -= 5;
    }

    const de4 = byDe.get(4);
    if (de4?.decoded?.value) {
        const amount = String(de4.decoded.value);
        if (isStrictNumeric(amount, 12)) score += 8;
        else score -= 6;
    }

    return score;
}

export function detectNetwork(rawHex) {
    const hex = normalizeIncomingHex(rawHex);
    const configuredVisaHeader = Number(NETWORK_CONFIG?.visa?.headerLength ?? 22);
    const scanLimit = Math.min(220, Math.max(0, hex.length - 40));
    const scannedOffsets = [];
    for (let o = 0; o <= scanLimit; o += 2) scannedOffsets.push(o);

    const visaOffsetCandidates = Array.from(new Set([
        configuredVisaHeader * 2,      // header informado em bytes (padrão esperado)
        configuredVisaHeader,          // header informado já em hex positions
        44,                            // legado comum (22 bytes)
        88,                            // variação possível (44 bytes)
        ...scannedOffsets              // fallback robusto: header variável
    ])).filter(v => Number.isFinite(v) && v >= 0 && v % 2 === 0);

    // Mastercard: costuma iniciar direto com MTI em EBCDIC.
    const atZero = detectMtiSpecAt(hex, 0);
    if (atZero?.mtiEncoding === 'ebcdic') {
        return {
            network: 'mastercard',
            isoStart: 0,
            mtiBytes: atZero.mtiBytes,
            mtiEncoding: atZero.mtiEncoding,
            normalizedHex: hex
        };
    }

    // Elo: comum iniciar com MTI ASCII (sem header Visa fixo).
    if (atZero?.mtiEncoding === 'ascii') {
        return {
            network: 'elo',
            isoStart: 0,
            mtiBytes: atZero.mtiBytes,
            mtiEncoding: atZero.mtiEncoding,
            normalizedHex: hex
        };
    }

    // Visa com header fixo (44 posi��es hex no seu tr�fego).
    const visaPrimaryOffset = 44;
    const visaAtPrimary = detectMtiSpecAt(hex, visaPrimaryOffset);
    if (visaAtPrimary) {
        return {
            network: 'visa',
            isoStart: visaPrimaryOffset,
            mtiBytes: visaAtPrimary.mtiBytes,
            mtiEncoding: visaAtPrimary.mtiEncoding,
            normalizedHex: hex
        };
    }

    // Compatibilidade: alguns ambientes usam 44 bytes de header (88 hex).
    const visaAt88 = detectMtiSpecAt(hex, 88);
    if (visaAt88) {
        return {
            network: 'visa',
            isoStart: 88,
            mtiBytes: visaAt88.mtiBytes,
            mtiEncoding: visaAt88.mtiEncoding,
            normalizedHex: hex
        };
    }

    // Fallback legado: escolhe o melhor offset por score estrutural (bitmap + DE2/DE3).
    const structural = [];
    for (const offset of visaOffsetCandidates) {
        const s = scoreVisaOffset(hex, offset);
        if (Number.isFinite(s)) structural.push({ offset, score: s, spec: detectMtiSpecAt(hex, offset) });
    }

    structural.sort((a, b) => b.score - a.score);
    const finalists = structural.slice(0, 6);

    let bestVisa = null;
    for (const c of finalists) {
        let decodedScore = Number.NEGATIVE_INFINITY;
        try {
            const decoded = decodeISO8583(hex.substring(c.offset), 'visa');
            decodedScore = scoreDecodedVisaMessage(decoded);
        } catch (_) {
            decodedScore = Number.NEGATIVE_INFINITY;
        }

        const totalScore = c.score + (Number.isFinite(decodedScore) ? decodedScore : -50);
        if (!bestVisa || totalScore > bestVisa.score) {
            bestVisa = { offset: c.offset, score: totalScore, spec: c.spec };
        }
    }
    if (bestVisa?.spec && bestVisa.score > 0) {
        return {
            network: 'visa',
            isoStart: bestVisa.offset,
            mtiBytes: bestVisa.spec.mtiBytes,
            mtiEncoding: bestVisa.spec.mtiEncoding,
            normalizedHex: hex
        };
    }

    // Fallback: se há ISO no início e MTI em BCD, trata como Visa.
    if (atZero?.mtiEncoding === 'bcd') {
        return {
            network: 'visa',
            isoStart: 0,
            mtiBytes: atZero.mtiBytes,
            mtiEncoding: atZero.mtiEncoding,
            normalizedHex: hex
        };
    }

    return {
        network: 'unknown',
        isoStart: 0,
        mtiBytes: 2,
        mtiEncoding: 'bcd',
        normalizedHex: hex
    };
}

export function parseLLVARNumericBCD(field) {
    if (!field.rawHex) return null;

    const hex = field.rawHex;

    // 1 byte BCD = 2 dígitos de tamanho
    const len = parseInt(hex.substr(0, 2), 16);

    // quantidade de bytes do valor
    const valueHex = hex.substr(2, len);

    return hexToAscii(valueHex);
}

/**
 * Decode a ISO8583 hex message
 * @param {string} hex - hex completo da mensagem ISO
 * @param {string} network - 'visa', 'mastercard', etc.
 * @returns {object} decoded ISO message
 */
export function decodeISO8583(hex, network) {
    if (!hex) return null;

    const safeNetwork = NETWORK_CONFIG?.[network] ? network : 'visa';
    const fieldConfig = buildFieldConfig(safeNetwork);
    
    const networkConfig = NETWORK_CONFIG?.[safeNetwork];
    if (!networkConfig) {
        console.error(`decodeISO8583 -> Configuracao de rede nao encontrada: ${safeNetwork}`);
        return null;
    }

    const fieldMap = networkConfig.fieldMap || {};
    const overrides = NETWORK_OVERRIDES[safeNetwork] || {};
    const normalizedHex = normalizeIncomingHex(hex);
    const state = { pos: 0 };

    const result = {
        mti: null,
        primaryBits: [],
        secondaryBits: [],
        dataElements: []
    };

    const autoMtiSpec = detectMtiSpecAt(normalizedHex, 0);
    const networkMtiBytes = NETWORK_CONFIG?.[safeNetwork]?.mtiBytes;
    const mtiBytes = autoMtiSpec?.mtiBytes ?? networkMtiBytes ?? 2;
    const mtiEncoding = autoMtiSpec?.mtiEncoding ?? (mtiBytes === 4 ? 'ebcdic' : 'bcd');

    // MTI
    const mtiRaw = getBytes(normalizedHex, state, mtiBytes);
    let mti = mtiRaw;
    if (mtiEncoding === 'ebcdic') mti = ebcdicToAscii(mtiRaw);
    else if (mtiEncoding === 'ascii') mti = hexToAscii(mtiRaw);
    result.mti = mti;
    const posAfterMti = state.pos;
    
    // Bitmap
    const bitmaps = readBitmaps(normalizedHex, state, safeNetwork);
    result.primaryBits = bitmaps.primaryBits;
    result.secondaryBits = bitmaps.secondaryBits;
    result.bitmapMode = bitmaps.mode;
    
    const allBits = [
        ...result.primaryBits,
        ...result.secondaryBits
    ];

    const stateStart = safeNetwork === 'visa'
        ? adjustVisaDataStart(normalizedHex, state.pos, allBits)
        : state.pos;
    //result.dataElements = decodeDataElements(hex, state, allBits);
    const dataElements = [];
    
    // Loop pelos 128 DEs possíveis
    const localState = { pos: stateStart };
    for (let i = 1; i <= allBits.length; i++) {

        if (allBits[i - 1] === '1') {
            // DE1 indica presença de bitmap secundário e já foi consumido acima
            if (i === 1) continue;

            const configDE = fieldConfig[i];
            if (!configDE) {
                dataElements.push({
                    de: i,
                    name: `DE${i}`,
                    type: 'UNKNOWN',
                    size: '',
                    rawHex: '',
                    decoded: { format: 'ERROR', value: 'Configuracao nao encontrada' },
                    showDecoded: true,
                    complex: false,
                    children: [],
                    error: 'missing_config'
                });
                break; // sem layout do DE n�o � seguro continuar.
            }
            const overrideParser = overrides[i]?.parser;
            const field = parseDE(normalizedHex, localState, i, configDE, safeNetwork);
            field.complex = Boolean(configDE?.COMPLEX);
            // Se houver parser customizado, aplica
            if (overrideParser) {
                try {
                    const parsed = overrideParser(field);
                    if (parsed) {
                        field.children = parsed.children ?? field.children ?? [];
                        if (parsed.value !== undefined) {
                            field.decoded = { format: parsed.format ?? 'HEX', value: parsed.value };
                        }
                        if (parsed.complex !== undefined) {
                            field.complex = parsed.complex;
                        } else if (Array.isArray(field.children) && field.children.length > 0) {
                            field.complex = true;
                        }
                    }
                } catch (e) {
                    console.error(`Erro no parser customizado DE${i}:`, e);
                }
            }
            dataElements.push(field);            
        }
    }
    result.dataElements = dataElements;
    return {
        mti,
        primaryBits: result.primaryBits,
        secondaryBits: result.secondaryBits,
        bitmapMode: result.bitmapMode,
        dataElements
    };
}

/**
 * Processa a mensagem ISO completa
 * @param {string} rawHex
 * @returns {object} decoded ISO
 */
export function processIncomingMessage(rawHex) {
    const networkInfo = detectNetwork(rawHex);
    if (!networkInfo) {
        console.error('processIncomingMessage -> Nao foi possivel detectar rede');
        return null;
    }

    const normalizedHex = networkInfo.normalizedHex ?? normalizeIncomingHex(rawHex);
    const isoHex = normalizedHex.substring(networkInfo.isoStart);
    const decoded = decodeISO8583(isoHex, networkInfo.network);
    return decoded;
}

window.decodeISO8583 = decodeISO8583;   
window.detectNetwork = detectNetwork;
window.buildFieldConfig = buildFieldConfig;











