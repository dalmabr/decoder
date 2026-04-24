import {
    hexToBin,
    ebcdicToAscii,
    hexToAscii,
    bcdToString
} from '../core/iso-decoder.js';

function getHexLength(cfg) {
    if (!cfg || typeof cfg.length !== 'number' || cfg.length < 0) return 0;

    if (cfg.unit === 'digits') {
        return Math.ceil(cfg.length / 2) * 2;
    }

    if (cfg.unit === 'bytes') {
        return cfg.length * 2;
    }

    // fallback: assume bytes when unit is omitted.
    return cfg.length * 2;
}

function decodeHexValue(rawHex, format) {
    switch (format) {
        case 'e':
            return ebcdicToAscii(rawHex);
        case 'b':
        case 'bcd':
            return bcdToString(rawHex);
        case 'a':
            return hexToAscii(rawHex);
        default:
            return rawHex;
    }
}

export function expandByBitmap(field, config) {
    if (!field?.rawHex) return { children: [] };

    const hex = field.rawHex;
    let pos = 0;

    const bitmapHexLength = (config.bitmapBytes || 0) * 2;
    const bmpHex = hex.substr(pos, bitmapHexLength);
    pos += bitmapHexLength;

    const bits = [];

    for (let i = 0; i < bitmapHexLength; i += 2) {
        bits.push(...hexToBin(bmpHex.substr(i, 2), 8).split(''));
    }

    const children = [];

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] !== '1') continue;

        const sub = i + 1;
        const cfg = config.map?.[sub];
        if (!cfg) continue;

        const hexLength = getHexLength(cfg);
        const rawHex = hex.substr(pos, hexLength);
        const decodedValue = decodeHexValue(rawHex, cfg.format);

        children.push({
            subfield: `${config.prefix}.${sub}`,
            name: cfg.name,
            size: `${hexLength / 2} bytes`,
            rawHex,
            decoded: decodedValue
        });

        pos += hexLength;
    }

    return {
        format: field.decoded?.format ?? 'HEX',
        value: field.decoded?.value ?? field.rawHex,
        children
    };
}
