import { 
    ebcdicToAscii
 } from '../core/iso-decoder.js';

 import { parseTLVDataset } from '../core/iso-decoder.js'

export function expandDE48Mastercar_d(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    const withDatasetLength = parseTLVDataset(field, {
        field: '48',
        datasetLengthType: 'hex',
        hasDatasetLengthByte: true,
        map: DE123_TAG_MAP
    });

    if (withDatasetLength?.children?.length) return withDatasetLength;

    const withoutDatasetLength = parseTLVDataset(field, {
        field: '48',
        datasetLengthType: 'hex',
        map: DE123_TAG_MAP
    });

    if (withoutDatasetLength?.children?.length) return withoutDatasetLength;

    return {
        format: field.decoded?.format ?? 'HEX',
        value: field.decoded?.value ?? field.rawHex,
        children: [{
            subfield: '48.raw',
            name: 'Raw Content',
            size: `${Math.floor((field.rawHex?.length || 0) / 2)} bytes`,
            rawHex: field.rawHex,
            decoded: field.decoded?.value ?? field.rawHex
        }]
    };
}

// ===========================================
// DE48 (Mastercard) - Expansão detalhada (JS)
// ===========================================
export function DE48expan_d(rawHex) {
  // 1) EBCDIC -> ASCII
  let ascii = (ebcdicToAscii(rawHex) || "").replace(/\u0000/g, "");
  // 2) Remover os 3 dígitos iniciais de comprimento (como no VBA: Mid(conteudo, 4, ...))
  if (/^\d{3}/.test(ascii)) ascii = ascii.slice(3);

  let pos = 0;
  const out = { tcc: "", subfields: [], ascii };

  // 3) TCC (1 char)
  if (pos < ascii.length) {
    out.tcc = ascii[pos];
    pos += 1;
  }

  // 4) Loop nos subcampos: [subE(2)][len(2)][data(len)]
  while (pos + 4 <= ascii.length) {
    const id = ascii.slice(pos, pos + 2);
    if (!/^\d{2}$/.test(id)) break;
    pos += 2;

    const lenStr = ascii.slice(pos, pos + 2);
    if (!/^\d{2}$/.test(lenStr)) break;
    pos += 2;
    const len = parseInt(lenStr, 10) || 0;

    const data = ascii.slice(pos, pos + len);
    pos += len;

    const sub = { id, len, data, parts: [] };

    // --- regras por subE (espelha Select Case do VBA) ---
    parseDE48SubParts(sub);

    out.subfields.push(sub);
  }

  return out;
}

