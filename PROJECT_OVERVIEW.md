# croop-frontend — Project Overview

Documento de referência técnica para o frontend mobile do Croop.
Atualizado em maio de 2026 com base na análise do DRS (Documento de Requisitos de Software).

---

## 1. Visão Geral

Frontend mobile do sistema Croop — plataforma de monitoramento e irrigação
inteligente de plantas via IoT. Desenvolvido em React Native com Expo,
voltado para dispositivos Android (primário) e iOS, com suporte secundário a Web.

**O que o Croop faz:**
O usuário cadastra plantas com espécie, ambiente e parâmetros de umidade.
Cada planta pode ser vinculada a um dispositivo IoT (ESP32 com sensor de
umidade do solo). O backend monitora continuamente a umidade, decide
automaticamente quando irrigar com base nos parâmetros da espécie, e notifica
o usuário sobre eventos críticos. O usuário também pode acionar irrigação manual
com proteção contra excesso de água.

**Responsabilidade do frontend:**
O app é a interface de controle e observabilidade. Ele não executa lógica de
irrigação, não calcula cronogramas e não decide quando notificar — isso é
responsabilidade do backend. O app apresenta resultados, recebe comandos
do usuário e exibe estados em tempo real.

O projeto está em estado de bootstrap: a infraestrutura de base (Expo,
TypeScript, CI) está configurada, mas a camada de aplicação (telas,
navegação, serviços, componentes) ainda não foi implementada.

---

## 2. Stack Utilizada

| Tecnologia         | Versão     | Papel                                      |
|--------------------|------------|--------------------------------------------|
| React Native       | 0.81.5     | Framework mobile                           |
| Expo               | ~54.0.33   | Toolchain, build e runtime                 |
| React              | 19.1.0     | Camada de UI                               |
| TypeScript         | ~5.9.2     | Tipagem estática (strict mode)             |
| expo-status-bar    | ~3.0.9     | Controle da status bar nativa              |
| react-native-web   | ^0.21.0    | Suporte a Web via Expo                     |
| react-dom          | 19.1.0     | Renderização web                           |
| ESLint             | ^9.0.0     | Linting (flat config, preset expo)         |

**Não instaladas, mas previstas:**
- `@react-navigation/*` — navegação entre telas
- `axios` — comunicação HTTP com o backend

---

## 3. Arquitetura do Aplicativo

O projeto segue a arquitetura de camadas padrão para apps React Native:

```
Entry point (index.ts)
  └── Root component (App.tsx)
        ├── Providers (NavigationContainer, tema, auth) [não implementado]
        └── Navigator raiz [não implementado]
              ├── AuthNavigator (login, cadastro) [não implementado]
              └── AppNavigator (bottom tabs + stacks) [não implementado]
                    ├── Screens (orquestração de UI)
                    ├── Components (UI reutilizável)
                    ├── Services (HTTP, regras de acesso à API)
                    └── Types (contratos TypeScript)
```

**Nova arquitetura do React Native habilitada** (`newArchEnabled: true` no
`app.json`). Isso usa JSI e Fabric em vez da bridge clássica. Toda lib
adicionada deve ser verificada quanto à compatibilidade com a new arch.

---

## 4. Estrutura de Pastas

### Estado atual (o que existe)

