async function carregarRacoes() {
  try {
    const url = 'https://raw.githubusercontent.com/lFelplSanches/HealthPaws/main/racoes.csv';
    const response = await fetch(url);
    const data = await response.text();
    const linhas = data.split('\n').slice(1);
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
    console.log("Rações carregadas com sucesso:", racoes);
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
  }
}

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
  mostrarEconomia(resultados);
  salvarHistorico(tipoPet, peso, idade, atividade, resultados);
  document.getElementById("results").style.display = "block";
}

function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const racoesFiltradas = racoes.filter(racao => racao.tipo.toLowerCase() === document.getElementById("tipo-pet").value);
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