// ==============================
// Regras de sub-componentização
// (espelha o Select Case do VBA)
// ==============================
export function parseDE48SubParts_(sub) {
  const { id, len, data } = sub;

  // utilitários
  const pushPart = (tag, length, value) =>
    sub.parts.push({ tag, length, value });

  const splitFixed = (chunkSize) => {
    let p = 0, idx = 1;
    while (p < data.length) {
      const take = Math.min(chunkSize, data.length - p);
      pushPart(String(idx++), take, data.slice(p, p + take));
      p += take;
    }
  };

  const parseTLV_2_2 = () => {
    let p = 0;
    while (p + 4 <= data.length) {
      const tag = data.slice(p, p + 2); p += 2;
      const lStr = data.slice(p, p + 2); p += 2;
      if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lStr)) break;
      const L = parseInt(lStr, 10) || 0;
      const val = data.slice(p, p + L); p += L;
      pushPart(tag, L, val);
    }
  };

  switch (id) {
    case "20": // blocos de 2
    case "23":
    case "87":
    case "80":
      splitFixed(2);
      break;

    case "26": // blocos de 3
    case "92":
      splitFixed(3);
      break;

    case "30": // um bloco inteiro (=len)
    case "43":
      pushPart(id, len, data);
      break;

    case "33": // TLV 2+2 dentro do data
      parseTLV_2_2();
      break;

    case "34": {
      // 3 subcomponentes: 5, 5, 1
      let p = 0;
      const take = (sz) => {
        const v = data.slice(p, p + sz);
        p += Math.min(sz, data.length - p);
        return v;
      };
      pushPart("1", Math.min(5, data.length), take(5));
      pushPart("2", Math.min(5, Math.max(0, data.length - 5)), take(5));
      pushPart("3", Math.min(1, Math.max(0, data.length - 10)), take(1));
      break;
    }

    case "42": {
      // subC = 2, lenSubC = 2, valor inicia na posição 5 (1-based do VBA)
      // aqui usamos 0-based: tag(0..1), len(2..3), valor a partir de 4
      if (data.length >= 4) {
        const tag = data.slice(0, 2);
        const L = parseInt(data.slice(2, 4), 10) || 0;
        const val = data.slice(4, 4 + L);
        pushPart(tag, L, val);
      }
      break;
    }

    case "56": {
      // subC = 3 dígitos, lenSubC = 3; depois valor
      let p = 0;
      while (p + 6 <= data.length) {
        const tag = data.slice(p, p + 3); p += 3;
        const lStr = data.slice(p, p + 3); p += 3;
        if (!/^\d{3}$/.test(tag) || !/^\d{3}$/.test(lStr)) break;
        const L = parseInt(lStr, 10) || 0;
        const val = data.slice(p, p + L); p += L;
        pushPart(tag, L, val);
      }
      break;
    }

    case "71": {
      // subC = 2, lenSubC = 2; repetir
      let p = 0;
      while (p + 4 <= data.length) {
        const tag = data.slice(p, p + 2); p += 2;
        const lStr = data.slice(p, p + 2); p += 2;
        if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lStr)) break;
        const L = parseInt(lStr, 10) || 0;
        const val = data.slice(p, p + L); p += L;
        pushPart(tag, L, val);
      }
      break;
    }

    case "61": {
      // blocos de 1 até consumir
      splitFixed(1);
      break;
    }

    case "63": {
      // 3 subcomponentes com tamanhos fixos: 3, 6, 6
      let p = 0;
      const t1 = data.slice(p, p + 3); p += 3;
      const t2 = data.slice(p, p + 6); p += 6;
      const t3 = data.slice(p, p + 6); p += 6;
      if (t1) pushPart("1", t1.length, t1);
      if (t2) pushPart("2", t2.length, t2);
      if (t3) pushPart("3", t3.length, t3);
      break;
    }

    case "77":
    case "84":
      splitFixed(3);
      break;

    case "95": {
      // três blocos: 6, 2, 2 (posições 1, 7, 9 no VBA)
      let p = 0;
      const a = data.slice(p, p + 6); p += 6;
      const b = data.slice(p, p + 2); p += 2;
      const c = data.slice(p, p + 2); p += 2;
      if (a) pushPart("1", a.length, a);
      if (b) pushPart("2", b.length, b);
      if (c) pushPart("3", c.length, c);
      break;
    }

    default:
      // TLV padrão 2+2
      parseTLV_2_2();
      break;
  }
}

// ===========================================
// DE48 (Mastercard) - Expansão detalhada
// RETORNA FORMATO COMPATÍVEL COM NETWORK_OVERRIDES
// ===========================================
export function DE48expand(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    
    // 1) EBCDIC -> ASCII
    let ascii = (ebcdicToAscii(field.rawHex) || "").replace(/\u0000/g, "");
    
    // 2) Remover os 3 dígitos iniciais de comprimento (LLLVAR)
    let actualContent = ascii;
    let declaredLen = 0;
    
    if (/^\d{3}/.test(ascii)) {
        declaredLen = parseInt(ascii.slice(0, 3), 10);
        actualContent = ascii.slice(3);
        
        if (declaredLen > 0 && declaredLen <= actualContent.length) {
            actualContent = actualContent.slice(0, declaredLen);
        }
    }

    let pos = 0;
    
    // 3) TCC (1 char)
    let tcc = "";
    if (pos < actualContent.length) {
        tcc = actualContent[pos];
        pos += 1;
        console.log(`DE48 TCC: '${tcc}'`);
    }

    // 4) Loop nos subcampos: [ID(2)][LEN(2)][DATA(len)]
    const subfields = [];
    let subfieldCount = 0;
    const maxSubfields = 50;
    
    while (pos + 4 <= actualContent.length && subfieldCount < maxSubfields) {
        const id = actualContent.slice(pos, pos + 2);
        pos += 2;
        
        if (!/^\d{2}$/.test(id)) break;

        const lenStr = actualContent.slice(pos, pos + 2);
        pos += 2;
        
        if (!/^\d{2}$/.test(lenStr)) break;
        
        const len = parseInt(lenStr, 10) || 0;
        if (len > 99 || len < 0) break;

        if (pos + len > actualContent.length) break;
        
        const data = actualContent.slice(pos, pos + len);
        pos += len;

        // Parse sub-partes conforme ID (lógica do VBA)
        const parts = parseDE48SubPartsJS(id, len, data);
        
        subfields.push({ id, len, data, parts });
        subfieldCount++;
        
        console.log(`DE48 Subfield ${id}: len=${len}, parts=${parts.length}`);
    }

    // RETORNAR FORMATO COMPATÍVEL COM NETWORK_OVERRIDES
    return {
        value: `TCC: ${tcc}, ${subfields.length} subfields`,
        format: 'STRUCTURED',
        children: [
            {
                field: 'TCC',
                name: 'TCC (Transaction Category Code)',
                size: '1',
                value: tcc,
                decoded: tcc,
                children: []
            },
            ...subfields.map(sf => ({
                field: `48.${sf.id}`,
                name: `Subcampo A ${sf.id}`,
                size: `${sf.len} bytes`,
                value: sf.data,
                decoded: sf.data,
                children: sf.parts.map(p => ({
                    field: `48.${sf.id}.${p.tag}`,
                    name: `Part ${p.tag}`,
                    size: `${p.length}`,
                    value: p.value,
                    decoded: p.value,
                    children: []
                }))
            }))
        ]
    };
}