```
croop-frontend/
├── .expo/                        # cache local do Expo (não versionado)
├── .github/
│   └── workflows/
│       ├── ci.yml                # pipeline de validação (type check, lint, expo config)
│       └── auto-pr.yml           # automação de criação e merge de PRs
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png         # Android adaptive icon
│   ├── splash-icon.png
│   └── favicon.png               # Web
├── scripts/
│   └── create_frontend_issues.ps1  # utilitário de criação de issues no GitHub
├── App.tsx                       # componente raiz (placeholder)
├── index.ts                      # entry point do Expo
├── app.json                      # configuração Expo
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

### Estrutura planejada (documentada no README, não criada)

```
src/
├── screens/       # telas da aplicação
├── components/    # componentes reutilizáveis
├── navigation/    # definição dos navigators e rotas
├── services/      # comunicação com o backend (Axios)
├── types/         # interfaces e tipos TypeScript
└── theme/         # cores, espaçamentos, tipografia
```

---

## 5. Principais Módulos

### Módulos de infraestrutura

| Módulo           | Localização prevista     | Status          |
|------------------|--------------------------|-----------------|
| Entry point      | `index.ts`               | Implementado    |
| Root component   | `App.tsx`                | Placeholder     |
| Navegação        | `src/navigation/`        | Não criado      |
| Telas            | `src/screens/`           | Não criado      |
| Componentes      | `src/components/`        | Não criado      |
| Serviços / HTTP  | `src/services/`          | Não criado      |
| Tipos            | `src/types/`             | Não criado      |
| Tema / constantes| `src/theme/`             | Não criado      |

### Módulos de domínio (derivados do DRS)

| Módulo de Domínio | Responsabilidade no frontend |
|-------------------|------------------------------|
| `auth`            | Login, cadastro, sessão JWT, proteção de rotas |
| `plants`          | Catálogo, cadastro (3 telas), edição, detalhe, remoção |
| `devices`         | Associação planta-dispositivo, status do sensor |
| `irrigation`      | Irrigação manual com pop-up de segurança, histórico de ações |
| `monitoring`      | Leituras de umidade atuais, estado da planta em tempo real |
| `schedule`        | Cronograma de cuidados gerado pelo backend/IA |
| `notifications`   | Recebimento push, listagem de alertas, deep link |
| `history`         | Histórico de eventos por planta (gráfico + tabela paginada) |
| `profile`         | Dados do usuário, logout, configurações pessoais |

---

## 6. Fluxos Principais

### 6.1 Inicialização do App

```
package.json ("main": "index.ts")
  └── index.ts
        └── registerRootComponent(App)   ← Expo registra o componente raiz
              └── App.tsx                ← componente raiz é renderizado
```

`registerRootComponent` garante compatibilidade entre Expo Go e builds
nativos standalone. Não deve ser substituído por `AppRegistry` diretamente.

### 6.2 Navegação

**Estado atual:** não implementada.

**Árvore de navegação completa planejada:**
```
App.tsx
└── NavigationContainer
      └── RootNavigator (Stack)
            │
            ├── [Sem sessão] AuthNavigator (Stack)
            │     ├── LoginScreen
            │     └── RegisterScreen
            │
            └── [Com sessão] AppNavigator (Bottom Tabs)
                  │
                  ├── Tab: Home
                  │     └── HomeScreen
                  │           (dashboard: resumo do catálogo, agenda semanal, alertas)
                  │
                  ├── Tab: Plantas
                  │     └── PlantsStack (Stack)
                  │           ├── PlantListScreen
                  │           ├── PlantDetailScreen
                  │           │     ├── → HistoryScreen
                  │           │     └── Modal: IrrigateConfirmModal (pop-up RN-009)
                  │           ├── PlantCreateStep1Screen  ← espécie + nome
                  │           ├── PlantCreateStep2Screen  ← ambiente + luz
                  │           ├── PlantCreateStep3Screen  ← confirmação
                  │           └── PlantEditScreen
                  │
                  ├── Tab: Dispositivos
                  │     └── DevicesStack (Stack)
                  │           ├── DeviceListScreen
                  │           └── DeviceAssociateScreen
                  │
                  └── Tab: Notificações
                        └── NotificationsScreen
