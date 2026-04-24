/* ----------  helpers  ---------- */
const $ = q => document.querySelector(q);

/* ----------  estado global  ---------- */
let currentRoot = null;
let breadcrumbTrail = ['ATE730'];

/* ----------  monta Ã¡rvore  ---------- */
const elementMap = new Map();

// 1. cria nÃ³ vazio para cada elemento que aparece
DATA.forEach(d => {
    if (!d.elemento) return;
    elementMap.set(d.elemento, {
        id: d.elemento,
        membro: d.membro,
        tipo: d.tipo,
        desc: d.descricao,
        obs: d.detalhe,
        children: []
    });
});

// 2. liga pai e filho (DEPOIS de garantir ATE730)
if (!elementMap.has('ATE730')) {
    elementMap.set('ATE730', {
        id: 'ATE730', membro: '', tipo: 'Programa',
        desc: 'Ponto de entrada', obs: '', children: []
    });
}

// Agora sim liga os filhos

DATA.forEach(d => {
    if (!d.elemento || !d.membro) return;
    const pai = elementMap.get(d.membro);
    const filho = elementMap.get(d.elemento);
    if (pai && filho && pai !== filho) {
        pai.children.push(filho);
    }
});

const nodes = Array.from(elementMap.values());

/* ----------  breadcrumb  ---------- */
function updateBreadcrumb(node) {
    if (!node || !node.id) return;
    const nav = $('#breadcrumb');
    nav.innerHTML = '';
    breadcrumbTrail.forEach((id, i) => {
        const span = document.createElement('span');
        span.textContent = id;
        span.style.color = i === breadcrumbTrail.length - 1 ? 'var(--text)' : 'var(--accent)';
        span.style.cursor = i === breadcrumbTrail.length - 1 ? 'default' : 'pointer';
        span.style.fontSize = '0.85rem';
        span.style.fontWeight = i === breadcrumbTrail.length - 1 ? '600' : '400';
        if (i < breadcrumbTrail.length - 1) span.onclick = () => showFluxo(nodes.find(n => n.id === id));
        nav.appendChild(span);
        if (i < breadcrumbTrail.length - 1) {
            const sep = document.createElement('span');
            sep.innerHTML = ' > ';
            sep.style.color = 'var(--sub)';
            sep.style.margin = '0 0.25rem';
            nav.appendChild(sep);
        }
    });
}

