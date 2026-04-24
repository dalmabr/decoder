import { 
    getBytes, 
    getBCDLength,
    hexToAscii,
    ebcdicToAscii,
    bcdToString
 } from '../core/iso-decoder.js';
import { expandDE48Mastercard } from '../network/master.js';

export function parseDE(hex, state, de, config, network = '') {
    //if (de === 48) {
    //    console.log("=== DEBUG DE48 ===");
    //    console.log("network:", network);
    //    console.log("config.type:", config?.type);
    //}
    
    if (!config) {
        console.warn(`parseDE -> config nao encontrada para DE${de}`);
        return {
            de,
            name: `DE${de}`,
            type: 'UNKNOWN',
            size: '',
            rawHex: '',
            decoded: null,
            showDecoded: false,
            complex: false,
            children: [],
            error: 'missing_config'
        };
    }

    let rawHex = '';
    let size = '';
    let decoded = null;
    let byteCount = 0;
    let lenHex;
    let lenBytes;
    let remainingBytes;
    let maxLenByConfig;
    let lengthEncoding;

    // --------------------------
    // Determina tamanho em bytes
    // --------------------------
    if (de === 55 && network === 'visa') {
        const de55StartPos = state.pos;
        const de55LenHex = getBytes(hex, state, 2);
        let de55Len = parseInt(de55LenHex, 16) || 0;
        let remainingBytes = Math.max(0, Math.floor((hex.length - state.pos) / 2));

        if (!isPlausibleDe55Length(de55Len, remainingBytes) || !looksLikeEmvPayload(hex, state.pos, de55Len)) {
            const recovered = recoverVisaDe55Alignment(hex, de55StartPos);
            if (recovered) {
                state.pos = recovered.valuePos;
                de55Len = recovered.length;
                remainingBytes = Math.max(0, Math.floor((hex.length - state.pos) / 2));
            }
        }

        if (de55Len > remainingBytes) {
            de55Len = remainingBytes;
        }

        rawHex = getBytes(hex, state, de55Len);
        size = `${de55Len} bytes`;
    } else
    if (config.type === 'Fixo') {
        byteCount = config.unit === 'bytes' 
            ? config.length 
            : getNumericBytes(config.length, config.format, network);
        rawHex = getBytes(hex, state, byteCount);
        size = `${config.length} ${config.unit}`;
    } else 
        
        if (config.type === 'LLVAR' || config.type === 'LLLVAR') {

            lenBytes = Number(config.lengthBytes) || (config.type === 'LLLVAR' ? 2 : 1);
            lengthEncoding = config.lengthEncoding || config.length;

            if (network === 'mastercard') {
                if (!config.lengthBytes) lenBytes = config.type === 'LLLVAR' ? 3 : 2;
                if (!config.lengthEncoding) lengthEncoding = 'ebcdic';
            }

            if ((de === 61) && network === 'mastercard') {
                lenBytes = 3;
            }

            lenHex = getBytes(hex, state, lenBytes);
            remainingBytes = Math.max(0, Math.floor((hex.length - state.pos) / 2));
            maxLenByConfig = typeof config.length === 'number' ? config.length : null;

            let len;

            if (config.length === 'binary') {
                if (network === 'mastercard') {
                    const lenStr = ebcdicToAscii(lenHex);
                    len = parseInt(lenStr, 10) || 0;
                } else {
                    len = parseInt(lenHex, 16) || 0;
                }
            }
            else if (network === 'mastercard' && lengthEncoding === 'ebcdic') {
                const lenStr = ebcdicToAscii(lenHex);
                len = parseInt(lenStr, 10) || 0;
            }
            else {
                len = resolveVariableLength({
                    lenHex,
                    lenBytes,
                    unit: config.unit,
                    format: config.format,
                    maxLenByConfig,
                    remainingBytes,
                    mode: config.length,
                    lengthEncoding
                });
            }

            if (isNaN(len)) {
                console.warn(`DE${de} ’ tamanho inválido`, lenHex, config);
                len = 0;
            }

            if (len > 9999 || len < 0 || !Number.isFinite(len)) {
                console.error(`DE${de} ' tamanho absurdo`, len);
            }

            byteCount = config.unit === 'digits'
                ? getNumericBytes(len, config.format, network)
                : len;

            rawHex = getBytes(hex, state, byteCount);
            //rawHex = readVarLength(hex, state, config.type);   
            size = `${len} ${config.unit}`;
        
    } else if (config.type === 'var') {
        lenBytes = Number(config.lengthBytes) || 1;
        if ((de === 63) && network === 'mastercard') {
            lenBytes = 3;
        }

        if (de === 48 && network === 'mastercard') {
            lenBytes = 3;  // 3 bytes EBCDIC = 6 hex chars.
        }

        if (network === 'visa') {
            lenHex = getBytes(hex, state, lenBytes);
        }
        
        let len;

        if (config.lengthType === 'bcd') {
            len = getPaddedBCDLength(lenHex, Number(config.lengthDigits));
        } else {
            if (network === 'visa') {
                len = parseInt(lenHex, 16);
            } else {
                // Para Mastercard e outros, ler length em EBCDIC
                lenHex = getBytes(hex, state, lenBytes);
                
                // Se for DE48 Mastercard, converter EBCDIC para número
                if ((de === 48 || de === 63 ) && network === 'mastercard') {
                    const lenEbcdic = ebcdicToAscii(lenHex);
                    len = parseInt(lenEbcdic, 10) || 0;
                } else {
                    len = parseInt(lenHex, 16);
                }
            }
        }

        if (isNaN(len)) len = 0;
        
        if (len < 0) len = 0;
        
        if (typeof config.maxLength === 'number' && len > config.maxLength) {
            console.warn(`DE${de}: tamanho acima do máximo (${config.maxLength})`, len);
            len = config.maxLength;
        }

        byteCount = config.unit === 'digits'
            ? getNumericBytes(len, config.format, network)
            : len;

        rawHex = getBytes(hex, state, byteCount);
        size = `${len} ${config.unit || 'bytes'}`;
    }
    // --------------------------
    // Decodifica para exibiÃ§Ã£o
    // --------------------------
    if (rawHex) {
        const format = config.format || (config.encoding?.toLowerCase().includes('ebcdic') ? 'e' : null);
        if (format === 'e') decoded = { format: 'EBCDIC', value: ebcdicToAscii(rawHex) };
        else if (format === 'b') decoded = { format: 'BCD', value: bcdToString(rawHex) };
        else if (format === 'a') decoded = { format: 'ASCII', value: hexToAscii(rawHex) };
        else if (format === 'n' && network === 'mastercard') {
            decoded = { format: 'NUM', value: ebcdicToAscii(rawHex).replace(/[^\d]/g, '') };
        }
        else decoded = { format: 'HEX', value: rawHex };
    }

    //let children = [];

    if (de === 48 && network === 'mastercard' && rawHex) {
        try {
            const exp = expandDE48Mastercard({ rawHex });
            
       const result = {
            de: 48,
            name: "DE48 - Additional Data (Private)",
            type: config.type,
            size: `${rawHex.length / 2} bytes`,
            rawHex,
            decoded: { format: "STRUCTURED", value: exp.value },
            showDecoded: true,
            complex: true,
            children: exp.children
        };
        
        return result;
        
        
        } catch (e) {
            console.warn("❌ Falha ao expandir DE48 Mastercard:", e);
            return {
                de,
                name: config.name,
                type: config.type,
                size,
                rawHex,
                decoded: { format: 'HEX', value: rawHex },
                showDecoded: true,
                complex: false,
                children: [],
                error: `DE48 parse error: ${e.message}`
            };
        }
    }

    return {
        de,
        name: config.name,
        type: config.type,
        size,
        rawHex,
        decoded,
        showDecoded: decoded?.value !== rawHex,
        complex: false,
        children: []
    };
}

