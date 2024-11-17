function calcularProdutos(consumoDiarioKcal) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  // Normalizar valores para garantir a correspondência
  const tipoSelecionado = document.getElementById("tipo-pet").value.toLowerCase().trim();

  const racoesFiltradas = racoes.filter(racao => racao.tipo === tipoSelecionado);
  console.log("Rações filtradas para o tipo selecionado:", racoesFiltradas);

  if (racoesFiltradas.length === 0) {
    alert("Nenhuma ração disponível para o tipo de pet selecionado.");
    return [];
  }

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
