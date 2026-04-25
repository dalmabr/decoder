import { processIncomingMessage, detectNetwork,  } from '../core/iso-decoder.js';
import { buildFieldConfig } from '../config/overrides.js';

'use strict';
/* =========================================================
   ISO DECODER UI
   Apenas DOM, eventos e renderização
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelectorAll('.iso-panel')
        .forEach(initISODecoder);
});

document.addEventListener('click', function (e) {

    const row = e.target.closest('.copy-row');
    if (row?.dataset.copy) {
        navigator.clipboard.writeText(row.dataset.copy)
            .then(() => {
                row.classList.add('copied');
                setTimeout(() => row.classList.remove('copied'), 700);
                showPanelMessage(getPanelFromElement(row), 'Dados da linha copiados.', 'success');
            })
            .catch(() => {
                showPanelMessage(getPanelFromElement(row), 'Não foi possível copiar os dados da linha.', 'error');
            });
        return;
    }

    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.dataset.copy;
        navigator.clipboard.writeText(text)
            .then(() => {
                e.target.textContent = 'Copiado';
                setTimeout(() => e.target.textContent = 'Copiar', 1000);
            })
            .catch(() => {
                showPanelMessage(getPanelFromElement(e.target), 'Não foi possível copiar o conteúdo.', 'error');
            });
    }
});

document.addEventListener('click', function (e) {

    const btn = e.target.closest('.expand-btn');
    if (!btn) return;

    const de = String(btn.dataset.de);

    const detailRow = document.querySelector(
        `tr.detail-row[data-parent="${de}"]`
    );

    if (!detailRow) return; // proteção

    const arrow = btn.querySelector('.arrow');
    const isOpen = detailRow.style.display === 'table-row';

    detailRow.style.display = isOpen ? 'none' : 'table-row';
    arrow.textContent = isOpen ? '>' : 'v';
    btn.title = isOpen ? 'Expandir detalhes' : 'Recolher detalhes';
});

export function initISODecoder(panel) {
    const refs = getPanelRefs(panel);

    if (!refs) return;

    const { hexInput, decodeBtn, clearBtn, results } = refs;

    decodeBtn.disabled = true;

    bindHexInput(hexInput, decodeBtn, results);
    bindPaste(hexInput);
    bindClear(panel, hexInput, decodeBtn, results);
    bindDecode(panel, hexInput, decodeBtn, results);
    bindExpand(panel);
}

window.initISODecoder = initISODecoder;

// ==========================
// Renderização ISO Refatorada
// ==========================

function renderISO_(panel, data, network, fieldConfig) {
    // MTI
    panel.querySelector('.mti .value').textContent = data.mti;

    // Bitmaps
    renderBitmap(
        panel.querySelector('.primary-bitmap'),
        data.primaryBits,
        0,
        network,
        fieldConfig
    );

    renderBitmap(
        panel.querySelector('.secondary-bitmap'),
        data.secondaryBits,
        64,
        network,
        fieldConfig
    );

    // Data Elements
    renderDETable(
        panel.querySelector('.de-table tbody'),
        data.dataElements,
        network,
        fieldConfig
    );
}

function renderBitmap_(container, bits, offset = 0, network, fieldConfig) {
    container.innerHTML = '';
    if (!bits || !bits.length) return; // evita erro
    bits.forEach((b, i) => {
        const d = document.createElement('div');
        d.className = b === '1' ? 'bit on' : 'bit off';
        const bitNumber = offset + i + 1;
        d.textContent = b === '1' ? bitNumber : '.';
        container.appendChild(d);
    });
}

function renderChildre_n_(children) {
    if (Array.isArray(children)) {
        return children.map((child, index) => `
            <div class="child-card">
                <div class="child-header">Item ${index + 1}</div>
                ${Object.entries(child).map(([key, value]) => `
                    <div class="child-row">
                        <span class="child-key">${beautifyKey(key)}</span>
                        <span class="child-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    return `
    <div class="child-card">
        ${Object.entries(children).map(([key, value]) => `
            <div class="child-row">
                <span class="child-key">${beautifyKey(key)}</span>
                <span class="child-value">${value}</span>
            </div>
        `).join('')}
    </div>
    `;
}
// -----------------------------
// Renderização da ISO8583
// -----------------------------
function renderISO(panel, data, network, fieldConfig) {
    // MTI
    panel.querySelector('.mti .value').textContent = data.mti;

    // Rede Detectada
    const networkEl = panel.querySelector('.network-value');
    if (networkEl) {
        networkEl.textContent = String(network).toUpperCase() || 'UNKNOWN';
    }

    // Modo do Bitmap
    const bitmapModeEl = panel.querySelector('.bitmap-mode-value');
    if (bitmapModeEl) {
        bitmapModeEl.textContent = data.bitmapMode === 'text' ? 'Texto (Hex/EBCDIC)' : 'Binário padrão';
    }

    // Bitmaps
    renderBitmap(panel.querySelector('.primary-bitmap'), data.primaryBits, 0);
    renderBitmap(panel.querySelector('.secondary-bitmap'), data.secondaryBits, 64);

    // Data Elements
    renderDETable(panel.querySelector('.de-table tbody'), data.dataElements);
}

// -----------------------------
// Renderização do Bitmap
// -----------------------------
function renderBitmap(container, bits, offset = 0) {
    container.innerHTML = '';
    if (!bits || !bits.length) return;

    bits.forEach((b, i) => {
        const div = document.createElement('div');
        div.className = b === '1' ? 'bit on' : 'bit off';
        div.textContent = b === '1' ? offset + i + 1 : '.';
        container.appendChild(div);
    });
}

function renderDETable(tbody, elements) {
  //console.log("📋 renderDETable:", {
  //      totalElements: elements.length,
  //      de48: elements.find(e => e.de === 48).
  // });
    
    tbody.innerHTML = '';

    elements.forEach(el => {
        const tr = document.createElement('tr');
        tr.classList.add('copy-row');
        tr.dataset.copy = el.rawHex || el.decoded?.value || '';

        const hasDetail = el.complex === true;

        const btn = hasDetail
            ? `<button class="expand-btn" data-de="${el.de}">
                   <span class="arrow">></span>
               </button>`
            : '';

        // bloco de conteúdo (HEX + ASCII/EBCDIC)
        const fieldBlock = `
            <span class="fld-id">${el.de}</span>
            <span class="fld-name">${el.name || ''}</span>
            ${btn}
        `;

        const attrBlock = `
            <span class="fld-type">${el.type || ''}</span>
            <span class="fld-size">${el.size || ''}</span>
        `;

        let valueBlock = `
            <span class="hex">${el.rawHex || ''}</span>
        `;

        if (!hasDetail && el.showDecoded && el.decoded?.value) {
            valueBlock += `<br>
                <span class="decoded ${el.decoded.format.toLowerCase()}">
                    ${el.decoded.value}
                </span>`;
        }
        

        tr.innerHTML = `
            <td class="col-field"><div class="cell-stack field-stack">${fieldBlock}</div></td>
            <td class="col-attr"><div class="cell-stack attr-stack">${attrBlock}</div></td>
            <td class="multi-line col-value"><div class="cell-stack value-stack">${valueBlock}</div></td>
        `;

        tbody.appendChild(tr);
        
        if (el.complex && el.children) {
            const detailTr = document.createElement('tr');
            detailTr.classList.add('detail-row');
            detailTr.style.display = 'none';
            detailTr.dataset.parent = String(el.de);

            detailTr.innerHTML = `
                <td colspan="3" class="detail-cell">
                    <div class="detail-container">
                        ${renderChildren(el.children)}
                    </div>
                </td>
            `;

            tbody.appendChild(detailTr);
        }

    });
}

function renderChildren(children) {
    // ← ADICIONA ISSO: proteção contra children vazio/inválido
    if (!children || !Array.isArray(children) || children.length === 0) {
        //console.log("⚠️ renderChildren: children vazio ou inválido");
        return '';
    }
        
    //console.log("🎨 renderChildren:", {
    //    count: children?.length,
    //    first: children?.[0]?.subfield || children?.[0]?.field || 'N/A'
    //});
        
    if (Array.isArray(children)) {
        return children.map((child, index) => {
            const childId = child.subfield
                || child.field  // ← NOVO: fallback para child.field
                || (child.field && child.datasetId && child.tag 
                    ? `${child.field}.${child.datasetId}-${child.tag}` 
                    : `Item ${index + 1}`);
            const childName = child.name || '';
            const childSize = child.size || (typeof child.length === 'number' ? `${child.length} bytes` : '');

            const raw = child.rawHex || child.valueHex || '';
            const decoded = typeof child.decoded === 'object'
                ? (child.decoded?.value ?? '')
                : (child.decoded ?? '');

            const hasDecoded = Boolean(decoded && decoded !== raw);
            const preferDecodedOnly = hasDecoded && isReadableText(decoded);
            const lines = preferDecodedOnly
                ? [decoded]
                : [raw, hasDecoded ? decoded : ''].filter(Boolean);
            const firstLine = lines[0] || '';
            const extraLines = lines.slice(1);
            const copyPayload = `${childId}\t${childName}\t${childSize}\t${lines.join(' | ')}`;

            return `
            <div class="child-card copy-row" data-copy="${escapeHtmlAttr(copyPayload)}" title="Clique para copiar os dados desta linha">
                <div class="child-row child-grid child-grid-main">
                    <span class="child-col child-col-field">${escapeHtml(childId)}</span>
                    <span class="child-col child-col-name" title="${escapeHtmlAttr(String(childName))}">${escapeHtml(childName)}</span>
                    <span class="child-col child-col-size">${escapeHtml(childSize)}</span>
                    <span class="child-col child-col-content">${escapeHtml(String(firstLine))}</span>
                </div>
                ${extraLines.length ? `
                <div class="child-row child-grid child-grid-extra">
                    <span class="child-col child-col-field"></span>
                    <span class="child-col child-col-name"></span>
                    <span class="child-col child-col-size"></span>
                    <span class="child-col child-col-content">
                        ${extraLines.map(line => `<div>${escapeHtml(String(line))}</div>`).join('')}
                    </span>
                </div>
                ` : ''}
            </div>
            `;
        }).join('');
    }

    const copyPayload = Object.entries(children)
        .map(([key, value]) => `${beautifyKey(key)}: ${value}`)
        .join(' | ');

    return `
    <div class="child-card copy-row" data-copy="${escapeHtmlAttr(copyPayload)}" title="Clique para copiar os dados desta linha">
        ${Object.entries(children).map(([key, value]) => {
            const desc = de60Descriptions?.[key]?.[value];

            return `
                <div class="child-row">
                    <span class="child-key">${beautifyKey(key)}</span>
                    <span class="child-value">
                        ${value}
                        ${desc ? `<span class="value-desc">${desc}</span>` : ''}
                    </span>
                </div>
            `;
        }).join('')}
    </div>
    `;
}

function isReadableText(text) {
    if (!text) return false;
    if (/[?]/.test(text)) return false;

    const printable = (text.match(/[A-Za-z0-9\s.,:;@#/\-_=+()]/g) || []).length;
    return (printable / text.length) >= 0.7;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtmlAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}
// -----------------------------
// Beautify de nomes
// -----------------------------
function beautifyKey(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim();
}

function beautifyKey_(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim();
}

function expandComplexDE(panel, de) {
    const handlers = {
        //120: decodeDE120Dataset,
        //123: decodeDE123Dataset,
        //125: decodeDE125Dataset,
        //126: decodeDE126Dataset
    };

    handlers[de]?.();
}

function clearISOPanel(panel) {
    const hexInput = panel.querySelector('.hex-input');
    const results = panel.querySelector('.results');

    hexInput.value = '';

    if (results) {
        results.classList.add('hidden');

        const mti = results.querySelector('.mti .value');
        if (mti) mti.textContent = '';
        const nw = results.querySelector('.network-value');
        if (nw) nw.textContent = '';
        const bm = results.querySelector('.bitmap-mode-value');
        if (bm) bm.textContent = '';

        const pBitmap = results.querySelector('.primary-bitmap');
        if (pBitmap) pBitmap.innerHTML = '';
        const sBitmap = results.querySelector('.secondary-bitmap');
        if (sBitmap) sBitmap.innerHTML = '';
        const tb = results.querySelector('.de-table tbody');
        if (tb) tb.innerHTML = '';
    }
}

function normalizeHexInput(raw) {
    return raw
        .replace(/<INI>|<FIN>/gi, '')   // remove marcadores
        .toUpperCase();
}

function isValidHex(str) {
    if (!str) return true;
    if (str.length % 2 !== 0) return true;
    // return /^[0-9a-fA-F]+$/.test(str);
    return true;
}

function getPanelRefs(panel) {
    const refs = {
        hexInput: panel.querySelector('.hex-input'),
        decodeBtn: panel.querySelector('.decode-btn'),
        clearBtn: panel.querySelector('.clear-btn'),
        results: panel.querySelector('.results')
    };

    const missing = Object.entries(refs)
        .filter(([, el]) => !el)
        .map(([key]) => key);

    if (missing.length) {
        console.warn(
            'ISO Decoder: estrutura HTML incompleta',
            { panel, missing }
        );
        return null;
    }

    return refs;
}

function bindHexInput(hexInput, decodeBtn, results) {
    hexInput.addEventListener('input', () => {
        const value = normalizeHexInput(hexInput.value);
        hexInput.value = value;

        hexInput.classList.remove('valid', 'invalid');
        results.classList.add('hidden');

        if (!value) {
            decodeBtn.disabled = true;
            return;
        }

        if (isValidHex(value)) {
            hexInput.classList.add('valid');
            decodeBtn.disabled = false;
        } else {
            hexInput.classList.add('invalid');
            decodeBtn.disabled = true;
        }
    });
}

function bindPaste(hexInput) {
    hexInput.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        hexInput.value = normalizeHexInput(pasted);
        hexInput.dispatchEvent(new Event('input'));
    });
}

function bindClear(panel, hexInput, decodeBtn, results) {
    panel.querySelector('.clear-btn').addEventListener('click', () => {
        hexInput.value = '';
        hexInput.classList.remove('valid', 'invalid');
        decodeBtn.disabled = true;
        results.classList.add('hidden');
        clearResults(results);
        clearPanelMessage(panel);
        hexInput.focus();
    });
}

function bindDecode(panel, hexInput, decodeBtn, results) {

    decodeBtn.addEventListener('click', () => {
    try {
        const rawHex = hexInput.value.trim();
        if (!rawHex) {
            showPanelMessage(panel, 'Cole uma mensagem hexadecimal para continuar.', 'warning');
            return;
        }

        const decoded = processIncomingMessage(rawHex);
        if (!decoded || !Array.isArray(decoded.dataElements) || decoded.dataElements.length === 0) {
            showPanelMessage(panel, 'Não foi possível interpretar a mensagem com o layout atual.', 'error');
            return;
        }

        const networkInfo = detectNetwork(rawHex);
        const fieldConfig = buildFieldConfig(networkInfo.network);

        renderISO(panel, decoded, networkInfo.network, fieldConfig);

        results.classList.remove('hidden');
        if (networkInfo?.network === 'unknown') {
            showPanelMessage(panel, 'Bandeira não identificada com confiança. Resultado exibido com layout padrão.', 'warning');
        } else {
            showPanelMessage(panel, 'Mensagem processada com sucesso.', 'success');
        }
    } catch (err) {
        showPanelMessage(
            panel,
            `Falha ao processar a mensagem: ${err?.message || 'erro inesperado.'}`,
            'error'
        );
    }
    });

}

function bindExpand(panel) {
    panel.addEventListener('click', e => {
        if (!e.target.classList.contains('expand-btn')) return;
        expandComplexDE(panel, e.target.dataset.de);
    });
}

function clearResults() {
    const tbody = document.querySelector('#resultsTable tbody');
    if (tbody) tbody.innerHTML = '';

    const input = document.querySelector('#isoInput');
    if (input) input.value = '';
}

function getPanelFromElement(element) {
    return element?.closest?.('.iso-panel')
        || document.querySelector('.iso-panel[data-tool-panel="iso"]')
        || null;
}

function clearPanelMessage(panel) {
    const feedback = panel?.querySelector('.decoder-feedback');
    if (!feedback) return;
    feedback.textContent = '';
    feedback.style.display = 'none';
}

function showPanelMessage(panel, message, type = 'info') {
    if (!panel) return;

    let feedback = panel.querySelector('.decoder-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'decoder-feedback';
        feedback.style.marginTop = '10px';
        feedback.style.padding = '10px 12px';
        feedback.style.borderRadius = '8px';
        feedback.style.fontSize = '13px';
        feedback.style.fontWeight = '600';
        panel.insertBefore(feedback, panel.firstChild);
    }

    const palette = {
        success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
        warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
        error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
        info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' }
    };

    const tone = palette[type] || palette.info;
    feedback.style.display = 'block';
    feedback.style.background = tone.bg;
    feedback.style.border = `1px solid ${tone.border}`;
    feedback.style.color = tone.text;
    feedback.textContent = message;
}


const de60Descriptions = {
    TerminalType: {
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
    TerminalEntryCapability: {
        '0': 'Unknown codes',
        '1': 'Terminal not used',
        '2': 'Magnetic stripe read cap',
        '3': 'QR code',
        '4': 'OCR read capability',
        '5': 'Contact chip, magnetic-stripe',
        '6': 'Reserved for future use',
        '7': 'Reserved for future use',
        '8': 'Proximity-read-capable',
        '9': 'Terminal does not read card data'
    },
    ChipConditionCode:          { 
        '0': 'Not applicable to fall back transactions.',
        '1': 'Fall back transactions Transaction was initiated from a magnetic stripe',
        '2': 'Fall back transactions Transaction was initiated at a chip-capable terminal'
    },
    SpecialConditionIndicator: {
        '0': 'Default value',
        '1': 'Purchase of Central Bank Digital Currency (CBDC) or tokenized deposits',
        '2': 'Purchase of Stablecoin (Fiat-backed)',
        '3': 'Purchase of Blockchain Native Token/Coin',
        '7': 'Purchase of Cryptocurrency',
        '8': 'Quasi-Cash',
        '9': 'Payment on existing debt'
    },
    ChipTransactionIndicator: {
        '0': 'Not applicable;',
        '1': 'Third bitmap or field 55 to submit chip data.',
        '2': 'Third bitmap for their chip data.',
        '3': 'V.I.P. (not the acquirer) inserts this code and also downgrades the transaction by dropping chip data section.',
        '4': 'V.I.P. inserts this code based on the presence of a token-based transaction.'
    },
    ChipCardAuthenticReliabilityIndicator: {
        '0': 'Fill for field 60.7 present, or subsequent subfields that are present.',
        '1': 'Acquirer indicates that Card Authentication may not be reliable.',
        '2': 'V.I.P. indicates acquirer inactive for Card Authentication.',
        '3': 'V.I.P. indicates issuer inactive for Card Authentication.'
    },
    MailPhoneElecCommerceAndPaymentIndicator: {
        '00': 'Not applicable',
        '01': 'Single transaction of a mail/phone order:',
        '02': 'Recurring transaction',
        '03': 'Installment payment',
        '04': 'Unknown classification',
        '05': 'Secure electronic commerce transaction',
        '06': 'Non-authenticated security transaction at a 3-D Secure-capable merchant',
        '07': 'Non-authenticated security transaction',
        '08': 'Non-secure transaction',
        '09': 'Reserved'
    },
    CardholderIDMethodIndicator: {
        '0': 'Not specified',
        '1': 'Signature',
        '2': 'Online PIN',
        '3': 'Unattended terminal, no PIN pad',
        '4': 'Mail/Telephone/Electronic Commerce'
    },
    AdditionalAuthorizationIndicators: {
        '0': 'Not applicable:',
        '1': 'Terminal accepts partial authorization responses',
        '2': 'Estimated amount: Terminal does not support partial authorization responses',
        '3': 'Estimated amount and terminal accepts partial authorization responses'
    }
};







