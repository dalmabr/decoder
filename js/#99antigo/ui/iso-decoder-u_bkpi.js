import { processIncomingMessage, detectNetwork, buildFieldConfig } from '../core/iso-decoder-core.js';

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

    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.dataset.copy;
        navigator.clipboard.writeText(text);
        e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = '📋', 1000);
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
    arrow.textContent = isOpen ? '▶' : '▼';
});

function initISODecoderX(panel) {
    const hexInput = panel.querySelector('.hex-input');
    const decodeBtn = panel.querySelector('.btn-primary');
    const clearBtn  = panel.querySelector('.btn-secondary');
    const results   = panel.querySelector('.results');
    decodeBtn.disabled = true;

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

    hexInput.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        hexInput.value = normalizeHexInput(pasted);
        hexInput.dispatchEvent(new Event('input'));
    });

    clearBtn.addEventListener('click', () => {
        clearISOPanel(panel);
        decodeBtn.disabled = true;
        hexInput.classList.remove('valid', 'invalid');
        hexInput.focus();
    });

    decodeBtn.addEventListener('click', () => {

        const hex = hexInput.value;

        try {
            const decoded = processIncomingMessage(hex);
            renderISO(panel, decoded);
            results.classList.remove('hidden');
        } catch (err) {
            alert(err.message);
        }
    });

    panel.addEventListener('click', e => {
        if (!e.target.classList.contains('expand-btn')) return;
        expandComplexDE(panel, e.target.dataset.de);
    });
}

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
        d.textContent = b === '1' ? bitNumber : '·';
        container.appendChild(d);
    });
}

function renderDETable_(tbody, elements, network, fieldConfig) {
    tbody.innerHTML = '';
    if (!elements || !elements.length) return; // evita erro

    elements.forEach(el => {
        const tr = document.createElement('tr');

        const hasDetail = el.complex === true;

        const btn = hasDetail
            ? `<button class="expand-btn" data-de="${el.de}">
                   <span class="arrow">▶</span>
               </button>`
            : '';

        let valueBlock = `
            <span class="fld-name">${el.name || ''}</span>
            ${btn}<br>
            <span class="hex">${el.rawHex || ''}</span>
        `;

        if (el.showDecoded && el.decoded?.value) {
            valueBlock += `<br>
                <span class="decoded ${el.decoded.format.toLowerCase()}">
                    ${el.decoded.value}
                </span>`;
        }

        tr.innerHTML = `
            <td>${el.de}</td>
            <td>${el.type}</td>
            <td>${el.size}</td>
            <td class="multi-line">${valueBlock}</td>
        `;

        tbody.appendChild(tr);

        // Renderizar complex DEs filhos
        if (el.complex && el.children) {
            console.log('el.children: ', el.children);
            const detailTr = document.createElement('tr');
            detailTr.classList.add('detail-row');
            detailTr.style.display = 'none';
            detailTr.dataset.parent = String(el.de);

            detailTr.innerHTML = `
                <td colspan="4" class="detail-cell">
                    <div class="detail-container">
                        ${renderChildren(el.children)}
                    </div>
                </td>
            `;

            tbody.appendChild(detailTr);
        }
    });
}

function renderChildren_(children) {
    if (Array.isArray(children)) {
        return children.map((child, index) => `
            <div class="child-card">
                <div class="child-header">Item ${index + 1}</div>
                ${Object.entries(child).map(([key, value]) => `
                    <div class="child-row">
                        <span class="child-key">${beautifyKey(key)}</span>
                        <span class="child-value">
                            ${value}
                            <button class="copy-btn" data-copy="${value}"></button>
                        </span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    return `
    <div class="child-card">
        ${Object.entries(children).map(([key, value]) => {
            const desc = de60Descriptions?.[key]?.[value];
            return `
                <div class="child-row">
                    <span class="child-key">${beautifyKey(key)}</span>
                    <span class="child-value">
                        ${value}
                        ${desc ? `<span class="value-desc">${desc}</span>` : ''}
                        <button class="copy-btn" data-copy="${value}"></button>
                    </span>
                </div>
            `;
        }).join('')}
    </div>
    `;
}
// -----------------------------
// Renderização da ISO8583
// -----------------------------
function renderISO(panel, data, network, fieldConfig) {
    // MTI
    panel.querySelector('.mti .value').textContent = data.mti;

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
        div.textContent = b === '1' ? offset + i + 1 : '·';
        container.appendChild(div);
    });
}

