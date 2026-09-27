# Enquetes e Questionários Padrão - App Formandos

Este documento contém o **catálogo padrão**: 10 categorias, 23 perguntas e as opções interativas de resposta usadas para gerar os relatórios automatizados de preferência das turmas.

Ele é a fonte do *seed* do banco de dados. O catálogo padrão é igual para todas as turmas e é somente leitura. Cada administrador pode criar, além dele, **catálogos personalizados** para a sua turma (ver `README.md`).

**Convenções:**

- **Seleção Única:** cada participante escolhe uma opção. Ao votar de novo, o voto anterior é substituído.
- **Seleção Múltipla:** cada participante escolhe várias opções. Ao votar de novo, o conjunto anterior é substituído.
- **Opção exclusiva** (marcada com *(exclusiva)*): opção neutra ou negativa, como "Sem preferência" ou "Nenhuma restrição". Ao marcá-la em uma pergunta múltipla, as demais opções são desmarcadas.
- Os votos são **identificados**: o administrador vê quem votou. Os participantes podem alterar o voto.

---

## 1. Formato do Evento

### 1.1. Qual formato de comemoração a turma prefere?
> **Tipo:** Seleção Única

- `[ Baile de Gala (noite inteira) ]`
- `[ Jantar Dançante (mais íntimo, com a família) ]`
- `[ Churrasco / Festa Descontraída ]`
- `[ Festa Temática ]`
- `[ Viagem de Formatura ]`
- `[ Sem preferência ]`

### 1.2. Qual horário e duração a turma prefere para a festa?
> **Tipo:** Seleção Única

- `[ Diurno (almoço ou tarde) ]`
- `[ Noturno, com cerca de 5 horas ]`
- `[ Noite inteira, até o amanhecer ]`
- `[ Sem preferência ]`

### 1.3. Como deve ser a cerimônia oficial de colação de grau?
> **Tipo:** Seleção Única

- `[ Solene, organizada pela instituição ]`
- `[ Solene, com empresa contratada pela turma ]`
- `[ Sem preferência / Seguir a orientação da instituição ]`

---

## 2. Espaço do Evento

### 2.1. Onde vai ser o nosso evento?
> **Tipo:** Seleção Única

- `[ Salão Clássico ]`
- `[ Espaço ao Ar Livre / Chácara ]`
- `[ Rooftop Urbano ]`
- `[ Espaço Moderno / Industrial ]`
- `[ Sem preferência / Qualquer local ]`

### 2.2. O que é prioridade na localização?
> **Tipo:** Seleção Única

- `[ Próxima à instituição de ensino ]`
- `[ Fácil acesso de transporte (Uber/Ônibus) ]`
- `[ Estacionamento no local ]`
- `[ Região central da cidade ]`
- `[ Sem preferência / Indiferente ]`

---

## 3. Comida & Gastronomia

### 3.1. Como queremos o serviço de alimentação principal?
> **Tipo:** Seleção Única

- `[ Jantar Sentado (Empratado) ]`
- `[ Buffet Self-Service ]`
- `[ Salgados & Finger Foods ]`
- `[ Estações Temáticas (Massas/Hambúrguer) ]`
- `[ Sem preferência ]`

### 3.2. Você tem alguma alergia ou restrição alimentar?
> **Tipo:** Seleção Múltipla

- `[ Nenhuma restrição ]` *(exclusiva)*
- `[ Intolerância à Lactose ]`
- `[ Celíaco / Sem Glúten ]`
- `[ Alergia a Frutos do Mar ]`
- `[ Alergia a Castanhas/Amendoim ]`
- `[ Vegetariano ]`
- `[ Vegano ]`

### 3.3. Qual opção de Menu de Fim de Noite é indispensável?
> **Tipo:** Seleção Única

- `[ Mini Hambúrguer + Fritas ]`
- `[ Pizzas Variadas ]`
- `[ Salgados Fritos ]`
- `[ Churros + Sobremesas ]`
- `[ Café da Manhã Completo ]`
- `[ Não desejo Menu de Fim de Noite ]`

---

## 4. Bebidas & Bar

### 4.1. Qual a modalidade do bar de bebidas?
> **Tipo:** Seleção Única

- `[ Open Bar Completo (Drinks + Cerveja + Destilados) ]`
- `[ Bar Leve (Cerveja + Vinho + Sem Álcool) ]`
- `[ Focado em Caipirinhas & Coquetéis ]`
- `[ Apenas Bebidas Não Alcoólicas ]`
- `[ Sem preferência ]`

### 4.2. Qual bebida não pode faltar no evento?
> **Tipo:** Seleção Única

- `[ Coquetéis / Gin Tônica ]`
- `[ Cerveja / Chopp ]`
- `[ Vodka com Energético ]`
- `[ Refrigerantes e Sucos ]`
- `[ Nenhuma opção específica / Indiferente ]`

---

## 5. Música & Atrações

### 5.1. Quem deve ser a atração musical principal?
> **Tipo:** Seleção Única

- `[ Banda de Eventos / Baile ]`
- `[ DJ de Funk / Eletrônico ]`
- `[ Grupo de Sertanejo / Pagode ]`
- `[ Bateria Universitária / Bloco ]`
- `[ Sem atração ao vivo (Apenas playlist) ]`

### 5.2. Quais ritmos musicais devem tocar durante o evento?
> **Tipo:** Seleção Múltipla

