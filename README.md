# AirWatch Mobile

Aplicativo mobile desenvolvido em React Native com Expo como solução para a Global Solution da FIAP. O app é uma plataforma de monitoramento da qualidade do ar em tempo real, integrando dados de satélites, APIs públicas e sensores IoT locais, com controle de acesso por perfil de usuário.

## Integrantes

Enrico Delesporte
RM: 565760

Vitor Dias dos Santos 
RM: 565422

Felipe Kirschner Modesto
RM: 561810


## Vídeo de Demonstração

[Assista no YouTube](https://youtube.com/SEU_LINK)

## Descrição da Solução

O AirWatch é uma plataforma que permite cidadãos, prefeituras e órgãos ambientais acompanharem a qualidade do ar em tempo real. Utilizamos dados de satélites (Sentinel-5P / ESA) via APIs públicas gratuitas (OpenAQ, Open-Meteo) e complementamos com sensores IoT locais (ESP32).

**Problema resolvido:** A poluição do ar mata ~7 milhões de pessoas por ano (OMS). Dados existem, mas estão dispersos e são de difícil acesso. Pequenas cidades não possuem sistemas próprios de monitoramento.

**Solução:**
- Centralização de dados de satélite e IoT
- Cadastro de cidades e bairros com alertas configuráveis
- Dashboard simples e acessível com índice AQI em tempo real
- Alertas para populações vulneráveis (asmáticos, idosos)

## Tecnologias

- React Native + Expo SDK 54
- React Navigation (Stack Navigator + Bottom Tab Navigator)
- Fetch API para integração com backend REST Java / Spring Boot
- react-native-svg para ícones vetoriais
- AsyncStorage para persistência de sessão

## Estrutura de Telas

O app conta com doze telas navegáveis, organizadas em um fluxo lógico de uso:

| Tela | Descrição |
|---|---|
| Login | Autenticação com e-mail e senha via JWT |
| Cadastro | Registro com nome, e-mail, senha e escolha de perfil |
| Home | Apresentação do app, tecnologias e acesso às funcionalidades |
| Monitor | Dashboard por cidade com AQI em tempo real |
| Leituras de Ar | CRUD de leituras com PM2.5, PM10, CO2, NO2, O3 e AQI |
| Sensores | CRUD de sensores IoT por cidade |
| Países | CRUD de países com código ISO e continente |
| Cidades | CRUD de cidades com coordenadas e população |
| Configurações de Alerta | Configuração por poluente, limiar e severidade |
| Eventos de Alerta | Listagem e gerenciamento de alertas disparados |
| Usuários | Administração de contas (somente ADMIN) |
| Perfil | Dados do usuário, permissões e logout |

## Requisitos Atendidos

### 1. Navegação entre telas

A navegação é gerenciada pelo React Navigation com Stack Navigator aninhado em Bottom Tab Navigator. As abas disponíveis variam conforme o papel do usuário, garantindo que cada perfil acesse apenas o que lhe é pertinente.

Rotas navegáveis: Login, Cadastro, Home, Monitor, Leituras, Sensores, Países, Cidades, Configurações de Alerta, Eventos de Alerta, Usuários e Perfil (total de 12 rotas).

### 2. CRUD com API REST (Java / Spring Boot)

Todas as operações de Create, Read, Update e Delete são realizadas via Fetch contra a API REST hospedada no Render. Nenhum dado é armazenado apenas localmente.

Entidades com CRUD completo:
- Países
- Cidades
- Sensores
- Leituras de Ar
- Configurações de Alerta
- Eventos de Alerta
- Usuários

Todas as telas possuem feedback visual de loading (ActivityIndicator), mensagens de erro via Alert e validação de formulários antes do envio.

**Base URL:** `https://airwatch-api.onrender.com`

### 3. Estilização com identidade visual

O app adota o tema **Eco Futurista** — inspirado em monitoramento ambiental, mapas térmicos e sensores climáticos. A paleta utiliza verde neon `#00FF87` e azul `#00D4FF` sobre fundo escuro `#030D08`, transmitindo a sensação de tecnologia aplicada à sustentabilidade.

Todos os ícones são vetoriais (react-native-svg), sem uso de emojis. O design segue padrões de usabilidade com hierarquia visual clara, badges de status coloridos por nível de AQI e cards com bordas luminosas.

### 4. Arquitetura do código

O projeto segue separação clara de responsabilidades com nomeação padronizada e componentes reutilizáveis em todas as telas.

## Controle de Acesso por Perfil

| Perfil | Permissões |
|---|---|
| CITIZEN | Ver dashboard, cidades e leituras de ar |
| TECHNICIAN | CITIZEN + registrar leituras e gerenciar sensores |
| MANAGER | TECHNICIAN + gerenciar países, cidades e alertas |
| ADMIN | Acesso total incluindo gerenciamento de usuários |

## Como Executar

**Pré-requisitos:** Node.js 18+, npm e Expo CLI instalados.

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

Após iniciar, escaneie o QR code com o Expo Go (Android) ou execute no emulador.

```bash
# Web
npx expo start --web

# Android
npx expo start --android
```

## Estrutura do Projeto

```
AirWatch-Mobile/
├── App.js                        # Raiz do app, navegação, tabs e perfil
├── app.json                      # Configurações do Expo
├── index.js                      # Ponto de entrada
├── assets/                       # Ícones e imagens do app
└── src/
    ├── components/
    │   └── index.js              # Button, Input, Card, Badge, Icon SVG
    ├── context/
    │   └── AuthContext.js        # Autenticação global com AsyncStorage
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── HomeScreen.js
    │   ├── DashboardScreen.js
    │   ├── AirReadingsScreen.js
    │   ├── SensorsScreen.js
    │   ├── CountriesScreen.js
    │   ├── CitiesScreen.js
    │   ├── AlertConfigsScreen.js
    │   ├── AlertEventsScreen.js
    │   └── UsersScreen.js
    ├── services/
    │   └── api.js                # Fetch centralizado com JWT
    └── theme/
        └── index.js              # Paleta Eco Futurista e utilitários AQI
```

## Disciplina

Desenvolvimento de Aplicativos Mobile — Global Solution · FIAP 2026
