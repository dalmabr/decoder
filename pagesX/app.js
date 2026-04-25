
let currentProgram = 'ATE730';
let breadcrumbTrail = ['ATE730'];
let rows = [];

const linkNumeros = document.querySelector('a[href="#Numeros"]');
const linkTabelas = document.querySelector('a[href="#Tabelas"]');
const linkFluxo = document.querySelector('a[href="#Fluxo"]');

function csvToObjects(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(/[,;]+/).map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if ((char === ',' || char === ';') && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || '');
    return obj;
  });
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function updateBreadcrumb(newItem) {
  const existingIndex = breadcrumbTrail.indexOf(newItem);

  if (existingIndex !== -1) {
    breadcrumbTrail = breadcrumbTrail.slice(0, existingIndex + 1);
  } else {
    breadcrumbTrail.push(newItem);
  }

  renderBreadcrumb();
}

function renderBreadcrumb() {
  const breadcrumbEl = document.getElementById('breadcrumb');
  breadcrumbEl.innerHTML = '';

  breadcrumbTrail.forEach((item, index) => {
    if (index > 0) {
      const separator = document.createElement('span');
      separator.textContent = ' → ';
      separator.style.color = 'rgba(255,255,255,0.3)';
      breadcrumbEl.appendChild(separator);
    }

    const link = document.createElement('span');
    link.textContent = item;
    link.style.cursor = 'pointer';
    link.style.color = index === breadcrumbTrail.length - 1 ? '#fff' : 'rgba(255,255,255,0.6)';
    link.style.fontWeight = index === breadcrumbTrail.length - 1 ? '600' : '400';

    if (index < breadcrumbTrail.length - 1) {
      link.addEventListener('click', () => {
        navigateTo(item);
      });
      link.addEventListener('mouseenter', () => {
        link.style.color = '#fff';
        link.style.textDecoration = 'underline';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = 'rgba(255,255,255,0.6)';
        link.style.textDecoration = 'none';
      });
    }

    breadcrumbEl.appendChild(link);
  });
}

function resetBreadcrumb() {
  breadcrumbTrail = ['ATE730'];
  renderBreadcrumb();
}

function updateTitle(text = '') {
  const cardsTitle = document.getElementById('cards-title');
  if (cardsTitle) {
    cardsTitle.textContent = text;
  }
}

function navigateTo(program) {
  const successors = rows.filter(r => r.membro === program);

  updateBreadcrumb(program);
  updateTitle(`Fluxo Autorização`);

  // Use Tree View for Flow
  renderTree(program, successors);
  currentProgram = program;
}

function renderTree(rootProgram, children) {
  const cardsTitle = document.getElementById('cards-title');
  const cardsEl = document.getElementById('cards');

  if (!cardsEl) return;

  // Clear previous content and set class
  cardsEl.innerHTML = '';
  cardsEl.className = 'tree-container'; // Use tree container class

  // Find root details (optional, if we have metadata for the root)
  // We might need to search the entire 'rows' to find description for 'rootProgram'
  // But usually 'rows' contains edges. To find node props, we might need to look at where it appears as a child.
  // Or we can just use the ID.
  const rootDetails = rows.find(r => r.elemento === rootProgram) || { elemento: rootProgram, tipo: 'Programa', descricao: 'Nó Atual' };

  // Build Tree HTML
  const treeHtml = `
    <div class="tree">
      <ul>
        <li>
          ${createTreeNodeHtml(rootDetails, true)}
          ${children.length > 0 ? `
            <ul>
              ${children.map(child => `
                <li>
                  ${createTreeNodeHtml(child, false)}
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </li>
      </ul>
    </div>
  `;

  cardsEl.innerHTML = treeHtml;

  // Re-attach event listeners
  // We need to attach listeners to the generated nodes
  const nodes = cardsEl.querySelectorAll('.tree-node');
  nodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      const target = node.getAttribute('data-target');
      if (target && target !== rootProgram) {
        navigateTo(target);
      }
    });
  });
}

