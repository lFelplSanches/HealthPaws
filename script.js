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
document.addEventListener("DOMContentLoaded", () => {
  carregarRacoes();

  const calcularButton = document.getElementById("calcular");
  if (calcularButton) {
    calcularButton.addEventListener("click", () => {
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

      mostrarEconomia(resultados);
      document.getElementById("results").style.display = "block";
    });
  } else {
    console.error("Botão Calcular não encontrado no DOM.");
  }
});

// Lógica para calcular produtos
function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const pesoPacoteSelecionado = parseFloat(document.getElementById("peso-pacote").value);

  const racoesFiltradas = racoes.filter(r => r.tipo === tipoPet);

  return racoesFiltradas.map(r => {
    const precoPorKg = r.preco / r.pesoPacote;
    const precoAtualizado = precoPorKg * pesoPacoteSelecionado;

    const consumoDiarioGramas = (consumoDiarioKcal / r.densidade) * 1000;
    const custoDiario = (consumoDiarioGramas / 1000) * precoPorKg;
    const duracaoPacote = (pesoPacoteSelecionado * 1000) / consumoDiarioGramas;

    tableBody.innerHTML += `
      <tr>
        <td>${r.nome}</td>
        <td>R$ ${precoAtualizado.toFixed(2)}</td>
        <td>${consumoDiarioGramas.toFixed(2)} g</td>
        <td>R$ ${custoDiario.toFixed(2)}</td>
        <td>${Math.floor(duracaoPacote)} dias</td>
        <td>
          ${
            r.compra
              ? `<a href="${r.compra}" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/material-rounded/24/000000/shopping-cart.png" alt="Comprar">
                </a>`
              : "N/A"
          }
        </td>
      </tr>`;
    return { ...r, custoDiario, duracaoPacote };
  });
}

// Reimplementar análises econômicas
function mostrarEconomia(resultados) {
  const economiaContainer = document.getElementById("economia");
  economiaContainer.innerHTML = "<h3>Análise de Economia</h3>";

  const [melhor, segundaMelhor] = resultados.sort((a, b) => a.custoDiario - b.custoDiario);
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
