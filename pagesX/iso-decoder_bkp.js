window.showDecodificarISO = function () {
    const app = document.getElementById('app');
    setHomeView(false);
    app.innerHTML = `
    <div id="iso-container">
      <h2>Decodificar ISO 8583</h2>
      <label>Digite a mensagem em HEX:</label><br>
      <textarea id="hexInput" rows="4" cols="100" placeholder="Cole aqui a mensagem completa em HEX..."></textarea><br><br>
      <div id="mtiBox" style="margin:10px 0 20px 0; padding:12px; background:#e6f4ff; border-left:6px solid #0065cc; font:18px/1.4 monospace;">
        <strong>Mensagem ISO (MTI):</strong> <span id="mtiValue"></span>
      </div>
      <button id="decodeBtn" class="btn-primary">Decodificar</button>

      <div class="bitmap-pair">
        <div>
          <h3>Bitmap Primário (64 bits)</h3>
          <div id="primaryBitmap"></div>
        </div>
        <div>
          <h3>Bitmap Secundário (64 bits) - se houver</h3>
          <div id="secondaryBitmap"></div>
        </div>
      </div>

      <table id="deTable">
        <thead>
          <tr>
            <th>DE</th>
            <th>Tipo</th>
            <th>Tamanho</th>
            <th>Valor (HEX - EBCDIC)</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div id="detailContainers"></div>
    </div>
  `;

    const title = document.createElement('h2');
    title.textContent = 'Decodificar ISO 8583';
    title.style.textAlign = 'left';        // ← alinha à esquerda
    title.style.margin = '0 0 0.5rem 0';   // ← reduz espaço em cima e embaixo
    app.appendChild(title);
};