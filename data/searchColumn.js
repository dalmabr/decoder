function buscarColunas() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Busca por Colunas';
    app.appendChild(title);

    const filtrosDiv = document.createElement('div');
    filtrosDiv.className = 'filtros-container';

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar tabelas...';
    searchInput.className = 'table-search';
    searchInput.style.flex = '1';
    searchInput.style.minWidth = '200px';

    const selectOperacao = document.createElement('select');
    selectOperacao.className = 'filtro-select';
    selectOperacao.innerHTML = `
        <option value="">Todas as Operações</option>
        <option value="SELECT">Select</option>
        <option value="INSERT">Insert</option>
        <option value="UPDATE">Update</option>
        <option value="DELETE">Delete</option>
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
                <th data-sort="nomeColuna" style="cursor: pointer;">Coluna</th>
                <th data-sort="programa" style="cursor: pointer;">Programa</th>
                <th data-sort="tabela" style="cursor: pointer;">Tabela</th>
                <th data-sort="operacao" style="cursor: pointer;">Operação</th>
                <th data-sort="origem" style="cursor: pointer;">Origem</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody'); 
    app.appendChild(table);

    function achatarDados(obj) {
        return Object.entries(obj).flatMap(([nomeColuna, valor]) => {
            const dados = Array.isArray(valor) ? valor : [valor];
            return dados.map((d) => ({ ...d, nomeColuna }));
        });
    }

    const baseRows = achatarDados(DadosPorColuna);
    let rows = [...baseRows];
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
            const op = (item.operacao || '-').toUpperCase();
            const origem = (item.origem || '-').toUpperCase();
            row.innerHTML = `
                <td>${item.nomeColuna || '-'}</span></td>
                <td>${item.programa || '-'}</span></td>
                <td>${item.tabela || '-'}</td>
                <td>${item.operacao || '-'}</span></td>
                <td>${item.origem || '-'}</span></td>
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

    function aplicarFiltros() {
        const term = searchInput.value.toLowerCase().trim();
        const opFiltro = selectOperacao.value;
        const origemFiltro = selectOrigem.value;

        rows = baseRows.filter((d) => {
            const buscaMatch =
                !term ||
                (d.nomeColuna || '').toLowerCase().includes(term) ||
                (d.programa || '').toLowerCase().includes(term) ||
                (d.tabela || '').toLowerCase().includes(term) ||
                (d.operacao || '').toLowerCase().includes(term) ||
                (d.origem || '').toLowerCase().includes(term);

            const opMatch = !opFiltro || (d.operacao || '').toUpperCase() === opFiltro;
            const origemMatch = !origemFiltro || (d.origem || '').toUpperCase() === origemFiltro;

            return buscaMatch && opMatch && origemMatch;
        });

        renderPagina(1);
    }

    searchInput.addEventListener('input', aplicarFiltros);
    selectOperacao.addEventListener('change', aplicarFiltros);
    selectOrigem.addEventListener('change', aplicarFiltros);

    renderPagina(1);
}
