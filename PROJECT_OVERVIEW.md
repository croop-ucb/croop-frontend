# PROJECT_OVERVIEW.md — Croop Frontend

Atualizado em junho de 2026 com base na análise do código real.

---

## 1. Visão Geral

Frontend mobile do sistema Croop — plataforma de monitoramento e irrigação
inteligente de plantas via IoT. Desenvolvido em React Native com Expo,
voltado para Android (primário) com suporte a iOS e Web.

**O que o Croop faz:**
O usuário cadastra plantas com espécie, ambiente e parâmetros de umidade.
Cada planta pode ser vinculada a um dispositivo IoT (ESP32 com sensor de
umidade). O backend monitora continuamente a umidade, decide automaticamente
quando irrigar e notifica o usuário sobre eventos críticos. O usuário também
pode acionar irrigação manual com proteção contra excesso de água.

**Responsabilidade do frontend:**
O app é a interface de controle e observabilidade. Não executa lógica de
irrigação, não calcula cronogramas e não decide quando notificar — isso é
responsabilidade do backend. O app apresenta resultados, recebe comandos
do usuário e exibe estados em tempo real.

**Estado atual:** base de desenvolvimento ativa. Infraestrutura completa
(Expo, TypeScript, CI, navegação, Axios), splash screen animada, fluxo de
autenticação parcialmente implementado, catálogo de plantas funcional com
integração real ao backend. Faltam telas de detalhe, dispositivos, histórico
e cronograma.

---

## 2. Stack Utilizada

| Tecnologia                  | Versão       | Papel                                       |
|-----------------------------|--------------|---------------------------------------------|
| React Native                | 0.81.5       | Framework mobile                            |
| Expo                        | ~54.0.33     | Toolchain, build e runtime                  |
| React                       | 19.1.0       | Camada de UI                                |
| TypeScript                  | ~5.9.2       | Tipagem estática (strict mode)              |
| @react-navigation/native    | instalado    | Infraestrutura de navegação                 |
| @react-navigation/native-stack | instalado | Stack navigator tipado                      |
| react-native-svg            | instalado    | SVG (logo animado)                          |
| @expo/vector-icons          | instalado    | Ícones Ionicons                             |
| axios                       | instalado    | Comunicação HTTP com o backend              |
| expo-status-bar             | ~3.0.9       | Controle da status bar nativa               |
| react-native-web            | ^0.21.0      | Suporte a Web via Expo                      |
| ESLint                      | ^9.0.0       | Linting (flat config, preset expo)          |

**Não instaladas, mas previstas:**
- `@react-navigation/bottom-tabs` — Bottom Tabs (tab bar)
- Biblioteca de gráficos compatível com New Arch — histórico de umidade (UC-010)
- `expo-notifications` — push notifications em produção (requer EAS)

---

## 3. Arquitetura do Aplicativo

```
Entry point (index.ts)
  └── App.tsx
        ├── Splash screen animada (3s — SVG + BouncingDots)
        └── NavigationContainer
              └── RootNavigator (Stack)
                    ├── OnboardingScreen
                    ├── AuthNavigator (Stack) [implementado]
                    │     ├── AuthLandingScreen
                    │     ├── LoginScreen
                    │     ├── RegisterScreen
                    │     └── ForgotPasswordScreen
                    ├── PlantListScreen [implementado]
                    ├── PlantCreateScreen [implementado — tela única]
                    └── NotificationScreen [implementado]
```

**Nova arquitetura do React Native habilitada** (`newArchEnabled: true`).
Usa JSI e Fabric. Toda lib adicionada deve ser verificada quanto à
compatibilidade com a new arch.

**Ausente:** guard de autenticação no `RootNavigator`. Atualmente navega
direto para `OnboardingScreen` sem verificar se há token válido.

---

## 4. Estrutura de Pastas

### Estado atual (o que existe)

