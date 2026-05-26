# Listaokê Mobile — Contexto para refinamento da fila compacta

## Estado geral do projeto

O Listaokê Mobile é um app Expo/React Native com TypeScript, Supabase, Realtime, Storybook e build Android funcionando.

O core funcional já foi validado:
- criação de sala;
- entrada por código de 4 números;
- autenticação anônima Supabase;
- realtime entre aparelhos;
- fila cíclica;
- palco automático;
- dono gerenciando fila e membros;
- participante manual adicionado pelo dono;
- histórico da sala;
- resumo final;
- APK preview funcionando em celulares reais.

O projeto já foi salvo no GitHub e possui checkpoints/tags anteriores.

## Situação atual

Durante o redesign visual, o componente da fila ficou visualmente ruim no mobile.

Problema observado:
- os itens da fila ficaram altos demais;
- botões ocupam muito espaço;
- a fila ficou pesada visualmente;
- o card de cada pessoa parece grande demais para uma ação simples;
- o dono precisa controlar a fila rapidamente, mas a UI atual exige esforço visual.

## Decisão de produto

Não implementar drag and drop agora.

Motivo:
Drag and drop é uma feature maior, envolvendo:
- gesto;
- animação;
- permissões diferentes para dono e convidado;
- persistência de ordem;
- realtime;
- possível ajuste em Supabase/RPC;
- atualização de Storybook;
- testes em Android real.

Antes disso, será feita uma versão compacta e estável da fila.

## Objetivo desta etapa

Criar uma fila compacta, bonita e fácil de usar no mobile.

A fila deve:
- ocupar menos altura;
- mostrar claramente posição, nome e tipo do participante;
- permitir ao dono mover e remover pessoas rapidamente;
- evitar botões grandes;
- usar ícones ou botões pequenos;
- manter a regra de negócio atual;
- não alterar Supabase;
- não alterar controllers;
- não alterar models;
- não alterar autenticação;
- não alterar realtime.

## Layout desejado para cada item da fila

Estrutura visual ideal:

[1] Nome da pessoa                         lixeira
    Adicionado pelo dono / Convidado / Você
    botão pequeno subir    botão pequeno descer

## Regras de interação

Dono:
- vê ações para todos os itens da fila;
- pode subir pessoa;
- pode descer pessoa;
- pode remover pessoa da fila;
- ações devem ser pequenas e claras.

Convidado:
- não vê controles administrativos de outras pessoas;
- vê apenas a própria posição;
- suas ações principais continuam no card "Minha participação".

Participante manual:
- aparece como "Manual" ou "Adicionado pelo dono";
- pode ser movido/removido apenas pelo dono.

## Escopo técnico da etapa

Arquivos prováveis:
- src/views/components/room/QueueCard.tsx
- .rnstorybook/stories/QueueCard.stories.tsx, somente se quebrar props ou visual do Storybook

Evitar mexer em:
- src/controllers
- src/models
- Supabase
- SQL
- app.json
- autenticação
- realtime

## Resultado esperado

Fila mais compacta e utilizável.

Critérios de aceite:
- item da fila não estoura largura do celular;
- item ocupa pouca altura;
- lixeira aparece no canto superior direito do item;
- subir/descer aparecem como ações pequenas;
- participante manual continua identificado;
- dono consegue mover/remover;
- convidado não vê ações administrativas indevidas;
- TypeScript passa;
- Storybook abre;
- app normal abre.

## Comandos de validação

TypeScript:

npx.cmd tsc --noEmit

App normal:

npx.cmd expo start --lan --clear

Storybook:

npm run sb:clear