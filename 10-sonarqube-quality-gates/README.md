# 📊 SonarQube Quality Gates

[![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)](https://sonarqube.org)
[![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)

Portões de qualidade de código usando SonarQube com integração CI/CD para bloquear deploys com baixa qualidade.

---

## 💰 Licença

| Edição | Preço | Recursos |
|--------|-------|----------|
| **Community** | ✅ **Gratuito** (LGPL v3) | Análise de código, 30+ linguagens |
| **Developer** | 💲 $150/ano (até 100K LOC) | + Branch analysis, PR decoration |
| **Enterprise** | 💲 Sob consulta | + Portfolio, Security reports |
| **Data Center** | 💲 Sob consulta | + High availability |

> Este projeto usa **SonarQube Community** que é 100% gratuito.

---

## 🆓 Alternativas Gratuitas

| Ferramenta | Licença | Recursos |
|------------|---------|----------|
| **[SonarQube Community](https://sonarqube.org)** | Open Source | Análise completa |
| **[CodeClimate](https://codeclimate.com)** | Freemium | Open source grátis |
| **[Codacy](https://codacy.com)** | Freemium | Open source grátis |
| **[ESLint/Pylint](https://eslint.org)** | Open Source | Linters específicos |

---

## 📋 Pré-requisitos

- Docker (para instalação rápida) ou Java 17+
- Mínimo 2GB RAM (recomendado 4GB+)
- PostgreSQL (produção) ou H2 (desenvolvimento)

---

## 🛠️ Instalação

### Opção 1: Docker (Recomendado)

```bash
# Iniciar SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:community

# Acessar
open http://localhost:9000
# Login padrão: admin/admin
```

### Opção 2: Docker Compose (com PostgreSQL)

```yaml
# docker-compose.yml
version: "3"
services:
  sonarqube:
    image: sonarqube:community
    ports:
      - "9000:9000"
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://db:5432/sonar
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=sonar
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar
```

```bash
docker-compose up -d
```

### Opção 3: Instalação Manual

```bash
# Download
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.3.0.82913.zip
unzip sonarqube-10.3.0.82913.zip
cd sonarqube-10.3.0.82913/bin/linux-x86-64
./sonar.sh start
```

### Instalar Scanner

```bash
# Via npm (para projetos JS/TS)
npm install -g sonarqube-scanner

# Via Homebrew (macOS)
brew install sonar-scanner

# Download manual
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006.zip
```

---

## 🚀 Execução

```bash
# Criar arquivo sonar-project.properties
cat > sonar-project.properties << EOF
sonar.projectKey=my-project
sonar.sources=src
sonar.host.url=http://localhost:9000
sonar.login=your_token
EOF

# Executar análise
sonar-scanner
```

### Integração Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }
        stage('Quality Gate') {
            steps {
                waitForQualityGate abortPipeline: true
            }
        }
    }
}
```

---

## 🎯 Funcionalidades

- ✅ Quality Gates customizados
- ✅ Code coverage tracking
- ✅ Technical debt analysis
- ✅ Security hotspots
- ✅ PR decoration
- ✅ Branch analysis

---

## 📁 Estrutura

```
10-sonarqube-quality-gates/
├── sonar-project.properties
├── docker-compose.yml
├── jenkins/
│   └── Jenkinsfile
├── .github/workflows/
│   └── sonar.yml
└── README.md
```

---

## 👤 Autor

**Isaac Meneguini Albuquerque**
- 📧 isaacmeneguini@gmail.com
- 💼 [LinkedIn](https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3483984239170316299)