function readVarLength(hex, state, config) {
    const lenBytes = config.type === 'LLLVAR' ? 2 : 1;
    const lenHex = getBytes(hex, state, lenBytes);

    return config.length === 'bcd'
        ? getBCDLength(lenHex)
        : parseInt(lenHex, 16);
}

function getPaddedBCDLength(lenHex, digits) {
    if (!lenHex) return 0;
    const raw = String(lenHex).toUpperCase();

    // fallback padrão (comportamento antigo)
    if (!digits || raw.length !== digits + 1) {
        return parseInt(raw, 16);
    }

    const first = raw[0];
    const last = raw[raw.length - 1];

    // Suporta padding em qualquer lado: 0104 ou 1040 -> 104
    if ((first === '0' || first === 'F') && /^\d+$/.test(raw.slice(1))) {
        return parseInt(raw.slice(1), 10);
    }
    if ((last === '0' || last === 'F') && /^\d+$/.test(raw.slice(0, digits))) {
        return parseInt(raw.slice(0, digits), 10);
    }

    return parseInt(raw, 16);
}

function parsePackedBcdLength(lenHex) {
    const raw = String(lenHex || '').toUpperCase();
    if (!raw || !/^[0-9A-F]+$/.test(raw)) return NaN;
    if (/F/.test(raw.slice(0, -1))) return NaN;

    let out = '';
    for (let i = 0; i < raw.length; i++) {
        const n = raw[i];
        if (n === 'F') break;
        if (!/[0-9]/.test(n)) return NaN;
        out += n;
    }
    return out ? parseInt(out, 10) : NaN;
}

function isLengthFeasible(len, unit, format, remainingBytes, maxLenByConfig) {
    if (!Number.isFinite(len) || len < 0) return false;
    if (maxLenByConfig != null && len > maxLenByConfig) return false;

    const bytesNeeded = unit === 'digits'
        ? (format === 'n' ? Math.ceil(len / 2) : len)
        : len;

    return bytesNeeded <= remainingBytes;
}

