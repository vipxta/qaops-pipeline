# 🚩 Feature Flags Testing

[![LaunchDarkly](https://img.shields.io/badge/LaunchDarkly-3DD6F5?style=for-the-badge)](https://launchdarkly.com)
[![Flagsmith](https://img.shields.io/badge/Flagsmith-6633FF?style=for-the-badge)](https://flagsmith.com)
[![Unleash](https://img.shields.io/badge/Unleash-1A4049?style=for-the-badge)](https://unleash.io)

Testes com feature toggles para validação de comportamento de features em diferentes estados.

---

## 💰 Licenças e Preços

| Ferramenta | Versão Gratuita | Versão Paga |
|------------|-----------------|-------------|
| **LaunchDarkly** | ❌ Trial 14 dias | 💲 $10-$20/seat/mês |
| **Flagsmith** | ✅ Open Source (self-hosted) | 💲 $45+/mês (cloud) |
| **Unleash** | ✅ Open Source (self-hosted) | 💲 $80+/mês (Pro) |
| **Split.io** | ✅ Free tier (10 seats) | 💲 Sob consulta |

> **Recomendação**: Use **Flagsmith** ou **Unleash** self-hosted para projetos sem custo.

---

## 🆓 Alternativas 100% Gratuitas

| Ferramenta | Licença | Deploy | Link |
|------------|---------|--------|------|
| **[Flagsmith](https://flagsmith.com)** | BSD-3 | Docker/K8s | [GitHub](https://github.com/Flagsmith/flagsmith) |
| **[Unleash](https://unleash-hosted.com)** | Apache 2.0 | Docker/K8s | [GitHub](https://github.com/Unleash/unleash) |
| **[GrowthBook](https://growthbook.io)** | MIT | Docker | [GitHub](https://github.com/growthbook/growthbook) |
| **[Flipt](https://flipt.io)** | GPL-3.0 | Binário/Docker | [GitHub](https://github.com/flipt-io/flipt) |

---

## 📋 Pré-requisitos

- Docker (para ferramentas self-hosted)
- Node.js 18+ ou Python 3.9+
- Conta na ferramenta escolhida (se usar versão cloud)

---

## 🛠️ Instalação

### Flagsmith (Gratuito - Self-hosted)

```bash
# Docker (mais rápido)
docker run -d -p 8000:8000 flagsmith/flagsmith:latest

# Acessar: http://localhost:8000
# Criar conta e projeto
```

### Unleash (Gratuito - Self-hosted)

```bash
# Docker Compose
git clone https://github.com/Unleash/unleash-docker.git
cd unleash-docker
docker-compose up -d

# Acessar: http://localhost:4242
# Login: admin/unleash4all
```

### LaunchDarkly (Pago - Cloud)

```bash
# SDK Node.js
npm install launchdarkly-node-server-sdk

# Configurar com SDK Key do dashboard
```

---

## 🚀 Execução de Testes

```bash
# Instalar dependências
npm install

# Executar testes de feature flags
npm run test:flags

# Testar flag específica
npm run test:flags -- --flag=new_checkout
```

### Exemplo de Teste

```typescript
import { FeatureFlagTester } from './flag-tester';

describe('Feature Flag Tests', () => {
  it('should show new checkout when flag is ON', async () => {
    await flagTester.setFlag('new_checkout', true);
    const result = await app.getCheckoutPage();
    expect(result).toContain('New Checkout Experience');
  });

  it('should show old checkout when flag is OFF', async () => {
    await flagTester.setFlag('new_checkout', false);
    const result = await app.getCheckoutPage();
    expect(result).toContain('Classic Checkout');
  });
});
```

---

## 🎯 Funcionalidades

- ✅ Flag state testing
- ✅ A/B test validation
- ✅ Rollout percentage tests
- ✅ User targeting tests
- ✅ Flag dependencies
- ✅ Kill switch tests

---

## 📁 Estrutura

```
12-feature-flags-testing/
├── src/
│   ├── flag-tester.ts
│   └── clients/
│       ├── flagsmith.ts
│       ├── unleash.ts
│       └── launchdarkly.ts
├── tests/
│   └── feature-flags.spec.ts
├── docker-compose.yml      # Flagsmith/Unleash local
├── package.json
└── README.md
```

---

## 👤 Autor

**Isaac Meneguini Albuquerque**
- 📧 isaacmeneguini@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/isaac-meneguini-albuquerque/)
