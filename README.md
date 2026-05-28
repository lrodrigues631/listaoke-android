# Listaokê Mobile

App mobile em Expo/React Native para criar salas de karaokê compartilhadas em tempo real.

O Listaokê permite criar uma sala, compartilhar um código de 4 números e organizar a fila da cantoria sem bagunça. O dono administra a sala, os convidados entram pelo código, a fila gira automaticamente e todos veem as atualizações em tempo real.

## Estado atual

Este projeto já possui um core funcional validado:

- App Expo/React Native funcionando
- TypeScript funcionando
- Supabase conectado
- Anonymous Auth funcionando
- Realtime funcionando
- APK preview funcionando
- Storybook on-device funcionando
- Schema público do Supabase salvo em documentação
- Código versionado no GitHub
- Checkpoint estável criado

## Stack

- Expo
- React Native
- TypeScript
- Supabase
- Supabase Anonymous Auth
- Supabase Realtime
- AsyncStorage
- react-native-url-polyfill
- EAS Build
- Storybook para React Native/Expo

## Funcionalidades implementadas

### Sala

- Criar sala
- Entrar em sala com código de 4 números
- Copiar código
- Copiar convite
- Fechar sala
- Restaurar sala ao abrir o app

### Fila

- Entrar na fila
- Sair da fila
- Adiar a própria vez
- Fila cíclica
- Palco automático
- Próxima pessoa chamada automaticamente
- Concluir música e voltar ao fim da fila
- Pular vez e voltar ao fim da fila
- Parar de cantar

### Dono da sala

- Mover pessoas na fila para cima e para baixo
- Remover pessoa da fila
- Remover pessoa do palco
- Concluir apresentação de outra pessoa
- Pular vez de outra pessoa
- Transferir administração da sala
- Remover membro da sala
- Adicionar participante manual, para pessoas sem app

### Participante manual

O dono pode adicionar uma pessoa à fila mesmo que ela não esteja usando o app.

Essa pessoa:

- Aparece como participante manual
- Pode entrar na fila
- Pode subir automaticamente ao palco
- Pode ser controlada pelo dono
- Conta no histórico
- Conta no resumo final
- Conta no ranking de músicas cantadas

### Histórico e resumo

- Histórico da sala com mensagens humanas
- Resumo final ao fechar sala
- Total de músicas cantadas
- Pulos de vez
- Saídas da fila
- Participantes
- Ranking da noite

## Estrutura geral

```txt
src/
  config/
  constants/
  controllers/
  models/
  storybook/
    decorators/
    mocks/
  types/
  utils/
  views/
    components/
    screens/

.rnstorybook/
  stories/

docs/
  sql/

## Push notifications

O app possui push notification Android configurado e validado em APK real.

Fluxo atual:

1. O app cria ou restaura o usuário anônimo via Supabase Auth.
2. O app solicita permissão de notificação no Android.
3. O app gera um Expo Push Token.
4. O token é salvo em `public.push_tokens`.
5. Quando existe alguém no palco e outro membro real vira o primeiro da fila de espera, o Supabase dispara a Edge Function.
6. A Edge Function envia uma notificação para o próximo cantor.
7. A tabela `public.room_next_singer_notifications` evita spam para o mesmo par de cantor atual + próximo cantor.

Mensagem atual da notificação:

```txt
Sua vez esta chegando

Nome, voce e o proximo da fila. Nao some agora.