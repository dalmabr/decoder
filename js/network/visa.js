import { expandByBitmap } from '../ui/expand.js';
import { parseTLVDataset } from '../core/iso-decoder.js'

export function expandDE48Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return {
        format: 'EBCDIC',
        value: field.decoded?.value ?? field.rawHex,
        children: []
    };
}

export function expandDE48Visa_(field) {
    if (!field.decoded || !field.decoded.value) {
        console.warn('DE48Visa_ sem decoded vÃ¡lido');
        return null;
    }

    const hex = field.decoded.value;

    const ascii = ebcdicToAscii(hex);

    return {
        RawHex: hex,
        Text: ascii
    };
}

export function expandDE54Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    const value = field.decoded.value;
    const blocks = [];

    for (let i = 0; i < value.length; i += 20) {
        blocks.push({
            accountType: value.substr(i, 2),
            amountType: value.substr(i + 2, 2),
            currency: value.substr(i + 4, 3),
            sign: value.substr(i + 7, 1),
            amount: value.substr(i + 8, 12)
        });
    }

    return blocks;
}

export function expandDE55Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return parseDE55TLV(field);
}

export function expandOLD_DE60Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };

    const v = packedBcdToDigits(field.rawHex);

    return {
        format: 'BCD',
        value: v,
        children: [
            { subfield: '60.1', name: 'Terminal Type', size: '1 digit', decoded: v.substr(0, 1) },
            { subfield: '60.2', name: 'Terminal Entry Capability', size: '1 digit', decoded: v.substr(1, 1) },
            { subfield: '60.3', name: 'Chip Condition Code', size: '1 digit', decoded: v.substr(2, 1) },
            { subfield: '60.4', name: 'Special Condition Indicator', size: '1 digit', decoded: v.substr(3, 1) },
            { subfield: '60.7', name: 'Chip Transaction Indicator', size: '1 digit', decoded: v.substr(6, 1) },
            { subfield: '60.8', name: 'Chip Card Authentic Reliability Indicator', size: '1 digit', decoded: v.substr(7, 1) },
            { subfield: '60.9', name: 'Mail/Phone/E-Commerce and Payment Indicator', size: '2 digits', decoded: v.substr(8, 2) },
            { subfield: '60.11', name: 'Cardholder ID Method Indicator', size: '1 digit', decoded: v.substr(10, 1) },
            { subfield: '60.12', name: 'Additional Authorization Indicators', size: '1 digit', decoded: v.substr(11, 1) }
        ]
    };
}

export function expandDE60_OLD_Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };

    const v = packedBcdToDigits(field.rawHex);

    return {
        format: 'BCD',
        value: v,
        children: [
            {
                subfield: '60.1',
                name: 'Terminal Type',
                size: '1 digit',
                value: v.substr(0, 1),
                description: getDomainDescription('60.1', v.substr(0, 1)),
                decoded: formatDecoded('60.1', v.substr(0, 1))
            },
            {
                subfield: '60.2',
                name: 'Terminal Entry Capability',
                size: '1 digit',
                value: v.substr(1, 1),
                description: getDomainDescription('60.2', v.substr(1, 1)),
                decoded: formatDecoded('60.2', v.substr(1, 1))
            },
            {
                subfield: '60.3',
                name: 'Chip Condition Code',
                size: '1 digit',
                value: v.substr(2, 1),
                description: getDomainDescription('60.3', v.substr(2, 1)),
                decoded: formatDecoded('60.3', v.substr(2, 1))
            },
            {
                subfield: '60.4',
                name: 'Special Condition Indicator',
                size: '1 digit',
                value: v.substr(3, 1),
                description: getDomainDescription('60.4', v.substr(3, 1)),
                decoded: formatDecoded('60.4', v.substr(3, 1))
            },
            {
                subfield: '60.6',
                name: 'Chip Transaction Indicator',
                size: '1 digit',
                value: v.substr(6, 1),
                description: getDomainDescription('60.6', v.substr(6, 1)),
                decoded: formatDecoded('60.6', v.substr(6, 1))
            },
            {
                subfield: '60.7',
                name: 'Chip Card Authentic Reliability Indicator',
                size: '2 digits',
                value: v.substr(7, 1),
                description: getDomainDescription('60.7', v.substr(7, 1)),
                decoded: formatDecoded('60.7', v.substr(7, 1))
            },
            {
                subfield: '60.8',
                name: 'Mail/Phone/E-Commerce and Payment Indicator',
                size: '2 digits',
                value: v.substr(8, 2),
                description: getDomainDescription('60.8', v.substr(8, 2)),
                decoded: formatDecoded('60.8', v.substr(8, 2))
            },
            {
                subfield: '60.9',
                name: 'Cardholder ID Method Indicator',
                size: '1 digit',
                value: v.substr(10, 1),
                description: getDomainDescription('60.9', v.substr(10, 1)),
                decoded: formatDecoded('60.9', v.substr(10, 1))
            },
            {
                subfield: '60.10',
                name: 'Additional Authorization Indicators',
                size: '1 digit',
                value: v.substr(11, 1),
                description: getDomainDescription('60.10', v.substr(11, 1)),
                decoded: formatDecoded('60.10', v.substr(11, 1))
            }
        ]
    };
}

export function expandDE60Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };

    const v = packedBcdToDigits(field.rawHex);
    const totalLength = v.length;
    const children = [];

    // Definição dos campos com suas posições e tamanhos
    const fieldDefinitions = [
        { subfield: '60.1', name: 'Terminal Type', pos: 0, size: 1 },
        { subfield: '60.2', name: 'Terminal Entry Capability', pos: 1, size: 1 },
        { subfield: '60.3', name: 'Chip Condition Code', pos: 2, size: 1 },
        { subfield: '60.4', name: 'Special Condition Indicator', pos: 3, size: 1 },
        { subfield: '60.6', name: 'Chip Transaction Indicator', pos: 6, size: 1 },
        { subfield: '60.7', name: 'Chip Card Authentic Reliability Indicator', pos: 7, size: 1 },
        { subfield: '60.8', name: 'Mail/Phone/E-Commerce and Payment Indicator', pos: 8, size: 2 },
        { subfield: '60.9', name: 'Cardholder ID Method Indicator', pos: 10, size: 1 },
        { subfield: '60.10', name: 'Additional Authorization Indicators', pos: 11, size: 1 }
    ];

    // Itera apenas sobre os campos que têm dados disponíveis
    fieldDefinitions.forEach((def) => {
        const endPos = def.pos + def.size;

        // 👇 Verifica se há dados suficientes para este campo
        if (endPos <= totalLength) {
            const value = v.substr(def.pos, def.size);

            children.push({
                subfield: def.subfield,
                name: def.name,
                size: `${def.size} digit${def.size > 1 ? 's' : ''}`,
                value: value,
                description: getDomainDescription(def.subfield, value),
                decoded: formatDecoded(def.subfield, value)
            });
        }
    });

    return {
        format: 'BCD',
        value: v,
        children: children
    };
}

export function expandDE62Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };

    return expandByBitmap(field, {
        bitmapBytes: 8,
        prefix: '62',
        map: {
            1: { name: 'Authorization Characteristics Indicator', length: 1, format: 'e', unit: 'bytes' },
            2: { name: 'Transaction Identifier', length: 8, format: 'hex', unit: 'bytes' },
            3: { name: 'Validation Code', length: 4, format: 'e', unit: 'bytes' },
            4: { name: 'Market-Specific Data Identifier', length: 1, format: 'e', unit: 'bytes' },
            5: { name: 'Duration', length: 1, format: 'b', unit: 'bytes' },
            6: { name: 'Reserved', length: 1, format: 'e', unit: 'bytes' },
            7: { name: 'Purchase Identifier', length: 26, format: 'e', unit: 'bytes' },
            16: { name: 'Reserved', length: 2, format: 'e', unit: 'bytes' },
            17: { name: 'Mastercard Interchange Compliance', length: 15, format: 'e', unit: 'bytes' },
            20: { name: 'Merchant Verification Value', length: 5, format: 'b', unit: 'bytes' }
        }
    });
}

