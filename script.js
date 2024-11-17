
let historico = []; // Lista para armazenar o histórico
let racoes = []; // Lista que será preenchida com os dados do CSV

// Função para carregar os dados das rações do GitHub
async function carregarRacoes() {
  const url = 'https://raw.githubusercontent.com/lFelplSanches/HealthPaws/main/racoes.csv'; // URL da planilha
  const response = await fetch(url);
  const data = await response.text();
  const linhas = data.split('\n').slice(1); // Ignorar o cabeçalho
  racoes = linhas.map(linha => {
    const [nome, preco, densidade, pesoPacote, tipo] = linha.split(',');
    return {
      nome,
      preco: parseFloat(preco),
      densidade: parseFloat(densidade),
      pesoPacote: parseFloat(pesoPacote),
      tipo: tipo.trim()
    };
  });
  console.log("Rações carregadas:", racoes);
}

// Carregar as rações ao iniciar o aplicativo
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarRacoes();
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
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

  const RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
  const consumoDiarioKcal = RER * atividade;

  const resultados = calcularProdutos(consumoDiarioKcal);
  mostrarComparativo(resultados);
  mostrarEconomia(resultados);
  salvarHistorico(tipoPet, peso, idade, atividade, resultados);
  document.getElementById("results").style.display = "block";
}

function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Limpar resultados anteriores

  const resultados = racoes
    .filter(racao => racao.tipo.toLowerCase() === document.getElementById("tipo-pet").value)
    .map(racao => {
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

  return resultados;
}

function mostrarComparativo(resultados) {
  const melhores = resultados.sort((a, b) => a.custoDiario - b.custoDiario).slice(0, 2);
  const economiaContainer = document.getElementById("economia");
  economiaContainer.innerHTML = `
    <h3>Análise Comparativa</h3>
    <p><strong>1ª Opção:</strong> ${melhores[0].nome} - Custo Diário: R$ ${melhores[0].custoDiario.toFixed(2)}, Duração: ${Math.floor(melhores[0].duracaoPacote)} dias</p>
    <p><strong>2ª Opção:</strong> ${melhores[1].nome} - Custo Diário: R$ ${melhores[1].custoDiario.toFixed(2)}, Duração: ${Math.floor(melhores[1].duracaoPacote)} dias</p>
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