function resolveVariableLength({ lenHex, lenBytes, unit, format, maxLenByConfig, remainingBytes, mode, lengthEncoding, network }) {
    const candidates = [];

    const asHex = parseInt(lenHex, 16);
    if (Number.isFinite(asHex)) {
        //candidates.push({ value: asHex, tag: 'hex' });
        candidates.push({ value: asHex, tag: 'hex', priority: 0 });

    }

    const asBcdPacked = parsePackedBcdLength(lenHex);
    if (Number.isFinite(asBcdPacked)) {
        //candidates.push({ value: asBcdPacked, tag: 'bcdPacked' });
        candidates.push({ value: asBcdPacked, tag: 'bcdPacked', priority: 1 });

    }

    if (/^\d+$/.test(String(lenHex || ''))) {
        const asDec = parseInt(lenHex, 10);
        if (Number.isFinite(asDec)) {
            //candidates.push({ value: asDec, tag: 'dec' });
            candidates.push({ value: asDec, tag: 'dec', priority: 2 });

        }
    }

    const asEbc = ebcdicToAscii(lenHex || '');
    if (/^\d+$/.test(asEbc)) {
        const asEbcDec = parseInt(asEbc, 10);
        if (Number.isFinite(asEbcDec)) {
            //candidates.push({ value: asEbcDec, tag: 'ebcdic' });
            const priority = (network === 'mastercard') ? 3 : 0;
            candidates.push({ value: asEbcDec, tag: 'ebcdic', priority: priority });
        }
    }

    const asAscii = hexToAscii(lenHex || '');
    if (/^\d+$/.test(asAscii)) {
        const asAsciiDec = parseInt(asAscii, 10);
        if (Number.isFinite(asAsciiDec)) {
            //candidates.push({ value: asAsciiDec, tag: 'ascii' });
            candidates.push({ value: asAsciiDec, tag: 'ascii', priority: 4 });

        }
    }

    const valid = candidates.filter(c =>
        isLengthFeasible(c.value, unit, format, remainingBytes, maxLenByConfig)
    );
    if (!valid.length) return NaN;

    //const explicit = (lengthEncoding || '').toLowerCase();
    //const preferredTag =
    //    explicit === 'ebcdic' ? 'ebcdic' :
    //    explicit === 'ascii' ? 'ascii' :
    //    (explicit === 'binary' || explicit === 'hex') ? 'hex' :
    //    explicit === 'bcd' ? 'bcdPacked' :
    //    ((mode === 'binary' || mode === 'hex' || lenBytes === 1) ? 'hex' : 'bcdPacked');

    //valid.sort((a, b) => {
    //    const ap = a.tag === preferredTag ? 1 : 0;
    //    const bp = b.tag === preferredTag ? 1 : 0;
    //    if (ap !== bp) return bp - ap;
    //    return a.value - b.value;
    //});
    valid.sort((a, b) => {

        if (network === 'mastercard') {
            if (a.tag === 'bcdPacked' && b.tag === 'ebcdic') return -1;
            if (a.tag === 'ebcdic' && b.tag === 'bcdPacked') return 1;
        }
        return a.priority - b.priority;
    });


    return valid[0].value;
}

function getNumericBytes(len, format, network) {
    if (format !== 'n') return len;
    if (network === 'mastercard') return len;
    return Math.ceil(len / 2);
}

function isPlausibleDe55Length(len, remainingBytes) {
    return Number.isFinite(len) && len >= 0 && len <= remainingBytes && len <= 255;
}

function looksLikeEmvPayload(hex, pos, lenBytes) {
    if (!lenBytes || pos + 2 > hex.length) return false;
    const firstTagByte = hex.slice(pos, pos + 2).toUpperCase();
    if (!/^[0-9A-F]{2}$/.test(firstTagByte)) return false;

    if (firstTagByte === '00' || firstTagByte === 'FF') return false;

    const cls = parseInt(firstTagByte, 16);
    return (cls & 0x1F) !== 0;
}

function recoverVisaDe55Alignment(hex, startPos) {
    for (let shiftBytes = 1; shiftBytes <= 4; shiftBytes++) {
        const shiftedPos = startPos + (shiftBytes * 2);
        if (shiftedPos + 4 > hex.length) break;

        const lenHex = hex.slice(shiftedPos, shiftedPos + 4);
        if (!/^[0-9A-F]{4}$/.test(lenHex)) continue;

        const len = parseInt(lenHex, 16);
        const valuePos = shiftedPos + 4;
        const remainingBytes = Math.max(0, Math.floor((hex.length - valuePos) / 2));

        if (!isPlausibleDe55Length(len, remainingBytes)) continue;
        if (!looksLikeEmvPayload(hex, valuePos, len)) continue;

        return { length: len, valuePos };
    }

    return null;
}



