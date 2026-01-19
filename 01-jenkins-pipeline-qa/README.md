# 🔧 Jenkins Pipeline QA

[![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)
[![Groovy](https://img.shields.io/badge/Groovy-4298B8?style=for-the-badge&logo=apache-groovy&logoColor=white)](https://groovy-lang.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

## 📋 Descrição

Pipelines declarativos e scriptados para automação completa de testes em Jenkins, com integração Docker e relatórios automatizados.

## 🚀 Funcionalidades

- ✅ Pipeline declarativo multi-stage
- ✅ Pipeline scriptado avançado
- ✅ Integração com Docker
- ✅ Testes paralelos
- ✅ Quality Gates
- ✅ Notificações Slack/Email
- ✅ Relatórios HTML

## 📁 Estrutura

```
01-jenkins-pipeline-qa/
├── Jenkinsfile              # Pipeline declarativo principal
├── Jenkinsfile.scripted     # Pipeline scriptado
├── jenkins-config.yaml      # Configuração Jenkins as Code
├── shared-library/          # Biblioteca compartilhada
│   └── vars/
│       └── qaStages.groovy
└── README.md
```

## 🛠️ Quick Start

```groovy
// No Jenkins, criar novo Pipeline e apontar para Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}
```

## 📊 Pipeline Stages

```
┌─────────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌────────┐
│   Checkout  │──▶│  Build   │──▶│  Test    │──▶│ Quality │──▶│ Deploy │
└─────────────┘   └──────────┘   └──────────┘   └─────────┘   └────────┘
```
