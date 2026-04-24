# Croop Frontend

Frontend da aplicação Croop, desenvolvido em React Native com Expo. Este módulo é responsável pela interface do usuário, permitindo interação com o sistema de monitoramento e irrigação inteligente.

## Tecnologias utilizadas

- React Native
- Expo
- TypeScript
- React Navigation
- Axios (para comunicação com o backend)

## Sobre o projeto

O frontend do Croop fornece a interface para:

- Visualização das plantas cadastradas
- Monitoramento de umidade do solo
- Visualização de histórico de leituras
- Controle e acompanhamento de irrigações
- Recebimento de notificações
- Gerenciamento de dispositivos IoT

## Estrutura do projeto

```text
croop-frontend/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   └── types/
├── assets/
├── App.tsx
├── package.json
└── tsconfig.json
```

## Navegação

A navegação do aplicativo é estruturada utilizando React Navigation:

- Stack Navigator para fluxos de telas
- Bottom Tabs para áreas principais

Principais fluxos:

- Autenticação (login e cadastro)
- Lista de plantas
- Detalhe da planta
- Histórico de leituras
- Dispositivos IoT
- Configurações

## Configuração do ambiente

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd croop-frontend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Executar o projeto

```bash
npx expo start
```

## Executando no dispositivo

- Instale o aplicativo Expo Go no celular
- Escaneie o QR code exibido no terminal
- O aplicativo será carregado automaticamente

## Integração com o backend

A comunicação com o backend é feita via HTTP, utilizando Axios.

Exemplo de configuração:

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: "http://SEU_BACKEND:8000",
});
```

## Estado atual

- Estrutura inicial criada
- Configuração do Expo concluída
- Navegação em planejamento

## Próximos passos

- Implementar telas principais
- Criar navegação completa
- Integrar com backend (API)
- Implementar autenticação
- Criar componentes reutilizáveis

## Observação

Este repositório corresponde apenas ao frontend mobile. O backend e a integração IoT são mantidos em projetos separados.