export function expandDE63Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return expandByBitmap(field, {
        bitmapBytes: 3,
        prefix: '63',
        map: {
            1: { name: 'Network Identification Code', length: 4, format: 'hex', unit: 'digits' },
            2: { name: 'Time (Preauth Time Limit)', length: 4, format: 'hex', unit: 'digits' },
            3: { name: 'Message Reason Code', length: 4, format: 'hex', unit: 'digits' },
            4: { name: 'STIP/Switch Reason Code', length: 4, format: 'hex', unit: 'digits' }
        }
    });

}

export function expandDE104Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return parseTLVDataset(field, {
        field: '104',
        datasetLengthType: 'hex',
        map: DE104_TAG_MAP
    });
}

export function expandDE123Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    const withDatasetLength = parseTLVDataset(field, {
        field: '123',
        datasetLengthType: 'hex',
        hasDatasetLengthByte: true,
        map: DE123_TAG_MAP
    });

    if (withDatasetLength?.children?.length) return withDatasetLength;

    const withoutDatasetLength = parseTLVDataset(field, {
        field: '123',
        datasetLengthType: 'hex',
        map: DE123_TAG_MAP
    });

    if (withoutDatasetLength?.children?.length) return withoutDatasetLength;

    return {
        format: field.decoded?.format ?? 'HEX',
        value: field.decoded?.value ?? field.rawHex,
        children: [{
            subfield: '123.raw',
            name: 'Raw Content',
            size: `${Math.floor((field.rawHex?.length || 0) / 2)} bytes`,
            rawHex: field.rawHex,
            decoded: field.decoded?.value ?? field.rawHex
        }]
    };
}

export function expandDE125Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return parseTLVDataset(field, {
        field: '125',
        datasetLengthType: 'hex',
        hasDatasetLengthByte: false,  // 👈 SEM wrapper de dataset
        map: DE125_TAG_MAP
    });
}

export function expandDE127Visa(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    return parseTLVDataset(field, {
        field: '127',
        datasetLengthType: 'hex',
        map: DE127_TAG_MAP
    });
}

export function expandDE127_old(field) {
    if (!field.rawHex) return null;

    const hex = field.rawHex;
    let pos = 0;
    const result = {};

    // Subfield ID
    const datasetId = hex.substr(pos, 2);
    pos += 2;

    // Length BINÃRIO (base 16)
    const datasetLen = parseInt(hex.substr(pos, 4), 16);
    pos += 4;

    const datasetEnd = pos + (datasetLen * 2);

    while (pos < datasetEnd) {

        const tag = hex.substr(pos, 2);
        pos += 2;

        const len = parseInt(hex.substr(pos, 2), 16);
        pos += 2;

        const valueHex = hex.substr(pos, len * 2);
        pos += len * 2;

        const tagKey = `${datasetId}.${tag}`;
        const cfg = DE127_TAG_MAP[`${datasetId}-${tag}`];

        const decoded = cfg
            ? decodeByType(valueHex, cfg.decoder)
            : valueHex;

        result[`127.${tagKey} - ${cfg?.name || 'Unknown Tag'}`] = decoded;
    }

    return result;
}

function packedBcdToDigits(hex) {
    if (!hex) return '';
    const raw = String(hex).toUpperCase();
    if (!/^[0-9A-F]+$/.test(raw)) return raw;

    let out = '';
    for (let i = 0; i < raw.length; i++) {
        const nibble = raw[i];
        if (nibble === 'F') continue; // filler nibble
        out += nibble;
    }
    return out;
}

function parseDE55TLV(field) {
    const originalHex = String(field.rawHex || '').toUpperCase();
    const hex = normalizeDE55Payload(originalHex);
    const children = parseDE55Flat(hex);

    if (children.length === 0) {
        return {
            format: field.decoded?.format ?? 'HEX',
            value: field.decoded?.value ?? originalHex,
            complex: true,
            children: [{
                subfield: '55.raw',
                name: 'Raw ICC Data',
                size: `${Math.floor(hex.length / 2)} bytes`,
                rawHex: hex,
                decoded: hex
            }]
        };
    }

    return {
        format: field.decoded?.format ?? 'HEX',
        value: field.decoded?.value ?? originalHex,
        complex: true,
        children
    };
}

function normalizeDE55Payload(hex) {
    if (!hex) return '';

    if (parseDE55Flat(hex).length > 0) return hex;

    const candidates = [2, 1];

    for (const lengthBytes of candidates) {
        const prefixSize = lengthBytes * 2;
        if (hex.length <= prefixSize) continue;

        const lenHex = hex.slice(0, prefixSize);
        if (!/^[0-9A-F]+$/.test(lenHex)) continue;

        const expectedBytes = parseInt(lenHex, 16);
        const remainingBytes = Math.floor((hex.length - prefixSize) / 2);

        if (expectedBytes === remainingBytes) {
            const candidateHex = hex.slice(prefixSize);
            if (parseDE55Flat(candidateHex).length > 0) {
                return candidateHex;
            }
        }
    }

    return hex;
}

function parseDE55Flat(hex) {
    const children = [];
    let pos = 0;

    while (pos < hex.length) {
        const tagRead = readBerTag(hex, pos);
        if (!tagRead) break;

        const lengthRead = readBerLength(hex, tagRead.nextPos, hex.length);
        if (!lengthRead) break;

        const valueEnd = lengthRead.nextPos + (lengthRead.length * 2);
        if (valueEnd > hex.length) {
            break;
        }

        const valueHex = hex.slice(lengthRead.nextPos, valueEnd);
        children.push({
            subfield: tagRead.tag,
            name: getDE55TagName(tagRead.tag),
            size: `${lengthRead.length} bytes`,
            rawHex: valueHex,
            length: lengthRead.length,
            decoded: decodeDE55TagValue(tagRead.tag, valueHex)
        });

        pos = valueEnd;
    }

    return children;
}

function readBerTag(hex, pos) {
    if (pos + 2 > hex.length) return null;

    let tag = hex.slice(pos, pos + 2);
    pos += 2;

    if ((parseInt(tag, 16) & 0x1F) === 0x1F) {
        while (pos + 2 <= hex.length) {
            const nextByte = hex.slice(pos, pos + 2);
            tag += nextByte;
            pos += 2;
            if ((parseInt(nextByte, 16) & 0x80) === 0) break;
        }
    }

    return { tag, nextPos: pos };
}

function readBerLength(hex, pos, end) {
    if (pos + 2 > end) return null;

    const firstByte = parseInt(hex.slice(pos, pos + 2), 16);
    pos += 2;

    if ((firstByte & 0x80) === 0) {
        return { length: firstByte, nextPos: pos };
    }

    const lengthBytes = firstByte & 0x7F;
    if (lengthBytes === 0 || pos + (lengthBytes * 2) > end) return null;

    const lengthHex = hex.slice(pos, pos + (lengthBytes * 2));
    return {
        length: parseInt(lengthHex, 16),
        nextPos: pos + (lengthBytes * 2)
    };
}

function decodeDE55TagValue(tag, valueHex) {
    const type = DE55_TAG_TYPES[tag] || 'hex';

    switch (type) {
        case 'aid':
            return decodeAid(valueHex);
        case 'bcd':
            return packedBcdToDigits(valueHex);
        case 'ascii':
            return hexToAsciiLocal(valueHex);
        case 'text':
            return tryDecodeText(valueHex);
        default:
            return valueHex;
    }
}