/* ----------  cartÃ£o (mantido para compatibilidade)  ---------- */
function makeCard(node) {
    const div = document.createElement('div');
    div.className = 'card';
    let icon = '#prog', color = '#60a5fa';
    if (node.tipo.toLowerCase() === 'tabela') {
        if (/update/i.test(node.obs)) { icon = '#tab-upd'; color = '#f59e0b'; }
        else { icon = '#tab-sel'; color = '#10b981'; }
    }
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <div class="nome">${node.id}</div>
                <div class="tipo" style="color: ${color};">${node.tipo.toUpperCase()}</div>
            </div>
            <svg class="ico" width="20" height="20" style="color: ${color};"><use href="${icon}"/></svg>
        </div>
        <div class="desc">${(node.desc && node.desc.length > 10 && !node.desc.includes('r de Ilensagem')) ? node.desc : 'Sem descrição'}</div>
    `;
    div.onclick = () => showFluxo(node);
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'button');
    return div;
}

/* ----------  preenche tbody da data-table  ---------- */
function fillTable(tbody, items) {
    tbody.innerHTML = '';
    items.forEach(item => {
        // Define badge de status baseado em "obs"
        let statusClass = '';
        let statusText = item.obs || '-';
        if (/select/i.test(item.obs)) { statusClass = 'badge-paid'; statusText = 'Select'; }
        if (/update/i.test(item.obs)) { statusClass = 'badge-due'; statusText = 'Update'; }
        if (/insert/i.test(item.obs)) { statusClass = 'badge-due'; statusText = 'Insert'; }
        if (!item.obs) { statusClass = 'badge-pending'; statusText = ''; }

        const row = tbody.insertRow();
        row.innerHTML = `
      <td><span class="badge id">${item.id}</span></td>
      <td><span class="badge ${item.tipo.toLowerCase()}">${item.tipo}</span></td>
      <td><code>${item.membro || '-'}</code></td>
      <td>${item.desc || 'Sem descrição'}</td>
      <td><span class="badge-status ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn-action" onclick="menuAcoes('${item.id}')">Ação ▼</button>
      </td>
    `;
    });
}

/* ----------  exibe filhos de um nÃ³ (data-table)  ---------- */
function showFluxo(node) {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Filhos do Programa: ' + node.id;
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar na tabela...';
    searchInput.className = 'table-search';

    /* >>> filtra apenas PROGRAMAS que sÃ£o filhos diretos deste nÃ³ <<< */
    const filhosPrograma = (node.children || []).filter(c =>
        c.tipo.toLowerCase() === 'programa'
    );

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th data-sort="id">ID</th>
                <th>Tipo</th>
                <th data-sort="membro">Elemento</th>
                <th>Descrição</th>
                <th data-sort="obs">Detalhe</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    fillTable(tbody, filhosPrograma);

    table.querySelectorAll('th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            const sorted = [...filhosPrograma].sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
            fillTable(tbody, sorted);
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtrados = filhosPrograma.filter(n =>
            n.id.toLowerCase().includes(term) ||
            (n.desc && n.desc.toLowerCase().includes(term)) ||
            (n.obs && n.obs.toLowerCase().includes(term))
        );
        fillTable(tbody, filtrados);
    });

    app.appendChild(searchInput);
    app.appendChild(table);
}

let paginaAtual = 1;
let itensPorPagina = 15;

function mostrarPagina(items, pagina, porPagina) {
    const inicio = (pagina - 1) * porPagina;
    const fim = inicio + porPagina;
    return items.slice(inicio, fim);
}

function mostrarInfoPagina(total, pagina, porPagina) {
    const inicio = (pagina - 1) * porPagina + 1;
    const fim = Math.min(pagina * porPagina, total);
    return `Mostrando ${inicio}-${fim} de ${total}`;
}

function criarPaginacao(total, pagina, porPagina, onChange) {
    const div = document.createElement('div');
    div.className = 'paginacao';

    const info = document.createElement('span');
    info.textContent = mostrarInfoPagina(total, pagina, porPagina);

    const botoes = document.createElement('div');
    botoes.className = 'pag-buttons';

    const btnAnt = document.createElement('button');
    btnAnt.className = 'pag-btn';
    btnAnt.textContent = 'Anterior';
    btnAnt.disabled = pagina === 1;
    btnAnt.onclick = () => onChange(pagina - 1);

    const btnProx = document.createElement('button');
    btnProx.className = 'pag-btn';
    btnProx.textContent = 'Próximo';
    btnProx.disabled = pagina * porPagina >= total;
    btnProx.onclick = () => onChange(pagina + 1);

    botoes.append(btnAnt, btnProx);
    div.append(info, botoes);
    return div;
}

function showAllRecords() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Todos os Registros';
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar na tabela...';
    searchInput.className = 'table-search';
    app.appendChild(searchInput);

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
    <colgroup>
      <col style="width: 18%;">
      <col style="width: 16%;">
      <col style="width: 20%;">
      <col style="width: 46%;">
    </colgroup>
    <thead>
      <tr>
        <th data-sort="id">ID</th>
        <th>Tipo</th>
        <th data-sort="membro">Elemento</th>
        <th>Descrição</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    const baseRows = [...nodes];
    let rows = [...baseRows];

    function renderPagina(pag) {
        paginaAtual = pag;
        const pageItems = mostrarPagina(rows, pag, itensPorPagina);
        preencheTabela(pageItems);

        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();

        const pagEl = criarPaginacao(rows.length, pag, itensPorPagina, renderPagina);
        app.appendChild(pagEl);
    }

    table.querySelectorAll('th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            rows.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')));
            renderPagina(1);
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        rows = baseRows.filter(n =>
            String(n.id || '').toLowerCase().includes(term) ||
            String(n.tipo || '').toLowerCase().includes(term) ||
            String(n.membro || '').toLowerCase().includes(term) ||
            (n.desc && n.desc.toLowerCase().includes(term)) ||
            (n.obs && n.obs.toLowerCase().includes(term))
        );
        renderPagina(1);
    });

    function preencheTabela(items) {
        tbody.innerHTML = '';
        items.forEach((item) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.id || '-'}</td>
                <td>${item.tipo || '-'}</td>
                <td>${item.membro || '-'}</td>
                <td>${item.desc || 'Sem descrição'}</td>
            `;
        });
    }
    renderPagina(1);
}
/* ----------  views antigas (cards)  ---------- */
function showTabelas() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '<h2>Tabelas do Autorizador SAT</h2>';
    const row = document.createElement('div');
    row.className = 'cards-row';
    nodes.filter(n => n.tipo.toLowerCase() === 'tabela')
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach(t => row.appendChild(makeCard(t)));
    app.appendChild(row);
    breadcrumbTrail = ['Tabelas'];
    updateBreadcrumb({ id: 'Tabelas' });
}

