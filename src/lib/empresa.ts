// Dados da controladora (LGPD) em um lugar só: páginas legais e /conta usam
// daqui, para não divergirem.
export const EMPRESA = {
  razaoSocial: "61.557.779 LUANDERSON ARLINDO DE OLIVEIRA",
  nomeFantasia: "Formandos",
  responsavel: "Luanderson Arlindo de Oliveira",
} as const;

export const DPO = {
  nome: "Luanderson Arlindo de Oliveira",
  email: "companysexteto@gmail.com",
} as const;

// Frase de confiança (ADR-0001): quem mantém o site e o que ele não é.
// Mostrada no rodapé da página inicial e em /convite.
export const AVISO_INSTITUCIONAL =
  `O Formandos é um projeto gratuito de alunos da Unifacol, mantido por ${EMPRESA.responsavel}. ` +
  "Não é um site oficial da Unifacol. Você pode baixar seus dados e excluir sua conta quando quiser, em Minha conta.";

// Versão curta, no card "Privacidade e DPO" de Minha conta.
export const AVISO_INSTITUCIONAL_CURTO = "Projeto de alunos. Não é um site oficial da Unifacol.";

// Quem vê o voto (ADR-0001, item 0.3). Mesma frase na lista e na tela de votar.
export const AVISO_VISIBILIDADE_VOTO =
  "Os administradores da turma veem em qual opção você votou. A turma vê só os totais.";
