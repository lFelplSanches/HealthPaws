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

  const pesosDisponiveis = racoesFiltradas.map(r => parseFloat(r.pesoPacote));

  if (!pesosDisponiveis.includes(pesoPacoteSelecionado)) {
    alert(`O peso do pacote de ${pesoPacoteSelecionado} kg não está disponível para o tipo de pet selecionado.\n` +
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
const idade = parseFloat(document.getElementById("idade").value);
const atividade = parseFloat(document.getElementById("atividade").value);
const pesoPacoteSelecionado = parseFloat(document.getElementById("peso-pacote").value);

if (!tipoPet.trim() || peso <= 0 || idade < 0 || atividade <= 0 || pesoPacoteSelecionado <= 0) {
  alert("Preencha todos os campos corretamente.");
  return;
}

    const pesoValido = await validarPesoPacote(tipoPet, pesoPacoteSelecionado);
    if (!pesoValido) return;

    // Ajustar o RER com base na idade
    let RER;
    if (idade < 1) {
      RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) * 3 : 100 * Math.pow(peso, 0.67) * 2.5; // Filhotes
    } else if (idade >= 1 && idade <= 7) {
      RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67); // Adultos
    } else {
      RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) * 0.8 : 100 * Math.pow(peso, 0.67) * 0.8; // Idosos
    }

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
// Função para mostrar as melhores rações
function mostrarMelhoresRacoes(melhor, qualidade) {
  const melhorEconomica = document.getElementById("melhor-economica");
  const melhorQualidade = document.getElementById("melhor-qualidade");

  melhorEconomica.innerHTML = `
    <h3>Melhor Opção Econômica</h3>
    <p>Ração: ${melhor.nome}</p>
    <p>Custo Diário: R$ ${melhor.custoDiario.toFixed(2)}</p>
  `;

  if (qualidade) {
    melhorQualidade.innerHTML = `
      <h3>Melhor Opção de Qualidade</h3>
      <p>Ração: ${qualidade.nome}</p>
      <p>Custo Diário: R$ ${qualidade.custoDiario.toFixed(2)}</p>
    `;
  } else {
    melhorQualidade.innerHTML = `<h3>Melhor Opção de Qualidade</h3><p>Nenhuma disponível.</p>`;
  }
}
// Função para mostrar análise econômica detalhada
function mostrarAnaliseEconomicaDetalhada(melhor, qualidade, consumoDiarioKcal) {
  const comparativoDetalhado = document.getElementById("comparativo-detalhado");

  comparativoDetalhado.innerHTML = `
    <h3>Análise Econômica Detalhada</h3>
    <table class="styled-table">
      <thead>
        <tr>
          <th>Critério</th>
          <th>${melhor.nome}</th>
          <th>${qualidade ? qualidade.nome : "N/A"}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Custo Diário (R$)</td>
          <td>${melhor.custoDiario.toFixed(2)}</td>
          <td>${qualidade ? qualidade.custoDiario.toFixed(2) : "N/A"}</td>
        </tr>
        <tr>
          <td>Consumo Diário (g)</td>
          <td>${((consumoDiarioKcal / melhor.densidade) * 1000).toFixed(2)}</td>
          <td>${qualidade ? ((consumoDiarioKcal / qualidade.densidade) * 1000).toFixed(2) : "N/A"}</td>
        </tr>
        <tr>
          <td>Duração Estimada (dias)</td>
          <td>${Math.floor(melhor.duracaoPacote)}</td>
          <td>${qualidade ? Math.floor(qualidade.duracaoPacote) : "N/A"}</td>
        </tr>
      </tbody>
    </table>
  `;
}
// Função para mostrar análise de economia
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
// Função para encontrar as melhores rações
function encontrarMelhoresRacoes(resultados) {
  const categoriasOrdenadas = ["super premium", "premium", "standard"];

  const resultadosOrdenados = resultados.sort((a, b) => a.custoDiario - b.custoDiario);

  const racaoMaisEconomica = resultadosOrdenados[0];

  const racaoMelhorQualidade = resultadosOrdenados.find(
    r => categoriasOrdenadas.indexOf(r.categoria.toLowerCase()) < categoriasOrdenadas.indexOf(racaoMaisEconomica.categoria.toLowerCase())
  ) || resultadosOrdenados[0];

  return { racaoMaisEconomica, racaoMelhorQualidade };
}
