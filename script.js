
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
      .filter(l => l.trim() !== "")
      .map(l => {
        const [nome, preco, densidade, pesoPacote, tipo] = l.split(',');
        return {
          nome: nome.trim(),
          preco: parseFloat(preco),
          densidade: parseFloat(densidade),
          pesoPacote: parseFloat(pesoPacote),
          tipo: tipo.trim().toLowerCase()
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
  const menu = document.querySelector(".menu-lateral");
  menu.style.left = menu.style.left === "0px" ? "-250px" : "0";
});

// Configurar botão calcular
document.getElementById("calcular").addEventListener("click", () => {
  console.log("Rações disponíveis:", racoes); // Debug
  
  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const peso = parseFloat(document.getElementById("peso").value);
  const idade = document.getElementById("idade").value;
  const atividade = parseFloat(document.getElementById("atividade").value);

  if (!tipoPet || isNaN(peso) || !idade || isNaN(atividade)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  console.log("Critérios do cálculo:", { tipoPet, peso, idade, atividade });

  const RER = tipoPet === "cao" ? 70 * Math.pow(peso, 0.75) : 100 * Math.pow(peso, 0.67);
  const consumoDiarioKcal = RER * atividade;
  console.log("Consumo Diário (kcal):", consumoDiarioKcal);

  const resultados = calcularProdutos(consumoDiarioKcal);
  console.log("Resultados filtrados:", resultados);

  if (resultados.length === 0) {
    alert("Nenhuma ração disponível.");
    return;
  }

  mostrarComparativo(resultados);
  mostrarEconomia(resultados);
  document.getElementById("results").style.display = "block";
});

// Lógica para calcular produtos
function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const racoesFiltradas = racoes.filter(r => r.tipo === tipoPet);
  console.log("Rações filtradas por tipo:", racoesFiltradas); // Debug

  return racoesFiltradas.map(r => {
    const consumoDiarioGramas = (consumoDiarioKcal / r.densidade) * 1000;
    const custoDiario = (consumoDiarioGramas / 1000) * (r.preco / r.pesoPacote);
    const duracaoPacote = (r.pesoPacote * 1000) / consumoDiarioGramas;

    tableBody.innerHTML += `<tr><td>${r.nome}</td><td>R$ ${r.preco.toFixed(2)}</td><td>${consumoDiarioGramas.toFixed(2)}</td><td>R$ ${custoDiario.toFixed(2)}</td><td>${Math.floor(duracaoPacote)}</td></tr>`;
    return { nome: r.nome, custoDiario, duracaoPacote };
  });
}

// Outras funções (mostrar comparativo, economia) continuam iguais
