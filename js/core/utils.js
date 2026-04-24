import { 
    ebcdicToAscii,
    hexToAscii,
    bcdToString
 } from '../core/iso-decoder.js';

 import { hexToBits } from './bitmaps.js';
export function decodeFormat(rawHex, format) {
    //console.log('decodeFormat → decodeFormat entrada: ', format);
    if (!rawHex) return '';

    switch (format) {
        case 'a': // ASCII
            return hexToAscii(rawHex);
        case 'b': // BCD
            return bcdToString(rawHex);
        case 'e': // EBCDIC
            return ebcdicToAscii(rawHex);
        default:
            return rawHex; // se for outro tipo, devolve o hex cru
    }
}

// hex → bitmap → retorna array de DEs filhos
export function expandByBitmap(field, { bitmapBytes, prefix, map }) {
    if (!field.rawHex) return { children: [] };

    const hex = field.rawHex.substr(0, bitmapBytes * 2); // pega os bytes do bitmap
    const bits = hexToBits(hex);
    const children = [];
    

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            const deNum = i + 1;
            const cfg = map[deNum];
            if (!cfg) continue;
            
            const start = bitmapBytes * 2 + i * cfg.length; // simples, ajustar se necessário
            const rawHex = field.rawHex.substr(start, cfg.length * 2);
            children.push({
                deNum: deNum,
                name: cfg.name,
                rawHex,
                decoded: { value: rawHex } // ou decodifique conforme cfg.format
            });
        }
    }
    
    console.log('expandByBitmap → children: ', children);
    
    return {children}
}
