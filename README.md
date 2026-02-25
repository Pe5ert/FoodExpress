Gerando PDF do README - Sistema de Delivery

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable

# Caminho do arquivo
file_path = "/mnt/data/README_Sistema_Delivery.pdf"
doc = SimpleDocTemplate(file_path)

elements = []
styles = getSampleStyleSheet()

# Título
elements.append(Paragraph("<b>SISTEMA DE DELIVERY</b>", styles["Title"]))
elements.append(Spacer(1, 0.3 * inch))

# Seção: Sobre
elements.append(Paragraph("<b>Sobre o Projeto</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))
elements.append(Paragraph(
    "Sistema web de Delivery desenvolvido para gerenciamento de pedidos, clientes e produtos. "
    "O sistema permite cadastrar itens do cardapio, realizar pedidos e acompanhar o status das entregas. "
    "Projeto desenvolvido utilizando arquitetura MVC (Model-View-Controller).",
    styles["BodyText"]
))
elements.append(Spacer(1, 0.3 * inch))

# Funcionalidades
elements.append(Paragraph("<b>Funcionalidades</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))

funcionalidades = [
    "Cadastro de produtos",
    "Cadastro de clientes",
    "Realizacao de pedidos",
    "Listagem de pedidos",
    "Atualizacao de status (Pendente, Em preparo, Saiu para entrega, Entregue)",
    "Interface responsiva com Bootstrap"
]

elements.append(ListFlowable(
    [ListItem(Paragraph(item, styles["BodyText"])) for item in funcionalidades],
    bulletType='bullet'
))
elements.append(Spacer(1, 0.3 * inch))

# Tecnologias
elements.append(Paragraph("<b>Tecnologias Utilizadas</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))

tecnologias = [
    "PHP",
    "PostgreSQL	",
    "TailWind",
    "HTML5",
    "CSS3"
]

elements.append(ListFlowable(
    [ListItem(Paragraph(item, styles["BodyText"])) for item in tecnologias],
    bulletType='bullet'
))
elements.append(Spacer(1, 0.3 * inch))

# Instalação
elements.append(Paragraph("<b>Como Instalar</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))

instalacao = [
    "1. Clonar o repositorio.",
    "2. Criar o banco de dados no MySQL.",
    "3. Importar o arquivo .sql do projeto.",
    "4. Configurar o arquivo config/database.php.",
    "5. Iniciar um servidor local (XAMPP ou similar).",
    "6. Acessar no navegador: http://localhost/nome-do-projeto"
]

elements.append(ListFlowable(
    [ListItem(Paragraph(item, styles["BodyText"])) for item in instalacao],
    bulletType='bullet'
))
elements.append(Spacer(1, 0.3 * inch))

# Banco de Dados
elements.append(Paragraph("<b>Banco de Dados (Tabelas Principais)</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))

tabelas = [
    "avaliacao",
    “cardapio”,
    “entregador”,
    "item_pedido"
    “pagamento”,
    "pedidos",
    “pedido”,
    “rastreamento”,
    "repasse",
    “restaurante”,
    “usuario”,
     
]

elements.append(ListFlowable(
    [ListItem(Paragraph(item, styles["BodyText"])) for item in tabelas],
    bulletType='bullet'
))
elements.append(Spacer(1, 0.5 * inch))

# Autor
elements.append(Paragraph("<b>Autor</b>", styles["Heading2"]))
elements.append(Spacer(1, 0.2 * inch))
elements.append(Paragraph("Equipe 4", styles["BodyText"]))

# Construir PDF
doc.build(elements)

file_path


