
let historico = [];
let racoes = [];

// Função para carregar os dados das rações
async function carregarRacoes() {
  try {
    const response = await fetch('./racoes.csv'); // Carregar arquivo CSV local
    if (!response.ok) {
      throw new Error("Erro ao carregar o arquivo CSV");
    }
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
    console.log("Rações carregadas:", racoes); // Log para depuração
  } catch (error) {
    console.error("Erro ao carregar as rações:", error);
    alert("Erro ao carregar os dados das rações. Verifique o arquivo e tente novamente.");
  }
}

// Inicializar ao carregar
document.addEventListener("DOMContentLoaded", () => {
  carregarRacoes();

  const calcularButton = document.getElementById("calcular");
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
function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const tipoPet = document.getElementById("tipo-pet").value.toLowerCase();
  const pesoPacoteSelecionado = parseFloat(document.getElementById("peso-pacote").value);

  const racoesFiltradas = racoes.filter(r => r.tipo === tipoPet);

  if (racoesFiltradas.length === 0) {
    console.error("Nenhuma ração encontrada para o tipo de pet selecionado.");
    return [];
  }

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

// Encontrar as melhores rações
function encontrarMelhoresRacoes(resultados) {
  const categoriasOrdenadas = ["super premium", "premium", "standard"];

  // Ordenar por custo diário
  const resultadosOrdenados = resultados.sort((a, b) => a.custoDiario - b.custoDiario);

  // Melhor opção econômica
  const racaoMaisEconomica = resultadosOrdenados[0];

  // Melhor opção de qualidade (diferente da mais econômica)
  const racaoMelhorQualidade = resultadosOrdenados.find(
    r => categoriasOrdenadas.indexOf(r.categoria) < categoriasOrdenadas.indexOf(racaoMaisEconomica.categoria)
  ) || resultadosOrdenados[1]; // Caso não encontre, pega a segunda mais barata.

  return { racaoMaisEconomica, racaoMelhorQualidade };
}

// Mostrar as melhores rações
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
  }
}

// Mostrar análise econômica detalhada
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

// Mostrar análise de economia
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

// Toggle menu for responsive design
document.querySelector('.menu-toggle').addEventListener('click', () => {
  document.querySelector('.menu-lateral').classList.toggle('show');
});

// Filter CSV data by pet type before processing
async function carregarRacoesPorTipo(tipoPet) {
  try {
    const response = await fetch('./racoes.csv'); // Load the CSV file
    if (!response.ok) {
      throw new Error("Erro ao carregar o arquivo CSV");
    }
    const data = await response.text();
    const linhas = data.split('\n').slice(1); // Ignore the header
    return linhas
      .filter(l => l.trim() !== "") // Ignore empty lines
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
      })
      .filter(r => r.tipo === tipoPet.toLowerCase()); // Filter by pet type
  } catch (error) {
    console.error("Erro ao carregar as rações por tipo:", error);
    alert("Erro ao carregar os dados das rações. Verifique o arquivo e tente novamente.");
    return [];
  }
}

// Validate the selected package weight before calculation
async function validarPesoPacote(tipoPet, pesoPacoteSelecionado) {
  const racoesFiltradas = await carregarRacoesPorTipo(tipoPet);
  const pesoDisponivel = racoesFiltradas.some(r => r.pesoPacote === pesoPacoteSelecionado);
  if (!pesoDisponivel) {
    alert(`O peso do pacote de ${pesoPacoteSelecionado} kg não está disponível para o tipo de pet selecionado.`);
    return false;
  }
  return true;
}

// Override the "Calcular" button logic to include validation and optimized loading
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

    const racoesFiltradas = await carregarRacoesPorTipo(tipoPet);
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