function tryDecodeText(hex) {
    const ascii = hexToAsciiLocal(hex);
    return /[A-Za-z0-9 ]/.test(ascii) ? ascii : hex;
}

function hexToAsciiLocal(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        str += code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
    }
    return str;
}

function getDE55TagName(tag) {
    return DE55_TAG_NAMES[tag] || `EMV Tag ${tag}`;
}

const DE55_TAG_TYPES = {
    '4F': 'aid',
    '5A': 'bcd',
    '57': 'bcd',
    '5F20': 'text',
    '5F24': 'bcd',
    '5F25': 'bcd',
    '5F2A': 'bcd',
    '5F34': 'bcd',
    '82': 'hex',
    '84': 'aid',
    '8A': 'ascii',
    '8E': 'hex',
    '8F': 'hex',
    '91': 'hex',
    '94': 'hex',
    '95': 'hex',
    '97': 'hex',
    '98': 'hex',
    '99': 'hex',
    '9A': 'bcd',
    '9C': 'bcd',
    '9F02': 'bcd',
    '9F03': 'bcd',
    '9F09': 'bcd',
    '9F10': 'hex',
    '9F1A': 'bcd',
    '9F1E': 'ascii',
    '9F21': 'bcd',
    '9F26': 'hex',
    '9F27': 'hex',
    '9F33': 'hex',
    '9F34': 'hex',
    '9F35': 'hex',
    '9F36': 'hex',
    '9F37': 'hex',
    '9F39': 'hex',
    '9F40': 'hex',
    '9F41': 'bcd',
    '9F53': 'hex',
    '9F6E': 'hex'
};

function decodeAid(valueHex) {
    const aid = String(valueHex || '').toUpperCase();
    const label = EMV_AID_MAP[aid];
    return label ? `${aid} - ${label}` : aid;
}

const EMV_AID_MAP = {
    'A0000000031010': 'Visa Credit/Debit',
    'A0000000032010': 'Visa Electron',
    'A0000000032020': 'V PAY',
    'A0000000033010': 'Visa Interlink',
    'A0000000033060': 'Visa Business Electron',
    'A0000000034010': 'Visa Purchasing',
    'A0000000035010': 'Visa Fleet',
    'A0000000036010': 'Visa Corporate',
    'A0000000037010': 'Visa Commercial',
    'A0000000038010': 'Visa Plus',
    'A000000003999910': 'Visa ATM'
};

const DE55_TAG_NAMES = {
    '4F': 'Application Identifier (AID)',
    '50': 'Application Label',
    '57': 'Track 2 Equivalent Data',
    '5A': 'Application Primary Account Number (PAN)',
    '5F20': 'Cardholder Name',
    '5F24': 'Application Expiration Date',
    '5F25': 'Application Effective Date',
    '5F28': 'Issuer Country Code',
    '5F2A': 'Transaction Currency Code',
    '5F34': 'Application PAN Sequence Number',
    '82': 'Application Interchange Profile',
    '84': 'Dedicated File Name',
    '8A': 'Authorisation Response Code',
    '8E': 'Cardholder Verification Method List',
    '8F': 'Certification Authority Public Key Index',
    '91': 'Issuer Authentication Data',
    '94': 'Application File Locator',
    '95': 'Terminal Verification Results',
    '97': 'Transaction Certificate Data Object List',
    '98': 'Transaction Certificate Hash Value',
    '99': 'Transaction PIN Data',
    '9A': 'Transaction Date',
    '9C': 'Transaction Type',
    '9F02': 'Amount, Authorised',
    '9F03': 'Amount, Other',
    '9F09': 'Application Version Number',
    '9F10': 'Issuer Application Data',
    '9F1A': 'Terminal Country Code',
    '9F1E': 'Interface Device Serial Number',
    '9F21': 'Transaction Time',
    '9F26': 'Application Cryptogram',
    '9F27': 'Cryptogram Information Data',
    '9F33': 'Terminal Capabilities',
    '9F34': 'Cardholder Verification Method Results',
    '9F35': 'Terminal Type',
    '9F36': 'Application Transaction Counter',
    '9F37': 'Unpredictable Number',
    '9F39': 'POS Entry Mode',
    '9F40': 'Additional Terminal Capabilities',
    '9F41': 'Transaction Sequence Counter',
    '9F53': 'Transaction Category Code',
    '9F6E': 'Third Party Data'
};