```

**Regras de navegação:**
- `RootNavigator` controla a alternância Auth ↔ App com base no estado de sessão
- Durante verificação de sessão na inicialização, exibir splash/loading para evitar flicker
- Notificações push recebidas devem navegar diretamente para a tela relevante (deep link)
- A tipagem de rotas deve ser definida em `src/types/navigation.ts` antes dos navigators

### 6.3 Renderização de Telas

Telas devem:
- Viver em `src/screens/`
- Conhecer a navegação (recebem `navigation` e `route` como props)
- Orquestrar chamadas a services e composição de components
- Não conter lógica de negócio diretamente

### 6.4 Componentes Reutilizáveis

Componentes devem:
- Viver em `src/components/`
- Ser cegos à navegação
- Receber dados via props
- Não fazer chamadas a serviços diretamente

Componentes necessários identificados no DRS:
- Leitura atual de umidade (valor %, data/hora, indicador visual de status)
- Gráfico de histórico de umidade por período
- Tabela de eventos de irrigação (data/hora, tipo manual/automático, status)
- Estados reutilizáveis: loading, erro, vazio (estado vazio bem elaborado para onboarding)
- Pop-up modal de confirmação de irrigação com umidade alta (RN-009)

### 6.5 Comunicação com Backend

**Estado atual:** Axios não instalado, nenhuma chamada HTTP existe.

**Services previstos por domínio:**
```
src/services/api.ts                ← instância Axios centralizada (baseURL, interceptors)
src/services/authService.ts        ← login, cadastro, refresh token
src/services/plantsService.ts      ← CRUD de plantas
src/services/devicesService.ts     ← associação planta-dispositivo
src/services/irrigationService.ts  ← irrigação manual, histórico de ações
src/services/monitoringService.ts  ← leituras de umidade atuais
src/services/scheduleService.ts    ← cronograma gerado pelo backend
src/services/notificationService.ts← listagem de notificações, registro de token push
src/services/historyService.ts     ← histórico paginado por planta
```

A URL base do backend deve vir de variável de ambiente, nunca hardcoded.
Mecanismo recomendado: `app.config.ts` dinâmico com `expo-constants`.

O interceptor de resposta deve capturar `401 Unauthorized` e redirecionar
para Login (token expirado ou inválido).

### 6.6 Tratamento de Estados e Erros

Não implementado. Quando criado, cada tela precisará gerenciar:
- Estado de carregamento (loading)
- Estado de erro (falha de rede, erro da API)
- Estado vazio (sem dados — importante para onboarding)
- Estado de sucesso (dados renderizados)

Nenhuma lib de gerenciamento de estado global (Redux, Zustand, Context)
foi instalada. A decisão ainda não foi tomada. O token JWT, dados do usuário
autenticado e estado de notificações não lidas precisarão de estado global.

---

## 7. Configuração do Expo

Arquivo: `app.json`

| Campo                                  | Valor              | Observação                                |
|----------------------------------------|--------------------|-------------------------------------------|
| `name`                                 | croop-frontend     |                                           |
| `slug`                                 | croop-frontend     | Identificador único no Expo               |
| `version`                              | 1.0.0              |                                           |
| `orientation`                          | portrait           | Bloqueado em retrato                      |
| `newArchEnabled`                       | true               | New Architecture (JSI/Fabric) ativa       |
| `ios.supportsTablet`                   | true               | iPad habilitado                           |
| `android.edgeToEdgeEnabled`            | true               | Layout edge-to-edge                       |
| `android.predictiveBackGestureEnabled` | false              | Gesto preditivo de back desabilitado      |
| Web                                    | favicon configurado|                                           |

**Não configurado:** EAS Build (`eas.json`). Sem isso não é possível gerar
builds para distribuição (TestFlight, Play Store) nem usar `expo-notifications`
em produção.

**Scripts disponíveis:**
```
npm run start      → expo start
npm run android    → expo start --android
npm run ios        → expo start --ios
npm run web        → expo start --web
npm run lint       → expo lint
```

---

## 8. Uso de TypeScript

Arquivo: `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

- Herda configuração base do Expo (paths, módulos, JSX)
- `strict: true` ativa todas as checagens rigorosas (noImplicitAny,
  strictNullChecks, strictFunctionTypes, etc.)
- CI valida TypeScript via `npx tsc --noEmit` a cada push

**Tipos de aplicação:** nenhum definido ainda. Quando criados, devem viver
em `src/types/`. A tipagem das rotas de navegação (`RootParamList`) é
bloqueante para o TypeScript funcionar corretamente com React Navigation.

---

## 9. Uso de React Navigation

**Estado atual:** `@react-navigation/*` **não está instalado**.

**Pacotes necessários quando implementar:**
```
@react-navigation/native
@react-navigation/native-stack
@react-navigation/bottom-tabs
react-native-screens
react-native-safe-area-context
```

**Padrão de tipagem esperado (`src/types/navigation.ts`):**
```ts
export type RootParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppParamList = {
  Plants: undefined;
  PlantDetail: { id: string };
  PlantCreateStep1: undefined;
  PlantCreateStep2: { name: string; species: string };
  PlantCreateStep3: { name: string; species: string; environment: string; light: string };
  PlantEdit: { id: string };
  History: { plantId: string };
  Devices: undefined;
  DeviceAssociate: { plantId: string };
  Notifications: undefined;
  Schedule: undefined;
};
```

Todos os navigators devem ser criados tipados a partir desses tipos.

---

## 10. Uso Previsto de Axios / Services

**Estado atual:** `axios` **não está instalado**.

**Padrão esperado quando implementado:**

