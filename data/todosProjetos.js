function mergeById(base, updates) {
    const map = new Map(base.map(item => [item.id, { ...item }]));

    for (const item of updates) {
        map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }

    return [...map.values()];
}

function todosProjetos() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Busca por Projetos';
    app.appendChild(title);

    const filtrosDiv = document.createElement('div');
    filtrosDiv.className = 'filtros-container';

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Pesquisar conteúdo...';
    searchInput.className = 'table-search';
    searchInput.style.flex = '1';
    searchInput.style.minWidth = '200px';

    const selectOperacao = document.createElement('select');
    selectOperacao.className = 'filtro-select';
    selectOperacao.innerHTML = `
        <option value="">Todas as Situações</option>
        <option value="Pendente">Pendente</option>
        <option value="andamento">Em Andamento</option>
        <option value="atendimento">Em atendimento</option>
        <option value="cancelada">Cancelada</option>
        <option value="A Fazer">A Fazer</option>
        <option value="Arquivada">Arquivada</option>
        <option value="Concluído">Concluído</option>
        <option value="Fechada">Fechada</option>
        <option value="Feito">Feito</option>
        <option value="Homologação">Homologação</option>
    `;

    filtrosDiv.append(searchInput, selectOperacao);
    app.appendChild(filtrosDiv);

    const table = document.createElement('table');
    table.className = 'data-table data-table-projetos';
    table.innerHTML = `
        <colgroup>
            <col style="width: 9%;">
            <col style="width: 7%;">
            <col style="width: 9%;">
            <col style="width: 10.5%;">
            <col style="width: 10.5%;">
            <col style="width: 11%;">
            <col style="width: 40%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="id" style="cursor: pointer;">Id</th>
                <th data-sort="tipo" style="cursor: pointer;">Tipo</th>
                <th data-sort="status" style="cursor: pointer;">Status</th>
                <th data-sort="dataIni" style="cursor: pointer;">Data Inicial</th>
                <th data-sort="prazoFinal" style="cursor: pointer;">Prazo Final</th>
                <th data-sort="dataMod" style="cursor: pointer;">Data Modif.</th>
                <th data-sort="resumo" style="cursor: pointer;">Resumo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    const dadosUnificados = mergeById(dadosGid, dadosGidUpd);
    const baseRows = dadosUnificados;
    let rows = [...baseRows];
    const itensPorPagina = 15;
    let paginaAtual = 1;
    let sortKeyAtual = '';
    let sortAsc = true;

    function mostrarPagina(items, pagina, porPagina) {
        const inicio = (pagina - 1) * porPagina;
        return items.slice(inicio, inicio + porPagina);
    }

    function criarPaginacao(total, pagina, porPagina, onChange) {
        const div = document.createElement('div');
        div.className = 'paginacao';

        const info = document.createElement('span');
        const inicio = (pagina - 1) * porPagina + 1;
        const fim = Math.min(pagina * porPagina, total);
        info.textContent = `Mostrando ${inicio}-${fim} de ${total}`;

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

    function ordenaRows() {
        if (!sortKeyAtual) return;

        rows.sort((a, b) => {
            let va;
            let vb;

            if (sortKeyAtual === 'id') {
                va = Number(a[sortKeyAtual] || 0);
                vb = Number(b[sortKeyAtual] || 0);
            } else if (sortKeyAtual === 'dataIni' || sortKeyAtual === 'prazoFinal' || sortKeyAtual === 'dataMod') {
                va = parseDataBR(a[sortKeyAtual]);
                console.log('Parsed va:', va);
                vb = parseDataBR(b[sortKeyAtual]);
            } else {
                va = String(a[sortKeyAtual] || '').toLowerCase();
                vb = String(b[sortKeyAtual] || '').toLowerCase();
            }

            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
        });
    }

    function parseDataBR(valor) {
        if (!valor) return 0;

        const [data, hora = '00:00'] = String(valor).trim().split(' ');
        const [dia, mes, ano] = data.split('/');
        const [h, m] = hora.split(':');

        if (!dia || !mes || !ano) return 0;

        return new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(h || 0),
            Number(m || 0)
        ).getTime();
    }

    function preencheTabela(items) {
        tbody.innerHTML = '';
        items.forEach((item) => {
            tbody.insertRow().innerHTML = `
                <td title="${item.id || '-'}">${item.id || '-'}</td>
                <td title="${item.tipo || '-'}">${item.tipo || '-'}</td>
                <td title="${item.status || '-'}">${item.status || '-'}</td>
                <td title="${item.dataIni || '-'}">${item.dataIni || '-'}</td>
                <td title="${item.prazoFinal || '-'}">${item.prazoFinal || '-'}</td>
                <td title="${item.dataMod || '-'}">${item.dataMod || '-'}</td>
                <td title="${item.resumo || '-'}">${item.resumo || '-'}</td>
            `;
        });
    }

    function renderPagina(pagina) {
        paginaAtual = pagina;
        ordenaRows();
        const pageItems = mostrarPagina(rows, pagina, itensPorPagina);
        preencheTabela(pageItems);
        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();
        app.appendChild(criarPaginacao(rows.length, pagina, itensPorPagina, renderPagina));
    }

    function aplicarFiltros() {
        const term = searchInput.value.trim().toLowerCase();
        const opFiltro = selectOperacao.value.trim().toLowerCase();

        rows = baseRows.filter((d) => {
            const buscaMatch =
                !term ||
                (d.id || '').toLowerCase().includes(term) ||
                (d.tipo || '').toLowerCase().includes(term) ||
                (d.status || '').toLowerCase().includes(term) ||
                (d.dataIni || '').toLowerCase().includes(term) ||
                (d.prazoFinal || '').toLowerCase().includes(term) ||
                (d.dataMod || '').toLowerCase().includes(term) ||
                (d.resumo || '').toLowerCase().includes(term);

            const opMatch = !opFiltro || (d.status || '').trim().toLowerCase() === opFiltro;
            return buscaMatch && opMatch;
        });

        renderPagina(1);
    }

    function onKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (paginaAtual > 1) renderPagina(paginaAtual - 1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const totalPaginas = Math.ceil(rows.length / itensPorPagina);
            if (paginaAtual < totalPaginas) renderPagina(paginaAtual + 1);
        }
    }

    document.addEventListener('keydown', onKeyDown);
    currentViewCleanup = () => document.removeEventListener('keydown', onKeyDown);

    searchInput.addEventListener('input', aplicarFiltros);
    selectOperacao.addEventListener('change', aplicarFiltros);

    table.querySelectorAll('th[data-sort]').forEach((th) => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;

            if (sortKeyAtual === key) {
                sortAsc = !sortAsc;
            } else {
                sortKeyAtual = key;
                sortAsc = true;
            }

            renderPagina(1);
        });
    });

    renderPagina(1);
}