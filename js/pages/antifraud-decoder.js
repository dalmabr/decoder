export function initAntiFraudDecoder(panel) {
    if (!panel) return;

    const input = panel.querySelector('#hexInput');
    const decodeBtn = panel.querySelector('[data-af-decode]');
    const clearBtn = panel.querySelector('[data-af-clear]');
    const result = panel.querySelector('#result');

    if (!input || !decodeBtn || !clearBtn || !result) {
        console.warn('Antifraud Decoder: estrutura HTML incompleta', { panel });
        return;
    }

    // Mantem o mesmo padrao visual do ISO (sem auto-resize).
    input.style.height = '';

    const normalizeAntiFraudInput = (raw) => String(raw || '')
        .replace(/<INI>|<FIN>/gi, '')
        .trimStart();

    const syncInputState = () => {
        const hasValue = input.value.trim().length > 0;
        input.classList.toggle('valid', hasValue);
        input.classList.remove('invalid');
    };

    const runDecode = () => {
        const value = input.value.trim();
        if (!value) return;

        if (typeof window.processText === 'function') {
            window.processText();
            result.classList.add('has-results');
        } else {
            result.textContent = 'Core Antifraude não carregado.';
        }
    };

    decodeBtn.addEventListener('click', runDecode);

    clearBtn.addEventListener('click', () => {
        input.value = '';
        input.style.height = '';
        syncInputState();
        result.innerHTML = '';
        result.classList.remove('has-results');
        input.focus();
    });

    input.addEventListener('input', () => {
        input.value = normalizeAntiFraudInput(input.value);
        syncInputState();
    });

    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        input.value = normalizeAntiFraudInput(pasted);
        syncInputState();
    });

    syncInputState();
}