function showUtilitarios() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '<h2>Números do Autorizador SAT</h2>';
    const stats = {
        total: nodes.length,
        programas: nodes.filter(n => n.tipo.toLowerCase() === 'programa').length,
        tabelas: nodes.filter(n => n.tipo.toLowerCase() === 'tabela').length,
        selects: nodes.filter(n => n.tipo.toLowerCase() === 'tabela' && /select/i.test(n.obs)).length,
        updates: nodes.filter(n => n.tipo.toLowerCase() === 'tabela' && /update/i.test(n.obs)).length
    };
    const max = Math.max(stats.programas, stats.tabelas, stats.selects, stats.updates);
    function bar(label, value, color) {
        const pct = (value / max) * 100;
        return `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">
                <span>${label}</span>
                <span>${value}</span>
            </div>
            <div style="background: var(--sub); border-radius: 8px; height: 10px; overflow: hidden;">
                <div style="background: ${color}; width: ${pct}%; height: 100%; transition: width 0.4s;"></div>
            </div>
        </div>`;
    }
    const viz = document.createElement('div');
    viz.style.maxWidth = '600px';
    viz.innerHTML = `
        ${bar('Programas', stats.programas, '#ff9f0a')}
        ${bar('Tabelas', stats.tabelas, '#32d74b')}
        ${bar('Selects', stats.selects, '#0a84ff')}
        ${bar('Updates', stats.updates, '#ff375f')}`;
    app.appendChild(viz);
    updateBreadcrumb({ id: 'Números' });
}

/* ----------  menu header  ----------- */
function openView(view) {
    console.log("Entrei no view", view)
    if (view === 'fluxo') showTodosProgramas();
    if (view === 'tabelas') showTodasTabelas();
    if (view === 'copybook') showCopybooks();
    if (view === 'colunas') buscarColunas();
    if (view === 'utilitarios') showUtilitarios();
    if (view === 'all') showAllRecords();
    if (view === 'busca') buscarVariaveis();
}

document.addEventListener('click', e => {
    const link = e.target.closest('[data-view]');
    if (!link) return;
    e.preventDefault();
    document.querySelectorAll('[data-view]').forEach(a => a.classList.remove('ativo'));
    link.classList.add('ativo');
    const view = link.dataset.view;
    openView(view);
    // fecha dropdown apÃ³s navegar
    if (typeof closeAllDropdowns === 'function') closeAllDropdowns();
});

/* ----------  inicializaÃ§Ã£o  ---------- */
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view');
    if (initialView) {
        openView(initialView);
    } else {
        setHomeView(true); // exibe hero/landing ao carregar
    }
    updateAsideVisibility();
});

/* ----------  utilitÃ¡rios  ---------- */
function setHomeView(isHome) {
    document.body.classList.toggle('home', isHome);

    // SeÃ§Ãµes de landing page
    const secInicio    = document.getElementById('inicio');
    const secSobre     = document.getElementById('o-que-e-sat-sia');
    const secApp       = document.getElementById('app');
    const secBreadcrumb = document.getElementById('breadcrumb');

    if (isHome) {
        // Exibe hero e seÃ§Ã£o de feature cards
        if (secInicio)    secInicio.style.display    = '';
        if (secSobre)     secSobre.style.display      = '';
        if (secApp)       secApp.style.minHeight      = '';
        if (secBreadcrumb) secBreadcrumb.innerHTML    = '';
    } else {
        // Esconde o landing, mostra apenas o conteÃºdo da tool
        if (secInicio)    secInicio.style.display    = 'none';
        if (secSobre)     secSobre.style.display      = 'none';
        // Garante que o #app ocupe ao menos a tela toda
        if (secApp)       secApp.style.minHeight      = 'calc(100vh - 64px)';
        // Scroll suave para o topo apÃ³s 1 frame (conteÃºdo jÃ¡ inserido)
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // Mantém breadcrumb limpo na visão de ferramentas.
    }
}

