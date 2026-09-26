# Enquetes e Questionários Padrão - App Formandos

Este documento contém o **catálogo padrão**: 8 categorias, 16 perguntas e as opções interativas de resposta usadas para gerar os relatórios automatizados de preferência das turmas.

Ele é a fonte do *seed* do banco de dados. O catálogo padrão é igual para todas as turmas e é somente leitura. Cada administrador pode criar, além dele, **catálogos personalizados** para a sua turma (ver `README.md`).

**Convenções:**

- **Seleção Única:** cada participante escolhe uma opção. Ao votar de novo, o voto anterior é substituído.
- **Seleção Múltipla:** cada participante escolhe várias opções. Ao votar de novo, o conjunto anterior é substituído.
- **Opção exclusiva** (marcada com *(exclusiva)*): opção neutra ou negativa, como "Sem preferência" ou "Nenhuma restrição". Ao marcá-la em uma pergunta múltipla, as demais opções são desmarcadas.
- Os votos são **identificados**: o administrador vê quem votou. Os participantes podem alterar o voto.

---

## 1. Espaço do Evento

### 1.1. Onde vai ser o nosso evento?
> **Tipo:** Seleção Única

- `[ Salão Clássico ]`
- `[ Espaço ao Ar Livre / Chácara ]`
- `[ Rooftop Urbano ]`
- `[ Espaço Moderno / Industrial ]`
- `[ Sem preferência / Qualquer local ]`

### 1.2. O que é prioridade na localização?
> **Tipo:** Seleção Única

- `[ Próxima à instituição de ensino ]`
- `[ Fácil acesso de transporte (Uber/Ônibus) ]`
- `[ Estacionamento no local ]`
- `[ Região central da cidade ]`
- `[ Sem preferência / Indiferente ]`

---

## 2. Comida & Gastronomia

### 2.1. Como queremos o serviço de alimentação principal?
> **Tipo:** Seleção Única

- `[ Jantar Sentado (Empratado) ]`
- `[ Buffet Self-Service ]`
- `[ Salgados & Finger Foods ]`
- `[ Estações Temáticas (Massas/Hambúrguer) ]`
- `[ Sem preferência ]`

### 2.2. Você tem alguma alergia ou restrição alimentar?
> **Tipo:** Seleção Múltipla

- `[ Nenhuma restrição ]` *(exclusiva)*
- `[ Intolerância à Lactose ]`
- `[ Celíaco / Sem Glúten ]`
- `[ Alergia a Frutos do Mar ]`
- `[ Alergia a Castanhas/Amendoim ]`
- `[ Vegetariano ]`
- `[ Vegano ]`

### 2.3. Qual opção de Menu de Fim de Noite é indispensável?
> **Tipo:** Seleção Única

- `[ Mini Hambúrguer + Fritas ]`
- `[ Pizzas Variadas ]`
- `[ Salgados Fritos ]`
- `[ Churros + Sobremesas ]`
- `[ Não desejo Menu de Fim de Noite ]`

---

## 3. Bebidas & Bar

### 3.1. Qual a modalidade do bar de bebidas?
> **Tipo:** Seleção Única

- `[ Open Bar Completo (Drinks + Cerveja + Destilados) ]`
- `[ Bar Leve (Cerveja + Vinho + Sem Álcool) ]`
- `[ Focado em Caipirinhas & Coquetéis ]`
- `[ Apenas Bebidas Não Alcoólicas ]`
- `[ Sem preferência ]`

### 3.2. Qual bebida não pode faltar no evento?
> **Tipo:** Seleção Única

- `[ Coquetéis / Gin Tônica ]`
- `[ Cerveja / Chopp ]`
- `[ Vodka com Energético ]`
- `[ Refrigerantes e Sucos ]`
- `[ Nenhuma opção específica / Indiferente ]`

---

## 4. Música & Atrações

### 4.1. Quem deve ser a atração musical principal?
> **Tipo:** Seleção Única

- `[ Banda de Eventos / Baile ]`
- `[ DJ de Funk / Eletrônico ]`
- `[ Grupo de Sertanejo / Pagode ]`
- `[ Bateria Universitária / Bloco ]`
- `[ Sem atração ao vivo (Apenas playlist) ]`

### 4.2. Quais ritmos musicais devem tocar durante o evento?
> **Tipo:** Seleção Múltipla

- `[ Pop / Funk ]`
- `[ Pagode / Samba ]`
- `[ Sertanejo ]`
- `[ Rock / Axé ]`
- `[ Eletrônica ]`
- `[ Sem preferência musical ]` *(exclusiva)*

---

## 5. Experiência Visual & Recordações

### 5.1. Como você prefere registrar os momentos do evento?
> **Tipo:** Seleção Única

- `[ Cabine / Totem de Fotos Instantâneas ]`
- `[ Plataforma 360° para Vídeos ]`
- `[ Cobertura focada em Vídeos Curtos (Reels/TikTok) ]`
- `[ Fotógrafo de Pista Tradicional ]`
- `[ Não vejo necessidade desses registros ]`

### 5.2. Quais itens de animação e efeitos agregam ao evento?
> **Tipo:** Seleção Múltipla

- `[ Robô de LED / Interativos ]`
- `[ Kits de Neon, Óculos e Acessórios ]`
- `[ Efeitos de Fumaça & Confetes ]`
- `[ Brindes Personalizados (Ex: Chinelos) ]`
- `[ Nenhum item extra de animação ]` *(exclusiva)*

---

## 6. Estrutura, Segurança & Recepção

### 6.1. Quais serviços de equipe de apoio são prioritários?
> **Tipo:** Seleção Múltipla

- `[ Segurança Privada & Brigadistas ]`
- `[ Mestre de Cerimônias / Apresentador ]`
- `[ Recepcionistas ]`
- `[ Equipe de Limpeza Contínua ]`
- `[ Serviço de Valet / Manobristas ]`
- `[ Nenhum serviço adicional necessário ]` *(exclusiva)*

---

## 7. Traje & Identidade Visual

### 7.1. Qual é o estilo de traje sugerido para os participantes e convidados?
> **Tipo:** Seleção Única

- `[ Gala / Black Tie ]`
- `[ Esporte Fino / Social ]`
- `[ Temático / Fantasia ]`
- `[ Casual / Livre ]`
- `[ Sem preferência ]`

### 7.2. Qual estilo de decoração melhor representa a turma?
> **Tipo:** Seleção Única

- `[ Minimalista & Elegante ]`
- `[ Iluminação Rústica & Aconchegante ]`
- `[ Moderno (Luzes/Telões de LED) ]`
- `[ Temático / Personalizado ]`
- `[ Sem preferência de decoração ]`

---

## 8. Rituais & Pré-Eventos

### 8.1. Gostariam de organizar algum evento antes da festa oficial?
> **Tipo:** Seleção Única

- `[ Churrasco / Encontro Descontraído ]`
- `[ Aula da Saudade / Momento Simbólico ]`
- `[ Culto Ecumênico / Cerimônia Religiosa ]`
- `[ Festa de Contagem Regressiva (100 Dias) ]`
- `[ Nenhum pré-evento ]`

### 8.2. Quais rituais tradicionais devem fazer parte da programação da festa?
> **Tipo:** Seleção Múltipla

- `[ Valsa / Dança Oficial ]`
- `[ Brinde Coletivo com Espumante ]`
- `[ Entrega de Placas / Homenagens ]`
- `[ Retrospectiva em Vídeo ]`
- `[ Nenhum ritual protocolar ]` *(exclusiva)*