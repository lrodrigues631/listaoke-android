# Listaokê Mobile

Aplicativo mobile em Expo/React Native para criar salas de karaokê compartilhadas em tempo real.

O Listaokê permite que uma pessoa crie uma sala, compartilhe um código de 4 números e os convidados entrem para participar da fila. A fila é atualizada em tempo real, o palco gira automaticamente e o dono da sala pode administrar a noite.

## Estado atual do projeto

Core funcional já implementado e testado:

- Criação de sala
- Entrada com código de 4 números
- Supabase Anonymous Auth
- Supabase Realtime
- Fila cíclica
- Palco automático
- Histórico da sala
- Resumo final da sala
- Ranking de músicas cantadas
- Controle de dono e convidado
- Transferência de administração
- Remoção de membros
- Participante manual adicionado pelo dono
- Restauração de sala ao abrir o app
- APK preview funcionando
- Storybook funcionando

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
- Storybook on-device para React Native/Expo

## Estrutura geral

```txt
src/
  config/
  constants/
  controllers/
  models/
  storybook/
    mocks/
    decorators/
  types/
  utils/
  views/
    components/
    screens/

.rnstorybook/
  stories/

docs/
  sql/