- `[ Pop / Funk ]`
- `[ Pagode / Samba ]`
- `[ Sertanejo ]`
- `[ Rock / Axé ]`
- `[ Eletrônica ]`
- `[ Sem preferência musical ]` *(exclusiva)*

---

## 6. Experiência Visual & Recordações

### 6.1. Como você prefere registrar os momentos do evento?
> **Tipo:** Seleção Única

- `[ Cabine / Totem de Fotos Instantâneas ]`
- `[ Plataforma 360° para Vídeos ]`
- `[ Cobertura focada em Vídeos Curtos (Reels/TikTok) ]`
- `[ Fotógrafo de Pista Tradicional ]`
- `[ Não vejo necessidade desses registros ]`

### 6.2. Quais itens de animação e efeitos agregam ao evento?
> **Tipo:** Seleção Múltipla

- `[ Robô de LED / Interativos ]`
- `[ Kits de Neon, Óculos e Acessórios ]`
- `[ Efeitos de Fumaça & Confetes ]`
- `[ Brindes Personalizados (Ex: Chinelos) ]`
- `[ Nenhum item extra de animação ]` *(exclusiva)*

---

## 7. Estrutura, Segurança & Recepção

### 7.1. Quais serviços de equipe de apoio são prioritários?
> **Tipo:** Seleção Múltipla

- `[ Segurança Privada & Brigadistas ]`
- `[ Mestre de Cerimônias / Apresentador ]`
- `[ Recepcionistas ]`
- `[ Equipe de Limpeza Contínua ]`
- `[ Serviço de Valet / Manobristas ]`
- `[ Nenhum serviço adicional necessário ]` *(exclusiva)*

### 7.2. Quais cuidados com os convidados são importantes?
> **Tipo:** Seleção Múltipla

- `[ Acessibilidade (rampas, banheiros e assentos adaptados) ]`
- `[ Espaço para crianças ]`
- `[ Área de descanso / mais silenciosa ]`
- `[ Descartáveis e decoração sustentáveis ]`
- `[ Nenhum cuidado específico ]` *(exclusiva)*

---

## 8. Traje & Identidade Visual

### 8.1. Qual é o estilo de traje sugerido para os participantes e convidados?
> **Tipo:** Seleção Única

- `[ Gala / Black Tie ]`
- `[ Esporte Fino / Social ]`
- `[ Temático / Fantasia ]`
- `[ Casual / Livre ]`
- `[ Sem preferência ]`

### 8.2. Qual estilo de decoração melhor representa a turma?
> **Tipo:** Seleção Única

- `[ Minimalista & Elegante ]`
- `[ Iluminação Rústica & Aconchegante ]`
- `[ Moderno (Luzes/Telões de LED) ]`
- `[ Temático / Personalizado ]`
- `[ Sem preferência de decoração ]`

### 8.3. Se a festa tiver um tema, qual combina mais com a turma?
> **Tipo:** Seleção Única

- `[ Hollywood / Tapete Vermelho ]`
- `[ Anos 80 e 90 ]`
- `[ Baile de Máscaras ]`
- `[ Las Vegas / Cassino ]`
- `[ Natureza / Boho ]`
- `[ Galáxia / Futurista ]`
- `[ Sem tema definido ]`

---

## 9. Rituais & Pré-Eventos

### 9.1. Gostariam de organizar algum evento antes da festa oficial?
> **Tipo:** Seleção Múltipla

- `[ Churrasco / Encontro Descontraído ]`
- `[ Pool Party / Gincana ]`
- `[ Aula da Saudade / Momento Simbólico ]`
- `[ Culto Ecumênico / Cerimônia Religiosa ]`
- `[ Festa de Contagem Regressiva (100 Dias) ]`
- `[ Comemoração de Meio de Curso ]`
- `[ Nenhum pré-evento ]` *(exclusiva)*

### 9.2. Quais rituais tradicionais devem fazer parte da programação da festa?
> **Tipo:** Seleção Múltipla

- `[ Valsa / Dança Oficial ]`
- `[ Brinde Coletivo com Espumante ]`
- `[ Entrega de Placas / Homenagens ]`
- `[ Retrospectiva em Vídeo ]`
- `[ Homenagem aos Pais e Padrinhos ]`
- `[ Juramento dos Formandos ]`
- `[ Discurso de Paraninfo / Orador da Turma ]`
- `[ Nenhum ritual protocolar ]` *(exclusiva)*

---

## 10. Orçamento & Arrecadação

### 10.1. Como a turma prefere arrecadar o dinheiro da formatura?
> **Tipo:** Seleção Múltipla

- `[ Contribuição Mensal Fixa ]`
- `[ Rifas e Sorteios ]`
- `[ Festas e Eventos para Arrecadar ]`
- `[ Bazar / Venda de Produtos ]`
- `[ Patrocínio de Empresas ]`
- `[ Cota Extra, se faltar dinheiro ]`
- `[ Sem preferência ]` *(exclusiva)*

### 10.2. Onde o orçamento deve ser priorizado?
> **Tipo:** Seleção Múltipla

- `[ Cerimônia de Colação ]`
- `[ Espaço do Evento ]`
- `[ Comida e Bebida ]`
- `[ Música e Atrações ]`
- `[ Fotos e Vídeos ]`
- `[ Decoração ]`
- `[ Sem prioridade definida ]` *(exclusiva)*
