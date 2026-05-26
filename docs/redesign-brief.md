# Redesign Brief — Listaokê Mobile

## 1. Objetivo do redesign

O redesign do Listaokê Mobile tem como objetivo transformar o app de uma ferramenta funcional de fila de karaokê em uma experiência visual mais clara, fluida, moderna e social.

O core técnico do app já está funcional. O foco deste redesign é melhorar:

- hierarquia visual;
- clareza das ações;
- experiência do dono da sala;
- experiência do convidado;
- leitura da fila;
- presença visual do palco;
- compartilhamento do código da sala;
- estados vazios;
- microinterações;
- consistência visual via Storybook.

O app deve continuar simples de usar em um ambiente real de karaokê, onde há barulho, distração, pessoas conversando e pouco tempo para pensar.

A frase-guia do redesign é:

> O convidado entende sua situação em 3 segundos. O dono controla a noite em 2 toques.

---

## 2. Princípios de UX

### 2.1 Clareza antes de estética

O app deve ser bonito, mas a clareza vem primeiro.

Cada tela precisa responder rapidamente:

- onde estou;
- o que está acontecendo;
- o que posso fazer agora;
- qual ação é mais importante.

### 2.2 Dono e convidado não vivem a mesma experiência

O dono precisa de controle.

O convidado precisa de simplicidade.

A interface não deve ser igual para os dois papéis apenas com botões escondidos. Cada papel precisa ter uma hierarquia própria.

### 2.3 A tela da sala é o coração do app

A sala ativa é a experiência principal do Listaokê.

Ela deve priorizar:

- quem está no palco;
- quem é o próximo;
- posição do usuário na fila;
- ações rápidas do dono;
- leitura simples da fila.

### 2.4 O palco deve parecer importante

A pessoa cantando agora não pode parecer apenas mais um item de lista.

O palco é o momento emocional da noite e precisa ter destaque visual.

### 2.5 A fila precisa ser escaneável

A fila deve ser entendida rapidamente.

O usuário precisa bater o olho e entender:

- quem é o próximo;
- onde ele está;
- quantas pessoas faltam;
- se ele está ou não na fila.

### 2.6 Ações perigosas devem ser protegidas

Ações como encerrar sala, remover participante, pular cantor ou sair da fila devem ter peso visual correto.

Essas ações não devem competir com ações principais.

### 2.7 Estados vazios devem orientar

Telas vazias não devem parecer erro.

Todo estado vazio precisa explicar o que está acontecendo e sugerir a próxima ação.

Exemplo:

> Ainda não tem ninguém na fila. Compartilhe o código ou adicione alguém manualmente.

### 2.8 Storybook é checklist visual

Todo componente importante do redesign deve ter stories cobrindo seus principais estados.

O Storybook deve servir como ambiente de validação visual antes de mexer nas telas reais.

Variações com logos, estados vazios, estados de erro, loading, dono e convidado também devem passar pelo Storybook antes de serem integradas ao app real.

---

## 3. Direção visual

O Listaokê Mobile deve ter uma direção visual noturna, moderna e premium, com clima de karaokê, festa e rolê entre amigos.

A estética deve ser:

- dark mode;
- roxo escuro;
- preto;
- magenta;
- lilás neon;
- cards escuros;
- bordas suaves;
- brilho controlado;
- visual limpo;
- divertido, mas não infantil;
- premium, mas não sério demais.

O app deve parecer uma noite de karaokê organizada, não um painel técnico.

Evitar:

- visual infantil;
- excesso de neon;
- estética gamer genérica;
- gradiente em tudo;
- cards brilhando sem motivo;
- textos pequenos;
- telas poluídas;
- botões demais competindo entre si.

### 3.1 Uso de logo e assets oficiais

Os assets de marca oficiais ficam em `resources/` e devem ser tratados como fonte visual da identidade do Listaokê.

Arquivos reais identificados nesta etapa:

- `fav-icon.svg`;
- `fav-icon@2x.png`;
- `fav-icon@3x.png`;
- `logo-horizontal.svg`;
- `logo-horizontal@2x.png`;
- `logo-horizontal@3x.png`;
- `logo-vertical.svg`;
- `logo-vertical@2x.png`;
- `logo-vertical@3x.png`.

Arquivos PNG base esperados quando forem adicionados:

- `fav-icon.png`;
- `logo-horizontal.png`;
- `logo-vertical.png`.