function createTreeNodeHtml(item, isRoot) {
  const isTable = (item.tipo || '').toLowerCase() === 'tabela';
  const iconTabela = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/></svg>`;
  const iconPrograma = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;

  const icon = isTable ? iconTabela : iconPrograma;
  const typeClass = isTable ? 'type-tabela' : 'type-programa';
  const rootClass = isRoot ? 'is-root' : '';
  const target = item.elemento || item; // Fallback

  return `
    <a href="#" class="tree-node ${typeClass} ${rootClass}" data-target="${target}">
      <div class="node-icon">${icon}</div>
      <div class="node-title">${target}</div>
      <div class="node-desc">${escapeHTML(item.descricao || '')}</div>
    </a>
  `;
}

function renderCards(list, titleText = '', viewType = 'grid') {
  const cardsTitle = document.getElementById('cards-title');
  const cardsEl = document.getElementById('cards');

  if (!cardsEl) return;

  if (cardsTitle && titleText) {
    cardsTitle.textContent = titleText;
  }

  cardsEl.innerHTML = '';
  cardsEl.className = `cards ${viewType === 'flow' ? 'flow-view' : ''}`;

  if (list.length === 0) {
    cardsEl.innerHTML = '<p style="color: rgba(255,255,255,0.5)">Nenhum item encontrado</p>';
    return;
  }

  list.forEach((r, index) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.animationDelay = `${index * 50}ms`; // Stagger effect

    // SVG Icons
    const iconTabela = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #34d399"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/></svg>`;
    const iconPrograma = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #60a5fa"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;

    const isTable = r.tipo && r.tipo.toLowerCase() === 'tabela';
    const icon = isTable ? iconTabela : iconPrograma;

    el.innerHTML = `
      <div class="card-header">
        <div class="icon-wrapper">${icon}</div>
        <div class="meta">${escapeHTML(r.tipo || '')}</div>
      </div>
      <div class="title">${escapeHTML(r.elemento || '')}</div>
      <div class="desc">${escapeHTML(r.descricao && r.descricao.trim() !== '' ? r.descricao : 'Sem descrição')}</div>
    `;
    el.addEventListener('click', () => {
      navigateTo(r.elemento);
    });
    cardsEl.appendChild(el);
  });
}

function getAllUniqueNodes(list) {
  const nodes = new Map();

  list.forEach(r => {
    if (r.elemento) {
      nodes.set(r.elemento, r);
    }

    if (r.membro && !nodes.has(r.membro)) {
      nodes.set(r.membro, {
        elemento: r.membro,
        tipo: 'Programa',
        descricao: 'Nó Raiz / Pai',
        membro: ''
      });
    }
  });

  return Array.from(nodes.values());
}

document.getElementById('search').addEventListener('input', e => {
  const term = e.target.value.trim().toLowerCase();

  if (!term) {
    navigateTo('ATE730');
    return;
  }

  const allNodes = getAllUniqueNodes(rows);
  const filtered = allNodes.filter(r =>
    (r.elemento && r.elemento.toLowerCase().includes(term)) ||
    (r.descricao && r.descricao.toLowerCase().includes(term)) ||
    (r.tipo && r.tipo.toLowerCase().includes(term))
  );

  document.getElementById('breadcrumb').innerHTML = '';
  updateTitle(`Resultados para "${term}"`);
  renderCards(filtered);
});

function computeMetrics(list) {
  const uniqueElements = new Set();
  const uniqueProgramas = new Set();
  const uniqueTabelas = new Set();

  list.forEach(r => {
    if (r.elemento) {
      uniqueElements.add(r.elemento);

      const tipo = (r.tipo || '').toLowerCase();
      if (tipo === 'programa') {
        uniqueProgramas.add(r.elemento);
      } else if (tipo === 'tabela') {
        uniqueTabelas.add(r.elemento);
      }
    }
  });

  const total = uniqueElements.size;
  const programas = uniqueProgramas.size + 1;
  const tabelas = uniqueTabelas.size;


  const selects = list.filter(r => (r.detalhe || '').toLowerCase().includes('select')).length;
  const inserts = list.filter(r => (r.detalhe || '').toLowerCase().includes('insert')).length;
  const updates = list.filter(r => (r.detalhe || '').toLowerCase().includes('update')).length;

  return { total, programas, tabelas, selects, inserts, updates };
}

