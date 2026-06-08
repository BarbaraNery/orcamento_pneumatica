let tipoOrcamento = "proposta";

const cadiriri = {
  nome: "CADIRIRI HIDRÁULICA E PNEUMÁTICA LTDA",
  telefone: "(11) 94189-9655",
  endereco: "Rua Barão de Monte Santo, Nº 856",
  cidade: "03123020 - São Paulo, SP",
  cnpj: "09.577.109/0001-60",
  ie: "148.138.546.116"
};

function gerarNumeroOrcamento() {
  const ano = new Date().getFullYear();
  let ultimoNumero = localStorage.getItem("ultimoOrcamentoCadiriri");

  if (!ultimoNumero) {
    ultimoNumero = 0;
  }

  ultimoNumero = Number(ultimoNumero) + 1;
  localStorage.setItem("ultimoOrcamentoCadiriri", ultimoNumero);

  return `CAD-${ano}-${String(ultimoNumero).padStart(4, "0")}`;
}

window.onload = function () {
  adicionarProduto();
  mostrarCampoFaturado();
};

function abrirFormulario(tipo) {
  tipoOrcamento = tipo;

  const formulario = document.getElementById("formulario");
  const areaManutencao = document.getElementById("areaManutencao");
  const blocoProdutos = document.querySelector(".bloco-produtos");
  const blocoPagamento = document.querySelector(".bloco-pagamento");
  const blocoSedex = document.querySelector(".bloco-sedex");

  document.getElementById("menuInicial").classList.add("oculto");
  formulario.classList.remove("oculto");

  if (areaManutencao) {
    formulario.appendChild(areaManutencao);
  }

  if (tipo === "proposta") {
    document.getElementById("tituloFormulario").innerText = "Proposta comercial";

    if (blocoProdutos) blocoProdutos.style.display = "block";
    if (blocoPagamento) blocoPagamento.style.display = "block";
    if (blocoSedex) blocoSedex.style.display = "block";

    if (areaManutencao) {
      areaManutencao.classList.add("oculto");
      areaManutencao.style.display = "none";
    }

  } else {
    document.getElementById("tituloFormulario").innerText = "Ordem de serviço";

    if (blocoProdutos) blocoProdutos.style.display = "none";
    if (blocoPagamento) blocoPagamento.style.display = "none";
    if (blocoSedex) blocoSedex.style.display = "none";

    if (areaManutencao) {
      areaManutencao.classList.remove("oculto");
      areaManutencao.style.display = "block";
    } else {
      alert("Área de manutenção não encontrada no HTML.");
    }
  }
}


window.abrirFormulario = abrirFormulario;


function voltarMenu() {
  document.getElementById("formulario").classList.add("oculto");
  document.getElementById("menuInicial").classList.remove("oculto");
}

function adicionarProduto() {
  const area = document.getElementById("produtos");

  const div = document.createElement("div");
  div.className = "produto-item";

div.innerHTML = `
  <div>
    <label>Produto/Serviço</label>
    <input type="text" class="produto">
  </div>

  <div>
    <label>Marca</label>
    <input type="text" class="marca">
  </div>
   
  <div>
    <label>Código</label>
    <input type="text" class="codigo">
  </div>

  <div>
    <label>Quantidade</label>
    <input type="number" class="quantidade" value="1">
  </div>

  <div>
    <label>Preço unitário (R$)</label>
    <input type="number" class="preco" value="0">
  </div>

  <div>
    <label>Disponibilidade</label>
    <select class="disponibilidade" onchange="mostrarPrazoProduto(this)">
      <option value="Em estoque">Em estoque</option>
      <option value="Sob encomenda">Sob encomenda</option>
    </select>
  </div>

  <div class="campo-prazo-produto oculto">
    <label>Prazo útil</label>
    <input type="text" class="prazoProduto" placeholder="Ex: 15 dias úteis">
  </div>
`;

  area.appendChild(div);
}

function removerProduto() {
  const area = document.getElementById("produtos");

  if (area.children.length > 1) {
    area.removeChild(area.lastElementChild);
  }
}