const DE104_TAG_MAP = {
    '66-C0': { name: 'Postal Code', decoder: 'numeric' },
    '1A-80': { name: 'Fuel Indicator', decoder: 'numeric' },
    '1A-81': { name: 'Service Type', decoder: 'numeric' },
    '1A-83': { name: 'Product Code', decoder: 'numeric' },
    '1A-84': { name: 'Product Category/Description', decoder: 'numeric' },
    '1A-88': { name: 'Unit Price', decoder: 'numeric' },
    '1A-89': { name: 'Unit Price Minor Unit', decoder: 'numeric' },
    '1A-8A': { name: 'Unit of Measure', decoder: 'numeric' },
    '1A-8B': { name: 'Product Quantity', decoder: 'numeric' },
    '1A-8C': { name: 'Quantity Minor Unit', decoder: 'numeric' },
    '1A-8D': { name: 'Total Time Plugged In', decoder: 'numeric' },
    '1A-8E': { name: 'Total Charging Time', decoder: 'numeric' },
    '1A-8F': { name: 'Start Time of Charge', decoder: 'numeric' },
    '1A-90': { name: 'Finish Time of Charge', decoder: 'numeric' },
    '1A-91': { name: 'Total Amount Including tax (Gross Price)', decoder: 'numeric' },
    '1A-93': { name: 'Discount Rate - Percentage', decoder: 'numeric' },
    '1A-94': { name: 'Discount Rate - Unit Discount', decoder: 'numeric' },
    '1A-95': { name: 'Discount Rate - Flat Rate per transaction', decoder: 'numeric' },
    '1A-96': { name: 'Total Discount Amount', decoder: 'numeric' },
    '1A-97': { name: 'Net Amount (Net Price)', decoder: 'numeric' },
    '1A-98': { name: 'Non-Taxable Indicator', decoder: 'numeric' },
    '1A-99': { name: 'Local Tax Included Indicator', decoder: 'numeric' },
    '1A-9A': { name: 'Local Tax Amount', decoder: 'numeric' },
    '1A-9B': { name: 'Local Tax Rate', decoder: 'numeric' },
    '1A-9C': { name: 'National Tax Included Indicator', decoder: 'numeric' },
    '1A-9D': { name: 'National Tax Amount', decoder: 'numeric' },
    '1A-9E': { name: 'National Tax Rate', decoder: 'numeric' },
    '1A-9F': { name: 'Other Tax Included Indicator', decoder: 'numeric' },
    '1A-9F': { name: 'Other Tax Amount', decoder: 'numeric' },
    '1A-9F': { name: 'Other Tax Rate', decoder: 'numeric' },
    '02-05': { name: 'Pre-Tax Amount', decoder: 'numeric' },
    '02-07': { name: 'Tax Rate', decoder: 'numeric' },
    '02-08': { name: 'Discount Amount', decoder: 'numeric' },
    '02-09': { name: 'Prohibited Item Indicator', decoder: 'numeric' },
    '18-80': { name: 'Recurring Payment Type', decoder: 'numeric' },
    '18-81': { name: 'Payment Amount Indicator Per Transaction', decoder: 'numeric' },
    '18-82': { name: 'Number of Recurring Payment', decoder: 'numeric' },
    '18-83': { name: 'Frequency of Recurring Payment', decoder: 'numeric' },
    '18-84': { name: 'Registration Reference Number', decoder: 'numeric' },
    '18-85': { name: 'Maximum Recurring Payment Amount', decoder: 'numeric' },
    '18-86': { name: 'Validation Indicator', decoder: 'numeric' },
    '56-01': { name: 'Payment Facilitator ID', decoder: 'numeric' },
    '56-02': { name: 'Sub-Merchant ID', decoder: 'numeric' },
    '56-03': { name: 'Independent Sales Organization ID', decoder: 'numeric' },
    '56-04': { name: 'Foreign Retailer Indicator', decoder: 'numeric' },
    '56-81': { name: 'Acceptor Legal Business Name', decoder: 'ebcdic' },
    '56-82': { name: 'Payment Facilitator Name', decoder: 'numeric' },
    '56-83': { name: 'Marketplace ID', decoder: 'numeric' },
    '56-84': { name: 'Gateway ID', decoder: 'numeric' },
    '56-85': { name: 'Staged Digital Wallet ID', decoder: 'numeric' },
    '56-86': { name: 'Ramp Provider ID', decoder: 'numeric' },
    '57-01': { name: 'Business Application Identifier', decoder: 'ebcdic' },
    '57-80': { name: 'Service Processing Type', decoder: 'numeric' },
    '57-81': { name: 'Deferred OCT Date/Time Value', decoder: 'numeric' },
    '57-82': { name: 'Purpose of Payment', decoder: 'numeric' },
    '57-83': { name: 'Maximum Processing Date', decoder: 'numeric' },
    '57-02': { name: 'Source of Funds', decoder: 'numeric' },
    '57-84': { name: 'Scheme Identifier', decoder: 'ebcdic' },
    '58-01': { name: 'Benefit Administrator ID', decoder: 'numeric' },
    '58-02': { name: 'Service Type Code', decoder: 'numeric' },
    '58-03': { name: 'Payer ID/ Carrier ID', decoder: 'numeric' },
    '58-04': { name: 'Approval or Reject Reason Code', decoder: 'numeric' },
    '59-01': { name: 'Promotion Type', decoder: 'numeric' },
    '59-02': { name: 'Promotion Code', decoder: 'numeric' },
    '59-03': { name: 'Promotion Description', decoder: 'numeric' },
    '59-04': { name: 'Receipt Data', decoder: 'numeric' },
    '59-05': { name: 'Merchant Indicator', decoder: 'numeric' },
    '59-06': { name: 'Discount Indicator', decoder: 'numeric' },
    '59-07': { name: 'Unit Discount', decoder: 'numeric' },
    '59-08': { name: 'Unit Quantity', decoder: 'numeric' },
    '5B-01': { name: 'Risk Score', decoder: 'numeric' },
    '5B-02': { name: 'Risk Condition Code', decoder: 'numeric' },
    '5B-80': { name: 'Authorization Posting Score', decoder: 'numeric' },
    '5B-84': { name: 'Watch List Results Code', decoder: 'numeric' },
    '5B-85': { name: 'Visa Account Attack Intelligence Score', decoder: 'numeric' },
    '5B-86': { name: 'Visa Deep Authorization Score', decoder: 'numeric' },
    '5C-01': { name: 'Type of Purchase', decoder: 'numeric' },
    '5C-02': { name: 'Service Type', decoder: 'numeric' },
    '5C-03': { name: 'Fuel Type', decoder: 'numeric' },
    '5C-04': { name: 'Unit of Measure', decoder: 'numeric' },
    '5C-05': { name: 'Quantity', decoder: 'numeric' },
    '5C-06': { name: 'Unit Cost', decoder: 'numeric' },
    '5C-07': { name: 'Gross Fuel Price', decoder: 'numeric' },
    '5C-08': { name: 'Net Fuel Price', decoder: 'numeric' },
    '5C-09': { name: 'Gross Non-Fuel Price', decoder: 'numeric' },
    '5C-10': { name: 'Estimated Km/Miles Added', decoder: 'numeric' },
    '5C-11': { name: 'Carbon Footprint', decoder: 'numeric' },
    '5C-12': { name: 'Estimated Vehicle Km/Miles Available', decoder: 'numeric' },
    '5C-13': { name: 'Local Tax Included', decoder: 'numeric' },
    '5C-14': { name: 'Local Tax', decoder: 'numeric' },
    '5C-15': { name: 'National Tax Included', decoder: 'numeric' },
    '5C-16': { name: 'National Tax', decoder: 'numeric' },
    '5C-17': { name: 'Other Tax', decoder: 'numeric' },
    '5C-18': { name: 'Merchant VAT Registration/Single Business Reference Number', decoder: 'numeric' },
    '5C-19': { name: 'Customer VAT Registration Number', decoder: 'numeric' },
    '5C-0A': { name: 'Net Non-Fuel Price', decoder: 'numeric' },
    '5C-0B': { name: 'Odometer Reading', decoder: 'numeric' },
    '5C-0C': { name: 'Charging Power Output Capacity', decoder: 'numeric' },
    '5C-0D': { name: 'Charging Reason Code', decoder: 'numeric' },
    '5C-0E': { name: 'VAT/Tax Rate', decoder: 'numeric' },
    '5C-0F': { name: 'Miscellaneous Fuel Tax Exemption Status', decoder: 'numeric' },
    '5C-1A': { name: 'Customer Reference Number', decoder: 'numeric' },
    '5C-1B': { name: 'Message Identifier', decoder: 'numeric' },
    '5C-1C': { name: 'Additional Data Indicator', decoder: 'numeric' },
    '5C-1D': { name: 'Maximum Power Dispensed', decoder: 'numeric' },
    '5C-1E': { name: 'Summary Commodity Code', decoder: 'numeric' },
    '5C-1F': { name: 'Non-Fuel Product Code 1', decoder: 'numeric' },
    '5C-1F02': { name: 'Non-Fuel Product Code 2', decoder: 'numeric' },
    '5C-1F03': { name: 'Non-Fuel Product Code 3', decoder: 'numeric' },
    '5C-1F04': { name: 'Non-Fuel Product Code 4', decoder: 'numeric' },
    '5C-1F05': { name: 'Non-Fuel Product Code 5', decoder: 'numeric' },
    '5C-1F06': { name: 'Non-Fuel Product Code 6', decoder: 'numeric' },
    '5C-1F07': { name: 'Non-Fuel Product Code 7', decoder: 'numeric' },
    '5C-1F08': { name: 'Non-Fuel Product Code 8', decoder: 'numeric' },
    '5C-1F09': { name: 'Fuel Brand', decoder: 'numeric' },
    '5C-1F0A': { name: 'Fuel Transaction Validation Results', decoder: 'numeric' },
    '5C-1F0B': { name: 'Fuel Acceptance Mode', decoder: 'numeric' },
    '5C-1F10': { name: 'Expanded Fuel Type', decoder: 'numeric' },
    '5C-1F11': { name: 'Fleet Employee Number', decoder: 'numeric' },
    '5C-1F12': { name: 'Fleet Trailer Number', decoder: 'numeric' },
    '5C-1F13': { name: 'Fleet Additional Prompted Data 1', decoder: 'numeric' },
    '5C-1F14': { name: 'Fleet Additional Prompted Data 2', decoder: 'numeric' },
    '5C-1F27': { name: 'Connector Type', decoder: 'numeric' },
    '5C-1F28': { name: 'Discount Method', decoder: 'numeric' },
    '5C-1F29': { name: 'Discount Agent', decoder: 'numeric' },
    '5C-1F2A': { name: 'Discount Plan ID', decoder: 'numeric' },
    '5C-1F2B': { name: 'Client ID', decoder: 'numeric' },
    '5C-1F2C': { name: 'National Tax Rate', decoder: 'numeric' },
    '5C-1F2D': { name: 'Other Tax Included', decoder: 'numeric' },
    '5C-1F2E': { name: 'Other Tax Rate', decoder: 'numeric' },
    '5D-01': { name: 'Total Installment Amount', decoder: 'numeric' },
    '5D-02': { name: 'Installment Payment Currency', decoder: 'numeric' },
    '5D-03': { name: 'Number of Installments', decoder: 'numeric' },
    '5D-04': { name: 'Amount of Each Installment', decoder: 'numeric' },
    '5D-51': { name: 'Installment Payment Number', decoder: 'numeric' },
    '5D-62': { name: 'Frequency of Installments', decoder: 'numeric' },
    '5D-73': { name: 'Date of First Installment', decoder: 'numeric' },
    '5D-08': { name: 'Total Amount Funded', decoder: 'numeric' },
    '5D-09': { name: 'Percent of Amount Requested', decoder: 'numeric' },
    '5D-0A': { name: 'Total Expenses', decoder: 'numeric' },
    '5D-0B': { name: 'Percent of Total Expenses', decoder: 'numeric' },
    '5D-0C': { name: 'Total Fees', decoder: 'numeric' },
    '5D-0D': { name: 'Percent of Total Fees', decoder: 'numeric' },
    '5D-0E': { name: 'Total Taxes', decoder: 'numeric' },
    '5D-0F': { name: 'Percent of Total taxes', decoder: 'numeric' },
    '5D-10': { name: 'Total Insurance', decoder: 'numeric' },
    '5D-11': { name: 'Percent of Total Insurance', decoder: 'numeric' },
    '5D-12': { name: 'Total Other Costs', decoder: 'numeric' },
    '5D-13': { name: 'Percent of Total Other Costs', decoder: 'numeric' },
    '5D-14': { name: 'Monthly Interest Rates', decoder: 'numeric' },
    '5D-15': { name: 'Annual Interest Rate', decoder: 'numeric' },
    '5D-16': { name: 'Annual Total Cost of Financing', decoder: 'numeric' },
    '5D-17': { name: 'Installment Payment Type', decoder: 'numeric' },
    '5D-18': { name: 'Grace Period', decoder: 'numeric' },
    '5D-19': { name: 'Installment Payment Interest', decoder: 'numeric' },
    '5D-1A': { name: 'VAT for Installment Payment Interest', decoder: 'numeric' },
    '5D-80': { name: 'Plan Owner', decoder: 'numeric' },
    '5D-82': { name: 'Plan Registration System Identifier', decoder: 'numeric' },
    '5F-01': { name: 'Sender Reference Number', decoder: 'numeric' },
    '5F-02': { name: 'Sender Account Number', decoder: 'numeric' },
    '5F-03': { name: 'Sender Name', decoder: 'numeric' },
    '5F-04': { name: 'Sender Address', decoder: 'numeric' },
    '5F-05': { name: 'Sender City', decoder: 'numeric' },
    '5F-06': { name: 'Sender State', decoder: 'numeric' },
    '5F-07': { name: 'Sender Country', decoder: 'numeric' },
    '5F-08': { name: 'Source of Funds', decoder: 'numeric' },
    '5F-09': { name: 'Claim Code', decoder: 'numeric' },
    '5F-0A': { name: 'Recipient Name', decoder: 'numeric' },
    '5F-0B': { name: 'Confirmation Number', decoder: 'numeric' },
    '5F-0C': { name: 'Recipient City', decoder: 'numeric' },
    '5F-0D': { name: 'Recipient Country', decoder: 'numeric' },
    '5F-0E': { name: 'Proprietary Amount Type', decoder: 'numeric' },
    '5F-0F': { name: 'Proprietary Amount', decoder: 'numeric' },
    '5F-10': { name: 'Sender Postal Code', decoder: 'numeric' },
    '60-01': { name: 'Fare Basis Code-Leg 1', decoder: 'numeric' },
    '60-02': { name: 'Fare Basis Code-Leg 2', decoder: 'numeric' },
    '60-03': { name: 'Fare Basis Code-Leg 3', decoder: 'numeric' },
    '60-04': { name: 'Fare Basis Code-Leg 4', decoder: 'numeric' },
    '60-05': { name: 'Computerized Res System', decoder: 'numeric' },
    '60-06': { name: 'Flight Number-Leg 1', decoder: 'numeric' },
    '60-07': { name: 'Flight Number-Leg 2', decoder: 'numeric' },
    '60-08': { name: 'Flight Number-Leg 3', decoder: 'numeric' },
    '60-09': { name: 'Flight Number-Leg 4', decoder: 'numeric' },
    '60-0A': { name: 'Credit Reason Indicator', decoder: 'numeric' },
    '60-0B': { name: 'Ticket Change Indicator', decoder: 'numeric' },
    '61-01': { name: 'Days Rented', decoder: 'numeric' },
    '61-02': { name: 'Daily Rental Rate', decoder: 'numeric' },
    '61-03': { name: 'Weekly Rental Rate', decoder: 'numeric' },
    '61-04': { name: 'Insurance Charges', decoder: 'numeric' },
    '61-05': { name: 'Fuel Charges', decoder: 'numeric' },
    '61-06': { name: 'Car Class Code', decoder: 'numeric' },
    '61-07': { name: 'One-Way Drop-Off Charges', decoder: 'numeric' },
    '61-08': { name: 'Renter Name', decoder: 'numeric' },
    '62-01': { name: 'Daily Room Rate', decoder: 'numeric' },
    '62-02': { name: 'Total Tax', decoder: 'numeric' },
    '62-03': { name: 'Prepaid Expenses', decoder: 'numeric' },
    '62-04': { name: 'Food/Bev Charges', decoder: 'numeric' },
    '62-05': { name: 'Folio Cash Advances', decoder: 'numeric' },
    '62-06': { name: 'Room Nights', decoder: 'numeric' },
    '62-07': { name: 'Total Room Tax', decoder: 'numeric' },
    '63-01': { name: 'Local Tax Indicator', decoder: 'numeric' },
    '63-02': { name: 'Local Tax', decoder: 'numeric' },
    '63-03': { name: 'National Tax Indicator', decoder: 'numeric' },
    '63-04': { name: 'National Tax', decoder: 'numeric' },
    '63-05': { name: 'Merchant VAT Registration/Single Business Reference Number', decoder: 'numeric' },
    '63-06': { name: 'Customer VAT Registration Number', decoder: 'numeric' },
    '63-07': { name: 'Summary Commodity Code', decoder: 'numeric' },
    '63-08': { name: 'Other Tax', decoder: 'numeric' },
    '63-09': { name: 'Message Identifier', decoder: 'numeric' },
    '63-0A': { name: 'Time of Purchase', decoder: 'numeric' },
    '63-0B': { name: 'Customer Reference Number', decoder: 'numeric' },
    '63-13': { name: 'Merchant Postal Code', decoder: 'numeric' },
    '63-15': { name: 'Additional Data Indicator', decoder: 'numeric' },
    '63-80': { name: 'Merchant Reference Number', decoder: 'numeric' },
    '63-82': { name: 'VAT Documentation Indicator', decoder: 'numeric' },
    '64-01': { name: 'Compromised Account Risk Condition Code (CARCC)', decoder: 'numeric' },
    '64-02': { name: 'VAA Risk Score', decoder: 'numeric' },
    '65-01': { name: 'n/a', decoder: 'numeric' },
    '65-02': { name: 'Client-defined data', decoder: 'numeric' },
    '65-03': { name: 'Mastercard Data Element DE121-Authorizing Agent ID Code', decoder: 'numeric' },
    '65-04': { name: 'Mastercard Data Element DE48, Subelement 23- Payment Initiation Channel', decoder: 'numeric' },
    '65-05': { name: 'Mastercard Data Element DE48, Subelement 95- Promotion Code', decoder: 'numeric' },
    '65-06': { name: 'Mastercard Data Element DE112', decoder: 'numeric' },
    '65-07': { name: 'Mastercard Data Element DE48, Subelement 32- Mastercard Assigned ID', decoder: 'numeric' },
    '65-09': { name: 'Mastercard Data Element DE48, Subelement 64- Transit Program', decoder: 'numeric' },
    '65-11': { name: 'Mastercard Data Element DE54', decoder: 'numeric' },
    '65-12': { name: 'Mastercard Data Element DE48, Subelement 61, Subfield 5', decoder: 'numeric' },
    '65-13': { name: 'Mastercard Data Element DE61, Subelement 11', decoder: 'numeric' },
    '65-14': { name: 'Mastercard Data Element DE48, Subelement 74, Subfield 1, Subfield 2', decoder: 'numeric' },
    '65-15': { name: 'Mastercard Data Element DE48, Subelement 42- Electronic Commerce Indicators, Subfield 1 (Electronic Commerce Security Level Indicator and UCAF Collection Indicator), position 2', decoder: 'numeric' },
    '65-16': { name: 'Mastercard Data Element DE61, Subfield 3', decoder: 'numeric' },
    '65-18': { name: 'Mastercard Data Element DE48, Subelement 57, Subfield 1, Subfield 2', decoder: 'numeric' },
    '65-19': { name: 'Mastercard Data Element DE48, Subelement 65- Terminal Compliant Indicator, Subfield 1 (Terminal Line Encryption), Subfield 2 (UKPT/DUKPT Compliant)', decoder: 'numeric' },
    '65-20': { name: 'Mastercard Data Element DE48, Subelement 48- Mobile Program Indicators, Subfield 2 (Mastercard Mobile Remote Payment Transaction Types)', decoder: 'numeric' },
    '65-21': { name: 'Mastercard Data Element DE48, Subelement 37- Mastercard Mobile Remote Payment Transaction Types, Subfield 1 (Payment Facilitator ID), Subfield 2 (Independent Sales Organization ID), Subfield 3 (Sub-Merchant ID)', decoder: 'numeric' },
    '65-22': { name: 'Mastercard Data Element DE48, Subelement 17', decoder: 'numeric' },
    '65-23': { name: 'Reserved', decoder: 'numeric' },
    '65-24': { name: 'Mastercard Data Element DE22, Subelement 1', decoder: 'numeric' },
    '65-25': { name: 'Mastercard Data Element DE48, Subelement 33, Subfield 5', decoder: 'numeric' },
    '65-26': { name: 'Mastercard Data Element DE48, Subelement 33, Subfield 6', decoder: 'numeric' },
    '65-28': { name: 'Mastercard Data Element (DE) 48, Subelement 52', decoder: 'numeric' },
    '65-29': { name: 'Mastercard Data Element (DE) 61, Subelement 7', decoder: 'numeric' },
    '65-30': { name: 'Mastercard Data Element (DE) 48, Subelement 61, Subfield 4', decoder: 'numeric' },
    '65-31': { name: 'Mastercard Data Element (DE) 48, Subelement 55, Subfield 1, Subfield 2', decoder: 'numeric' },
    '65-32': { name: 'Mastercard Data Element (DE) 48, Subelement 77', decoder: 'numeric' },
    '65-33': { name: 'Mastercard Data Element (DE) 48, Subelement 14', decoder: 'numeric' },
    '65-34': { name: 'Mastercard Data Element (DE) 48, Subelement 14', decoder: 'numeric' },
    '65-35': { name: 'Mastercard Data Element DE48, Subelement 53, Subfield 1 (E-ID Request Value)', decoder: 'numeric' },
    '65-36': { name: 'Mastercard Data Element DE48, Subelement 21', decoder: 'numeric' },
    '65-37': { name: 'Mastercard Data Element DE48, Subelement 66', decoder: 'numeric' },
    '65-38': { name: 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 01 (Low-Risk Merchant Indicator)', decoder: 'numeric' },
    '65-39': { name: 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 02 (Single tap indicator)', decoder: 'numeric' },
    '65-40': { name: 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 03 (Response to PIN request)', decoder: 'numeric' },
    '65-41': { name: 'Mastercard Data Element (DE) 48, Subelement 22, Subfield 04 (Issuer PIN request in a single tap mode)', decoder: 'numeric' },
    '65-42': { name: 'Acquiring Institution ID Code', decoder: 'numeric' },
    '65-43': { name: 'Digital Secure Remote Payment (DSRP) (Token) Cryptogram', decoder: 'numeric' },
    '65-44': { name: 'Remote Commerce Acceptor Identifier', decoder: 'numeric' },
    '65-46': { name: 'Mastercard Data Element DE48, Subelement 03, Subfield 04 (Merchant Country of Origin Indicator)', decoder: 'numeric' },
    '65-47': { name: 'Mastercard Data Element DE48, Subelement 24', decoder: 'numeric' },
    '65-48': { name: 'Data Element (DE) 39 and Data Element (DE) 48, Subelement 84 â€” Merchant Advice Code', decoder: 'numeric' },
    '65-49': { name: 'Data Element (DE) 48, Subelement 22, Subfield 05 - Cardholder/Merchant Initiated Transaction Indicator', decoder: 'numeric' },
    '65-51': { name: 'Mastercard Data Element DE108, Subelement 3, Subfield 01 (Sender Reference Number)', decoder: 'numeric' },
    '65-56': { name: 'Mastercard Data Element DE48, Subelement 37, Subfield 05 (Merchant Payment Gateway ID)', decoder: 'numeric' },
    '65-0A': { name: 'Mastercard Data Element DE39, Value 34 (Suspect fraud)', decoder: 'numeric' },
    '65-0B': { name: 'Mastercard Data Element DE48, Subelement 18- Service Parameters, Subfield 1 (Canada Domestic Indicator)', decoder: 'numeric' },
    '65-0C': { name: 'Mastercard Data Element DE48, Subelement 26-Wallet Program Data, Subfield 1 Wallet Identifier)', decoder: 'numeric' },
    '65-0D': { name: 'Mastercard Data Element DE123 Receipt Free Text', decoder: 'numeric' },
    '65-0E': { name: 'Mastercard Data Element DE48, Subelement 25- Prepaid Activation/Load, Subfield 1 (Message Identifier)', decoder: 'numeric' },
    '65-0F': { name: 'Mastercard Data element DE48', decoder: 'numeric' },
    '66-01': { name: 'American Express Data Field (DF) 48, Additional Data ', decoder: 'numeric' },
    '66-05': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-06': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-07': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-08': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-09': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-10': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-11': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-12': { name: 'American Express Data Field (DF) 22, POS Data Code, position 4', decoder: 'numeric' },
    '66-13': { name: 'MCIT Indicator', decoder: 'numeric' },
    '66-14': { name: 'American Express Data Element DE 112, Subelement 001- Payment Account Reference', decoder: 'numeric' },
    '66-15': { name: 'American Express Data Field 113, Subfield 5', decoder: 'numeric' },
    '66-16': { name: 'American Express Data Field 60, Subfield 8', decoder: 'numeric' },
    '66-17': { name: 'Indirect Model Type Indicator', decoder: 'numeric' },
    '66-0A': { name: 'American Express Data Field 22, Subfield 5', decoder: 'numeric' },
    '66-0B': { name: 'Not applicable', decoder: 'numeric' },
    '66-0C': { name: 'Seller ID', decoder: 'numeric' },
    '66-0D': { name: 'American Express Data Field 60, Subfield 6', decoder: 'numeric' },
    '66-0E': { name: 'Not applicable', decoder: 'numeric' },
    '66-0F': { name: 'American Express Data Field 60, Subfield 5', decoder: 'numeric' },
    '67-01': { name: 'Country Code', decoder: 'numeric' },
    '67-02': { name: 'Installment', decoder: 'numeric' },
    '67-03': { name: 'Consumer Deferred Sale', decoder: 'numeric' },
    '67-04': { name: 'POS Web', decoder: 'numeric' },
    '67-05': { name: 'Installment Inquiry Response', decoder: 'numeric' },
    '67-06': { name: 'Issuer Installments', decoder: 'numeric' },
    '67-80': { name: 'Type of Installment', decoder: 'numeric' },
    '67-81': { name: 'Number of Installments', decoder: 'numeric' },
    '67-82': { name: 'Amount of Each Installment', decoder: 'numeric' },
    '67-83': { name: 'Transaction Rate', decoder: 'numeric' },
    '67-84': { name: 'Deferred Period ID', decoder: 'numeric' },
    '67-85': { name: 'Amount of Installments 1', decoder: 'numeric' },
    '67-86': { name: 'Transaction Rate 1', decoder: 'numeric' },
    '67-87': { name: 'Deferred Period ID 1', decoder: 'numeric' },
    '67-88': { name: 'Amount of Installments 2', decoder: 'numeric' },
    '67-89': { name: 'Transaction Rate 2', decoder: 'numeric' },
    '67-90': { name: 'Deferred Period ID 2', decoder: 'numeric' },
    '67-91': { name: 'Amount of Installments 3', decoder: 'numeric' },
    '67-92': { name: 'Transaction Rate 3', decoder: 'numeric' },
    '67-93': { name: 'Deferred Period ID 3', decoder: 'numeric' },
    '67-94': { name: 'Simulation Flag', decoder: 'numeric' },
    '67-95': { name: 'Gracia Flag', decoder: 'numeric' },
    '67-96': { name: 'Deferred Flag', decoder: 'numeric' },
    '67-97': { name: 'Domestic E-commerce Tool', decoder: 'numeric' },
    '67-98': { name: 'Domestic E-commerce Tool Data', decoder: 'numeric' },
    '69-01': { name: 'Number of Payment Forms', decoder: 'numeric' },
    '6C-01': { name: 'Travel Tag Codes', decoder: 'numeric' },
    '6D-01': { name: 'Authentication Alert', decoder: 'numeric' },
    '6E-01': { name: 'Cardholder Tax ID Type', decoder: 'numeric' },
    '6E-02': { name: 'Cardholder Tax ID', decoder: 'numeric' },
    '6E-03': { name: 'Asset Indicator', decoder: 'numeric' },
    '6E-04': { name: 'Loan Type', decoder: 'numeric' },
    '6E-05': { name: 'Merchant Program Identifier', decoder: 'numeric' },
    '70-01': { name: 'Transaction Statement 1', decoder: 'numeric' },
    '70-02': { name: 'Transaction Statement 2', decoder: 'numeric' },
    '70-03': { name: 'Transaction Statement 3', decoder: 'numeric' },
    '70-04': { name: 'Transaction Statement 4', decoder: 'numeric' },
    '70-05': { name: 'Transaction Statement 5', decoder: 'numeric' },
    '71-01': { name: 'Free-form data', decoder: 'numeric' }
};

const DE123_TAG_MAP = {
    '66-C0': { name: 'Postal Code', decoder: 'numeric' },
    '66-CF': { name: 'Street Address', decoder: 'numeric' },
    '66-D0': { name: 'Compressed AVS Data', decoder: 'numeric' },
    '66-D4': { name: 'Cardholder Name', decoder: 'ebcdic' },
    '66-D6': { name: 'Cardholder Shipping Hash', decoder: 'numeric' },

    '67-03': { name: 'Result', decoder: 'numeric' },
    '67-04': { name: 'Active Account Management Velocity Checking Result', decoder: 'numeric' },
    '67-05': { name: 'Cardholder Verification Methods Identified by Cardholder Device', decoder: 'binary' },
    '67-07': { name: 'Issuer Special Condition Code', decoder: 'numeric' },
    '67-08': { name: 'Token Verification Result Code', decoder: 'numeric' },
    '67-84': { name: 'Other Phone Number Verification Result', decoder: 'numeric' },
    '67-85': { name: 'Other Email Address Verification Result', decoder: 'numeric' },

    '68-01': { name: 'Token', decoder: 'ebcdic' },
    '68-02': { name: 'Token Assurance Method', decoder: 'numeric' },
    '68-03': { name: 'Token Requestor ID', decoder: 'ebcdic' },
    '68-04': { name: 'Primary Account Number, Account Range', decoder: 'numeric' },
    '68-05': { name: 'Token Reference ID', decoder: 'ebcdic' },
    '68-06': { name: 'Token Expiration Date', decoder: 'ebcdic' },
    '68-07': { name: 'Token Type', decoder: 'ebcdic' },
    '68-08': { name: 'Token Status', decoder: 'ebcdic' },
    '68-0B': { name: 'PAN Reference ID', decoder: 'ebcdic' },
    '68-0A': { name: 'Last Updated By', decoder: 'ebcdic' },
    '68-10': { name: 'Visa Token Score', decoder: 'numeric' },
    '68-11': { name: 'Visa Token Decisioning', decoder: 'numeric' },
    '68-12': { name: 'Number of Active Tokens', decoder: 'numeric' },
    '68-13': { name: 'Number of Inactive Tokens', decoder: 'numeric' },
    '68-14': { name: 'Number of Suspended Tokens', decoder: 'numeric' },
    '68-80': { name: 'Bound Device Index', decoder: 'numeric' },
    '68-81': { name: 'Token User Identifier', decoder: 'numeric' },
    '68-82': { name: 'Token User Application Type', decoder: 'numeric' },
    '68-83': { name: 'Token Authentication Factor A', decoder: 'numeric' },
    '68-86': { name: 'Token Requestor - TSP ID', decoder: 'numeric' },
    '68-88': { name: 'Token Expiration Date', decoder: 'numeric' },
    '68-89': { name: 'Token Status', decoder: 'numeric' },
    '68-0B': { name: 'PAN Reference ID', decoder: 'ebcdic' },
    '68-0D': { name: 'Auto Fill Indicator', decoder: 'numeric' },
    '68-0E': { name: 'Token VDCU Update First Use Indicator', decoder: 'numeric' },
    '68-0F': { name: 'PAN/Token Update Channel', decoder: 'numeric' },
    '68-1A': { name: 'Activation Code', decoder: 'numeric' },
    '68-1B': { name: 'Activation Code Expiry Date/Time', decoder: 'numeric' },
    '68-1C': { name: 'Activation Code Verification Attempts', decoder: 'numeric' },
    '68-1D': { name: 'Number of Activation Codes Issued', decoder: 'numeric' },
    '68-1E': { name: 'Token activation date/time', decoder: 'numeric' },
    '68-1F31': { name: 'Elapsed Time To Live', decoder: 'numeric' },
    '68-1F32': { name: 'Count of Number of Transactions', decoder: 'numeric' },
    '68-1F33': { name: 'Cumulative transaction Amount', decoder: 'numeric' },
    '68-1F35': { name: 'Total Number of Tokens for Token Inquiry Criteria', decoder: 'numeric' },
    '68-1F37': { name: 'Issuer Custom Data for File Control Information (FCI) Template', decoder: 'numeric' },
    '68-1F38': { name: 'Issuer Custom Data for Issuer Application Data (IAD)', decoder: 'numeric' },
    '68-1F7F': { name: 'PAN Expiration Date', decoder: 'numeric' }

};

const DE125_TAG_MAP = {
    '01-01': { name: 'Device Type', decoder: 'ans' },
    '01-02': { name: 'Device Language Code', decoder: 'ebcdic' },
    '01-03': { name: 'Device ID', decoder: 'ebcdic' },
    '01-04': { name: 'Device Number', decoder: 'ebcdic' },
    '01-05': { name: 'Device Name', decoder: 'ebcdic' },
    '01-06': { name: 'Device Location', decoder: 'ebcdic' },
    '01-07': { name: 'IP Address', decoder: 'ebcdic' },
    '02-03': { name: 'Wallet Provider Risk Assessment', decoder: 'ebcdic' },
    '02-04': { name: 'Wallet Provider Risk Assessment Version', decoder: 'ebcdic' },
    '02-05': { name: 'Wallet Provider Device Score', decoder: 'ebcdic' },
    '02-06': { name: 'Wallet Provider Account Score', decoder: 'ebcdic' },
    '02-07': { name: 'Wallet Provider Reason Codes', decoder: 'ebcdic' },
    '02-08': { name: 'PAN Source', decoder: 'ebcdic' },
    '02-09': { name: 'Wallet Account ID', decoder: 'ans' },
    '02-0A': { name: 'Wallet Account E-mail Address', decoder: 'ebcdic' },
    '02-80': { name: 'Overall Assessment', decoder: 'ebcdic' },
    '03-03': { name: 'Original Transaction', decoder: 'ebcdic' },
    '03-80': { name: 'Original Transaction Date Time', decoder: 'ebcdic' },
    '03-81': { name: 'Original Purchase Identifier', decoder: 'ebcdic' },
    '03-82': { name: 'Original POS Environment', decoder: 'ebcdic' },
    '03-83': { name: 'Original POS Entry Mode', decoder: 'ebcdic' },
    '03-84': { name: 'Original POS Condition Code', decoder: 'ebcdic' },
    '03-85': { name: 'Original Response Code', decoder: 'ebcdic' },
    '03-86': { name: 'Original Additional Authorization Indicators', decoder: 'ebcdic' },
    '03-87': { name: 'Original Delegated Authentication Indicator', decoder: 'ebcdic' },
    '03-88': { name: 'Original CAVV Results Code', decoder: 'ebcdic' },
    '03-89': { name: 'Original CVV2/dCVV2 Results Code', decoder: 'ebcdic' },
    '03-8A': { name: 'Original AVS Results Code', decoder: 'ebcdic' },
    '03-8B': { name: 'Original Card Authentication Results Code', decoder: 'ebcdic' },
    '03-8C': { name: 'Original CVV/dCVV Results Code', decoder: 'ebcdic' },
    '03-8D': { name: 'Original Token VerificationVerification Result', decoder: 'ebcdic' },
    '03-8E': { name: 'Original Cardholder ID Method', decoder: 'ebcdic' },
    '03-8F': { name: 'Original CDCVM', decoder: 'ebcdic' },
    '03-90': { name: 'Total Number of Original Transaction Details', decoder: 'ebcdic' },
    '67-D0': { name: 'MagnePrint Data', decoder: 'ebcdic' },
    '69-80': { name: 'Internal Transfer Pricing', decoder: 'ebcdic' },
    '69-81': { name: 'Number of Settlement Positions', decoder: 'ebcdic' },
    '70-01': { name: 'Transaction Statement 1', decoder: 'ebcdic' },
    '70-02': { name: 'Transaction Statement 2', decoder: 'ebcdic' },
    '70-03': { name: 'Transaction Statement 3', decoder: 'ebcdic' },
    '70-04': { name: 'Transaction Statement 4', decoder: 'ebcdic' },
    '70-05': { name: 'Transaction Statement 5', decoder: 'ebcdic' },
    '6b-0D': { name: 'Purchase Restriction Flag', decoder: 'ebcdic' },
    '6b-0E': { name: 'Host-Based Purchase Restrictions', decoder: 'ebcdic' }
}

const DE127_TAG_MAP = {
    '40-01': { name: 'Terms and Condition Verification', decoder: 'ebcdic' },
    '40-02': { name: 'Issuer Terms and Conditions Date', decoder: 'ebcdic' },
    '41-02': { name: 'Replacement PAN Expiration Date', decoder: 'bytes' },
    '41-04': { name: 'Account Status', decoder: 'numeric' },
    '41-05': { name: 'Conversion Code', decoder: 'numeric' },
    '41-06': { name: 'VAU Segment ID', decoder: 'numeric' },
    '41-07': { name: 'Request from Merchant for Updated Account', decoder: 'numeric' },
};

const DE60_VISA_DOMAINS = {
    '60.1': { // Terminal Type
        '0': 'Unspecified',
        '1': 'Unattended',
        '2': 'ATM',
        '3': 'Unattended',
        '4': 'Electronic cash register',
        '5': 'Unattended customer terminal',
        '7': 'Telephone device',
        '8': 'Reserved',
        '9': 'Use to identify that an mPOS'
    },
    '60.2': { // Terminal Entry Capability
        '0': 'Unknown codes',
        '1': 'Terminal not used',
        '2': 'Magnetic stripe read capability',
        '3': 'QR code',
        '4': 'OCR read capability',
        '5': 'Contact chip, magnetic-stripe',
        '6': 'Reserved for future use',
        '7': 'Reserved for future use',
        '8': 'Proximity-read-capable',
        '9': 'Terminal does not read card data'
    },
    '60.3': { // Chip Condition Code
        '0': 'Not applicable to fall back transactions',
        '1': 'fall back transactions',
        '2': 'fall back transactions'
    },
    '60.4': { // Special Condition Indicator
        '0': 'Default value',
        '7': 'Purchase of Cryptocurrency',
        '8': 'Quasi-Cash',
        '9': 'Payment on existing debt'
    },
    '60.6': { // Chip Transaction Indicator
        '0': 'Not applicable',
        '1': 'chip data',
        '2': 'third bitmap for their chip data',
        '3': 'downgrades the transaction',
        '4': 'presence of a token-based transaction',
    },
    '60.7': { // Chip Transaction Indicator
        '0': 'subfields that are present',
        '1': 'Card Authentication may not be reliable',
        '2': 'Card Authentication',
        '3': 'issuer inactive for Card Authenticat'
    },
    '60.8': { // Chip Card Authentic Reliability Indicator
        '00': 'Not applicable',
        '01': 'Single transaction of a mail/phone order',
        '02': 'Recurring transaction',
        '03': 'Installment payment',
        '04': 'Unknown',
        '05': 'Secure electronic commerce transaction',
        '06': 'Non-authenticated security',
        '07': 'Non-authenticated security',
        '08': 'Non-secure transaction',
        '09': 'Reserved:'
    },
    '60.10': { // Mail/Phone/E-Commerce Indicator
        '0': 'Not Applicable',
        '1': 'Terminal accepts partial authorization responses',
        '2': 'Estimated amount',
        '3': 'Estimated amount and terminal accepts partial authorization'
    },
};

// Funções auxiliares (mantidas)
const getDomainDescription = (subfield, value) => {
    const domainMap = DE60_VISA_DOMAINS[subfield];
    if (!domainMap) return null;
    return domainMap[value] || null;
};

const formatDecoded = (subfield, value) => {
    const desc = getDomainDescription(subfield, value);
    return desc ? `${value} - ${desc}` : value;
};