// Parser de sub-partes (lógica extraída do VBA)
function parseDE48SubPartsJS(id, len, data) {
    const idNum = parseInt(id, 10);
    const parts = [];
    let posSubC = 0;
    let iterar = 0;
    let subC = 0;
    
    const pushPart = (tag, length, value) => parts.push({ tag: String(tag), length, value });
    
    while (iterar < len && parts.length < 100) {
        let lenSubC = 0;
        let tag = "";
        
        switch (idNum) {
            case 20: case 23: case 87: case 80:
                subC++; lenSubC = 2; tag = subC; break;
            case 26: case 92:
                subC++; lenSubC = 3; tag = subC; break;
            case 30: case 43:
                subC++; lenSubC = len; tag = subC; break;
            case 33: case 71: case 75:
                if (posSubC + 4 > data.length) { iterar = len; continue; }
                tag = data.slice(posSubC, posSubC + 2); posSubC += 2;
                lenSubC = parseInt(data.slice(posSubC, posSubC + 2), 10) || 0; posSubC += 2;
                break;
            case 34:
                subC++;
                if (subC === 1) lenSubC = 5;
                else if (subC === 2) lenSubC = 5;
                else if (subC === 3) lenSubC = 1;
                else { iterar = len; continue; }
                tag = subC;
                break;
            case 42:
                if (data.length < 4) { iterar = len; continue; }
                tag = data.slice(0, 2); lenSubC = parseInt(data.slice(2, 4), 10) || 0;
                posSubC = 4;
                break;
            case 56:
                if (posSubC + 6 > data.length) { iterar = len; continue; }
                tag = data.slice(posSubC, posSubC + 3); posSubC += 3;
                lenSubC = parseInt(data.slice(posSubC, posSubC + 3), 10) || 0; posSubC += 3;
                break;
            case 61:
                subC++; lenSubC = 1; tag = subC; break;
            case 63:
                subC++;
                if (subC === 1) lenSubC = 3;
                else if (subC === 2) lenSubC = 6;
                else if (subC === 3) lenSubC = 6;
                else { iterar = len; continue; }
                tag = subC;
                break;
            case 77: case 84:
                subC = 1; lenSubC = 3; tag = subC; break;
            case 95:
                subC++;
                if (subC === 1) { lenSubC = 6; posSubC = 0; }
                else if (subC === 2) { lenSubC = 2; posSubC = 6; }
                else if (subC === 3) { lenSubC = 2; posSubC = 8; }
                else { iterar = len; continue; }
                tag = subC;
                break;
            default:
                if (posSubC + 4 > data.length) { iterar = len; continue; }
                tag = data.slice(posSubC, posSubC + 2); posSubC += 2;
                lenSubC = parseInt(data.slice(posSubC, posSubC + 2), 10) || 0; posSubC += 2;
                break;
        }
        
        const value = data.slice(posSubC, posSubC + lenSubC);
        pushPart(tag, lenSubC, value);
        
        if (idNum === 61 || idNum === 34) iterar += lenSubC;
        else iterar = posSubC + lenSubC;
        
        posSubC += lenSubC;
    }
    
    return parts;
}

// ===========================================
// Parser simples usando SEU MAPA
// ===========================================

