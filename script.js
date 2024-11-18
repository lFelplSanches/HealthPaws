let historico = [];
let racoes = [];

// Função para carregar os dados das rações
async function carregarRacoes() {
  try {
    const url = 'https://raw.githubusercontent.com/lFelplSanches/HealthPaws/main/racoes.csv';
    const response = await fetch(url);
    const data = await response.text();
    const linhas = data.split('\n').slice(1); // Ignorar o cabeçalho
    racoes = linhas
      .filter(l => l.trim() !== "") // Ignorar linhas vazias
      .map(l => {
        const [nome, preco, densidade, pesoPacote, tipo, categoria, compra] = l.split(',');
        return {
          nome: nome.trim(),
          preco: parseFloat(preco),
          densidade: parseFloat(densidade),
          pesoPacote: parseFloat(pesoPacote),
          tipo: tipo.trim().toLowerCase(),
          categoria: categoria ? categoria.trim().toLowerCase() : "standard",
          compra: compra ? compra.trim() : null
        };
      });
    console.log("Rações carregadas:", racoes);
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
  }
}

// Inicializar ao carregar
document.addEventListener("DOMContentLoaded", carregarRacoes);

// Configurar botão do menu
document.getElementById("menu-toggle").addEventListener("click", () => {
  const menu = document.getElementById("menu-lateral"); // Selecionar por ID
  menu.classList.toggle('menu-aberto'); // Alternar classe para exibir o menu
});

// Configurar botão calcular
document.getElementById("calcular").addEventListener("click", () => {
  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const peso = parseFloat(document.getElementById("peso").value);
  const idade = document.getElementById("idade").value;
  const atividade = parseFloat(document.getElementById("atividade").value);

  if (!tipoPet || isNaN(peso) || !idade || isNaN(atividade)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
  const consumoDiarioKcal = RER * atividade;

  const resultados = calcularProdutos(consumoDiarioKcal);

  if (resultados.length === 0) {
    alert("Nenhuma ração disponível.");
    return;
  }

  const resultadosOrdenados = resultados.sort((a, b) => a.custoDiario - b.custoDiario);
  mostrarComparativo(resultadosOrdenados);
  mostrarEconomia(resultadosOrdenados);
  mostrarAnaliseComparativa(resultadosOrdenados[0], resultadosOrdenados[1], consumoDiarioKcal);
  document.getElementById("results").style.display = "block";
});

// Lógica para calcular produtos
function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const racoesFiltradas = racoes.filter(r => r.tipo === tipoPet);

  return racoesFiltradas.map(r => {
    const consumoDiarioGramas = (consumoDiarioKcal / r.densidade) * 1000;
    const custoDiario = (consumoDiarioGramas / 1000) * (r.preco / r.pesoPacote);
    const duracaoPacote = (r.pesoPacote * 1000) / consumoDiarioGramas;

    tableBody.innerHTML += `
      <tr>
        <td>${r.nome}</td>
        <td>R$ ${r.preco.toFixed(2)}</td>
        <td>${consumoDiarioGramas.toFixed(2)}</td>
        <td>R$ ${custoDiario.toFixed(2)}</td>
        <td>${Math.floor(duracaoPacote)}</td>
        <td>${r.compra ? `<a href="${r.compra}" target="_blank" rel="noopener noreferrer">Comprar</a>` : 'N/A'}</td>
      </tr>`;
    return { nome: r.nome, custoDiario, duracaoPacote, densidade: r.densidade };
  });
}

// Função para mostrar comparativo entre as rações
function mostrarComparativo(resultados) {
  const comparativoContainer = document.getElementById("comparativo");
  comparativoContainer.innerHTML = "<h3>Análise Comparativa</h3>";

  const [melhor, segundaMelhor] = resultados;

  const itemHTML = (racao, isMelhor) => `
    <div class="comparativo-item">
      <div class="nome" style="color: ${isMelhor ? '#20c6d6' : '#555'};">
        ${isMelhor ? '🌟 ' : ''}${racao.nome}
      </div>
      <div class="custo">Custo Diário: <strong>R$ ${racao.custoDiario.toFixed(2)}</strong></div>
      <div class="duracao">Duração: <strong>${Math.floor(racao.duracaoPacote)} dias</strong></div>
    </div>
  `;

  comparativoContainer.innerHTML += itemHTML(melhor, true);
  comparativoContainer.innerHTML += itemHTML(segundaMelhor, false);
}

// Função para mostrar análise econômica
function mostrarEconomia(resultados) {
  const economiaContainer = document.getElementById("economia");
  economiaContainer.innerHTML = "<h3>Análise de Economia</h3>";

  const [melhor, segundaMelhor] = resultados;
  const economiaAbsoluta = segundaMelhor.custoDiario - melhor.custoDiario;
  const economiaPercentual = ((economiaAbsoluta / segundaMelhor.custoDiario) * 100).toFixed(2);

  economiaContainer.innerHTML += `
    <p>Escolhendo a ração <strong>${melhor.nome}</strong>, você economiza:</p>
    <ul>
      <li><strong>R$ ${economiaAbsoluta.toFixed(2)}</strong> por dia.</li>
      <li><strong>${economiaPercentual}%</strong> em relação à segunda opção mais econômica.</li>
    </ul>
    <p style="color: #20c6d6; font-size: 1.2rem;">
      <strong>${melhor.nome}</strong> é a escolha mais econômica!
    </p>
  `;
}

// Função para mostrar análise comparativa detalhada
function mostrarAnaliseComparativa(melhor, segundaMelhor, consumoDiarioKcal) {
  const comparativoContainer = document.getElementById("comparativo");
  comparativoContainer.innerHTML += `
    <div class="comparativo-detalhado">
      <h3>Análise Comparativa Detalhada</h3>
      <table>
        <thead>
          <tr>
            <th>Critério</th>
            <th>${melhor.nome}</th>
            <th>${segundaMelhor.nome}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Custo Diário (R$)</td>
            <td>${melhor.custoDiario.toFixed(2)}</td>
            <td>${segundaMelhor.custoDiario.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Consumo Diário (g)</td>
            <td>${((consumoDiarioKcal / melhor.densidade) * 1000).toFixed(2)}</td>
            <td>${((consumoDiarioKcal / segundaMelhor.densidade) * 1000).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Duração Estimada (dias)</td>
            <td>${Math.floor(melhor.duracaoPacote)}</td>
            <td>${Math.floor(segundaMelhor.duracaoPacote)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