function updateAsideVisibility() {
    const aside = $('#resumo');
    if (aside) aside.style.display = document.body.classList.contains('home') ? 'block' : 'none';
}
function highlight(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function showEmptyState() {
    console.log('showEmptyState');
    fadeSwitch(() => {
        const app = $('#app');
        app.innerHTML = `
            <div class="empty-hero">
                <svg class="empty-illustration" viewBox="0 0 800 600" aria-hidden="true">
                    <use href="#illustration"/>
                </svg>
            </div>
        `;
        breadcrumbTrail = [];
        updateBreadcrumb({ id: '' });
    });
}

function fadeSwitch(newContentFn) {
    const app = $('#app');
    app.classList.add('fade-out');
    setTimeout(() => {
        newContentFn();
        app.classList.remove('fade-out');
    }, 200);
}

window.menuAcoes = function (id) {
    const escolha = prompt(`Ações para ${id}:\n1 Ver detalhes\n2 Copiar ID\n3 Exportar linha`);
    if (!escolha) return;
    switch (escolha.trim()) {
        case '1': alert(`Detalhes:\n${JSON.stringify(nodes.find(n => n.id === id), null, 2)}`); break;
        case '2': navigator.clipboard.writeText(id); alert('ID copiado!'); break;
        case '3': exportarLinha(id); break;
        default: alert('Opção inválida');
    }
};

function exportarLinha(id) {
    const item = nodes.find(n => n.id === id);
    if (!item) return;
    const csv = `${item.id},${item.tipo},${item.membro},${item.desc},${item.obs}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function showTodosProgramas() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Todos os Programas';
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar programas...';
    searchInput.className = 'table-search';
    app.appendChild(searchInput);

    const table = document.createElement('table');
    table.className = 'data-table data-table-programas';
    table.innerHTML = `
        <colgroup>
            <col style="width: 18%;">
            <col style="width: 22%;">
            <col style="width: 60%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="membro" style="cursor: pointer;">Nome</th>
                <th style="cursor: pointer;" data-sort="elemento">Programa Chamado</th>
                <th>Descrição</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    // **Pega TODOS os programas do DATA (mantÃ©m repetiÃ§Ãµes)**
    let todosProgramas = DATA.filter(d => d.tipo?.toLowerCase() === 'programa');
    const itensPorPagina = 15;
    let paginaAtual = 1;

    function mostrarPagina(items, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina;
        const fim = inicio + porPagina;
        return items.slice(inicio, fim);
    }

    function mostrarInfoPagina(total, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina + 1;
        const fim = Math.min(pagina * porPagina, total);
        return `Mostrando ${inicio}-${fim} de ${total}`;
    }

    function criarPaginacao(total, pagina, porPagina, onChange) {
        const div = document.createElement('div');
        div.className = 'paginacao';

        const info = document.createElement('span');
        info.textContent = mostrarInfoPagina(total, pagina, porPagina);

        const botoes = document.createElement('div');
        botoes.className = 'pag-buttons';

        const btnAnt = document.createElement('button');
        btnAnt.className = 'pag-btn';
        btnAnt.textContent = 'Anterior';
        btnAnt.disabled = pagina === 1;
        btnAnt.onclick = () => onChange(pagina - 1);

        const btnProx = document.createElement('button');
        btnProx.className = 'pag-btn';
        btnProx.textContent = 'Próximo';
        btnProx.disabled = pagina * porPagina >= total;
        btnProx.onclick = () => onChange(pagina + 1);

        botoes.append(btnAnt, btnProx);
        div.append(info, botoes);
        return div;
    }

    function renderPagina(pag) {
        paginaAtual = pag;
        const pageItems = mostrarPagina(todosProgramas, pag, itensPorPagina);
        preencheTabela(pageItems);

        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();

        const pagEl = criarPaginacao(todosProgramas.length, pag, itensPorPagina, renderPagina);
        app.appendChild(pagEl);
    }

    function preencheTabela(items) {
        tbody.innerHTML = '';
        items.forEach(d => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${d.membro || '-'}</td>
                <td>${d.elemento || '-'}</td>
                <td>${d.descricao || 'Sem descrição'}</td>
            `;
        });
    }

    // **OrdenaÃ§Ã£o**
    table.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            todosProgramas.sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
            renderPagina(1); // volta para pÃ¡gina 1 apÃ³s ordenar
        });
    });

    // **Busca ao vivo**
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        todosProgramas = DATA.filter(d =>
            d.tipo?.toLowerCase() === 'programa' &&
            (String(d.membro || '').toLowerCase().includes(term) ||
                (d.descricao && d.descricao.toLowerCase().includes(term)) ||
                String(d.elemento || '').toLowerCase().includes(term) ||
                String(d.detalhe || '').toLowerCase().includes(term)
            )
        );
        renderPagina(1); // volta para pÃ¡gina 1 apÃ³s busca
    });

    // **Primeira renderizaÃ§Ã£o**
    renderPagina(1);
}

function showTodasTabelas() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Todas as Tabelas';
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar tabelas...';
    searchInput.className = 'table-search';
    app.appendChild(searchInput);

    const table = document.createElement('table');
    table.className = 'data-table-short data-table-tabelas';
    table.innerHTML = `
        <colgroup>
            <col style="width: 18%;">
            <col style="width: 42%;">
            <col style="width: 20%;">
            <col style="width: 20%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="elemento" style="cursor: pointer;">Nome</th>
                <th>Descrição</th>
                <th data-sort="membro" style="cursor: pointer;">Acessada por</th>
                <th data-sort="detalhe" style="cursor: pointer;">Tipo de acesso</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    // **Todas as linhas do DATA onde tipo = tabela**
    let todasTabelas = DATA.filter(d => d.tipo?.toLowerCase() === 'tabela');
    
    const itensPorPagina = 15;
    let paginaAtual = 1;

    // **FunÃ§Ãµes de paginaÃ§Ã£o (iguais Ã  de programas)**
    function mostrarPagina(items, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina;
        const fim = inicio + porPagina;
        return items.slice(inicio, fim);
    }
    function mostrarInfoPagina(total, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina + 1;
        const fim = Math.min(pagina * porPagina, total);
        return `Mostrando ${inicio}-${fim} de ${total}`;
    }
    function criarPaginacao(total, pagina, porPagina, onChange) {
        const div = document.createElement('div');
        div.className = 'paginacao';
        const info = document.createElement('span');
        info.textContent = mostrarInfoPagina(total, pagina, porPagina);
        const botoes = document.createElement('div');
        botoes.className = 'pag-buttons';
        const btnAnt = document.createElement('button');
        btnAnt.className = 'pag-btn';
        btnAnt.textContent = 'Anterior';
        btnAnt.disabled = pagina === 1;
        btnAnt.onclick = () => onChange(pagina - 1);
        const btnProx = document.createElement('button');
        btnProx.className = 'pag-btn';
        btnProx.textContent = 'Próximo';
        btnProx.disabled = pagina * porPagina >= total;
        btnProx.onclick = () => onChange(pagina + 1);
        botoes.append(btnAnt, btnProx);
        div.append(info, botoes);
        return div;
    }

    function renderPagina(pag) {
        paginaAtual = pag;
        const pageItems = mostrarPagina(todasTabelas, pag, itensPorPagina);
        preencheTabela(pageItems);
        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();
        const pagEl = criarPaginacao(todasTabelas.length, pag, itensPorPagina, renderPagina);
        app.appendChild(pagEl);
    }

    function preencheTabela(items) {
        tbody.innerHTML = '';
        items.forEach(d => {
            let tipoAcesso = d.detalhe || '-';
            if (/select/i.test(d.detalhe)) tipoAcesso = 'Select';
            if (/update/i.test(d.detalhe)) tipoAcesso = 'Update';
            if (/insert/i.test(d.detalhe)) tipoAcesso = 'Insert';

            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${d.elemento || '-'}</td>
                <td>${d.descricao || 'Sem descrição'}</td>
                <td>${d.membro || '-'}</td>
                <td>${tipoAcesso}</td>
            `;
        });
    }

    // OrdenaÃ§Ã£o
    table.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            todasTabelas.sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
            renderPagina(1);
        });
    });

    // Busca ao vivo
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        todasTabelas = DATA.filter(d =>
            d.tipo?.toLowerCase() === 'tabela' &&
            (d.elemento.toLowerCase().includes(term) ||
                (d.descricao && d.descricao.toLowerCase().includes(term)) ||
                (d.membro && d.membro.toLowerCase().includes(term)) ||
                (d.detalhe && d.detalhe.toLowerCase().includes(term)))
        );
        renderPagina(1);
    });

    // Primeira renderizaÃ§Ã£o
    renderPagina(1);
}

function showCopybooks() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Busca por Copybooks';
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar copybooks...';
    searchInput.className = 'table-search';
    app.appendChild(searchInput);

    const table = document.createElement('table');
    table.className = 'data-table data-table-programas';
    table.innerHTML = `
        <colgroup>
            <col style="width: 18%;">
            <col style="width: 22%;">
            <col style="width: 60%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="copybook" style="cursor: pointer;">Copybook</th>
                <th data-sort="programa" style="cursor: pointer;">Programa</th>
                <th data-sort="tipo" style="cursor: pointer;">Tipo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    const source = typeof indicePorCopybook === 'object' && indicePorCopybook ? indicePorCopybook : {};
    let rows = Object.entries(source).flatMap(([copybook, itens]) => {
        const list = Array.isArray(itens) ? itens : [itens];
        return list.map((item) => ({
            copybook,
            programa: item?.programa || '-',
            tipo: item?.tipo || '-'
        }));
    });

    const itensPorPagina = 15;

    function mostrarPagina(items, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina;
        return items.slice(inicio, inicio + porPagina);
    }

    function mostrarInfoPagina(total, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina + 1;
        const fim = Math.min(pagina * porPagina, total);
        return `Mostrando ${inicio}-${fim} de ${total}`;
    }

    function criarPaginacao(total, pagina, porPagina, onChange) {
        const div = document.createElement('div');
        div.className = 'paginacao';
        const info = document.createElement('span');
        info.textContent = mostrarInfoPagina(total, pagina, porPagina);
        const botoes = document.createElement('div');
        botoes.className = 'pag-buttons';

        const btnAnt = document.createElement('button');
        btnAnt.className = 'pag-btn';
        btnAnt.textContent = 'Anterior';
        btnAnt.disabled = pagina === 1;
        btnAnt.onclick = () => onChange(pagina - 1);

        const btnProx = document.createElement('button');
        btnProx.className = 'pag-btn';
        btnProx.textContent = 'Próximo';
        btnProx.disabled = pagina * porPagina >= total;
        btnProx.onclick = () => onChange(pagina + 1);

        botoes.append(btnAnt, btnProx);
        div.append(info, botoes);
        return div;
    }

    function preencheTabela(items) {
        tbody.innerHTML = '';
        items.forEach((item) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.copybook || '-'}</td>
                <td>${item.programa}</td>
                <td>${item.tipo || '-'}</td>
            `;
        });
    }

    function renderPagina(pagina) {
        const pageItems = mostrarPagina(rows, pagina, itensPorPagina);
        preencheTabela(pageItems);
        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();
        app.appendChild(criarPaginacao(rows.length, pagina, itensPorPagina, renderPagina));
    }

    table.querySelectorAll('th[data-sort]').forEach((th) => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            rows.sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
            renderPagina(1);
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        rows = Object.entries(source).flatMap(([copybook, itens]) => {
            const list = Array.isArray(itens) ? itens : [itens];
            return list.map((item) => ({
                copybook,
                programa: item?.programa || '-',
                tipo: item?.tipo || '-'
            }));
        }).filter((item) =>
            item.copybook.toLowerCase().includes(term) ||
            item.programa.toLowerCase().includes(term) ||
            item.tipo.toLowerCase().includes(term)
        );
        renderPagina(1);
    });

    renderPagina(1);
}
