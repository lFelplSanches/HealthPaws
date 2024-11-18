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

      const { racaoMaisEconomica, racaoMelhorQualidade } = encontrarMelhoresRacoes(resultados);
      mostrarMelhoresRacoes(racaoMaisEconomica, racaoMelhorQualidade);
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
    const custoDiario = (consumoDiarioGramas / 1000) * precoAtualizado;
    const duracaoPacote = (pesoPacoteSelecionado * 1000) / consumoDiarioGramas;

    tableBody.innerHTML += `
      <tr>
        <td>${r.nome}</td>
        <td>R$ ${precoAtualizado.toFixed(2)}</td>
        <td>${consumoDiarioGramas.toFixed(2)}</td>
        <td>R$ ${custoDiario.toFixed(2)}</td>
        <td>${Math.floor(duracaoPacote)}</td>
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

// Encontrar as melhores rações
function encontrarMelhoresRacoes(resultados) {
  const resultadosOrdenados = resultados.sort((a, b) => a.custoDiario - b.custoDiario);

  const racaoMaisEconomica = resultadosOrdenados[0];

  const categoriasOrdenadas = ["super premium", "premium", "standard"];
  const racaoMelhorQualidade = resultadosOrdenados.find(r =>
    categoriasOrdenadas.indexOf(r.categoria.toLowerCase()) >= 0
  );

  return { racaoMaisEconomica, racaoMelhorQualidade };
}

// Mostrar as melhores rações
function mostrarMelhoresRacoes(racaoMaisEconomica, racaoMelhorQualidade) {
  const melhorEconomicaContainer = document.getElementById("melhor-economica");
  const melhorQualidadeContainer = document.getElementById("melhor-qualidade");

  melhorEconomicaContainer.innerHTML = `
    <h3>Ração Mais Econômica</h3>
    <p><strong>${racaoMaisEconomica.nome}</strong></p>
    <p>Custo Diário: R$ ${racaoMaisEconomica.custoDiario.toFixed(2)}</p>
    <p>Duração: ${Math.floor(racaoMaisEconomica.duracaoPacote)} dias</p>
  `;

  melhorQualidadeContainer.innerHTML = `
    <h3>Melhor Qualidade e Econômica</h3>
    <p><strong>${racaoMelhorQualidade.nome}</strong></p>
    <p>Custo Diário: R$ ${racaoMelhorQualidade.custoDiario.toFixed(2)}</p>
    <p>Categoria: ${racaoMelhorQualidade.categoria}</p>
    <p>Duração: ${Math.floor(racaoMelhorQualidade.duracaoPacote)} dias</p>
  `;
}