async function buscarCNPJ() {
  const campo = document.getElementById("cnpj");
  const valor = campo.value.replace(/\D/g, "");

  if (!valor) {
    alert("Digite um CNPJ para buscar.");
    return;
  }

  if (valor.length === 11) {
    alert("CPF informado. A busca automática funciona apenas para CNPJ.");
    return;
  }

  if (valor.length !== 14) {
    alert("Digite um CNPJ válido com 14 números.");
    return;
  }

  try {
    const resposta = await fetch(`https://open.cnpja.com/office/${valor}`);

    if (!resposta.ok) {
      throw new Error("Erro na consulta do CNPJ");
    }

    const dados = await resposta.json();

    document.getElementById("empresa").value = dados.company?.name || "";
    document.getElementById("endereco").value =
      `${dados.address?.street || ""}, ${dados.address?.number || ""} - ${dados.address?.district || ""} - ${dados.address?.city || ""}/${dados.address?.state || ""}`;

  } catch (erro) {
    console.error(erro);
    alert("Erro ao buscar CNPJ.");
  }
}

window.buscarCNPJ = buscarCNPJ;

function gerarPDF() {

    if (tipoOrcamento !== "proposta") {
    gerarPDFManutencao();
    return;
    }

    if (tipoOrcamento === "manutencao") {
    gerarPDFManutencao();
    return;
  }
  
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo = new Image();
  logo.src = "assets/logo.png";

  const empresa = document.getElementById("empresa").value;
  const nomeCliente = document.getElementById("nomeCliente").value;
  const cnpj = document.getElementById("cnpj").value;
  const endereco = document.getElementById("endereco").value;
  const telefone = document.getElementById("telefone").value;
  const vendedor = document.getElementById("vendedor").value;
  const retirada = document.getElementById("retirada").value;
  const pagamento = document.getElementById("pagamento").value;
  const dias = document.getElementById("dias").value;
  const parcelasCartao = document.getElementById("parcelasCartao")?.value || "";
  const frete = Number(document.getElementById("frete").value || 0);
  const cepCliente = document.getElementById("cepCliente").value;
  const enderecoCliente = document.getElementById("enderecoCliente").value;
  const bairroCliente = document.getElementById("bairroCliente").value;
  const cidadeCliente = document.getElementById("cidadeCliente").value;
  const observacoes = document.getElementById("observacoes").value;
  const emailCliente = document.getElementById("emailCliente")?.value || "";
  const primeiroContato = document.getElementById("primeiroContato")?.value || "";
  const validade = document.getElementById("validade").value;
  const numeroOrcamento = gerarNumeroOrcamento();

  if (!empresa || !vendedor) {
    alert("Preencha o nome da empresa e selecione o vendedor.");
    return;
  }

  const tituloPDF = tipoOrcamento === "proposta"
    ? "PROPOSTA COMERCIAL"
    : "ORÇAMENTO DE MANUTENÇÃO";

  const hoje = new Date().toLocaleDateString("pt-BR");

  doc.rect(8, 8, 194, 280);
  doc.addImage(logo, "PNG", 14, 12, 35, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(cadiriri.nome, 55, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(cadiriri.telefone, 55, 26);
  doc.text(cadiriri.endereco, 55, 32);
  doc.text(cadiriri.cidade, 55, 38);
  doc.text(`CNPJ: ${cadiriri.cnpj} — IE: ${cadiriri.ie}`, 55, 44);

  doc.text(`Nº: ${numeroOrcamento}`, 155, 20);
  doc.text(`Data: ${hoje}`, 155, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(tituloPDF, 105, 65, { align: "center" });

  let yCliente = 80;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  const empresaQuebrada = doc.splitTextToSize(`Empresa: ${empresa}`, 90);
  doc.text(empresaQuebrada, 14, yCliente);
  yCliente += empresaQuebrada.length * 6;

  doc.text(`CNPJ: ${cnpj}`, 14, yCliente);
  yCliente += 6;

  const clienteQuebrado = doc.splitTextToSize(`Cliente: ${nomeCliente || "-"}`, 90);
  doc.text(clienteQuebrado, 14, yCliente);
  yCliente += clienteQuebrado.length * 6;

  const enderecoQuebrado = doc.splitTextToSize(`Endereço: ${endereco}`, 90);
  doc.text(enderecoQuebrado, 14, yCliente);
  yCliente += enderecoQuebrado.length * 6;

  doc.text(`Telefone: ${telefone || "-"}`, 14, yCliente);
  yCliente += 6;

  doc.text(`E-mail: ${document.getElementById("emailCliente")?.value || "-"}`, 14, yCliente);
  yCliente += 6;
  
  doc.text(`CEP: ${cepCliente || "-"}`, 14, yCliente);
  yCliente += 6;

const enderecoEntregaQuebrado = doc.splitTextToSize(
  `Endereço Entrega: ${enderecoCliente || "-"}`,
  90
);

doc.text(enderecoEntregaQuebrado, 14, yCliente);
yCliente += enderecoEntregaQuebrado.length * 6;

doc.text(`Bairro: ${bairroCliente || "-"}`, 14, yCliente);
yCliente += 6;

doc.text(`Cidade: ${cidadeCliente || "-"}`, 14, yCliente);
yCliente += 6;


  doc.text(`Vendedor: ${vendedor}`, 125, 80, { maxWidth: 65 });
  doc.text(`Retirada/Envio: ${retirada}`, 125, 88, { maxWidth: 65 });

let textoPagamento = "";

if (pagamento === "Faturado") {
  textoPagamento = `Pagamento: Faturado ${dias}`;
}
else if (pagamento === "Cartão de crédito") {
  textoPagamento = `Pagamento: Cartão de crédito - ${parcelasCartao}`;
}
  
else if (pagamento === "Primeiro contato") {
  const valorPrimeiroContato = document.getElementById("primeiroContato")?.value || "";
  textoPagamento = `Pagamento: Primeiro contato - ${valorPrimeiroContato}`;
}
  
else {
  textoPagamento = `Pagamento: ${pagamento}`;
}

  doc.text(textoPagamento, 125, 96, { maxWidth: 65 });

  const inicioTabela = Math.max(yCliente + 15, 112);

  const produtos = document.querySelectorAll(".produto-item");

  let linhas = [];
  let subtotal = 0;

  produtos.forEach((item) => {
    const produto = item.querySelector(".produto").value;
    const marca = item.querySelector(".marca").value;
    const codigo = item.querySelector(".codigo").value;
    const quantidade = Number(item.querySelector(".quantidade").value || 0);
    const preco = Number(item.querySelector(".preco").value || 0);
    const disponibilidade = item.querySelector(".disponibilidade")?.value || "";
    const prazoProduto = item.querySelector(".prazoProduto")?.value || "";

    const total = quantidade * preco;
    subtotal += total;

    let prazoFinal = disponibilidade;

    if (disponibilidade === "Sob encomenda" && prazoProduto) {
      prazoFinal = `Sob encomenda - ${prazoProduto}`;
    }

    linhas.push([
      produto,
      marca,
      codigo,
      quantidade,
      formatarMoeda(preco),
      formatarMoeda(total),
      prazoFinal
    ]);
  });

  doc.autoTable({
    startY: inicioTabela,
    head: [["Produto/Serviço", "Marca", "Código", "Qtd", "Preço unit.", "Total", "Disponibilidade"]],
    body: linhas,
    theme: "grid",
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold"
    },
    styles: {
      fontSize: 8
    }
  });

  const totalGeral = subtotal + frete;
  let y = doc.lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.text(`Subtotal: ${formatarMoeda(subtotal)}`, 140, y);
  doc.text(`Frete: ${formatarMoeda(frete)}`, 140, y + 7);
  doc.text(`Total geral: ${formatarMoeda(totalGeral)}`, 140, y + 14);

  y += 30;

  doc.text("Observações:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    observacoes || `Orçamento válido por ${validade}. Consulte disponibilidade após esse prazo.`,
    14,
    y + 8,
    { maxWidth: 180 }
  );

  doc.line(14, 270, 90, 270);
  doc.line(120, 270, 195, 270);

  doc.setFontSize(9);
  doc.text(`Vendedor: ${vendedor}`, 52, 276, { align: "center" });
  doc.text("Responsável pela empresa", 157, 276, { align: "center" });

  doc.save(`${tituloPDF.toLowerCase().replaceAll(" ", "-")}-${empresa}.pdf`);
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function mostrarCampoFaturado() {
  const pagamento = document.getElementById("pagamento").value;
  const campoFaturado = document.getElementById("campoFaturado");
  const campoParcelas = document.getElementById("campoParcelas");
  const campoPrimeiroContato = document.getElementById("campoPrimeiroContato");

  if (pagamento === "Faturado") {
    campoFaturado.style.display = "block";
  } else {
    campoFaturado.style.display = "none";
    document.getElementById("dias").value = "";
  }

  if (pagamento === "Cartão de crédito") {
    campoParcelas.classList.remove("oculto");
  } else {
    campoParcelas.classList.add("oculto");
    document.getElementById("parcelasCartao").value = "1x sem juros";
  }

  if (pagamento === "Primeiro contato") {
    campoPrimeiroContato.classList.remove("oculto");
  } else {
    campoPrimeiroContato.classList.add("oculto");
    document.getElementById("primeiroContato").value = "";
  }
}


async function gerarWord() {

  const empresa = document.getElementById("empresa").value;
  const cnpj = document.getElementById("cnpj").value;
  const endereco = document.getElementById("endereco").value;
  const telefone = document.getElementById("telefone").value;
  const vendedor = document.getElementById("vendedor").value;
  const retirada = document.getElementById("retirada").value;
  const pagamento = document.getElementById("pagamento").value;
  const primeiroContato = document.getElementById("primeiroContato")?.value || "";
  const dias = document.getElementById("dias").value;
  const parcelasCartao = document.getElementById("parcelasCartao")?.value || "";
  const emailCliente = document.getElementById("emailCliente")?.value || "";
  const frete = Number(document.getElementById("frete").value || 0);
  const observacoes = document.getElementById("observacoes").value;


  let pagamentoExibicao = pagamento;

  if (pagamento === "Faturado" && dias) {
  pagamentoExibicao = `Faturado (${dias})`;
  }

if (pagamento === "Cartão de crédito" && parcelasCartao) {
  pagamentoExibicao = `Cartão de crédito (${parcelasCartao})`;
}

if (pagamento === "Primeiro contato" && primeiroContato) {
  pagamentoExibicao = `Primeiro contato - ${primeiroContato}`;
  }

  const produtos = document.querySelectorAll(".produto-item");

  let subtotal = 0;
  let tabelaProdutos = [];

  produtos.forEach((item) => {

    const produto = item.querySelector(".produto").value;
    const codigo = item.querySelector(".codigo").value;
    const quantidade = Number(item.querySelector(".quantidade").value || 0);
    const preco = Number(item.querySelector(".preco").value || 0);

    const total = quantidade * preco;

    subtotal += total;

    tabelaProdutos.push([
      produto,
      codigo,
      quantidade.toString(),
      formatarMoeda(preco),
      formatarMoeda(total)
    ]);
  });

  const totalGeral = subtotal + frete;

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel
  } = docx;

  const rows = [];

  rows.push(
    new TableRow({
      children: [
        "Produto",
        "Código",
        "Qtd",
        "Preço Unit.",
        "Total"
      ].map(text =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: true
                })
              ]
            })
          ]
        })
      )
    })
  );

  tabelaProdutos.forEach(item => {

    rows.push(
      new TableRow({
        children: item.map(text =>
          new TableCell({
            children: [
              new Paragraph(text.toString())
            ]
          })
        )
      })
    );
  });

  const doc = new Document({

    sections: [
      {
        children: [

          new Paragraph({
            text: cadiriri.nome,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `CNPJ: ${cadiriri.cnpj}`,
                bold: true
              })
            ]
          }),

          new Paragraph({
            text: `${cadiriri.endereco} - ${cadiriri.cidade}`
          }),

          new Paragraph({
            text: `Telefone: ${cadiriri.telefone}`
          }),

          new Paragraph({
            text: " "
          }),

          new Paragraph({
            text: tipoOrcamento === "proposta"
              ? "PROPOSTA COMERCIAL"
              : "ORÇAMENTO DE MANUTENÇÃO",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),

          new Paragraph({
            text: " "
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Empresa: ", bold: true }),
              new TextRun(empresa)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "CNPJ: ", bold: true }),
              new TextRun(cnpj)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Endereço: ", bold: true }),
              new TextRun(endereco)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Telefone: ", bold: true }),
              new TextRun(telefone)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Vendedor: ", bold: true }),
              new TextRun(vendedor)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Retirada/Envio: ", bold: true }),
              new TextRun(retirada)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Pagamento: ", bold: true }),
              new TextRun(
                pagamento === "Faturado"
                  ? `Faturado ${dias}`
                  : pagamento
              )
            ]
          }),

          new Paragraph({
            text: " "
          }),

          new Table({
            rows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            }
          }),

          new Paragraph({
            text: " "
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Subtotal: ${formatarMoeda(subtotal)}`,
                bold: true
              })
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Frete: ${formatarMoeda(frete)}`,
                bold: true
              })
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Total Geral: ${formatarMoeda(totalGeral)}`,
                bold: true
              })
            ]
          }),

          new Paragraph({
            text: " "
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Observações:",
                bold: true
              })
            ]
          }),

          new Paragraph({
            text: observacoes || "Sem observações."
          })

        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download =
    `${tipoOrcamento}-${empresa}.docx`;

  link.click();
}

function mostrarPrazoProduto(select) {
  const produtoItem = select.closest(".produto-item");
  const campoPrazo = produtoItem.querySelector(".campo-prazo-produto");

  if (select.value === "Sob encomenda") {
    campoPrazo.classList.remove("oculto");
  } else {
    campoPrazo.classList.add("oculto");
    produtoItem.querySelector(".prazoProduto").value = "";
  }
}
function abrirHistorico() {
  document.getElementById("menuInicial").classList.add("oculto");
  document.getElementById("formulario").classList.add("oculto");
  document.getElementById("historico").classList.remove("oculto");

  listarHistorico();
}

function salvarOrcamento() {
  const empresa = document.getElementById("empresa").value;
  const nomeCliente = document.getElementById("nomeCliente").value;
  const cnpj = document.getElementById("cnpj").value;
  const vendedor = document.getElementById("vendedor").value;
  const pagamento = document.getElementById("pagamento").value;
  const retirada = document.getElementById("retirada").value;
  const frete = Number(document.getElementById("frete").value || 0);

  const validade = document.getElementById("validade")?.value || "";
  const observacoes = document.getElementById("observacoes")?.value || "";

  const numeroOrcamento = gerarNumeroOrcamento();
  const data = new Date().toLocaleDateString("pt-BR");

  const produtos = [];
  let subtotal = 0;

  document.querySelectorAll(".produto-item").forEach((item) => {
    const produto = item.querySelector(".produto").value;
    const marca = item.querySelector(".marca").value;
    const codigo = item.querySelector(".codigo").value;
    const quantidade = Number(item.querySelector(".quantidade").value || 0);
    const preco = Number(item.querySelector(".preco").value || 0);
    const disponibilidade = item.querySelector(".disponibilidade")?.value || "";
    const prazoProduto = item.querySelector(".prazoProduto")?.value || "";

    const total = quantidade * preco;
    subtotal += total;

    produtos.push({
      produto,
      marca,
      codigo,
      quantidade,
      preco,
      total,
      disponibilidade,
      prazoProduto
    });
  });

  const totalGeral = subtotal + frete;

  const cepCliente = document.getElementById("cepCliente").value;
  const enderecoCliente = document.getElementById("enderecoCliente").value;
  const bairroCliente = document.getElementById("bairroCliente").value;
  const cidadeCliente = document.getElementById("cidadeCliente").value;

  const orcamento = {
    numero: numeroOrcamento,
    data,
    tipo: tipoOrcamento === "proposta" ? "Proposta comercial" : "Orçamento de manutenção",
    empresa,
    nomeCliente,
    cnpj,
    vendedor,
    pagamento,
    retirada,
    frete,
    subtotal,
    totalGeral,
    validade,
    observacoes,
    cepCliente,
    enderecoCliente,
    bairroCliente,
    cidadeCliente,
    produtos
  };

  const historico = JSON.parse(localStorage.getItem("historicoOrcamentosCadiriri")) || [];

  historico.push(orcamento);

  localStorage.setItem("historicoOrcamentosCadiriri", JSON.stringify(historico));

  alert(`Orçamento ${numeroOrcamento} salvo com sucesso!`);
}

function listarHistorico() {
  const lista = document.getElementById("listaHistorico");
  const pesquisa = document.getElementById("pesquisaHistorico")?.value.toLowerCase() || "";

  const historico = JSON.parse(localStorage.getItem("historicoOrcamentosCadiriri")) || [];

  const filtrados = historico.filter((orcamento) => {
    return (
      orcamento.numero.toLowerCase().includes(pesquisa) ||
      orcamento.data.toLowerCase().includes(pesquisa) ||
      orcamento.empresa.toLowerCase().includes(pesquisa) ||
      orcamento.nomeCliente.toLowerCase().includes(pesquisa) ||
      orcamento.cnpj.toLowerCase().includes(pesquisa)
    );
  });

  if (filtrados.length === 0) {
    lista.innerHTML = "<p>Nenhum orçamento encontrado.</p>";
    return;
  }

  lista.innerHTML = filtrados
    .map((orcamento) => `
      <div class="card-historico">
        <h3>${orcamento.numero}</h3>
        <p><strong>Data:</strong> ${orcamento.data}</p>
        <p><strong>Tipo:</strong> ${orcamento.tipo}</p>
        <p><strong>Empresa:</strong> ${orcamento.empresa}</p>
        <p><strong>Cliente:</strong> ${orcamento.nomeCliente || "-"}</p>
        <p><strong>CNPJ:</strong> ${orcamento.cnpj}</p>
        <p><strong>Vendedor:</strong> ${orcamento.vendedor}</p>
        <p><strong>Total:</strong> ${formatarMoeda(orcamento.totalGeral)}</p>
        <button onclick="gerarPDFDoHistorico('${orcamento.numero}')">
        Gerar PDF novamente
        </button>       
      </div>
    `)
    .join("");
}
function gerarPDFHistorico(numero) {
  const historico = JSON.parse(
    localStorage.getItem("historicoOrcamentosCadiriri")
  ) || [];

  const orcamento = historico.find(
    item => item.numero === numero
  );

  if (!orcamento) {
    alert("Orçamento não encontrado.");
    return;
  }

  gerarPDFComDados(orcamento);
}

function gerarPDFDoHistorico(numero) {

  const historico = JSON.parse(
    localStorage.getItem("historicoOrcamentosCadiriri")
  ) || [];

  const orcamento = historico.find(
    item => item.numero === numero
  );

  if (!orcamento) {
    alert("Orçamento não encontrado.");
    return;
  }

  document.getElementById("empresa").value = orcamento.empresa || "";
  document.getElementById("nomeCliente").value = orcamento.nomeCliente || "";
  document.getElementById("cnpj").value = orcamento.cnpj || "";
  document.getElementById("vendedor").value = orcamento.vendedor || "";
  document.getElementById("retirada").value = orcamento.retirada || "";
  document.getElementById("pagamento").value = orcamento.pagamento || "";
  document.getElementById("frete").value = orcamento.frete || 0;
  document.getElementById("cepCliente").value = orcamento.cepCliente || "";
  document.getElementById("enderecoCliente").value = orcamento.enderecoCliente || "";
  document.getElementById("bairroCliente").value = orcamento.bairroCliente || "";
  document.getElementById("cidadeCliente").value = orcamento.cidadeCliente || "";
  document.getElementById("observacoes").value = orcamento.observacoes || "";
  document.getElementById("validade").value = orcamento.validade || "";

  if (document.getElementById("dias")) {
    document.getElementById("dias").value = orcamento.dias || "";
  }

  if (
    document.getElementById("parcelasCartao") &&
    orcamento.parcelasCartao
  ) {
    document.getElementById("parcelasCartao").value =
      orcamento.parcelasCartao;
  }

  mostrarCampoFaturado();

  const areaProdutos = document.getElementById("produtos");
  areaProdutos.innerHTML = "";

  orcamento.produtos.forEach(produto => {

    adicionarProduto();

    const ultimoProduto =
      areaProdutos.lastElementChild;

    ultimoProduto.querySelector(".produto").value =
      produto.produto || "";

    ultimoProduto.querySelector(".marca").value =
      produto.marca || "";

    ultimoProduto.querySelector(".codigo").value =
      produto.codigo || "";

    ultimoProduto.querySelector(".quantidade").value =
      produto.quantidade || 1;

    ultimoProduto.querySelector(".preco").value =
      produto.preco || 0;

    if (ultimoProduto.querySelector(".disponibilidade")) {

      ultimoProduto.querySelector(".disponibilidade").value =
        produto.disponibilidade || "Em estoque";

      mostrarPrazoProduto(
        ultimoProduto.querySelector(".disponibilidade")
      );
    }

    if (
      ultimoProduto.querySelector(".prazoProduto")
    ) {
      ultimoProduto.querySelector(".prazoProduto").value =
        produto.prazoProduto || "";
    }
  });

  gerarPDF();
}

function imprimirOrcamento() {
  gerarPDF();
}

function gerarPDFManutencao() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo = new Image();
  logo.src = "assets/logo.png";

  const empresa = document.getElementById("empresa").value;
  const nomeCliente = document.getElementById("nomeCliente").value;
  const cnpj = document.getElementById("cnpj").value;
  const endereco = document.getElementById("endereco").value;
  const telefone = document.getElementById("telefone").value;
  const vendedor = document.getElementById("vendedor").value;

  const tipoEquipamento = document.getElementById("tipoEquipamento").value;
  const marca = document.getElementById("marcaManutencao").value;
  const modelo = document.getElementById("modeloManutencao").value;
  const valor = document.getElementById("valorManutencao").value || "A definir";
  const problema = document.getElementById("problemaManutencao").value;
  const observacoes = document.getElementById("observacoesManutencao").value;

  const numeroOrcamento = gerarNumeroOrcamento();
  const hoje = new Date().toLocaleDateString("pt-BR");

  doc.rect(8, 8, 194, 280);
  doc.addImage(logo, "PNG", 14, 12, 35, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(cadiriri.nome, 55, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(cadiriri.telefone, 55, 26);
  doc.text(cadiriri.endereco, 55, 32);
  doc.text(cadiriri.cidade, 55, 38);
  doc.text(`CNPJ: ${cadiriri.cnpj} — IE: ${cadiriri.ie}`, 55, 44);

  doc.text(`Nº: ${numeroOrcamento}`, 155, 20);
  doc.text(`Data: ${hoje}`, 155, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ORÇAMENTO DE MANUTENÇÃO", 105, 62, { align: "center" });

  doc.setFontSize(10);
  let y = 78;

  doc.text(`Empresa: ${empresa || "-"}`, 14, y); y += 7;
  doc.text(`Cliente: ${nomeCliente || "-"}`, 14, y); y += 7;
  doc.text(`CPF/CNPJ: ${cnpj || "-"}`, 14, y); y += 7;
  doc.text(`Endereço: ${endereco || "-"}`, 14, y); y += 7;
  doc.text(`Telefone: ${telefone || "-"}`, 14, y); y += 10;

  doc.text("Dados do equipamento", 14, y); y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Tipo: ${tipoEquipamento}`, 14, y); y += 7;
  doc.text(`Marca: ${marca || "-"}`, 14, y); y += 7;
  doc.text(`Modelo/Código: ${modelo || "-"}`, 14, y); y += 7;
  doc.text(`Valor: ${valor}`, 14, y); y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("O que está acontecendo:", 14, y); y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(problema || "-", 180), 14, y);
  y += 25;

  doc.setFont("helvetica", "bold");
  doc.text("Observações técnicas:", 14, 150);

  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(observacoes || "-", 180), 14, 158);

  doc.setFont("helvetica", "bold");
 

  y += 12;

  criarCanhotoManutencao(doc, 178, numeroOrcamento, hoje, empresa, tipoEquipamento);
  criarCanhotoManutencao(doc, 232, numeroOrcamento, hoje, empresa, tipoEquipamento);

  doc.save(`manutencao-${empresa || "cliente"}.pdf`);
}

function criarCanhotoManutencao(doc, y, numero, data, empresa, tipoEquipamento, vendedor) {
  doc.setDrawColor(0);
  doc.line(14, y - 6, 195, y - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CANHOTO DE MANUTENÇÃO", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(`Nº: ${numero}`, 14, y + 7);
  doc.text(`Data: ${data}`, 105, y + 7);

  doc.text(`Cliente: ${empresa || "-"}`, 14, y + 14);
  doc.text(`Equipamento: ${tipoEquipamento || "-"}`, 14, y + 21);
  doc.text(`Responsável: ${vendedor || "-"}`, 14, y + 28);

  doc.line(14, y + 40, 85, y + 40);
  doc.line(115, y + 40, 195, y + 40);

  doc.text("Assinatura cliente", 32, y + 45);
  doc.text("Assinatura empresa", 140, y + 45);
}

