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
    alert(`O peso do pacote de ${pesoPacoteSelecionado} kg não está disponível para o tipo de pet selecionado.
` +
      `Pesos disponíveis: ${[...new Set(pesosDisponiveis)].join(', ')} kg`);
    return false;
  }
  return true;
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

// Evento de DOMContentLoaded e lógica do botão
document.addEventListener("DOMContentLoaded", () => {
  const calcularButton = document.getElementById("calcular");

  if (calcularButton) {
    calcularButton.addEventListener("click", async () => {
      try {
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

        function calcularRER(tipoPet, peso, idade) {
          let RER;
          if (idade < 1) {
            RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) * 3 : 100 * Math.pow(peso, 0.67) * 2.5;
          } else if (idade >= 1 && idade <= 7) {
            RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
          } else {
            RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) * 0.8 : 100 * Math.pow(peso, 0.67) * 0.8;
          }
          return RER;
        }

        const RER = calcularRER(tipoPet, peso, idade);
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
      } catch (error) {
        console.error("Erro ao processar o cálculo:", error);
        alert("Ocorreu um erro ao realizar o cálculo. Verifique os dados inseridos e tente novamente.");
      }
    });
  } else {
    console.error("Botão calcular não encontrado no DOM.");
  }
});