```
croop-frontend/
├── .github/
│   └── workflows/
│       ├── ci.yml                # pipeline de validação (type check, lint, expo config)
│       └── auto-pr.yml           # automação de criação e merge de PRs
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── CroopLogo.tsx         # logo SVG com texto curvo configurável
│   │   └── ScreenBackground.tsx  # wrapper de fundo com overlay escuro
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # stack raiz tipado
│   │   └── AuthNavigator.tsx     # stack de autenticação
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── AuthLandingScreen.tsx     # tela de entrada (login/cadastro)
│   │   │   ├── LoginScreen.tsx           # login com email + senha
│   │   │   ├── RegisterScreen.tsx        # cadastro de usuário
│   │   │   └── ForgotPasswordScreen.tsx  # recuperação de senha (sem integração)
│   │   ├── onboarding/
│   │   │   └── OnboardingScreen.tsx      # tela de onboarding inicial
│   │   ├── plants/
│   │   │   ├── PlantListScreen.tsx       # catálogo com FlatList + estados
│   │   │   └── PlantCreateScreen.tsx     # cadastro de planta (tela única)
│   │   └── notification/
│   │       └── NotificationScreen.tsx    # listagem de notificações
│   ├── services/
│   │   ├── api.ts                # instância Axios + interceptor de token
│   │   ├── authService.ts        # cadastrar(), login()
│   │   ├── plantsService.ts      # listarPlantas(), criarPlanta()
│   │   ├── especiesService.ts    # buscarEspecies()
│   │   ├── notificationService.ts # listarNotificacoes()
│   │   └── tokenStore.ts         # módulo simples de armazenamento de token
│   └── types/
│       ├── navigation.ts         # RootStackParamList, AuthStackParamList
│       └── api.ts                # PlantaResponse, EspecieResponse, etc.
├── App.tsx                       # splash animada + NavigationContainer
├── index.ts                      # entry point do Expo
├── app.json                      # configuração Expo
├── package.json
├── tsconfig.json
└── eslint.config.js
```

### Estrutura planejada (ainda não criada)

```
src/
├── screens/
│   ├── plants/
│   │   ├── PlantDetailScreen.tsx      # detalhe + irrigação manual
│   │   └── PlantEditScreen.tsx        # edição de planta
│   ├── devices/
│   │   ├── DeviceListScreen.tsx       # lista de dispositivos vinculados
│   │   └── DeviceAssociateScreen.tsx  # associação planta ↔ dispositivo
│   ├── history/
│   │   └── HistoryScreen.tsx          # gráfico + tabela de eventos
│   ├── schedule/
│   │   └── ScheduleScreen.tsx         # cronograma semanal
│   └── profile/
│       └── ProfileScreen.tsx          # dados do usuário + logout
├── navigation/
│   └── AppNavigator.tsx               # Bottom Tabs (Home, Plantas, Dispositivos, Notificações)
└── theme/
    ├── colors.ts
    └── spacing.ts
```

---

## 5. Módulos Implementados

### `App.tsx`
Splash screen animada: logo CROOP em SVG com texto curvo e três dots com
animação de bounce. Após 3 segundos, renderiza o `NavigationContainer`
com o `RootNavigator`.

### `src/services/api.ts`
Instância Axios centralizada. `BASE_URL` lida de `EXPO_PUBLIC_API_URL` com
fallback para `http://10.0.2.2:8000` (Emulador Android → host). Header
`bypass-tunnel-authorization: true` incluído por padrão. Interceptor de
request injeta o token Bearer automaticamente via `tokenStore.getToken()`.

**Ausente:** interceptor de resposta para capturar `401` e redirecionar para Login.

### `src/services/tokenStore.ts`
Módulo simples (variável em memória) para armazenar o JWT. Não usa
`AsyncStorage` nem `SecureStore` — o token não persiste entre reinicializações
do app. Decisão de persistência ainda não tomada.

### `src/screens/plants/PlantListScreen.tsx`
FlatList com três estados: loading, erro (com botão de retry) e vazio
(com ícone e texto de onboarding). Recarrega ao receber foco (`useFocusEffect`).
Cards mostram nome personalizado, ambiente e porte. Botões de edição e
vínculo de dispositivo nos cards são placeholders (sem navegação).