function showMetricsInsideCard() {
  const m = computeMetrics(rows);
  const cardsEl = document.getElementById('cards');
  cardsEl.className = 'metrics-grid';
  cardsEl.innerHTML = `
    <div class="metric-panel metric-total">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
      <div class="metric-value">${m.total}</div>
      <div class="metric-label">Total</div>
    </div>
    <div class="metric-panel metric-programas">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></div>
      <div class="metric-value">${m.programas}</div>
      <div class="metric-label">Programas</div>
    </div>
    <div class="metric-panel metric-tabelas">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/></svg></div>
      <div class="metric-value">${m.tabelas}</div>
      <div class="metric-label">Tabelas</div>
    </div>
    <div class="metric-panel metric-selects">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
      <div class="metric-value">${m.selects}</div>
      <div class="metric-label">Selects</div>
    </div>
    <div class="metric-panel metric-inserts">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>
      <div class="metric-value">${m.inserts}</div>
      <div class="metric-label">Inserts</div>
    </div>
    <div class="metric-panel metric-updates">
      <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>
      <div class="metric-value">${m.updates}</div>
      <div class="metric-label">Updates</div>
    </div>
  `;
  updateTitle('Números do Autorizador SAT');
}

function getTableObjects(list) {
  const uniqueTables = new Map();
  list.forEach(r => {
    if ((r.tipo || '').toLowerCase() === 'tabela' && r.elemento) {
      uniqueTables.set(r.elemento, r);
    }
  });
  return Array.from(uniqueTables.values())
    .sort((a, b) => a.elemento.localeCompare(b.elemento));
}

function showTablesInsideCard() {
  const tables = getTableObjects(rows);
  const cardsEl = document.getElementById('cards');
  cardsEl.className = 'cards';
  updateTitle('Tabelas do Autorizador SAT');

  // SVG Icon for Table
  const iconTabela = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #34d399"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/></svg>`;

  if (tables.length === 0) {
    cardsEl.innerHTML = '<p>Nenhuma tabela encontrada</p>';
    return;
  }

  cardsEl.innerHTML = '';

  tables.forEach((t, index) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.animationDelay = `${index * 30}ms`;

    el.innerHTML = `
      <div class="card-header">
        <div class="icon-wrapper">${iconTabela}</div>
        <div class="meta">TABELA</div>
      </div>
      <div class="title">${escapeHTML(t.elemento)}</div>
      <div class="desc">${escapeHTML(t.descricao || 'Sem descrição')}</div>
    `;

    el.addEventListener('click', () => {
      navigateTo(t.elemento);
    });

    cardsEl.appendChild(el);
  });
}

linkNumeros.addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('breadcrumb').innerHTML = '';
  showMetricsInsideCard();
});

linkTabelas.addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('breadcrumb').innerHTML = '';
  showTablesInsideCard();
});

linkFluxo.addEventListener('click', (event) => {
  event.preventDefault();
  resetBreadcrumb();
  navigateTo('ATE730');
});

function init() {
  rows = DATA;  // DATA comes from data.js
  console.log('Dados carregados:', rows);
  navigateTo('ATE730');
}

function displayCards(cards) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  let idx = 0;
  let useSix = true; // 1ª linha = 6

  while (idx < cards.length) {
    const row = document.createElement('div');
    row.className = 'cards-row';

    const limit = useSix ? 6 : 5;
    for (let i = 0; i < limit && idx < cards.length; i++) {
      const card = createCard(cards[idx]);
      row.appendChild(card);
      idx++;
    }
    container.appendChild(row);
    useSix = !useSix; // alterna 6 ↔ 5
  }
}

init();