export function expandDE48Masterca_r_d(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    
    // Converter EBCDIC para ASCII
    const ascii = (ebcdicToAscii(field.rawHex) || "").replace(/\u0000/g, "");
    
    // Pular os 3 primeiros dígitos (length LLL)
    const content = /^\d{3}/.test(ascii) ? ascii.slice(3) : ascii;
    
    let pos = 0;
    const tcc = content[pos++] || "";
    
    const subfields = [];
    
    // Loop pelos subcampos
    while (pos + 4 <= content.length) {
        const subcampoId = content.slice(pos, pos + 2);
        pos += 2;
        
        const len = parseInt(content.slice(pos, pos + 2), 10) || 0;
        pos += 2;
        
        if (len === 0 || pos + len > content.length) break;
        
        const dados = content.slice(pos, pos + len);
        pos += len;
        
        // Parse dos subelementos
        const subelementos = parseSubelementos(subcampoId, dados);
        
        subfields.push({
            id: subcampoId,
            len,
            dados,
            subelementos
        });
    }
    
    // Montar retorno
    return {
        value: `TCC: ${tcc}, ${subfields.length} subfields`,
        children: [
            {
                field: '48.TCC',
                name: 'Transaction Category Code',
                size: '1',
                value: tcc,
                children: []
            },
            ...subfields.map(sf => ({
                field: `48.${sf.id}`,
                name: DE48_TAG_MAP[`${sf.id}-1`]?.name?.split(' ')[0] || `Subcampo B ${sf.id}`,
                size: `${sf.len} bytes`,
                value: sf.dados,
                children: sf.subelementos.map(se => {
                    let mapKey = `${sf.id}-${se.id}`;
                    const mapEntry = DE48_TAG_MAP[mapKey];
                    return {
                        field: `48.${sf.id}.${se.id}`,
                        name: mapEntry?.name || `Subelemento ${se.id}`,
                        size: `${se.len} chars`,
                        value: se.valor,
                        children: []
                    };
                })
            }))
        ]
    };
}
// Parser de subelementos
function parseSubelementos(subcampoId, dados) {
    const subelementos = [];
    let pos = 0;
    let sequencial = 1;
    
    // TLV 2+2: tag nos dados (33, 42, 71, 75, etc.)
    if (['x33', 'x42', 'x71', 'x75'].includes(subcampoId)) {
        while (pos + 4 <= dados.length) {
            const tag = dados.slice(pos, pos + 2);
            pos += 2;
            const len = parseInt(dados.slice(pos, pos + 2), 10) || 0;
            pos += 2;
            if (pos + len > dados.length) break;
            const valor = dados.slice(pos, pos + len);
            pos += len;
            
            subelementos.push({ id: tag, len, valor });
        }
    }
    // Blocos de 3: 26
    else if (subcampoId === 'x26') {
        while (pos < dados.length) {
            const valor = dados.slice(pos, pos + 3);
            subelementos.push({ id: String(sequencial++), len: valor.length, valor });
            pos += 3;
        }
    }
    // Sem subelementos (usa 0)
    else if (DE48_TAG_MAP[`${subcampoId}-0`]) {
        subelementos.push({ id: '0', len: dados.length, valor: dados });
    }
    // Padrão: bloco único (usa 1)
    else {
        subelementos.push({ id: '1', len: dados.length, valor: dados });
    }
    
    return subelementos;
}