### `src/screens/plants/PlantCreateScreen.tsx`
Formulário em tela única. Busca de espécie com debounce (300ms) e dropdown.
Campos: espécie (obrigatório), nome personalizado, ambiente (obrigatório),
porte, localização, observações. Validação inline antes de submeter.
Integração real com `POST /plantas/` e `GET /especies/`.

**Pendência:** o DRS exige fluxo de 3 telas consecutivas (RNF-002). Atualmente
é uma única tela com scroll.

### `src/navigation/`
`RootNavigator` e `AuthNavigator` completamente tipados. `RootStackParamList`
cobre: `Onboarding`, `Auth`, `PlantList`, `PlantCreate`, `Notification`.
`AuthStackParamList` cobre: `AuthLanding`, `Login`, `Register`, `ForgotPassword`.

---

## 6. Fluxos Implementados

### 6.1 Inicialização

```
index.ts → registerRootComponent(App)
  └── App.tsx
        ├── Splash 3s (SVG + dots animados)
        └── NavigationContainer → RootNavigator → OnboardingScreen
```

Não há verificação de sessão na inicialização — o app sempre abre no Onboarding.

### 6.2 Autenticação (parcial)

```
OnboardingScreen → AuthNavigator → AuthLandingScreen
  ├── "Entrar" → LoginScreen
  │     └── authService.login() → tokenStore.setToken() → PlantListScreen
  └── "Cadastrar" → RegisterScreen
        └── authService.cadastrar() → (redireciona para login manual)
```

`ForgotPasswordScreen` existe mas sem integração com backend.

### 6.3 Catálogo de Plantas

```
PlantListScreen (carrega ao focar)
  └── plantsService.listarPlantas() → GET /plantas/
        ├── Sucesso → FlatList de cards
        ├── Erro → mensagem + retry
        └── Vazio → empty state com onboarding

PlantListScreen → "Adicionar planta" → PlantCreateScreen
  └── criarPlanta() → POST /plantas/ → navigation.goBack()
```

### 6.4 Notificações

```
PlantListScreen → ícone de notificação → NotificationScreen
  └── notificationService.listarNotificacoes() → GET /notificacoes/
```

---

## 7. Configuração do Expo

Arquivo: `app.json`

| Campo | Valor | Observação |
|-------|-------|------------|
| `name` | croop-frontend | |
| `slug` | croop-frontend | |
| `version` | 1.0.0 | |
| `orientation` | portrait | Bloqueado em retrato |
| `newArchEnabled` | true | JSI/Fabric ativa |
| `ios.supportsTablet` | true | iPad habilitado |
| `android.edgeToEdgeEnabled` | true | Layout edge-to-edge |