function renderDETable(tbody, elements) {
    tbody.innerHTML = '';

    elements.forEach(el => {
        const tr = document.createElement('tr');

        const hasDetail = el.complex === true;

        const btn = hasDetail
            ? `<button class="expand-btn" data-de="${el.de}">
                   <span class="arrow">▶</span>
               </button>`
            : '';

        // bloco de conteúdo (HEX + ASCII/EBCDIC)
        let valueBlock = `
            <span class="fld-name">${el.name || ''}</span>
            ${btn}<br>
            <span class="hex">${el.rawHex || ''}</span>
        `;

        if (el.showDecoded && el.decoded?.value) {
            valueBlock += `<br>
                <span class="decoded ${el.decoded.format.toLowerCase()}">
                    ${el.decoded.value}
                </span>`;
        }

        tr.innerHTML = `
            <td>${el.de}</td>
            <td>${el.type}</td>
            <td>${el.size}</td>
            <td class="multi-line">${valueBlock}</td>
        `;

        tbody.appendChild(tr);
        
        if (el.complex && el.children) {
            const detailTr = document.createElement('tr');
            detailTr.classList.add('detail-row');
            detailTr.style.display = 'none';
            detailTr.dataset.parent = String(el.de);

            detailTr.innerHTML = `
                <td colspan="4" class="detail-cell">
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
    console.log('renderChildren', children);
    if (Array.isArray(children)) {
        return children.map((child, index) => `
            <div class="child-card">
                <div class="child-header">Item ${index + 1}</div>
                ${Object.entries(child).map(([key, value]) => `
                    <div class="child-row">
                        <span class="child-key">${beautifyKey(key)}</span>
                        <span class="child-value">
                            ${value}
                            <button class="copy-btn" data-copy="${value}">📋</button>
                        </span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    return `
    <div class="child-card">
        ${Object.entries(children).map(([key, value]) => {

            const desc = de60Descriptions?.[key]?.[value];

            return `
                <div class="child-row">
                    <span class="child-key">${beautifyKey(key)}</span>
                    <span class="child-value">
                        ${value}
                        ${desc ? `<span class="value-desc">${desc}</span>` : ''}
                        <button class="copy-btn" data-copy="${value}"></button>
                    </span>
                </div>
            `;
        }).join('')}
    </div>
    `;

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
        120: decodeDE120Dataset,
        123: decodeDE123Dataset,
        125: decodeDE125Dataset,
        126: decodeDE126Dataset
    };

    handlers[de]?.();
}

function clearISOPanel(panel) {
    const hexInput = panel.querySelector('.hex-input');
    const results = panel.querySelector('.results');

    hexInput.value = '';

    if (results) {
        results.classList.add('hidden');

        results.querySelector('.mti').textContent = '';
        results.querySelector('.primary-bitmap').innerHTML = '';
        results.querySelector('.secondary-bitmap').innerHTML = '';
        results.querySelector('.de-table tbody').innerHTML = '';
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
        hexInput.focus();
    });
}

function bindDecode(panel, hexInput, decodeBtn, results) {

    decodeBtn.addEventListener('click', () => {
    try {
        const rawHex = hexInput.value.trim();
        const decoded = processIncomingMessage(rawHex);

        const networkInfo = detectNetwork(rawHex);
        const fieldConfig = buildFieldConfig(networkInfo.network);

        renderISO(panel, decoded, networkInfo.network, fieldConfig);

        results.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
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
