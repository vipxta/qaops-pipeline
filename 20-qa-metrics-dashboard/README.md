# 📊 QA Metrics Dashboard

[![Allure](https://img.shields.io/badge/Allure-FF6B6B?style=for-the-badge)](https://docs.qameta.io/allure)
[![ReportPortal](https://img.shields.io/badge/ReportPortal-00B2A9?style=for-the-badge)](https://reportportal.io)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)](https://grafana.com)

Dashboards de métricas de qualidade com integração Allure, ReportPortal e Grafana.

---

## 💰 Licenças e Preços

| Ferramenta | Versão Gratuita | Versão Paga |
|------------|-----------------|-------------|
| **Allure Report** | ✅ Open Source (Apache 2.0) | - |
| **Allure TestOps** | ❌ Trial 14 dias | 💲 Sob consulta |
| **ReportPortal** | ✅ Open Source (Apache 2.0) | 💲 Enterprise disponivel |
| **Grafana** | ✅ Open Source (AGPLv3) | 💲 Cloud plans disponíveis |
| **TestRail** | ❌ Trial 14 dias | 💲 $36-$54/user/mês |

> **Recomendação**: Use **Allure Report + ReportPortal + Grafana** (todos gratuitos) para uma solução completa sem custos.

---

## 🆓 Stack 100% Gratuita Recomendada

| Componente | Ferramenta | Licença |
|------------|------------|--------|
| **Relatórios de Teste** | [Allure Report](https://docs.qameta.io/allure) | Apache 2.0 |
| **Agregação de Resultados** | [ReportPortal](https://reportportal.io) | Apache 2.0 |
| **Dashboards/Métricas** | [Grafana](https://grafana.com) | AGPLv3 |
| **Armazenamento de Métricas** | [InfluxDB](https://influxdata.com) | MIT |
| **Test Management** | [Kiwi TCMS](https://kiwitcms.org) | GPLv2 |

### Alternativas ao TestRail (Gratuitas)

| Ferramenta | Licença | Recursos |
|------------|---------|----------|
| **[Kiwi TCMS](https://kiwitcms.org)** | Open Source | Test management completo |
| **[TestLink](https://testlink.org)** | Open Source | Test management clássico |
| **[Tuleap](https://tuleap.org)** | Open Source | ALM completo |

---

## 📋 Pré-requisitos

- Docker e Docker Compose
- 4GB RAM mínimo (8GB recomendado)
- 20GB espaço em disco

---

## 🛠️ Instalação

### Allure Report (Gratuito)

```bash
# Via npm
npm install -g allure-commandline

# Via Homebrew (macOS)
brew install allure

# Via apt (Linux)
sudo apt-add-repository ppa:qameta/allure
sudo apt-get update
sudo apt-get install allure

# Gerar relatório
allure generate ./allure-results -o ./allure-report
allure open ./allure-report
```

### ReportPortal (Gratuito - Self-hosted)

```bash
# Docker Compose
curl -LO https://raw.githubusercontent.com/reportportal/reportportal/master/docker-compose.yml
docker-compose up -d

# Acessar: http://localhost:8080
# Login: superadmin/erebus
```

### Grafana + InfluxDB (Gratuito)

```yaml
# docker-compose.yml
version: '3'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
  
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=adminadmin
      - DOCKER_INFLUXDB_INIT_ORG=qa-metrics
      - DOCKER_INFLUXDB_INIT_BUCKET=test-results
```

```bash
docker-compose up -d
# Grafana: http://localhost:3000 (admin/admin)
# InfluxDB: http://localhost:8086
```

---

## 🚀 Integração

### Enviar resultados para Allure

```javascript
// Jest + allure-jest
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-allure', { resultsDir: './allure-results' }]
  ]
};
```

### Enviar resultados para ReportPortal

```javascript
// Cypress
// cypress.config.js
module.exports = {
  reporter: '@reportportal/agent-js-cypress',
  reporterOptions: {
    endpoint: 'http://localhost:8080/api/v1',
    token: 'your-token',
    launch: 'Cypress Tests',
    project: 'my_project'
  }
};
```

---

## 🎯 Funcionalidades

- ✅ Test execution metrics
- ✅ Trend analysis
- ✅ Flaky test detection
- ✅ Coverage trends
- ✅ Defect density
- ✅ Custom dashboards

---

## 📁 Estrutura

```
20-qa-metrics-dashboard/
├── allure/
│   ├── allure-results/
│   └── allure-report/
├── grafana/
│   ├── dashboards/
│   └── datasources/
├── reportportal/
│   └── docker-compose.yml
├── docker-compose.yml
└── README.md
```

---

## 👤 Autor

**Isaac Meneguini Albuquerque**
- 📧 isaacmeneguini@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/isaac-meneguini-albuquerque/)
