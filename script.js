
if (typeof historico === "undefined") {
  var historico = [];
}

if (typeof racoes === "undefined") {
  var racoes = [];
}

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

// Função para calcular os produtos
function calcularProdutos(consumoDiarioKcal, racoesFiltradas, pesoPacoteSelecionado) {
  const tableBody = document.getElementById("tableBody");
  if (!tableBody) {
    console.error("Elemento 'tableBody' não encontrado no DOM.");
    return [];
  }

  tableBody.innerHTML = ""; // Limpa os resultados anteriores

  return racoesFiltradas.map(racao => {
    const precoPorKg = racao.preco / racao.pesoPacote;
    const precoAtualizado = precoPorKg * pesoPacoteSelecionado;

    const consumoDiarioGramas = (consumoDiarioKcal / racao.densidade) * 1000;
    const custoDiario = (consumoDiarioGramas / 1000) * precoPorKg;
    const duracaoPacote = (pesoPacoteSelecionado * 1000) / consumoDiarioGramas;

    // Adiciona os dados à tabela
    tableBody.innerHTML += `
      <tr>
        <td>${racao.nome}</td>
        <td>R$ ${precoAtualizado.toFixed(2)}</td>
        <td>${consumoDiarioGramas.toFixed(2)} g</td>
        <td>R$ ${custoDiario.toFixed(2)}</td>
        <td>${Math.floor(duracaoPacote)} dias</td>
        <td>${racao.link ? `<a href="${racao.link}" target="_blank">Comprar</a>` : "Não disponível"}</td>
      </tr>
    `;

    return {
      ...racao,
      consumoDiarioGramas,
      custoDiario,
      duracaoPacote
    };
  });
}

// Função para mostrar as melhores rações
function mostrarMelhoresRacoes(melhorEconomica, melhorQualidade) {
  const melhorEconomicaContainer = document.getElementById("melhor-economica");
  const melhorQualidadeContainer = document.getElementById("melhor-qualidade");

  if (melhorEconomicaContainer) {
    melhorEconomicaContainer.innerHTML = `
      <h3>Melhor Opção Econômica</h3>
      <p><strong>Nome:</strong> ${melhorEconomica.nome}</p>
      <p><strong>Custo Diário:</strong> R$ ${melhorEconomica.custoDiario.toFixed(2)}</p>
      <p><strong>Duração do Pacote:</strong> ${Math.floor(melhorEconomica.duracaoPacote)} dias</p>
      <p><strong>Link:</strong> ${melhorEconomica.link ? `<a href="${melhorEconomica.link}" target="_blank">Comprar</a>` : "Não disponível"}</p>
    `;
  }

  if (melhorQualidadeContainer) {
    if (melhorQualidade) {
      melhorQualidadeContainer.innerHTML = `
        <h3>Melhor Opção de Qualidade</h3>
        <p><strong>Nome:</strong> ${melhorQualidade.nome}</p>
        <p><strong>Custo Diário:</strong> R$ ${melhorQualidade.custoDiario.toFixed(2)}</p>
        <p><strong>Duração do Pacote:</strong> ${Math.floor(melhorQualidade.duracaoPacote)} dias</p>
        <p><strong>Link:</strong> ${melhorQualidade.link ? `<a href="${melhorQualidade.link}" target="_blank">Comprar</a>` : "Não disponível"}</p>
      `;
    } else {
      melhorQualidadeContainer.innerHTML = `<h3>Melhor Opção de Qualidade</h3><p>Nenhuma disponível.</p>`;
    }
  }
}

// Função para encontrar as melhores rações
function encontrarMelhoresRacoes(resultados) {
  const categoriasOrdenadas = ["super premium", "premium", "standard"];

  const resultadosOrdenados = resultados.sort((a, b) => a.custoDiario - b.custoDiario);

  const racaoMaisEconomica = resultadosOrdenados[0];

  const racaoMelhorQualidade = resultadosOrdenados.find(
    r => categoriasOrdenadas.indexOf(r.categoria.toLowerCase()) <
         categoriasOrdenadas.indexOf(racaoMaisEconomica.categoria.toLowerCase())
  ) || resultadosOrdenados[0];

  return { racaoMaisEconomica, racaoMelhorQualidade };
}

// Evento DOMContentLoaded e lógica do botão
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
        
        // Ajuste pelo fator da idade
let fatorIdade = 1;
if (idade < 1) {
    fatorIdade = 1.5; // Jovens
} else if (idade > 7) {
    fatorIdade = 0.8; // Idosos
}
const consumoDiarioKcal = 70 * Math.pow(peso, 0.75) * atividade * fatorIdade;

        const racoesFiltradas = await carregarRacoesPorTipo(tipoPet, pesoPacoteSelecionado);
        const resultados = calcularProdutos(consumoDiarioKcal, racoesFiltradas, pesoPacoteSelecionado);

        if (resultados.length === 0) {
          alert("Nenhuma ração disponível para o tipo de pet selecionado.");
          return;
        }

        const { racaoMaisEconomica, racaoMelhorQualidade } = encontrarMelhoresRacoes(resultados);

        // Exibir resultados
        mostrarMelhoresRacoes(racaoMaisEconomica, racaoMelhorQualidade);
        const resultsContainer = document.getElementById("results");
        if (resultsContainer) {
          resultsContainer.style.display = "block"; // Garante que os resultados estão visíveis
        } else {
          console.error("Elemento 'results' não encontrado no DOM.");
        }
      } catch (error) {
        console.error("Erro ao processar o cálculo:", error);
      }
    });
  } else {
    console.error("Botão calcular não encontrado no DOM.");
  }
});