```ts
// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,  // via variável de ambiente
});

api.interceptors.request.use((config) => {
  // adicionar token de autenticação
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 → redirecionar para Login (token expirado)
    return Promise.reject(error);
  }
);
```

Services específicos por domínio consomem essa instância e são os únicos
pontos do código que fazem chamadas HTTP. Telas e componentes nunca chamam
`api` diretamente.

---

## 11. Configuração de CI

### `ci.yml` — Validação de Qualidade

- **Gatilhos:** push em qualquer branch + PRs para `main`
- **Runner:** `ubuntu-latest`, Node 20
- **Passos:** checkout → `npm ci` → `tsc --noEmit` → `expo lint` → `expo config --type public`
- **Sem testes:** o pipeline não executa nenhum teste automatizado

### `auto-pr.yml` — Automação de Pull Requests

- **Gatilho:** push em qualquer branch exceto `main`
- **Comportamento:**
  1. Extrai número de issue do nome da branch (ex: `26-feature` → `#26`)
  2. Cria PR automaticamente se não existir
  3. Habilita auto-merge com squash imediatamente
- **Títulos gerados:** `Resolve issue #N` / `Closes #N`
- **Risco:** auto-merge é habilitado antes do CI concluir. Depende de
  branch protection rules no GitHub para ser seguro.

---

## 12. Padrões Identificados

| Padrão                            | Onde aplicar                                  |
|-----------------------------------|-----------------------------------------------|
| Entry via `registerRootComponent` | Manter em `index.ts`, não alterar             |
| Strict TypeScript                 | Manter `strict: true` no `tsconfig.json`      |
| Um service por domínio            | `src/services/[dominio]Service.ts`            |
| Instância Axios centralizada      | `src/services/api.ts` — única fonte de HTTP   |
| Tipos antes da implementação      | Definir `RootParamList` antes dos navigators  |
| Tema centralizado                 | `src/theme/` antes da primeira tela           |
| Screens orquestram, não processam | Lógica de negócio fica nos services           |
| Components cegos à navegação      | Componentes recebem dados por props           |
| Branch nomeada com issue          | `<número>-descricao` para auto-PR funcionar   |

---

## 13. Pontos Críticos

1. **`react-navigation` e `axios` não estão instalados.** Qualquer
   implementação de tela ou integração com backend falhará no build sem
   instalá-los primeiro.

2. **Sem `src/`:** toda a estrutura de aplicação precisa ser criada do
   zero antes de qualquer tela.

3. **Auto-merge habilitado antes do CI concluir.** Branch protection rules
   no GitHub devem exigir CI verde como pré-requisito para o auto-merge
   ser seguro.

4. **Sem gestão de variáveis de ambiente.** A URL do backend não pode ser
   hardcoded. Resolver antes de qualquer chamada HTTP.

5. **Sem EAS Build configurado.** Sem `eas.json` não é possível gerar
   builds para distribuição nas stores nem usar push notifications em produção.

6. **Sem autenticação definida.** Nenhuma decisão foi tomada sobre JWT,
   AsyncStorage vs SecureStore, refresh token. Quanto mais telas forem
   construídas antes dessa decisão, maior o retrabalho.

7. **Sem estado global definido.** Token JWT, dados do usuário e estado de
   notificações não lidas precisam de solução antes de qualquer tela autenticada.

---

## 14. Riscos Técnicos e Arquiteturais

| Risco                                         | Severidade | Descrição                                                                         |
|-----------------------------------------------|------------|-----------------------------------------------------------------------------------|
| `newArchEnabled: true` + libs não compatíveis | Alta       | JSI/Fabric quebra libs que usam bridge clássica. Validar cada nova dependência. Gráficos e push notifications são os mais sensíveis. |
| React 19.1 + RN 0.81 — stack recente          | Média      | Ecossistema de libs pode não ter suporte completo.                                |
| Biblioteca de gráficos + New Arch             | Alta       | UC-010 exige gráfico de histórico. Escolher lib compatível com JSI/Fabric antes de implementar. |
| Push notifications + EAS não configurado      | Alta       | `expo-notifications` requer EAS Build para funcionar em builds de produção.       |
| Mecanismo de atualização de sensor indefinido | Alta       | Polling vs WebSocket não está definido no DRS. Impacta a arquitetura de services e estado. |
| Auto-merge sem gate de testes                 | Alta       | Código quebrado pode chegar à `main` se CI não for exigido pelo branch protection.|
| Sem testes automatizados                      | Alta       | Type check e lint não detectam erros de lógica, integração ou UX.                |
| URL do backend hardcoded                      | Alta       | Vaza dados de infraestrutura se commitada.                                        |
| Sem decisão de autenticação                   | Média      | Retrabalho cresce linearmente com telas criadas antes da decisão.                 |
| Sem EAS configurado                           | Baixa      | Bloqueia distribuição quando necessário, mas não bloqueia desenvolvimento local.  |