Regras obrigatórias:

1. As logos oficiais não podem ser recoloridas pelo tema.
2. Não aplicar `tintColor`, `fill`, `stroke`, `color` ou `currentColor` nas logos oficiais.
3. PNG deve ser priorizado para `logo-horizontal` e `logo-vertical` quando a intenção for preservar a cor original da marca.
4. SVG pode ser usado para ícones ou fallback, desde que preserve a cor original ou esteja explicitamente marcado como variação monocromática.
5. `logo-vertical`: uso preferencial na `HomeScreen` ou em telas com mais respiro visual.
6. `logo-horizontal`: uso preferencial em `CreateRoomScreen`, `JoinRoomScreen` e áreas compactas.
7. `fav-icon`: uso apenas como ícone pequeno, loading, marca reduzida ou detalhe visual. Ele não deve substituir a configuração nativa do app nesta etapa.
8. `RoomHeader`: pode usar lockup textual compacto em vez da logo oficial se isso melhorar legibilidade e reduzir peso visual.
9. Nunca esticar a logo.
10. Sempre preservar proporção e área de respiro.
11. Em fundo escuro, usar a versão oficial que tenha melhor contraste, sem alterar a cor via código.

Todo uso de logo no redesign deve ser validado em Storybook antes de entrar nas telas reais. As stories de marca devem cobrir versão horizontal, vertical, ícone, fallback SVG quando aplicável, fundo escuro e tamanhos pequeno/grande.

---

## 4. Paleta e atmosfera

### 4.1 Atmosfera

A atmosfera desejada é:

- karaokê noturno;
- bar/rolê;
- palco;
- luz baixa;
- energia social;
- organização;
- diversão;
- expectativa da vez;
- fechamento de noite.

### 4.2 Paleta sugerida

A paleta deve ser baseada nestes grupos:

#### Fundo

- preto profundo;
- roxo quase preto;
- gradientes escuros muito sutis.

#### Superfícies

- cards em roxo escuro;
- cards elevados em preto arroxeado;
- áreas com borda violeta discreta.

#### Acentos

- magenta neon;
- lilás;
- violeta;
- rosa controlado para destaque.

#### Texto

- branco suave para texto principal;
- lilás acinzentado para texto secundário;
- cinza arroxeado para textos de apoio;
- magenta/lilás para labels importantes.

#### Estados

- sucesso: verde menta discreto;
- perigo: vermelho rosado controlado;
- aviso: amarelo quente discreto, se necessário.

### 4.3 Uso do neon

O neon deve ser usado com intenção.

Usar neon em:

- botão principal;
- palco atual;
- código da sala;
- item do usuário na fila;
- feedback de copiar/confirmar;
- resumo final.

Evitar neon em:

- todos os cards;
- todos os textos;
- todos os ícones;
- listas longas;
- ações secundárias.

Neon demais vira carnaval de RGB. O Listaokê precisa de brilho, não de curto-circuito.

---

## 5. Hierarquia das telas

### 5.1 Home

A Home deve funcionar como entrada rápida para o app.

Hierarquia recomendada:

1. Logo/nome Listaokê
2. Frase curta:
   - “Seu karaokê sem bagunça.”
3. Ação principal:
   - “Entrar em uma sala”
4. Ação secundária:
   - “Criar uma sala”
5. Explicação curta:
   - criar ou entrar;
   - entrar na fila;
   - cantar e acompanhar a ordem.

A ação “Entrar em uma sala” deve ter mais destaque que “Criar uma sala”, porque a maioria dos usuários será convidada.

---

### 5.2 Criar sala

A tela de criar sala deve ser rápida e sem burocracia.

Hierarquia recomendada:

1. Título:
   - “Criar sala”
2. Subtítulo:
   - “Monte sua sala e chame a galera para cantar.”
3. Campo:
   - Nome da sala
4. Campo:
   - Seu nome
5. Configurações rápidas recolhidas, se existirem
6. Botão principal:
   - “Criar sala”

Evitar colocar muitas configurações antes da sala existir.

---

### 5.3 Entrar com código

A tela de entrada com código deve ser direta.

Hierarquia recomendada:

1. Título:
   - “Entrar na sala”
2. Instrução curta:
   - “Digite o código que te mandaram.”
3. Campo de código grande e segmentado
4. Botão:
   - “Colar código”
