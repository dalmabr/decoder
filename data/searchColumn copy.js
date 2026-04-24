        // ========== NAVEGAÇÃO ==========
        function showTab(tabId) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        }

        // ========== 1. BUSCA COLUNAS ==========
function buscarColunas() {

    setHomeView(false);
    const app = $('#app');
    app.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Busca por Colunas';
    title.style.textAlign = 'left';        // ← alinha à esquerda
    title.style.margin = '0 0 0.5rem 0';   // ← reduz espaço em cima e embaixo
    app.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Buscar tabelas…';
    searchInput.className = 'table-search';
    app.appendChild(searchInput);

    const table = document.createElement('table');
    table.className = 'data-table-short'; // mesma classe já ajustada
    table.innerHTML = `
        <thead>
            <tr>
                <th data-sort="elemento" style="cursor: pointer;">Programa ↕</th>
                <th>Tabela</th>
                <th data-sort="membro" style="cursor: pointer;">Operação ↕</th>
                <th data-sort="detalhe" style="cursor: pointer;">Origem ↕</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    app.appendChild(table);





    const coluna = document.getElementById('campoColuna').value.toUpperCase().trim();
    if (!coluna) return;

    const opsAtivas = [];
    ['SELECT','INSERT','UPDATE','DELETE'].forEach(op => {
        if (document.getElementById('op' + op).checked) opsAtivas.push(op);
    });
            
    const origensAtivas = [];
    ['SELECT','INTO','SET','WHERE','JOIN'].forEach(orig => {
        if (document.getElementById('orig' + orig).checked) origensAtivas.push(orig);
    });

    let achados = indicePorColuna[coluna] || [];
    achados = achados.filter(item => {
        const opOk = opsAtivas.includes(item.operacao);
        const origem = item.origem || '';
        const origOk = origensAtivas.includes(origem);
        return opOk && origOk;
    });

    achados.sort((a, b) => {
        const c1 = a.programa.localeCompare(b.programa);
                if (c1 !== 0) return c1;
                return (a.tabela || '').localeCompare(b.tabela || '');
            });

    renderizarTabela('tblColunas', 'totalColunas', achados, item => `
        <td>${item.programa}</td>
        <td>${item.tabela}</td>
        <td><span class="badge badge-${item.operacao}">${item.operacao}</span></td>
        <td><span class="badge badge-origem-${item.origem || 'SELECT'}">${item.origem || '-'}</span></td>
    `);
}

// ========== 2. BUSCA COPYBOOKS ==========
function buscarCopybooks() {
    const copy = document.getElementById('campoCopy').value.toUpperCase().trim();
    if (!copy) return;

    const achados = indicePorCopybook[copy] || [];
    achados.sort((a, b) => a.programa.localeCompare(b.programa));

    renderizarTabela('tblCopybooks', 'totalCopybooks', achados, item => `
        <td>${item.programa}</td>
        <td><code>${copy}</code></td>
        <td><span class="badge badge-${item.tipo}">${item.tipo}</span></td>
    `);
}

// ========== 3. BUSCA VARIÁVEIS ==========
function buscarVariaveis() {
    const variavel = document.getElementById('campoVar').value.toUpperCase().trim();
            if (!variavel) return;

            const achados = indicePorVariavel[variavel] || [];
            
            achados.sort((a, b) => {
                const c1 = a.programa.localeCompare(b.programa);
                if (c1 !== 0) return c1;
                return a.linhaNum - b.linhaNum;
            });

    const tbody = document.querySelector('#tblVariaveis tbody');
    const total = document.getElementById('totalVariaveis');
    
    tbody.innerHTML = '';
    
    if (achados.length === 0) {
        total.innerHTML = `Nenhuma variável encontrada com o nome "<strong>${variavel}</strong>".<br>
            <small>Dica: A variável pode estar em um COPYBOOK. Tente buscar o COPYBOOK em vez disso.</small>`;
                tbody.innerHTML = '<tr><td colspan="5" class="no-results">Variável não encontrada</td></tr>';
                return;
            }

    total.innerHTML = `<strong>${achados.length}</strong> ocorrência(s) de "<strong>${variavel}</strong>" 
                (${achados.filter(x => x.tipo === 'DEFINICAO').length} definições, 
                ${achados.filter(x => x.tipo === 'USO').length} usos)`;
            
    achados.forEach(item => {
                const linhaDestacada = escapeHtml(item.linha).replace(
                    new RegExp(variavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
                    `<span class="highlight">${variavel}</span>`
                );
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.programa}</strong></td>
                    <td><span class="line-num">${item.linhaNum}</span></td>
                    <td>${item.nivel}</td>
                    <td><span class="badge badge-${item.tipo}">${item.tipo}</span></td>
                    <td class="linha-completa"><div class="code-line">${linhaDestacada}</div></td>
                `;
                tbody.appendChild(tr);
            });
    }

    // ========== 4. BUSCA CALLs ==========
    function buscarCalls() {
        const programa = document.getElementById('campoCall').value.toUpperCase().trim();
        if (!programa) return;

        const calls = indicePorCalls[programa] || [];
        const totalDiv = document.getElementById('totalCalls');
        const resultDiv = document.getElementById('resultCalls');

        if (calls.length === 0) {
            totalDiv.textContent = 'Nenhum CALL/LINK/XCTL encontrado neste programa.';
            resultDiv.innerHTML = '';
            return;
        }

        totalDiv.textContent = `${calls.length} chamada(s) em ${programa}`;
            
        const porTipo = {};
        calls.forEach(c => {
            if (!porTipo[c.tipo]) porTipo[c.tipo] = [];
            porTipo[c.tipo].push(c);
        });

        let html = '<div class="call-chain">';
        html += `<strong>${programa}</strong>\n│\n`;
            
        const tipos = Object.keys(porTipo).sort();
        tipos.forEach((tipo, idxTipo) => {
            const isLastTipo = idxTipo === tipos.length - 1;
            html += `${isLastTipo ? '└─' : '├─'} [${tipo}]\n`;
                
            porTipo[tipo].forEach((c, idx, arr) => {
                const isLast = idx === arr.length - 1;
                html += `${isLastTipo ? '   ' : '│  '}${isLast ? '└─' : '├─'} ${c.programa}\n`;
            });
        });
        html += '</div>';
            
        html += '<table><thead><tr><th>Tipo</th><th>Programa</th><th>Comando Original</th></tr></thead><tbody>';
        calls.forEach(c => {
            html += `
                    <tr>
                        <td><span class="badge badge-${c.tipo}">${c.tipo}</span></td>
                        <td><strong>${c.programa}</strong></td>
                        <td><code>${escapeHtml(c.linha)}</code></td>
                    </tr>`;
            });
        html += '</tbody></table>';
            
        resultDiv.innerHTML = html;
        }

        // ========== UTILITÁRIOS ==========
function renderizarTabela(tblId, totalId, dados, renderRow) {
    const tbody = document.querySelector('#' + tblId + ' tbody');
    const total = document.getElementById(totalId);
    tbody.innerHTML = '';
            
    if (dados.length === 0) {
        total.textContent = 'Nenhum resultado encontrado.';
        tbody.innerHTML = '<tr><td colspan="10" class="no-results">Nenhum dado</td></tr>';
        return;
    }

    total.textContent = `${dados.length} resultado(s)`;
    dados.forEach(item => {
                const tr = document.createElement('tr');
        tr.innerHTML = renderRow(item);
        tbody.appendChild(tr);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

        // Enter para buscar
        ['campoColuna', 'campoCopy', 'campoVar', 'campoCall'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    if (id === 'campoColuna') buscarColunas();
                    else if (id === 'campoCopy') buscarCopybooks();
                    else if (id === 'campoVar') buscarVariaveis();
                    else if (id === 'campoCall') buscarCalls();
                }
            });
        });