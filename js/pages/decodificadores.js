import { initISODecoder } from '../ui/render.js';
import { initAntiFraudDecoder } from './antifraud-decoder.js';

'use strict';

function clearISOState() {
    const panel = document.querySelector('.iso-panel[data-tool-panel="iso"]');
    if (!panel) return;

    const input = panel.querySelector('.hex-input');
    const results = panel.querySelector('.results');
    const tbody = panel.querySelector('.de-table tbody');
    const primary = panel.querySelector('.primary-bitmap');
    const secondary = panel.querySelector('.secondary-bitmap');
    const mti = panel.querySelector('.mti .value');

    if (input) {
        input.value = '';
        input.classList.remove('valid', 'invalid');
    }
    if (results) results.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
    if (primary) primary.innerHTML = '';
    if (secondary) secondary.innerHTML = '';
    if (mti) mti.textContent = '';
}

function clearAntiFraudState() {
    const panel = document.querySelector('.iso-panel[data-tool-panel="antifraude"]');
    if (!panel) return;

    const input = panel.querySelector('#hexInput');
    const result = panel.querySelector('#result');

    if (input) {
        input.value = '';
        input.classList.remove('valid', 'invalid');
        input.style.height = '';
    }
    if (result) {
        result.innerHTML = '';
        result.classList.remove('has-results');
    }
}

function switchTool(tool) {
    const panels = document.querySelectorAll('[data-tool-panel]');
    const titleEl = document.getElementById('decoder-title');
    const descEl = document.getElementById('decoder-desc');

    panels.forEach((panel) => {
        const isVisible = panel.dataset.toolPanel === tool;
        panel.classList.toggle('hidden', !isVisible);
    });

    if (tool === 'iso') {
        if (titleEl) titleEl.textContent = 'Decodificador ISO 8583';
        if (descEl) descEl.textContent = 'Cole o payload em hexadecimal para obter a quebra detalhada.';
        clearAntiFraudState();
    } else if (tool === 'antifraude') {
        if (titleEl) titleEl.textContent = 'Decodificador Antifraude';
        if (descEl) descEl.textContent = 'Cole o payload em texto para obter a quebra detalhada.';
        clearISOState();
    }
}

function initBackToTop() {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;

    const toggle = () => {
        const shouldShow = window.scrollY > 280;
        btn.classList.toggle('visible', shouldShow);
    };

    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggle();
}

window.switchTool = switchTool;

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelectorAll('.iso-panel[data-tool-panel="iso"]')
        .forEach(initISODecoder);

    document
        .querySelectorAll('.iso-panel[data-tool-panel="antifraude"]')
        .forEach(initAntiFraudDecoder);

    document.querySelectorAll('.tab-btn').forEach((tab) => {
        tab.addEventListener('click', () => switchTool(tab.dataset.tool));
    });

    initBackToTop();

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'antifraude') {
        switchTool('antifraude');
    } else {
        switchTool('iso');
    }
});
