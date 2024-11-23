
let historico = [];
let racoes = [];

// Função para carregar os dados das rações
async function carregarRacoesPorTipo(tipoPet, pesoPacote) {
  try {
    const response = await fetch('http://localhost:3000/filter-racoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoPet, pesoPacote })
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar os dados do servidor.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
    alert("Erro ao carregar os dados das rações. Verifique sua conexão com o servidor.");
    return [];
  }
}

// Validar o peso do pacote para o tipo de pet selecionado
async function validarPesoPacote(tipoPet, pesoPacoteSelecionado) {
  const racoesFiltradas = await carregarRacoesPorTipo(tipoPet, pesoPacoteSelecionado);

  // Certifique-se de comparar os valores como números
  const pesosDisponiveis = racoesFiltradas.map(r => parseFloat(r.pesoPacote));

  if (!pesosDisponiveis.includes(pesoPacoteSelecionado)) {
    alert(`O peso do pacote de ${pesoPacoteSelecionado} kg não está disponível para o tipo de pet selecionado.
` +
      `Pesos disponíveis: ${[...new Set(pesosDisponiveis)].join(', ')} kg`);
    return false;
  }
  return true;
}

// Ajustar a lógica do botão "Calcular"
document.addEventListener("DOMContentLoaded", () => {
  const calcularButton = document.getElementById("calcular");
  calcularButton.addEventListener("click", async () => {
    const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
    const peso = parseFloat(document.getElementById("peso").value);
    const idade = document.getElementById("idade").value;
    const atividade = parseFloat(document.getElementById("atividade").value);
    const pesoPacoteSelecionado = parseFloat(document.getElementById("peso-pacote").value);

    if (!tipoPet || isNaN(peso) || !idade || isNaN(atividade) || isNaN(pesoPacoteSelecionado)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const pesoValido = await validarPesoPacote(tipoPet, pesoPacoteSelecionado);
    if (!pesoValido) return;

    const RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
    const consumoDiarioKcal = RER * atividade;

    const racoesFiltradas = await carregarRacoesPorTipo(tipoPet, pesoPacoteSelecionado);
    const resultados = calcularProdutos(consumoDiarioKcal, racoesFiltradas, pesoPacoteSelecionado);

    if (resultados.length === 0) {
      alert("Nenhuma ração disponível para o tipo de pet selecionado.");
      return;
    }

    const { racaoMaisEconomica, racaoMelhorQualidade } = encontrarMelhoresRacoes(resultados);

    mostrarMelhoresRacoes(racaoMaisEconomica, racaoMelhorQualidade);
    mostrarEconomia(resultados);
    mostrarAnaliseEconomicaDetalhada(racaoMaisEconomica, racaoMelhorQualidade, consumoDiarioKcal);

    document.getElementById("results").style.display = "block";
  });
});


// Função para calcular os produtos
function calcularProdutos(consumoDiarioKcal, racoesFiltradas, pesoPacoteSelecionado) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

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
        <td>${r.compra ? `<a href="${r.compra}" target="_blank">Comprar</a>` : "N/A"}</td>
      </tr>
    `;

    return { ...r, custoDiario, duracaoPacote };
  });
}

// Função para mostrar economia
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
  `;
}