---

## 15. Recomendações para Futuras Sessões de Desenvolvimento

**Antes de implementar qualquer tela:**

1. Instalar `@react-navigation/native`, `@react-navigation/native-stack`,
   `@react-navigation/bottom-tabs`, `react-native-screens`,
   `react-native-safe-area-context`
2. Instalar `axios`
3. Criar `src/types/navigation.ts` com o `RootParamList` tipado
4. Criar `src/theme/colors.ts` e `src/theme/spacing.ts`
5. Criar `src/services/api.ts` com instância Axios e variável de ambiente
6. Decidir estratégia de autenticação (token storage, refresh)
7. Decidir solução de estado global (Zustand recomendado pela simplicidade)
8. Configurar variável de ambiente para `baseURL` via `app.config.ts`
9. Pesquisar e decidir biblioteca de gráficos compatível com New Arch

**Ao criar cada tela:**
- Criar em `src/screens/`
- Criar componentes reutilizáveis em `src/components/`
- Toda chamada HTTP passa por um service em `src/services/`
- Nunca usar valores de cor, fonte ou espaçamento fora do tema

**Para o CI:**
- Configurar branch protection no GitHub exigindo CI verde antes do auto-merge
- Adicionar Jest + Testing Library quando as primeiras telas estiverem prontas

**Para distribuição:**
- Criar `eas.json` quando o app estiver próximo da primeira release

---

## 16. Domínio do Sistema — Casos de Uso

O DRS define 10 casos de uso. Abaixo o resumo com indicação de quem executa
cada um e o impacto no frontend.

### Casos de uso executados pelo usuário (frontend é autor da ação)

| UC | Nome | Impacto no Frontend |
|----|------|---------------------|
| UC-001 | Realizar Cadastro de Usuário | Tela de cadastro com validação inline (nome, CPF, email, senha) |
| UC-002 | Realizar Login | Tela de login, persistência de token, guard de navegação |
| UC-003 | Gerenciar Catálogo de Plantas (CRUD) | Fluxo de 3 telas obrigatório para criação (RNF-002), edição e remoção |
| UC-004 | Associar Planta ao Dispositivo IoT | Tela de associação com campo de ID do dispositivo |
| UC-007 | Solicitar Irrigação Manual | Botão na tela de detalhe, pop-up de alerta se umidade alta (RN-009) |
| UC-010 | Consultar Histórico de Cuidados | Gráfico + tabela + paginação |

### Casos de uso executados pelo sistema (frontend é observador do resultado)

| UC | Nome | Impacto no Frontend |
|----|------|---------------------|
| UC-005 | Monitorar Umidade do Solo | Exibir leitura atual (%, data/hora) na tela de detalhe da planta |
| UC-006 | Executar Irrigação Automática | Refletir no histórico e no estado da planta |
| UC-008 | Gerar Cronograma de Cuidados | Exibir agenda semanal na Home e tela de cronograma |
| UC-009 | Receber Notificações | Push notification → deep link para tela relevante |

---

## 17. Telas Identificadas

Lista derivada dos casos de uso do DRS.

