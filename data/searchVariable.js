function buscarVariaveis() {
    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h1');
    title.className = 'view-title';
    title.textContent = 'Busca por Variáveis';
    app.appendChild(title);

    const filtrosDiv = document.createElement('div');
    filtrosDiv.className = 'filtros-container';

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar variáveis...';
    searchInput.className = 'table-search';
    searchInput.style.flex = '1';
    searchInput.style.minWidth = '200px';

    filtrosDiv.append(searchInput);
    app.appendChild(filtrosDiv);

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <colgroup>
            <col style="width: 20%;">
            <col style="width: 25%;">
            <col style="width: 55%;">
        </colgroup>
        <thead>
            <tr>
                <th data-sort="programa" style="cursor: pointer;">Programa</th>
                <th data-sort="linhaNum" style="cursor: pointer;">Linha</th>
                <th data-sort="linha" style="cursor: pointer;">Linha do Código</th>
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

    const baseRows = achatarDados(indicePorVariavel);
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
            row.innerHTML = `
                <td>${item.programa || '-'}</span></td>
                <td>${item.linhaNum || '-'}</td>
                <td>${item.linha || '-'}</td>
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
            rows.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')));
            renderPagina(1);
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        rows = baseRows.filter((d) =>
            (d.nomeColuna || '').toLowerCase().includes(term) ||
            (d.programa || '').toLowerCase().includes(term) ||
            (d.linha || '').toLowerCase().includes(term) ||
            String(d.linhaNum || '').toLowerCase().includes(term)
        );
        renderPagina(1);
    });

    renderPagina(1);
}