5. Botão principal:
   - “Entrar”
6. Mensagem de erro humana, quando necessário

Mensagem de erro recomendada:

> Esse código não bate. Confere com quem criou a sala.

Evitar mensagens técnicas como:

- erro de request;
- sala inválida;
- erro 404;
- código inexistente.

---

### 5.4 Sala ativa como convidado

A sala do convidado deve ser simples.

Hierarquia recomendada:

1. Header com nome da sala e código
2. Card “Agora no palco”
3. Card “Sua vez” ou “Seu status na fila”
4. Botão principal:
   - Entrar na fila;
   - Sair da fila;
   - Aguardar;
   - Você é o próximo.
5. Prévia da fila
6. Ações secundárias:
   - Ver fila completa;
   - Ver membros;
   - Ver histórico.

O convidado não deve ver controles administrativos.

---

### 5.5 Sala ativa como dono

A sala do dono deve funcionar como mesa de controle.

Hierarquia recomendada:

1. Header com nome da sala, código e badge “Dono”
2. Ações rápidas de código:
   - copiar;
   - compartilhar.
3. Card “No palco”
4. Botão:
   - “Finalizar vez”
5. Card “Próximo”
6. Botão:
   - “Chamar próximo”
7. Ações rápidas:
   - Adicionar cantor;
   - Ver fila;
   - Membros;
   - Histórico.
8. Prévia da fila
9. Ação perigosa:
   - Encerrar sala, com confirmação.

A tela do dono precisa ser funcional antes de ser bonita.

---

### 5.6 Fila de espera

A fila deve deixar clara a ordem de apresentação.

Hierarquia recomendada:

1. Título:
   - “Fila de espera”
2. Card “Próximo”
3. Card “Sua posição”, quando for convidado
4. Lista ordenada da fila
5. Destaque visual no usuário atual
6. Botão:
   - Entrar na fila;
   - Sair da fila.

Para o dono, a fila pode mostrar ações de gerenciamento já existentes.

---

### 5.7 Membros

A tela de membros deve diferenciar claramente:

- quem está na sala;
- quem está na fila;
- quem está no palco;
- quem está fora da fila.

Hierarquia recomendada:

1. Título:
   - “Membros da sala”
2. Contador de pessoas conectadas
3. Ação do dono:
   - “Adicionar participante”
4. Seção:
   - Cantando agora
5. Seção:
   - Na fila
6. Seção:
   - Fora da fila

Convidados devem ver uma versão mais simples, sem controles administrativos.

---

### 5.8 Histórico

O histórico deve parecer memória da noite, não log técnico.

Hierarquia recomendada:

1. Título:
   - “Histórico da noite”
2. Total de apresentações
3. Destaque da noite, se os dados permitirem
4. Linha do tempo de apresentações
5. Estado vazio orientativo

Estado vazio recomendado:

> Ninguém cantou ainda. Quando o primeiro cantor subir ao palco, a história da noite começa aqui.

---

### 5.9 Sala encerrada / resumo final

O resumo final deve parecer o placar final da noite.

Hierarquia recomendada:

1. Título:
   - “Fim do show”
2. Subtítulo:
   - “Aqui está o resumo do rolê.”
3. Total de apresentações
4. Total de participantes
5. Ranking da noite
6. Quem abriu a noite
7. Quem fechou a noite
8. Botão:
   - “Compartilhar resumo”
9. Botão:
   - “Voltar para início”

O resumo pode ser mais celebrativo que o resto do app, mas ainda precisa manter o visual premium.

---

## 6. Diferença entre experiência do dono e do convidado

### 6.1 Convidado

O convidado quer participar sem pensar muito.

Ele precisa saber:

- quem está cantando agora;
- se ele está na fila;
- qual é sua posição;
- quantas pessoas faltam;
- qual botão apertar.

A experiência do convidado deve ter:

- poucas ações;
- texto claro;
- destaque para status pessoal;
- botão principal evidente;
- fila resumida;
- visual leve e direto.

O convidado não deve ver:

- finalizar vez;
- chamar próximo;
- encerrar sala;
- adicionar participante manual;
- remover pessoas;
- controles administrativos.

---

### 6.2 Dono

O dono precisa organizar a noite.

Ele precisa fazer rápido:

- copiar código;
- compartilhar sala;
- ver quem está no palco;
- ver quem é o próximo;
- finalizar vez;
- chamar próximo;
- adicionar cantor manualmente;
- consultar fila;
- consultar membros;
- encerrar sala.

A experiência do dono deve ter:

- ações rápidas;
- cards operacionais;
- botão “Adicionar cantor” fácil de encontrar;
- código da sala sempre acessível;
- fila compacta;
- confirmação para ações perigosas.

A tela do dono não pode esconder as ações principais em menus profundos.

---

## 7. Estrutura ideal da Sala

A Sala é o centro do app.

A estrutura ideal deve ser montada em torno destes blocos:

### 7.1 Header da sala

Deve conter:

- nome da sala;
- código da sala;
- ação de copiar código;
- ação de compartilhar código;
- indicador de papel, quando for dono;
- quantidade de membros, se disponível.

### 7.2 Palco atual

Deve conter:

- label “Agora no palco” ou “No palco”;
- nome do cantor;
- música, se existir;
- artista, se existir;
- estado vazio quando ninguém estiver cantando;
- ação “Finalizar vez”, apenas para dono.

### 7.3 Próximo cantor

Deve conter:

- nome do próximo;
- posição na fila;
- música/artista, se existirem;
- ação “Chamar próximo”, apenas para dono;
- estado vazio quando a fila estiver vazia.

### 7.4 Status do convidado

Deve conter os estados:

- fora da fila;
- na fila;
- próximo;
- no palco.

Textos recomendados:

#### Fora da fila

> Você ainda não está na fila.

Ação:

> Entrar na fila

#### Na fila

> Você está em 3º na fila.

Apoio:

> Faltam 2 pessoas antes de você.

Ação:

> Sair da fila

#### Próximo

> Você é o próximo.

Apoio:

> Já vai escolhendo a música.

#### No palco

> Você está no palco.

Apoio:

> Boa apresentação!

### 7.5 Fila resumida

Deve conter:

- próximos 3 a 5 participantes;
- posição de cada participante;
- destaque do usuário atual;
- botão “Ver fila completa”.

### 7.6 Ações rápidas do dono

Ações recomendadas:

- Adicionar cantor;
- Ver fila;
- Membros;
- Histórico;
- Copiar código;
- Compartilhar;
- Encerrar sala.

A ação “Encerrar sala” deve ser visualmente separada e exigir confirmação.

---

## 8. Estados obrigatórios no Storybook

O Storybook deve ser usado como checklist visual do redesign.

### 8.1 Componentes base

Criar stories para:

- Screen;
- AppHeader;
- Card;
- SectionTitle;
- PrimaryButton;
- SecondaryButton;
- GhostButton;
- DangerButton;
- IconButton;
- Badge;
- EmptyState;
- RoomCodeChip.

Estados obrigatórios:

- padrão;
- loading;
- disabled;
- pressed, se aplicável;
- erro, se aplicável;
- com conteúdo curto;
- com conteúdo longo.

---

### 8.2 Componentes da sala

Criar stories para:

- StageCard;
- NextSingerCard;
- MyQueueStatusCard;
- QueuePreview;
- QueueListItem;
- MemberListItem;
- HistoryTimelineItem;
- SummaryRankingItem;
- QuickActionButton.

Estados obrigatórios:

#### StageCard

- com cantor no palco;
- vazio;
- versão dono;
- versão convidado.

#### NextSingerCard

- com próximo cantor;
- fila vazia;
- versão dono com botão;
- versão convidado somente leitura.

#### MyQueueStatusCard

- fora da fila;
- na fila;
- próximo;
- no palco.

#### QueuePreview

- fila vazia;
- fila curta;
- fila longa;
- usuário atual destacado.

#### QueueListItem

- normal;
- próximo;
- usuário atual;
- modo dono;
- modo convidado.

#### MemberListItem

- cantando agora;
- na fila;
- fora da fila.

#### HistoryTimelineItem

- item comum;
- primeiro da noite;
- destaque;
- último da noite.

#### SummaryRankingItem

- primeiro lugar;
- posição comum;
- sem ranking.

---

### 8.3 Telas

Criar ou atualizar stories para:

#### Home

- padrão;
- com sala recente, se existir;
- loading, se existir.

#### Criar sala

- campos vazios;
- campos preenchidos;
- criando sala;
- erro.

#### Entrar com código