| # | Tela | Use Case | Observações |
|---|------|----------|-------------|
| 1 | Splash / Loading | — | Verificação de sessão ativa antes de redirecionar |
| 2 | Login | UC-002 | Email + senha, link para cadastro |
| 3 | Cadastro | UC-001 | Nome, CPF, email, senha com critérios RN-013 |
| 4 | Home / Dashboard | UC-008, UC-009 | Resumo: plantas, cronograma semanal, alertas recentes |
| 5 | Catálogo de Plantas | UC-003 | Lista do catálogo pessoal do usuário autenticado |
| 6 | Detalhe da Planta | UC-003, UC-005, UC-007 | Hub de informações: umidade atual, irrigação manual, acesso ao histórico |
| 7 | Cadastro de Planta — Step 1 | UC-003 | Espécie + nome da planta (obrigatórios — RN-003) |
| 8 | Cadastro de Planta — Step 2 | UC-003 | Ambiente (interno/externo) + luz recebida (obrigatórios — RN-003) |
| 9 | Cadastro de Planta — Step 3 | UC-003 | Revisão + confirmação (fluxo máximo 3 telas — RNF-002) |
| 10 | Edição de Planta | UC-003 | Mesmo formulário em modo de edição; alterar espécie atualiza faixa de umidade (RN-008) |
| 11 | Associar Dispositivo | UC-004 | Vinculação planta ↔ ESP32; impede 2 dispositivos na mesma planta (RN-005) |
| 12 | Histórico de Cuidados | UC-010 | Gráfico de umidade + tabela de eventos; paginação para volumes grandes |
| 13 | Cronograma Semanal | UC-008 | Agenda de irrigação gerada pelo backend/IA |
| 14 | Notificações | UC-009 | Lista de alertas recebidos (irrigação necessária, excesso, falha de sensor) |
| 15 | Gerenciar Dispositivos | UC-004 | Lista de dispositivos vinculados e seus estados |
| 16 | Configurações / Perfil | — | Dados do usuário, logout |

**Total: 16 telas** (algumas com variantes modais internas).

---

## 18. Fluxos Críticos de Usuário

### 18.1 Autenticação

```
Splash (verifica sessão)
  ├── Sessão válida → Home
  └── Sem sessão → Login
        ├── Credenciais corretas → Home
        ├── Credenciais inválidas → mensagem de erro (UC-002 Fluxo A)
        └── Email não cadastrado → sugestão de cadastro (UC-002 Fluxo B)
              └── → Cadastro → Login
```

---

### 18.2 Cadastro de Planta (máximo 3 telas — RNF-002)

```
Catálogo → Step 1 (espécie + nome)
         → Step 2 (ambiente + luz)
         → Step 3 (revisão + confirmar)
               └── Sucesso → Catálogo atualizado
```

---

### 18.3 Irrigação Manual (fluxo mais crítico de UX)

```
Detalhe da Planta → "Irrigar Agora"
  ├── Backend valida umidade
  │     ├── Umidade segura → Loading → Sucesso (irrigação confirmada)
  │     └── Umidade acima do ideal (RN-009) → Pop-up de alerta
  │           ├── Usuário cancela → Irrigação não ocorre
  │           └── Usuário confirma → Loading → Sucesso
  ├── Falha de comunicação com dispositivo → Mensagem de erro
  └── Falha de execução no dispositivo → Mensagem de erro
```

**Estados de UX necessários:** loading, sucesso, bloqueio-com-alerta,
erro-de-comunicação, erro-de-execução. Cada um precisa de representação visual distinta.

---

### 18.4 Notificação Push → Deep Link

```
Push recebida (app em background ou fechado)
  └── Usuário toca a notificação
        ├── Necessidade de irrigação → PlantDetailScreen (plantId)
        ├── Excesso de água → PlantDetailScreen (plantId)
        └── Falha de sensor → DeviceListScreen ou PlantDetailScreen
```

---

### 18.5 Consulta de Histórico

```
PlantDetailScreen → HistoryScreen
  ├── Gráfico de umidade por período
  ├── Tabela de eventos (data/hora, tipo manual/automático, status)
  └── Volume grande → paginação automática (UC-010 Fluxo C)
```

---

## 19. Regras de Negócio com Impacto Direto no Frontend

| Regra | Descrição resumida | Impacto no Frontend |
|-------|-------------------|---------------------|
| RN-001 | Validação de cadastro | Validação inline: email formato válido, email único, senha ≥6 chars alfanumérica, confirmação igual |
| RN-002 | Autenticação obrigatória | Guard de navegação no `RootNavigator`: sem token → redireciona para Login |
| RN-003 | Campos obrigatórios da planta | Espécie e ambiente obrigatórios; formulário bloqueia submit sem eles |
| RN-004 | Catálogo individual | App nunca exibe plantas de outros usuários; todas as queries são filtradas por usuário |
| RN-005 | 1 dispositivo por planta | UI deve impedir associar 2º dispositivo sem desvincular o 1º; exibir estado de vínculo atual |
| RN-007 | Decisão automática de irrigação | Frontend exibe resultado (irrigou / não irrigou / alerta), não decide |
| RN-008 | Personalização por espécie | Ao alterar espécie no formulário, valores de umidade padrão devem atualizar automaticamente na UI |
| RN-009 | Irrigação manual controlada | Pop-up de confirmação quando umidade acima do ideal; usuário pode cancelar ou confirmar |
| RN-011 | Notificações inteligentes | Backend não duplica alertas em < 30 min; UI deve lidar graciosamente se duplicatas chegarem |
| RN-013 | Validação de senha | Mín. 6 chars, 1 maiúscula, 1 minúscula, 1 número, sem espaços, não igual ao email |

