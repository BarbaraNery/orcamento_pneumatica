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
  document.getElementById("cnpj").addEventListener("blur", buscarCNPJ);
  mostrarCampoFaturado();
};

function abrirFormulario(tipo) {
  tipoOrcamento = tipo;

  document.getElementById("menuInicial").classList.add("oculto");
  document.getElementById("formulario").classList.remove("oculto");

  if (tipo === "proposta") {
    document.getElementById("tituloFormulario").innerText = "Proposta comercial";
    document.getElementById("tituloProdutos").innerText = "Produtos";
  } else {
    document.getElementById("tituloFormulario").innerText = "Orçamento de manutenção";
    document.getElementById("tituloProdutos").innerText = "Serviços / Peças";
  }
}

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
  const cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");

  if (cnpj.length !== 14) return;

  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    const dados = await resposta.json();

    if (dados.message) {
      alert("CNPJ não encontrado.");
      return;
    }

    document.getElementById("empresa").value = dados.razao_social || "";
    document.getElementById("telefone").value = dados.ddd_telefone_1 || "";

    document.getElementById("endereco").value =
      `${dados.logradouro || ""}, ${dados.numero || ""} - ${dados.bairro || ""} - ${dados.municipio || ""}/${dados.uf || ""}`;

  } catch (erro) {
    alert("Erro ao buscar CNPJ.");
    console.error(erro);
  }
}

function gerarPDF() {
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
  const parcelasCartao = document.getElementById("parcelasCartao")?.value || "";
  const dias = document.getElementById("dias").value;
  const freteManual = Number(document.getElementById("frete").value || 0);
  const observacoes = document.getElementById("observacoes").value;
  const validade = document.getElementById("validade").value;
  const numeroOrcamento = gerarNumeroOrcamento();

  const frete = freteManual;

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

  doc.setFont("helvetica", "bold");
doc.setFontSize(10);

doc.text(`Empresa: ${empresa}`, 14, 80, { maxWidth: 90 });
doc.text(`Cliente/Contato: ${nomeCliente}`, 14, 88, { maxWidth: 90 });
doc.text(`CNPJ: ${cnpj}`, 14, 88, { maxWidth: 90 });

const enderecoQuebrado = doc.splitTextToSize(`Endereço: ${endereco}`, 90);
doc.text(enderecoQuebrado, 14, 96);

let yDepoisEndereco = 96 + (enderecoQuebrado.length * 6);

doc.text(`Telefone: ${telefone}`, 14, yDepoisEndereco);

doc.text(`Vendedor: ${vendedor}`, 125, 80, { maxWidth: 65 });
doc.text(`Retirada/Envio: ${retirada}`, 125, 88, { maxWidth: 65 });

let textoPagamento = "";

if (pagamento === "Faturado") {
  textoPagamento = `Pagamento: Faturado ${dias}`;
} else if (pagamento === "Cartão de crédito") {
  textoPagamento = `Pagamento: Cartão de crédito - ${parcelasCartao}`;
} else {
  textoPagamento = `Pagamento: ${pagamento}`;
}

doc.text(textoPagamento, 125, 96, { maxWidth: 65 });

const inicioTabela = Math.max(yDepoisEndereco + 15, 112);

  const produtos = document.querySelectorAll(".produto-item");

  let linhas = [];
  let subtotal = 0;

  produtos.forEach((item) => {
    const produto = item.querySelector(".produto").value;
    const codigo = item.querySelector(".codigo").value;
    const quantidade = Number(item.querySelector(".quantidade").value || 0);
    const preco = Number(item.querySelector(".preco").value || 0);
    const total = quantidade * preco;

    subtotal += total;

    linhas.push([
      produto,
      codigo,
      quantidade,
      formatarMoeda(preco),
      formatarMoeda(total)
    ]);
  });

  doc.autoTable({
    startY: inicioTabela,
    head: [["Produto/Serviço", "Código", "Quantidade", "Preço unitário", "Total"]],
    body: linhas,
    theme: "grid",
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold"
    },
    styles: {
      fontSize: 9
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
}


async function gerarWord() {

  const empresa = document.getElementById("empresa").value;
  const cnpj = document.getElementById("cnpj").value;
  const endereco = document.getElementById("endereco").value;
  const telefone = document.getElementById("telefone").value;
  const vendedor = document.getElementById("vendedor").value;
  const retirada = document.getElementById("retirada").value;
  const pagamento = document.getElementById("pagamento").value;
  const dias = document.getElementById("dias").value;
  const frete = Number(document.getElementById("frete").value || 0);
  const observacoes = document.getElementById("observacoes").value;

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