- código vazio;
- código parcialmente preenchido;
- código válido;
- código inválido;
- entrando na sala.

#### Sala como convidado

- fora da fila;
- na fila;
- próximo;
- no palco;
- fila vazia;
- ninguém no palco;
- sala encerrada.

#### Sala como dono

- com pessoa no palco;
- sem pessoa no palco;
- fila vazia;
- fila cheia;
- adicionando participante manual;
- confirmação de encerrar sala;
- código copiado;
- próximo disponível;
- sem próximo.

#### Fila

- vazia;
- curta;
- longa;
- usuário destacado;
- dono gerenciando.

#### Membros

- poucos membros;
- muitos membros;
- pessoa no palco;
- pessoas na fila;
- pessoas fora da fila.

#### Histórico

- vazio;
- curto;
- longo;
- com participante repetido;
- com destaque.

#### Resumo final

- poucas apresentações;
- ranking completo;
- sala encerrada sem apresentações.

---

## 9. Microinterações e animações sugeridas

As microinterações devem reforçar clareza, não decorar a interface à toa.

### 9.1 Copiar código

Quando o usuário copiar o código:

- mostrar toast:
  - “Código copiado.”
- aplicar brilho rápido no chip do código;
- usar feedback tátil leve, se já houver suporte.

### 9.2 Compartilhar código

Ao tocar em compartilhar:

- abrir compartilhamento nativo, se já existir;
- manter o código em destaque;
- feedback visual simples após ação.

Texto sugerido:

> Entre na minha sala do Listaokê: 7X3K9

### 9.3 Entrar na fila

Ao entrar na fila:

- botão entra em loading;
- card de status aparece com fade/slide leve;
- toast:
  - “Você entrou na fila.”
- usuário aparece destacado na fila.

### 9.4 Sair da fila

Ao sair da fila:

- pedir confirmação se necessário;
- toast:
  - “Você saiu da fila.”
- atualizar status para fora da fila.

### 9.5 Chamar próximo

Ao chamar próximo:

- card do próximo deve fazer transição para o palco;
- StageCard recebe glow rápido;
- fila reorganiza suavemente;
- evitar mudanças bruscas sem feedback visual.

### 9.6 Finalizar vez

Ao finalizar vez:

- botão mostra loading;
- cantor sai do palco;
- próximo fica mais evidente;
- se não houver próximo, mostrar estado vazio orientativo.

### 9.7 Adicionar participante manual

Ao tocar em “Adicionar cantor”:

- abrir bottom sheet ou modal curto;
- campo de nome já focado;
- botão “Adicionar à fila”;
- após adicionar:
  - fechar bottom sheet;
  - mostrar toast:
    - “Nome entrou na fila.”
  - novo participante aparece destacado rapidamente.

### 9.8 Encerrar sala

Ao tocar em “Encerrar sala”:

- abrir confirmação;
- texto claro:
  - “Encerrar a sala finaliza a noite e gera o resumo.”
- botões:
  - “Cancelar”
  - “Encerrar sala”

Após encerrar:

- transição para o resumo final;
- animação sutil de fechamento;
- evitar qualquer efeito exagerado.

### 9.9 Resumo final

No resumo final:

- entrada suave dos cards principais;
- ranking aparece com leve stagger;
- botão de compartilhar destacado;
- visual mais celebrativo, mas controlado.

---

## 10. O que o Codex pode alterar

O Codex pode alterar:

- estilos visuais;
- componentes de UI;
- organização visual das telas;
- hierarquia de elementos;
- textos de interface;
- estados vazios;
- stories do Storybook;
- mocks visuais do Storybook;
- componentes base de design system;
- componentes específicos da sala;
- espaçamentos;
- cores;
- bordas;
- sombras;
- microinterações visuais;
- animações leves;
- modais e bottom sheets visuais, se não alterarem regra de negócio;
- estrutura visual das telas, desde que preservem os fluxos existentes.

O Codex pode criar:

- arquivos de tema/tokens;
- componentes visuais reutilizáveis;
- stories novas;
- mocks visuais para Storybook;
- documentação visual auxiliar, se necessário.

---

## 11. O que o Codex não pode alterar

O Codex não pode alterar:

- Supabase;
- SQL;
- migrations;
- controllers;
- models;
- autenticação;
- realtime;
- regras de negócio da fila;
- regras de palco automático;
- lógica de entrada em sala;
- lógica de encerramento de sala;
- contratos de dados existentes;
- nomes de campos vindos do banco;
- estrutura de dados sem necessidade;
- fluxos funcionais já validados;
- integrações já funcionando.

O Codex não deve:

- refazer o app do zero;
- trocar a arquitetura principal;
- criar funcionalidades novas sem autorização;
- remover funcionalidades existentes;
- alterar comportamento do app para “facilitar” o redesign;
- transformar componente visual em dependência direta do Supabase;
- fazer stories dependerem de dados reais;
- misturar refactor técnico com redesign visual.

O core técnico deve permanecer preservado durante o redesign: mudanças visuais não podem alterar contratos de dados, regras de fila, regras de palco, autenticação, realtime, controllers ou models.

Se algum ajuste técnico for necessário para viabilizar o redesign, o Codex deve explicar antes de alterar.

---

## 12. Ordem recomendada de implementação

A implementação deve ser incremental e validada pelo Storybook.

### Etapa 1: Análise e plano

Antes de alterar arquivos:

1. mapear telas atuais;
2. mapear componentes existentes;
3. mapear stories existentes;
4. identificar tema/estilos;
5. apresentar plano curto.

Nenhuma alteração visual deve ser feita antes desse plano.

---

### Etapa 2: Design system

Criar ou organizar:

- tokens de cor;
- tipografia;
- espaçamentos;
- radius;
- shadows/glow;
- componentes base.

Componentes principais:

- Screen;
- AppHeader;
- Card;
- Button;
- Badge;
- EmptyState;
- RoomCodeChip.

Validar tudo no Storybook.

---

### Etapa 3: Componentes da sala

Criar componentes reutilizáveis:

- StageCard;
- NextSingerCard;
- MyQueueStatusCard;
- QueuePreview;
- QueueListItem;
- MemberListItem;
- HistoryTimelineItem;
- SummaryRankingItem;
- QuickActionButton.

Todos devem funcionar por props e com mocks.

Não conectar diretamente ao Supabase.

---

### Etapa 4: Telas de entrada

Redesenhar:

1. Home;
2. Criar sala;
3. Entrar com código;
4. Sala criada / compartilhar código;
5. Identificação do participante, se existir.

Validar estados no Storybook.

---

### Etapa 5: Sala do convidado

Redesenhar a sala ativa do convidado com foco em:

- palco atual;
- status pessoal;
- entrar/sair da fila;
- próximos da fila;
- ações secundárias mínimas.

Validar no Storybook:

- fora da fila;
- na fila;
- próximo;
- no palco;
- fila vazia;
- ninguém no palco.

---

### Etapa 6: Sala do dono

Redesenhar a sala ativa do dono com foco em:

- palco atual;
- próximo cantor;
- finalizar vez;
- chamar próximo;
- adicionar cantor manualmente;
- código da sala;
- fila compacta;
- encerrar sala com confirmação.

Validar no Storybook:

- pessoa no palco;
- ninguém no palco;
- fila vazia;
- fila cheia;
- adicionar participante;
- encerrar sala;
- código copiado.

---

### Etapa 7: Telas complementares

Redesenhar:

1. Fila;
2. Membros;
3. Histórico;
4. Resumo final.

Validar todos os estados no Storybook.

---

### Etapa 8: Revisão visual

Revisar:

- contraste;
- consistência de botões;
- cards;
- espaçamentos;
- uso do neon;
- textos;
- estados vazios;
- diferença entre dono e convidado;
- ações perigosas;
- responsividade mobile.

---

### Etapa 9: Checagem final

Antes de considerar o redesign pronto:

1. rodar TypeScript;
2. rodar testes existentes;
3. abrir Storybook;
4. testar fluxos principais no app;
5. confirmar que o core técnico não foi alterado;
6. revisar arquivos alterados;
7. gerar relatório final.

---

## Resumo de decisão

Este redesign não é uma reconstrução técnica.

É uma reorganização visual e de experiência para deixar o Listaokê Mobile mais claro, mais bonito, mais fluido e mais adequado ao uso real em uma noite de karaokê.

O foco é:

- convidado simples;
- dono funcional;
- palco em destaque;
- fila clara;
- código fácil de compartilhar;
- resumo final memorável;
- Storybook como validação visual.

O app deve parecer uma experiência social organizada, não apenas uma lista funcionando.
