
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
  const pesosDisponiveis = racoesFiltradas.map(r => r.pesoPacote);
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
