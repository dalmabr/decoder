/**
 * projetos-tracker.js
 * Porta do VBA: leitura de CSV de projetos → tabelas por status + painel gerencial
 * Colunas esperadas: ID | Tipo | Status | Data Início | Prazo Final | Data Modificação | Resumo
 */

const ProjetosTracker = (() => {

  // ── Estado ───────────────────────────────────────────────────────────────
  let allRows = [];      // todas as linhas (exceto header)
  let headers = [];      // linha 1
  let controleSortState = { key: 'id', asc: true };

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
  function parseLocalDate(str) {
    if (!str) return null;
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{4})[\s,](\d{2}:\d{2})/);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}`);
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }

  function prepareControleRows() {
    const now = new Date();
    return allRows.map((row) => {
      const dataInicio = parseLocalDate(row[3]);
      const dataMod = parseLocalDate(row[5]) || now;
      const base = row[2] === 'Em Andamento' ? now : dataMod;
      const horas = dataInicio ? Math.max(0, (base - dataInicio) / 36e5) : 0;
      const horasTotal = Math.round(horas * 100) / 100;
      return {
        id: row[0] || '',
        tipo: row[1] || '',
        status: row[2] || '',
        dtInicio: row[3] || '',
        prazoFinal: row[4] || '',
        dtModificacao: row[5] || '',
        resumo: row[6] || '',
        horasTotal,
        dias: Math.round((horasTotal / 24) * 10) / 10,
        highlight: row[2] === 'Em Andamento' && horasTotal > 72
      };
    });
  }

  function sortControleRows(rows, key, asc) {
    return [...rows].sort((a, b) => {
      const va = a[key] ?? '';
      const vb = b[key] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') return asc ? va - vb : vb - va;
      return asc
        ? String(va).localeCompare(String(vb), 'pt-BR', { numeric: true })
        : String(vb).localeCompare(String(va), 'pt-BR', { numeric: true });
    });
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

  function renderControle(rows, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!rows.length) { el.innerHTML = '<p class="pt-empty">Sem dados.</p>'; return; }

    const columns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'tipo', label: 'Tipo', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'dtInicio', label: 'Dt. Início', sortable: true },
      { key: 'prazoFinal', label: 'Prazo Final', sortable: true },
      { key: 'dtModificacao', label: 'Dt. Modificação', sortable: true },
      { key: 'resumo', label: 'Resumo', sortable: false }
    ];

    const thead = columns.map(col => {
      const sorted = controleSortState.key === col.key;
      const arrow = sorted ? (controleSortState.asc ? ' ▲' : ' ▼') : '';
      return `<th class="${col.sortable ? 'sortable' : ''}" data-sort-key="${col.key}">${col.label}${arrow}</th>`;
    }).join('');

    const rowsHtml = rows.map(c => `
      <tr class="${c.highlight ? ' pt-alert' : ''}">
        <td class="pt-id">${c.id}</td>
        <td>${c.tipo}</td>
        <td>${badge(c.status)}</td>
        <td class="pt-date">${c.dtInicio}</td>
        <td class="pt-date">${c.prazoFinal}</td>
        <td class="pt-date">${c.dtModificacao}</td>
        <td class="pt-resumo" title="${(c.resumo || '').replace(/"/g, '&quot;')}">${c.resumo || ''}</td>
      </tr>`).join('');

    el.innerHTML = `<table class="pt-table"><thead><tr>${thead}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
    el.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        if (!key) return;
        if (controleSortState.key === key) controleSortState.asc = !controleSortState.asc;
        else { controleSortState.key = key; controleSortState.asc = true; }
        renderControle(sortControleRows(rows, controleSortState.key, controleSortState.asc), containerId);
      });
    });
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
    renderControle(sortControleRows(controle, controleSortState.key, controleSortState.asc),  'pt-controle-body');

    // Atualiza contadores nos tabs
    document.querySelector('[data-tab="pt-tab-andamento"] .pt-count')?.remove();
    document.querySelector('[data-tab="pt-tab-pendente"] .pt-count')?.remove();
    document.querySelector('[data-tab="pt-tab-controle"] .pt-count')?.remove();

    setCount('pt-tab-andamento', emAnd.length);
    setCount('pt-tab-pendente',  pend.length);
    setCount('pt-tab-controle',  allRows.length);

    document.getElementById('pt-results').classList.remove('hidden');
    document.getElementById('pt-empty-state').classList.add('hidden');
    switchTab('pt-tab-gerencial');
  }

  function setCount(tabId, n) {
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (!btn) return;
    btn.querySelector('.pt-count')?.remove();
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