---

## 20. Requisitos Não Funcionais com Impacto no Frontend

| RNF | Classificação | Critério | Impacto no Frontend |
|-----|---------------|----------|---------------------|
| RNF-001 | Usabilidade | Cadastro + 1ª planta em ≤5 min por 85% dos usuários | Onboarding claro, estados vazios bem elaborados |
| RNF-002 | Usabilidade | Cadastro de planta em máximo 3 telas consecutivas | Fluxo de `PlantCreate` limitado a 3 screens ou stepper interno |
| RNF-003 | Desempenho | Home carrega em ≤2s (p90) | Caching, agregação eficiente, não fazer muitas chamadas paralelas na home |
| RNF-004 | Desempenho | Recomendações por IA em ≤5s (p95) | UI deve exibir loading claro durante geração do cronograma |
| RNF-005 | Desempenho | Comando de irrigação manual transmitido em ≤3s (p95) | Feedback visual imediato; não bloquear UI durante o envio |
| RNF-008 | Segurança | Toda funcionalidade pessoal exige autenticação | Guard de navegação, interceptor 401, nenhuma tela privada sem sessão |
| RNF-009 | Segurança | Isolamento de dados por usuário | App nunca exibe nem permite editar dados de outros usuários |
| RNF-011 | Compatibilidade | Android 10+ obrigatório | Verificar compatibilidade de cada lib com Android 10; RN New Arch compatível |
| RNF-013 | Manutenibilidade | Modularização por domínio funcional | Separação de módulos: auth, plants, devices, irrigation, monitoring, schedule, notifications, history |
| RNF-014 | Manutenibilidade | Cobertura mínima de 70% nos módulos centrais | Planejar Jest + Testing Library desde as primeiras telas |
| RNF-017 | Desempenho | Suportar 100 plantas e 12 meses de histórico sem degradação | `FlatList` com virtualização obrigatória; não carregar todo histórico de uma vez |

---

## 21. Ambiguidades do DRS a Resolver

Pontos não especificados no DRS que impactam diretamente decisões de
arquitetura do frontend. Devem ser alinhados com o backend antes da
implementação dos módulos correspondentes.

| Ambiguidade | Módulos impactados | Decisões possíveis |
|-------------|-------------------|-------------------|
| **Mecanismo de atualização de leituras de sensor** — o DRS não define se o frontend deve fazer polling, usar WebSocket ou apenas pull-to-refresh manual. RN-006 define envio a cada ≥5 min pelo sensor. | `monitoring`, `PlantDetailScreen`, estado global | Polling periódico (simples, mais chamadas), WebSocket (complexo, eficiente), pull-to-refresh (manual, simples) |
| **Confirmação de email por token** — RN-013 menciona que emails válidos são verificados por token durante o cadastro, mas o DRS não detalha uma tela de confirmação de email | `auth`, `RegisterScreen` | Pode exigir tela adicional de "insira o código enviado por email" |
| **Meio de identificação do dispositivo IoT** — UC-004 menciona "identificação do dispositivo" sem especificar se é digitação de ID alfanumérico, QR Code ou NFC | `devices`, `DeviceAssociateScreen` | Input manual de ID (simples), QR Code (UX melhor, requer `expo-camera`), NFC (complexo) |
| **Formato do token de autenticação** — o DRS não especifica JWT vs. outro formato, nem política de refresh | `auth`, `api.ts`, interceptors | JWT com refresh token é o padrão FastAPI; confirmar com o backend |
| **Protocolo backend ↔ dispositivo IoT** — o DRS menciona integração IoT mas não define o protocolo (MQTT, REST, WebSocket) | `irrigation`, `monitoring` | Impacta se o frontend recebe dados diretamente ou apenas via backend REST |

