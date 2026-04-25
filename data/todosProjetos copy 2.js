async function todosProjetos() {
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
        <option value="">Todas as Operações</option>
        <option value="SELECT">Em andamento</option>
        <option value="INSERT">Em atendimento</option>
        <option value="UPDATE">Pendente</option>
        <option value="DELETE">Cancelado</option>
    `;

    const selectOrigem = document.createElement('select');
    selectOrigem.className = 'filtro-select';
    selectOrigem.innerHTML = `
        <option value="">Todas Origens</option>
        <option value="SELECT">Select</option>
        <option value="INTO">Into</option>
        <option value="SET">Set</option>
        <option value="WHERE">Where</option>
        <option value="FROM">From</option>
        <option value="JOIN">Join</option>
    `;

    filtrosDiv.append(searchInput, selectOperacao, selectOrigem);
    app.appendChild(filtrosDiv);

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <colgroup>
            <col style="width: 22%;">
            <col style="width: 18%;">
            <col style="width: 26%;">
            <col style="width: 17%;">
            <col style="width: 17%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="id" style="cursor: pointer;">ID</th>
                <th data-sort="tipo" style="cursor: pointer;">Tipo</th>
                <th data-sort="dataIni" style="cursor: pointer;">Data Início</th>
                <th data-sort="dataMod" style="cursor: pointer;">Data Modificação</th>
                <th data-sort="resumo" style="cursor: pointer;">Resumo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);

    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Carregando dados...';
    app.appendChild(loading);

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
                <td>${item.id || '-'}</td>
                <td>${item.tipo || '-'}</td>
                <td>${item.dataIni || '-'}</td>
                <td>${item.dataMod || '-'}</td>
                <td>${item.resumo || '-'}</td>
            `;
        });
    }

    let rows = [];
    const itensPorPagina = 15;

    function renderPagina(pagina) {
        const pageItems = mostrarPagina(rows, pagina, itensPorPagina);
        preencheTabela(pageItems);
        const oldPag = app.querySelector('.paginacao');
        if (oldPag) oldPag.remove();
        app.appendChild(criarPaginacao(rows.length, pagina, itensPorPagina, renderPagina));
    }

    function aplicarFiltros() {
        const term = searchInput.value.toLowerCase().trim();
        rows = baseRows.filter((d) => {
            return (
                !term ||
                (d.id || '').toLowerCase().includes(term) ||
                (d.tipo || '').toLowerCase().includes(term) ||
                (d.status || '').toLowerCase().includes(term) ||
                (d.dataIni || '').toLowerCase().includes(term) ||
                (d.prazoFinal || '').toLowerCase().includes(term) ||
                (d.dataMod || '').toLowerCase().includes(term) ||
                (d.resumo || '').toLowerCase().includes(term)
            );
        });
        renderPagina(1);
    }

    searchInput.addEventListener('input', aplicarFiltros);
    selectOperacao.addEventListener('change', aplicarFiltros);
    selectOrigem.addEventListener('change', aplicarFiltros);


    function achatarDados(obj) {
        return Object.entries(obj).flatMap(([nomeColuna, valor]) => {
            const dados = Array.isArray(valor) ? valor : [valor];
            return dados.map((d) => ({ ...d, nomeColuna }));
        });
    }

    const baseRows = achatarDados(DATA_PROJETOS);

    table.querySelectorAll('th[data-sort]').forEach((th) => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            rows.sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
            renderPagina(1);
        });
    });

    loading.remove();
    renderPagina(1);
}