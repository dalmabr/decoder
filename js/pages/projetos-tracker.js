/**
 * projetos-tracker.js
 * Porta do VBA: leitura de CSV de projetos → tabelas por status + painel gerencial
 * Colunas esperadas: ID | Tipo | Status | Data Início | Prazo Final | Data Modificação | Resumo
 */

const ProjetosTracker = (() => {

  // ── Estado ───────────────────────────────────────────────────────────────
  let allRows = [];      // todas as linhas (exceto header)
  let headers = [];      // linha 1

  // ── Parser CSV (equivale ao Split por aspas do VBA) ───────────────────────
  function parseCsvLine(line) {
    const fields = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const code = line.charCodeAt(i);

      // Ignora caracteres inválidos (espelho de LimparCaracteresInvalidos)
      if (!((code >= 32 && code <= 126) || (code >= 128 && code <= 255))) continue;
      if (code === 255 || code === 254 || code === 9) continue;

      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    return fields;
  }

  function parseDate(str) {
    if (!str || str.length < 10) return str;
    // Aceita "YYYY-MM-DD HH:MM" ou "DD/MM/YYYY HH:MM"
    const s = str.trim();
    let d;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      d = new Date(s.replace(' ', 'T'));
    } else if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
      const [dd, mm, yyyy] = s.split('/');
      const time = s.length > 10 ? s.slice(11, 16) : '00:00';
      d = new Date(`${yyyy}-${mm}-${dd}T${time}`);
    } else {
      return str;
    }
    if (isNaN(d)) return str;
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function processCsv(text) {
    // Normaliza quebras de linha
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());

    headers = parseCsvLine(lines[0]);
    allRows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.every(c => !c)) continue;

      // Colunas 3-5 (índices 3,4,5) = datas
      const row = cols.map((val, idx) => (idx >= 3 && idx <= 5) ? parseDate(val) : val);

      // Garante 7 colunas
      while (row.length < 7) row.push('');
      allRows.push(row.slice(0, 7));
    }
  }

  // ── Agrupamento (espelho de AgruparPorStatus) ─────────────────────────────
  function groupByStatus() {
    const groups = {};
    for (const row of allRows) {
      const status = row[2] || '(sem status)';
      groups[status] = (groups[status] || 0) + 1;
    }
    return groups;
  }

  function filterByStatus(status) {
    return allRows.filter(r => r[2] === status);
  }

  // ── Controle de tempo em status (espelho de ControlarStatusAtividades) ────
  function calcTempoEmStatus() {
    const controle = {};
    const hoje = new Date();

    for (const row of allRows) {
      const id = row[0];
      const status = row[2];
      const dataModStr = row[5];
      const dataInicioStr = row[3];

      if (!id) continue;

      const parseLocalDate = (s) => {
        if (!s) return null;
        // formato "DD/MM/YYYY HH:MM"
        const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})[\s,](\d{2}:\d{2})/);
        if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}`);
        return new Date(s);
      };

      const dataMod = parseLocalDate(dataModStr) || hoje;
      const dataInicio = parseLocalDate(dataInicioStr) || dataMod;

      if (!controle[id]) {
        controle[id] = { id, status, dataInicio, horasTotal: 0 };
      }

      const ref = controle[id];

      if (status === 'Em Andamento') {
        const diff = (hoje - dataInicio) / 36e5;
        ref.horasTotal = Math.round(diff * 100) / 100;
      } else if (status === 'Pendente') {
        const diff = (dataMod - dataInicio) / 36e5;
        ref.horasTotal = Math.round(diff * 100) / 100;
      }

      ref.status = status;
    }

    return Object.values(controle).sort((a, b) => b.horasTotal - a.horasTotal);
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const COLS = ['ID', 'Tipo', 'Status', 'Dt. Início', 'Prazo Final', 'Dt. Modificação', 'Resumo'];

  const STATUS_BADGE = {
    'Em Andamento': 'badge-andamento',
    'Pendente':     'badge-pendente',
    'Concluído':    'badge-concluido',
    'Cancelado':    'badge-cancelado',
  };

  function badge(status) {
    const cls = STATUS_BADGE[status] || 'badge-default';
    return `<span class="pt-badge ${cls}">${status}</span>`;
  }

  function renderTable(rows, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!rows.length) {
      el.innerHTML = '<p class="pt-empty">Nenhum registro encontrado.</p>';
      return;
    }

    const thead = `<tr>${COLS.map(c => `<th>${c}</th>`).join('')}</tr>`;
    const tbody = rows.map(r =>
      `<tr>
        <td class="pt-id">${r[0]}</td>
        <td>${r[1]}</td>
        <td>${badge(r[2])}</td>
        <td class="pt-date">${r[3]}</td>
        <td class="pt-date">${r[4]}</td>
        <td class="pt-date">${r[5]}</td>
        <td class="pt-resumo" title="${r[6]}">${r[6]}</td>
      </tr>`
    ).join('');

    el.innerHTML = `<table class="pt-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
  }

  function renderGerencial(groups, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const total = Object.values(groups).reduce((a, b) => a + b, 0);
    const rows = Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .map(([status, qt], i) => {
        const pct = total ? Math.round((qt / total) * 100) : 0;
        const cls = i % 2 === 0 ? 'pt-row-even' : 'pt-row-odd';
        return `<tr class="${cls}">
          <td>${badge(status)}</td>
          <td class="pt-center pt-bold">${qt}</td>
          <td class="pt-center">
            <div class="pt-bar-wrap"><div class="pt-bar" style="width:${pct}%"></div></div>
            <span class="pt-pct">${pct}%</span>
          </td>
        </tr>`;
      }).join('');

    el.innerHTML = `
      <table class="pt-table">
        <thead><tr><th>Status</th><th class="pt-center">Qtde</th><th class="pt-center">%</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td><strong>Total</strong></td><td class="pt-center pt-bold">${total}</td><td></td></tr></tfoot>
      </table>`;
  }

  function renderControle(controle, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!controle.length) { el.innerHTML = '<p class="pt-empty">Sem dados.</p>'; return; }

    const rows = controle.map(c => {
      const dias = (c.horasTotal / 24).toFixed(1);
      const alert = c.horasTotal > 72 && c.status === 'Em Andamento' ? ' pt-alert' : '';
      return `<tr class="${alert}">
        <td class="pt-id">${c.id}</td>
        <td>${badge(c.status)}</td>
        <td class="pt-center">${c.horasTotal}h</td>
        <td class="pt-center">${dias}d</td>
      </tr>`;
    }).join('');

    el.innerHTML = `
      <table class="pt-table">
        <thead><tr><th>ID</th><th>Status</th><th class="pt-center">Horas</th><th class="pt-center">Dias</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Tab switching ─────────────────────────────────────────────────────────
  function switchTab(tabId) {
    document.querySelectorAll('.pt-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.pt-tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  }

  // ── Renderiza tudo após upload ────────────────────────────────────────────
  function renderAll() {
    const groups   = groupByStatus();
    const emAnd    = filterByStatus('Em Andamento');
    const pend     = filterByStatus('Pendente');
    const controle = calcTempoEmStatus();

    renderGerencial(groups,   'pt-gerencial-body');
    renderTable(emAnd,        'pt-em-andamento-body');
    renderTable(pend,         'pt-pendente-body');
    renderControle(controle,  'pt-controle-body');

    // Atualiza contadores nos tabs
    document.querySelector('[data-tab="pt-tab-gerencial"] .pt-count')?.remove();
    document.querySelector('[data-tab="pt-tab-andamento"] .pt-count')?.remove();
    document.querySelector('[data-tab="pt-tab-pendente"] .pt-count')?.remove();

    setCount('pt-tab-gerencial', Object.keys(groups).length);
    setCount('pt-tab-andamento', emAnd.length);
    setCount('pt-tab-pendente',  pend.length);
    setCount('pt-tab-controle',  controle.length);

    document.getElementById('pt-results').classList.remove('hidden');
    document.getElementById('pt-empty-state').classList.add('hidden');
    switchTab('pt-tab-gerencial');
  }

  function setCount(tabId, n) {
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (!btn) return;
    const sp = document.createElement('span');
    sp.className = 'pt-count';
    sp.textContent = n;
    btn.appendChild(sp);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const dropzone = document.getElementById('pt-dropzone');
    const fileInput = document.getElementById('pt-file-input');

    if (!dropzone || !fileInput) return;

    // Click para abrir seletor
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag & Drop
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('pt-drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('pt-drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('pt-drag-over');
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) loadFile(fileInput.files[0]);
    });

    // Tabs
    document.querySelectorAll('.pt-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Novo arquivo
    document.getElementById('pt-btn-novo')?.addEventListener('click', () => {
      allRows = []; headers = [];
      document.getElementById('pt-results').classList.add('hidden');
      document.getElementById('pt-empty-state').classList.remove('hidden');
      document.getElementById('pt-filename').textContent = '';
      fileInput.value = '';
    });
  }

  function loadFile(file) {
    if (!file.name.endsWith('.csv')) {
      alert('Selecione um arquivo .csv');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        processCsv(e.target.result);
        document.getElementById('pt-filename').textContent = `📄 ${file.name} — ${allRows.length} registros`;
        renderAll();
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', ProjetosTracker.init);