**Não configurado:** EAS Build (`eas.json`). Sem ele não é possível gerar
builds para distribuição nem usar `expo-notifications` em produção.

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

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true }
}
```

Strict mode ativo. CI valida via `npx tsc --noEmit` a cada push.

Tipos de domínio definidos em `src/types/api.ts` (respostas do backend) e
`src/types/navigation.ts` (rotas tipadas).

---

## 9. CI

### `ci.yml`
- **Gatilhos:** push em qualquer branch + PRs para `main`
- **Runner:** `ubuntu-latest`, Node 20
- **Passos:** checkout → `npm ci` → `tsc --noEmit` → `expo lint` → `expo config --type public`
- **Sem testes:** o pipeline não executa nenhum teste automatizado

### `auto-pr.yml`
- **Gatilho:** push em qualquer branch exceto `main`
- **Comportamento:** extrai issue do nome da branch → cria PR → habilita auto-merge com squash
- **Risco:** auto-merge é habilitado antes do CI concluir. Depende de branch protection rules.

---

## 10. Pontos Críticos

1. **Sem guard de autenticação.** `RootNavigator` sempre abre em `OnboardingScreen`.
   Usuários com token válido passam pelo onboarding toda vez. Token não persiste
   entre reinicializações.

2. **`tokenStore.ts` é in-memory.** Fechar o app apaga o token. Implementar
   `AsyncStorage` ou `SecureStore` antes de qualquer release.

3. **PlantCreate em tela única viola RNF-002.** O DRS exige máximo 3 telas
   consecutivas. Refatorar para stepper ou múltiplas screens.

4. **Sem interceptor de 401.** Token expirado resulta em erro genérico, não
   redirecionamento para Login.

5. **Bottom Tabs ausentes.** `@react-navigation/bottom-tabs` não instalado;
   navegação entre módulos principais (Home, Plantas, Dispositivos, Notificações)
   não existe.

6. **Telas críticas ausentes:** PlantDetail (hub de UC-005, UC-007), DeviceList,
   DeviceAssociate (UC-004), HistoryScreen (UC-010), ScheduleScreen (UC-008),
   ProfileScreen.

7. **Sem EAS Build.** Impossível gerar builds para stores ou usar push
   notifications em produção.

---

## 11. Riscos Técnicos e Arquiteturais

| Risco | Severidade | Descrição |
|-------|------------|-----------|
| Token sem persistência | Alto | App perde sessão a cada reinicialização |
| Sem guard de autenticação | Alto | Usuário pode acessar telas privadas sem token |
| Sem interceptor 401 | Alto | Token expirado não redireciona para Login |
| PlantCreate viola RNF-002 | Médio | Tela única em vez de fluxo de 3 telas |
| `newArchEnabled: true` + libs | Médio | Cada nova lib (gráficos, notificações) deve ser verificada com JSI/Fabric |
| Sem state management global | Médio | tokenStore in-memory; sem solução para dados globais (usuário, notificações não lidas) |
| Sem testes automatizados | Alto | Nenhum teste unitário ou de integração |
| Auto-merge sem gate de CI | Médio | Código pode chegar à main antes do CI terminar |
| React 19.1 + RN 0.81 | Baixo | Stack recente; libs do ecossistema podem não ter suporte completo |

---

## 12. Telas Identificadas pelo DRS

| # | Tela | Status | Observações |
|---|------|--------|-------------|
| 1 | Splash / Loading | Implementado | 3s fixos em App.tsx; sem verificação de sessão |
| 2 | Onboarding | Implementado | Tela de entrada antes de auth |
| 3 | AuthLanding | Implementado | Escolha entre login e cadastro |
| 4 | Login | Implementado | Email + senha; integrado |
| 5 | Cadastro | Implementado | Nome, CPF, email, senha; integrado |
| 6 | ForgotPassword | Implementado | Sem integração com backend |
| 7 | Catálogo de Plantas | Implementado | FlatList + estados completos |
| 8 | Criar Planta | Parcial | Tela única (deve ser 3 telas — RNF-002) |
| 9 | Notificações | Implementado | Lista integrada |
| 10 | Detalhe da Planta | Não criado | Hub: umidade atual, irrigação manual, histórico |
| 11 | Edição de Planta | Não criado | — |
| 12 | Associar Dispositivo | Não criado | UC-004 |
| 13 | Gerenciar Dispositivos | Não criado | UC-004 |
| 14 | Histórico de Cuidados | Não criado | UC-010: gráfico + tabela + paginação |
| 15 | Cronograma Semanal | Não criado | UC-008 |
| 16 | Configurações / Perfil | Não criado | Dados do usuário, logout |

---

## 13. Recomendações — Próximos Passos

### Antes de qualquer nova tela

1. **Persistir token:** implementar `SecureStore` ou `AsyncStorage` em `tokenStore.ts`
2. **Guard de autenticação:** `RootNavigator` deve verificar token na inicialização e
   redirecionar para Auth ou App conforme o estado de sessão
3. **Interceptor 401:** adicionar em `api.ts` para capturar token expirado e redirecionar
4. **Instalar `@react-navigation/bottom-tabs`** e criar `AppNavigator` com as 4 tabs

### Telas prioritárias

5. **PlantDetailScreen** — hub central do app (umidade, irrigação manual, histórico)
6. **Refatorar PlantCreate** para 3 telas (RNF-002)
7. **HistoryScreen** com gráfico — escolher lib compatível com New Arch antes de implementar

### Infraestrutura

8. **Criar `src/theme/`** com cores e espaçamentos antes de adicionar mais telas
9. **Decidir estado global** — Zustand recomendado pela simplicidade
10. **Configurar EAS Build** quando próximo da primeira release
