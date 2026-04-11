const translations = {
  // Navbar
  "Serviços": "Servicios",
  "Sobre Nós": "Sobre Nosotros",
  "Portfólio": "Portafolio",
  "Processo": "Proceso",
  "Contato": "Contacto",
  "Diagnóstico Gratuito": "Diagnóstico Gratis",

  // Hero
  "Resultados Exponenciais": "Resultados Exponenciales",
  "Transforme a Tecnologia em Lucro": "Transforma la Tecnología en Beneficio",
  "Escale seu luxo, automatize operações e domine o mercado.": "Escale su lujo, automatice operaciones y domine el mercado.",
  "Escalar Meu Negócio →": "Escalar Mi Negocio →",
  "Ver Portfólio": "Ver Portafolio",
  "+ de 500": "+ de 500",
  "Projetos Web Entregues": "Proyectos Web Entregados",
  "Anos de Excelência": "Años de Excelencia",
  
  // Services
  "Soluções": "Soluciones",
  "O Que": "Lo Que",
  "Entregamos": "Entregamos",
  "Foco total em resultados. Removemos a complexidade tecnológica para você focar no crescimento.": "Enfoque total en resultados. Eliminamos la complejidad tecnológica para que usted se enfoque en el crecimiento.",
  "Sites & Landing Pages": "Sitios y Landing Pages",
  "Páginas de alta conversão projetadas para transformar visitantes em leads qualificados. Design premium, velocidade extrema.": "Páginas de alta conversión diseñadas para transformar visitantes en leads calificados. Diseño premium, velocidad extrema.",
  "Tráfego Pago / Ads": "Tráfico Pagado / Ads",
  "Estratégias de aquisição em Google e Meta Ads para escalar seu faturamento com previsibilidade e ROI comprovado.": "Estrategias de adquisición en Google y Meta Ads para escalar su facturación con previsibilidad y ROI comprobado.",
  "Automação & IA": "Automatización e IA",
  "Atendimento automático 24/7 com agentes de IA que agendam, qualificam leads e vendem enquanto você dorme.": "Atención automática 24/7 con agentes de IA que programan, califican leads y venden mientras duermes.",
  "Sistemas & Apps": "Sistemas y Apps",
  "Plataformas SaaS e aplicativos sob medida com arquitetura escalável para dominar seu mercado.": "Plataformas SaaS y aplicaciones a medida con arquitectura escalable para dominar su mercado.",
  "Solicitar Orçamento →": "Solicitar Presupuesto →",

  // Add more easily as needed
};

// Simple Text Replacer Strategy
let currentLang = 'pt';
const originalTexts = new Map();

function getTextNodes(node) {
  let textNodes = [];
  if (node.nodeType == 3) {
    if (node.nodeValue.trim() !== "") textNodes.push(node);
  } else {
    for (let child of node.childNodes) {
      if (child.nodeName.toLowerCase() !== 'script' && child.nodeName.toLowerCase() !== 'style') {
        textNodes.push(...getTextNodes(child));
      }
    }
  }
  return textNodes;
}

function initTranslations() {
  const nodes = getTextNodes(document.body);
  nodes.forEach((node, index) => {
    originalTexts.set(index, node.nodeValue);
  });
}

function translatePage(lang) {
  const nodes = getTextNodes(document.body);
  nodes.forEach((node, index) => {
    const original = originalTexts.get(index);
    if (!original) return;
    
    if (lang === 'pt') {
      node.nodeValue = original;
    } else if (lang === 'es') {
      // Find matches in translation dict
      let newText = original;
      for (const [ptText, esText] of Object.entries(translations)) {
        if (newText.includes(ptText)) {
          newText = newText.replace(newText.trim(), esText);
        }
      }
      node.nodeValue = newText;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTranslations();
  
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      langBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const lang = e.target.dataset.lang;
      translatePage(lang);
    });
  });
});
