let historico = []; // Lista para armazenar o histórico
let racoes = []; // Lista que será preenchida com os dados do CSV

// Função para carregar os dados das rações do GitHub
async function carregarRacoes() {
  try {
    const url = 'https://raw.githubusercontent.com/lFelplSanches/HealthPaws/main/racoes.csv'; // URL do CSV
    const response = await fetch(url);
    const data = await response.text();
    const linhas = data.split('\n').slice(1); // Ignorar o cabeçalho
    racoes = linhas
      .filter(linha => linha.trim() !== "") // Ignorar linhas vazias
      .map(linha => {
        const [nome, preco, densidade, pesoPacote, tipo] = linha.split(',');
        return {
          nome: nome ? nome.trim() : "Desconhecido",
          preco: preco ? parseFloat(preco) : 0,
          densidade: densidade ? parseFloat(densidade) : 0,
          pesoPacote: pesoPacote ? parseFloat(pesoPacote) : 0,
          tipo: tipo ? tipo.trim().toLowerCase() : "indefinido"
        };
      });
    console.log("Rações carregadas com sucesso:", racoes);
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
  }
}

// Carregar as rações ao iniciar o aplicativo
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarRacoes();
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
  }
});
document.addEventListener("mousemove", (event) => {
  const menu = document.querySelector(".menu-lateral");
  if (event.clientX <= 10) {
    menu.style.left = "0"; // Mostra o menu ao passar o mouse na borda esquerda
  } else if (event.clientX > 250) {
    menu.style.left = "-250px"; // Esconde o menu ao mover o mouse para fora
  }
});

document.getElementById("calcular").addEventListener("click", calcular);

function calcular() {
  const tipoPet = document.getElementById("tipo-pet").value;
  const peso = parseFloat(document.getElementById("peso").value);
  const idade = document.getElementById("idade").value;
  const atividade = parseFloat(document.getElementById("atividade").value);

  if (isNaN(peso) || !tipoPet || !idade || isNaN(atividade)) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  console.log("Dados do pet:", { tipoPet, peso, idade, atividade });

  const RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
  const consumoDiarioKcal = RER * atividade;

  console.log("Consumo Diário (kcal):", consumoDiarioKcal);

  const resultados = calcularProdutos(consumoDiarioKcal);

  if (resultados.length === 0) {
    alert("Nenhuma ração disponível para o tipo de pet selecionado.");
    return;
  }

  mostrarComparativo(resultados);
  mostrarEconomia(resultados); // Exibe análise de economia
  salvarHistorico(tipoPet, peso, idade, atividade, resultados);
  document.getElementById("results").style.display = "block";
}
function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const racoesFiltradas = racoes.filter(racao => racao.tipo === document.getElementById("tipo-pet").value.toLowerCase());
  console.log("Rações filtradas:", racoesFiltradas);

  return racoesFiltradas.map(racao => {
    const consumoDiarioGramas = (consumoDiarioKcal / racao.densidade) * 1000;
    const custoDiario = (consumoDiarioGramas / 1000) * (racao.preco / racao.pesoPacote);
    const duracaoPacote = (racao.pesoPacote * 1000) / consumoDiarioGramas;

    const row = `
      <tr>
        <td>${racao.nome}</td>
        <td>R$ ${racao.preco.toFixed(2)}</td>
        <td>${consumoDiarioGramas.toFixed(2)}</td>
        <td>R$ ${custoDiario.toFixed(2)}</td>
        <td>${Math.floor(duracaoPacote)}</td>
      </tr>
    `;
    tableBody.innerHTML += row;

    return { nome: racao.nome, custoDiario, duracaoPacote };
  });
}

function mostrarComparativo(resultados) {
  if (resultados.length < 2) {
    console.warn("Não há rações suficientes para o comparativo.");
    return;
  }

  const melhores = resultados.sort((a, b) => a.custoDiario - b.custoDiario).slice(0, 2);
  const economiaContainer = document.getElementById("economia");
  economiaContainer.innerHTML = `
    <h3>Análise Comparativa</h3>
    <p><strong>1ª Opção:</strong> ${melhores[0].nome} - Custo Diário: R$ ${melhores[0].custoDiario.toFixed(2)}, Duração: ${Math.floor(melhores[0].duracaoPacote)} dias</p>
    <p><strong>2ª Opção:</strong> ${melhores[1].nome} - Custo Diário: R$ ${melhores[1].custoDiario.toFixed(2)}, Duração: ${Math.floor(melhores[1].duracaoPacote)} dias</p>
  `;
}
function mostrarEconomia(resultados) {
  if (resultados.length < 2) {
    console.warn("Não há rações suficientes para calcular a economia.");
    return;
  }

  const [primeira, segunda] = resultados.sort((a, b) => a.custoDiario - b.custoDiario);

  const economiaContainer = document.getElementById("economia");
  economiaContainer.innerHTML += `
    <h3>Análise de Economia</h3>
    <p>A melhor opção é <strong>${primeira.nome}</strong> com custo diário de R$ ${primeira.custoDiario.toFixed(2)}.</p>
    <p>Comparado à segunda melhor opção, <strong>${segunda.nome}</strong>, você economiza R$ ${(segunda.custoDiario - primeira.custoDiario).toFixed(2)} por dia.</p>
  `;
}

function salvarHistorico(tipoPet, peso, idade, atividade, resultados) {
  historico.push({ tipoPet, peso, idade, atividade, resultados });
  exibirHistorico();
}

function exibirHistorico() {
  const historicoContainer = document.getElementById("historico");
  if (historico.length === 0) {
    historicoContainer.innerHTML = "<p>O histórico está vazio.</p>";
    return;
  }

  let historicoHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead style="background-color: #2a9d8f; color: white;">
        <tr>
          <th>Tipo de Pet</th>
          <th>Peso (kg)</th>
          <th>Idade</th>
          <th>Atividade</th>
          <th>Ração</th>
          <th>Custo Diário</th>
          <th>Duração (dias)</th>
        </tr>
      </thead>
      <tbody>
  `;

  historico.forEach(item => {
    item.resultados.forEach(racao => {
      historicoHTML += `
        <tr>
          <td>${item.tipoPet}</td>
          <td>${item.peso}</td>
          <td>${item.idade}</td>
          <td>${item.atividade}</td>
          <td>${racao.nome}</td>
          <td>R$ ${racao.custoDiario.toFixed(2)}</td>
          <td>${Math.floor(racao.duracaoPacote)}</td>
        </tr>
      `;
    });
  });

  historicoHTML += "</tbody></table>";
  historicoContainer.innerHTML = historicoHTML;
}

function limparHistorico() {
  historico = [];
  exibirHistorico();
}

document.getElementById("menu-toggle").addEventListener("click", () => {
  const menu = document.querySelector(".menu-lateral");
  menu.style.left = menu.style.left === "0px" ? "-250px" : "0";
});