export function expandDE48Mastercard(field) {
    if (!field?.rawHex) return { value: '', children: [] };
    
    const ascii = (ebcdicToAscii(field.rawHex) || "").replace(/\u0000/g, "");
    const content = /^\d{3}/.test(ascii) ? ascii.slice(3) : ascii;
    
    let pos = 0;
    const tcc = content[pos++] || "";
    
    const children = [{
        subfield: '48.68.1',
        field: '48.68.1',
        name: 'TCC (Transaction Category Code)',
        size: '1 byte',
        value: tcc,
        children: []
    }];
    
    // Loop TLV genérico dos subcampos
    while (pos + 4 <= content.length) {
        const id = content.slice(pos, pos + 2);
        pos += 2;
        
        const len = parseInt(content.slice(pos, pos + 2), 10) || 0;
        pos += 2;
        
        if (len === 0 || pos + len > content.length) break;
        
        const data = content.slice(pos, pos + len);
        pos += len;
        
        // Parser genérico com fallback
        const subElements = parseInternalTLV(data);
        
        // Adiciona cada sub-elemento
        subElements.forEach(se => {
            let mapKey = `${id}-${se.id}`;
            if (se.id === '1') {
                mapKey = id;
            }
                
            const mapEntry = DE48_TAG_MAP[mapKey];
            
            children.push({
                subfield: `48.${id}.${se.id}`,
                field: `48.${id}.${se.id}`,
                name: mapEntry?.name || `Subcampo c ${id}.${se.id}`,
                size: `${se.len} bytes`,
                value: se.valor,
                decoded: {
                    format: mapEntry?.decoder || 'hex',
                    value: applyDecoder(se.valor, mapEntry?.decoder)
                },
                children: []
            });
        });
    }

    // ←←← ADICIONA ISSO ANTES DO RETURN ←←←
    const result = {
        value: `TCC: ${tcc}, ${children.length - 1} subfields`,
        children: children
    };
   
    return {
        value: `TCC: ${tcc}, ${children.length - 1} subfields`,
        children
    };
}

// Parser genérico: tenta TLV padrão, depois fallbacks
function parseInternalTLV(data) {
    const subElements = [];
    
    // 1ª tentativa: TLV padrão (tag 2 + len 2 + data)
    let pos = 0;
    while (pos + 4 <= data.length) {
        const tag = data.slice(pos, pos + 2);
        pos += 2;
        const len = parseInt(data.slice(pos, pos + 2), 10) || 0;
        pos += 2;
        if (len === 0 || pos + len > data.length) break;
        const valor = data.slice(pos, pos + len);
        pos += len;
        subElements.push({ id: tag, len: 2 + 2 + len, valor });
    }
    
    // Se funcionou, retorna
    if (subElements.length > 0 && pos === data.length) {
        return subElements;
    }
    
    // 2ª tentativa: estrutura fixa 3+3 (para subcampo 56)
    subElements.length = 0;
    pos = 0;
    let instance = 1;
    while (pos + 6 <= data.length) {
        const part1 = data.slice(pos, pos + 3);
        const part2 = data.slice(pos + 3, pos + 6);
        pos += 6;
        subElements.push({ 
            id: String(instance++).padStart(2, '0'),  // ← "01", "02", "03"...
            len: 6, 
            valor: part1 + part2 
        });
    }
    
    // Se funcionou, retorna
    if (subElements.length > 0 && pos === data.length) {
        return subElements;
    }
    
    // 3ª tentativa: TLV curto tag 2 + valor 1 (para subcampo 71)
    subElements.length = 0;
    pos = 0;
    while (pos + 3 <= data.length) {
        const tag = data.slice(pos, pos + 2);
        pos += 2;
        const valor = data.slice(pos, pos + 1);
        pos += 1;
        subElements.push({ id: tag, len: 3, valor });
    }
    
    // Se funcionou, retorna
    if (subElements.length > 0 && pos === data.length) {
        return subElements;
    }
    
    // Fallback: bloco único
    return [{ id: '1', len: data.length, valor: data }];
}

function applyDecoder(data, decoderType) {
    switch(decoderType) {
        case 'ebcdic':
            return ebcdicToAscii(data)?.replace(/\u0000/g, '') || data;
        case 'numeric':
            return data;
        case 'binary':
            return parseInt(data, 16)?.toString(2) || data;
        default:
            return data;
    }
}

const DE48_TAG_MAP = {
    '03-01': { name: 'Plan Registration System Identifier', decoder: 'numeric' },
    '05-01': { name: 'Program Data', decoder: 'numeric' },
    '05-02': { name: 'Digital Auth', decoder: 'numeric' },
    '05-03': { name: 'Source Reason', decoder: 'numeric' },
    '05-04': { name: 'Funding Source', decoder: 'numeric' },
    '05-05': { name: 'Product Platform', decoder: 'numeric' },
    '05-06': { name: 'Cardholder ID', decoder: 'numeric' },
    '05-07': { name: 'ECI', decoder: 'numeric' },
    '06-01': { name: 'Binding ID', decoder: 'numeric' },
    '06-02': { name: 'Phone Number', decoder: 'numeric' },
    '06-03': { name: 'Device Location', decoder: 'numeric' },
    '07-01': { name: 'Email Address Format', decoder: 'numeric' },
    '07-02': { name: 'Email Address', decoder: 'numeric' },
    '08-01': { name: 'IP Address', decoder: 'numeric' },
    '08-02': { name: 'Shipping Address Line 1', decoder: 'numeric' },
    '08-03': { name: 'Shipping Address Country', decoder: 'numeric' },
    '08-04': { name: 'Shipping Address Postal Code', decoder: 'numeric' },
    '09-01': { name: 'Virtual Card Number Indicator', decoder: 'numeric' },
    '09-02': { name: 'Virtual Card Number', decoder: 'numeric' },
    '09-03': { name: 'Virtual Card Number Expiration Date', decoder: 'numeric' },
    '13-01': { name: 'Mobile Phone Number', decoder: 'numeric' },
    '13-02': { name: 'Mobile Phone Service Provider Name', decoder: 'numeric' },
    '14-00': { name: 'Account Type Indicator', decoder: 'numeric' },
    '15-01': { name: 'Date', decoder: 'numeric' },
    '15-02': { name: 'Time', decoder: 'numeric' },
    '16-00': { name: 'Processor Pseudo ICA', decoder: 'numeric' },
    '17-00': { name: 'Authentication Indicator', decoder: 'numeric' },
    '18-01': { name: 'Canada Domestic Indicator', decoder: 'numeric' },
    '20-00': { name: 'Cardholder Verification Method', decoder: 'numeric' },
    '21-01': { name: 'mPOS Device Type', decoder: 'numeric' },
    '21-02': { name: 'Terminal Capability', decoder: 'numeric' },
    '22-01': { name: 'Low-Risk Merchant Indicator', decoder: 'numeric' },
    '22-02': { name: 'Single Tap indicator', decoder: 'numeric' },
    '22-03': { name: 'Response to PIN Request', decoder: 'numeric' },
    '22-04': { name: 'Issuer PIN Request in a Single Tap Mode', decoder: 'numeric' },
    '22-05': { name: 'CIT/MIT Indicator', decoder: 'numeric' },
    '22-06': { name: 'Message Format Version Code: Acquirer', decoder: 'numeric' },
    '23-01': { name: 'Device Type', decoder: 'numeric' },
    '24-01': { name: 'ALM Service Code', decoder: 'numeric' },
    '24-02': { name: 'ALM Product Graduation Plus or Registered Product Code', decoder: 'numeric' },
    '24-03': { name: 'ALM Product Class', decoder: 'numeric' },
    '24-04': { name: 'ALM Rate Type', decoder: 'numeric' },
    '25-01': { name: 'Message Identifier', decoder: 'numeric' },
    '26-01': { name: 'Wallet Identifier', decoder: 'numeric' },
    '27-01': { name: 'Overview', decoder: 'numeric' },
    '27-02': { name: 'Test Results', decoder: 'numeric' },
    '28-00': { name: 'Cardless ATM Order ID', decoder: 'numeric' },
    '29-00': { name: 'Additional POS Terminal Locations', decoder: 'numeric' },
    '30-00': { name: 'Token Transaction Identifier', decoder: 'numeric' },
    '32-00': { name: 'Mastercard Assigned ID', decoder: 'numeric' },
    '33-01': { name: 'Account Number Indicator', decoder: 'numeric' },
    '33-02': { name: 'Account Number', decoder: 'numeric' },
    '33-03': { name: 'Expiration Date', decoder: 'numeric' },
    '33-04': { name: 'Product Code', decoder: 'numeric' },
    '33-05': { name: 'Token Assurance Method', decoder: 'numeric' },
    '33-06': { name: 'Token Requestor ID', decoder: 'numeric' },
    '33-07': { name: 'Primary Account Number, Account Range', decoder: 'numeric' },
    '33-08': { name: 'Storage Technology', decoder: 'numeric' },
    '34-01': { name: 'ATC Value', decoder: 'numeric' },
    '34-02': { name: 'ATC Discrepancy Value', decoder: 'numeric' },
    '34-03': { name: 'ATC Discrepancy Indicator', decoder: 'numeric' },
    '35-00': { name: 'Contactless Non-Card Form Factor Request/Response', decoder: 'numeric' },
    '37-01': { name: 'PayFac ID', decoder: 'numeric' },
    '37-02': { name: 'ISO ID', decoder: 'numeric' },
    '37-03': { name: 'Sponsored Merchant ID', decoder: 'numeric' },
    '37-04': { name: 'Country Code', decoder: 'numeric' },
    '37-05': { name: 'Gateway ID', decoder: 'numeric' },
    '38-01': { name: 'Account Category', decoder: 'numeric' },
    '39-00': { name: 'Account Data Compromise Information', decoder: 'numeric' },
    '41-01': { name: 'Additional Recurring Payments Information', decoder: 'numeric' },
    '42-01': { name: 'Security Level & UCAF', decoder: 'numeric' },
    '42-02': { name: 'Original SLI', decoder: 'numeric' },
    '42-03': { name: 'Downgrade Reason', decoder: 'numeric' },
    '43-00': { name: 'Static AAV / 3-D Secure Info', decoder: 'numeric' },
    '48-01': { name: 'Domain ID', decoder: 'numeric' },
    '48-02': { name: 'Program Type', decoder: 'numeric' },
    '48-03': { name: 'Check-In Entity', decoder: 'numeric' },
    '48-04': { name: 'Check-In Method', decoder: 'numeric' },
    '49-01': { name: 'Time Value', decoder: 'numeric' },
    '49-02': { name: 'Discrepancy Value', decoder: 'numeric' },
    '49-03': { name: 'Discrepancy Indicator', decoder: 'numeric' },
    '50-01': { name: 'Interchange Ind', decoder: 'numeric' },
    '50-02': { name: 'Percentage', decoder: 'numeric' },
    '50-03': { name: 'Unit Fee', decoder: 'numeric' },
    '50-04': { name: 'Flat Amt', decoder: 'numeric' },
    '50-05': { name: 'Payment Party', decoder: 'numeric' },
    '51-01': { name: 'OB Service', decoder: 'numeric' },
    '51-02': { name: 'OB Result', decoder: 'numeric' },
    '51-03': { name: 'Additional Info', decoder: 'numeric' },
    '54-01': { name: 'Ancillary Fee Code', decoder: 'numeric' },
    '54-02': { name: 'Ancillary Fee Amount', decoder: 'numeric' },
    '55-01': { name: 'Merchant Fraud Score/ASI Probability Indicator', decoder: 'numeric' },
    '55-02': { name: 'Reason Code', decoder: 'numeric' },
    '55-03': { name: 'Reserved for Future Use', decoder: 'numeric' },
    '55-04': { name: 'Reserved for Future Use', decoder: 'numeric' },
    '55-05': { name: 'Reserved for Future Use', decoder: 'numeric' },
    '56-01': { name: 'Security Services Indicator', decoder: 'numeric' },
    '56-02': { name: 'Security Services Data 56', decoder: 'numeric' },
    '57-01': { name: 'Security Services Indicator', decoder: 'numeric' },
    '57-02': { name: 'Security Services Data', decoder: 'numeric' },
    '58-01': { name: 'ATM Service Fee', decoder: 'numeric' },
    '58-02': { name: 'ATM Date', decoder: 'numeric' },
    '58-03': { name: 'Watermark', decoder: 'numeric' },
    '58-04': { name: 'Mark 1', decoder: 'numeric' },
    '58-05': { name: 'Mark 2', decoder: 'numeric' },
    '58-06': { name: 'Security Services Data', decoder: 'numeric' },
    '58-07': { name: 'Card Swallowed Status', decoder: 'numeric' },
    '58-08': { name: 'Posting Date', decoder: 'numeric' },
    '60-01': { name: 'Reference Conversion Rate', decoder: 'numeric' },
    '60-02': { name: 'Reference Conversion Rate Differential Sign Indicator', decoder: 'numeric' },
    '60-03': { name: 'Reference Conversion Rate Percent Differential', decoder: 'numeric' },
    '60-04': { name: 'Currency Rate Unique Identifier', decoder: 'numeric' },
    '61-01': { name: 'Partial Approval', decoder: 'numeric' },
    '61-02': { name: 'Purchase Amt Only', decoder: 'numeric' },
    '61-03': { name: 'Real-time Subst', decoder: 'numeric' },
    '61-04': { name: 'Merchant Transaction Fraud Scoring Indicator', decoder: 'numeric' },
    '61-05': { name: 'Final Auth', decoder: 'numeric' },
    '62-01': { name: 'Merchant Direct Participation', decoder: 'numeric' },
    '62-02': { name: 'Type of Transaction', decoder: 'numeric' },
    '62-03': { name: 'Real-Time Payment Rules', decoder: 'numeric' },
    '62-04': { name: 'Real-Time Payment Settlement Network ID and Name', decoder: 'numeric' },
    '62-05': { name: 'Real-Time Payment Funds Transfer Position', decoder: 'numeric' },
    '62-06': { name: 'DSS Reference Number', decoder: 'numeric' },
    '63-00': { name: 'Trace ID', decoder: 'numeric' },
    '64-01': { name: 'Transit Transaction Type', decoder: 'numeric' },
    '64-02': { name: 'Transportation Mode', decoder: 'numeric' },
    '65-01': { name: 'TLE Compliant', decoder: 'numeric' },
    '65-02': { name: 'UKPT/DUKPT Compliant', decoder: 'numeric' },
    '66-01': { name: 'Program Protocol', decoder: 'numeric' },
    '66-02': { name: 'Directory Server Transaction ID', decoder: 'numeric' },
    '67-01': { name: 'Sanctions Score', decoder: 'numeric' },
    '67-02': { name: 'Sanctions Score Additional Information', decoder: 'numeric' },
    '68-01': { name: 'Financial Account Identifier', decoder: 'numeric' },
    '69-01': { name: 'Network Data', decoder: 'numeric' },
    '69-02': { name: 'Date Settlement', decoder: 'numeric' },
    '70-01': { name: 'Implied Decimal Indicator', decoder: 'numeric' },
    '71': { name: 'OB Service Indicator', decoder: 'numeric' },
    '71-02': { name: 'OB Result 1', decoder: 'numeric' },
    '71-03': { name: 'OB Result 2', decoder: 'numeric' },
    '72-00': { name: 'Issuer Chip Authentication', decoder: 'numeric' },
    '74-01': { name: 'Process Indicator', decoder: 'numeric' },
    '74-02': { name: 'Processing Information', decoder: 'numeric' },
    '75-01': { name: 'Fraud Score', decoder: 'numeric' },
    '75-02': { name: 'Reason Code', decoder: 'numeric' },
    '75-03': { name: 'Model Score', decoder: 'numeric' },
    '75-04': { name: 'Model Reason Code', decoder: 'numeric' },
    '75-05': { name: 'Reserved for Future Use', decoder: 'numeric' },
    '76-01': { name: 'Mastercard Electronic Program Participation Level', decoder: 'numeric' },
    '77-00': { name: 'Transaction Type Identifier', decoder: 'numeric' },
    '78-01': { name: 'Spend Qualified Indicator', decoder: 'numeric' },
    '78-02': { name: 'Dynamic Currency Conversion Indicator', decoder: 'numeric' },
    '78-03': { name: 'US Deferred Billing Indicator', decoder: 'numeric' },
    '78-04': { name: 'Visa Checkout Indicator', decoder: 'numeric' },
    '78-05': { name: 'Message Reason Code', decoder: 'numeric' },
    '78-06': { name: 'Token Response Information', decoder: 'numeric' },
    '79-01': { name: 'CVR/TVR ID', decoder: 'numeric' },
    '79-02': { name: 'Byte ID', decoder: 'numeric' },
    '79-03': { name: 'Bit ID', decoder: 'numeric' },
    '79-04': { name: 'Value of Bit in Error', decoder: 'numeric' },
    '80-00': { name: 'PIN Service Code', decoder: 'numeric' },
    '82-00': { name: 'AVS Request', decoder: 'numeric' },
    '83-00': { name: 'AVS Response', decoder: 'numeric' },
    '84-00': { name: 'Merchant Advice Code', decoder: 'numeric' },
    '85-00': { name: 'Account Status (Visa Only)', decoder: 'numeric' },
    '86-00': { name: 'Relationship Participant Indicator (Visa Only)', decoder: 'numeric' },
    '87-00': { name: 'Card Validation Code Result', decoder: 'numeric' },
    '88-00': { name: 'Magnetic Stripe Comp Status', decoder: 'numeric' },
    '89-00': { name: 'Magnetic Stripe Comp Error', decoder: 'numeric' },
    '92-00': { name: 'CVC 2', decoder: 'numeric' },
    '93-01': { name: 'Fleet Card ID Request Indicator', decoder: 'numeric' },
    '93-02': { name: 'Optional Informational Text', decoder: 'numeric' },
    '95-00': { name: 'Mastercard Promotion Code', decoder: 'numeric' },
    '98-01': { name: 'ID/Driver Number', decoder: 'numeric' },
    '99-01': { name: 'Vehicle Number', decoder: 'numeric' }
};
