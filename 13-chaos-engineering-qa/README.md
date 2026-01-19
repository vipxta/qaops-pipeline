# 🔥 Chaos Engineering QA

[![Chaos Monkey](https://img.shields.io/badge/Chaos_Monkey-FF0000?style=for-the-badge)](https://netflix.github.io/chaosmonkey)
[![Gremlin](https://img.shields.io/badge/Gremlin-00BFA5?style=for-the-badge)](https://gremlin.com)
[![Litmus](https://img.shields.io/badge/Litmus-6C5CE7?style=for-the-badge)](https://litmuschaos.io)

Engenharia do caos para testes de resiliência, validando comportamento do sistema sob condições adversas.

---

## 💰 Licenças e Preços

| Ferramenta | Licença | Preço |
|------------|---------|-------|
| **Chaos Monkey** | ✅ Apache 2.0 | **Gratuito** |
| **Litmus** | ✅ Apache 2.0 | **Gratuito** |
| **Chaos Mesh** | ✅ Apache 2.0 | **Gratuito** |
| **Gremlin** | 💲 Comercial | $99-$500+/mês |
| **AWS FIS** | 💲 Pay-per-use | Varia por uso |

> **Recomendação**: Use **Litmus** ou **Chaos Mesh** para Kubernetes - são 100% gratuitos e mantidos pela CNCF.

---

## 🆓 Alternativas 100% Gratuitas

| Ferramenta | Plataforma | Mantenedor | Link |
|------------|------------|------------|------|
| **[Litmus](https://litmuschaos.io)** | Kubernetes | CNCF | [GitHub](https://github.com/litmuschaos/litmus) |
| **[Chaos Mesh](https://chaos-mesh.org)** | Kubernetes | CNCF | [GitHub](https://github.com/chaos-mesh/chaos-mesh) |
| **[Chaos Monkey](https://netflix.github.io/chaosmonkey)** | Spinnaker/AWS | Netflix | [GitHub](https://github.com/Netflix/chaosmonkey) |
| **[Pumba](https://github.com/alexei-led/pumba)** | Docker | Community | [GitHub](https://github.com/alexei-led/pumba) |
| **[Toxiproxy](https://github.com/Shopify/toxiproxy)** | Network | Shopify | [GitHub](https://github.com/Shopify/toxiproxy) |

---

## 📋 Pré-requisitos

- Kubernetes cluster (para Litmus/Chaos Mesh)
- Docker (para Pumba/Toxiproxy)
- kubectl configurado
- Helm 3.x (para instalação via charts)

---

## 🛠️ Instalação

### Litmus (Recomendado - Gratuito)

```bash
# Instalar Litmus via Helm
helm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/
helm install chaos litmuschaos/litmus --namespace=litmus --create-namespace

# Acessar portal
kubectl port-forward svc/chaos-litmus-frontend-service 9091:9091 -n litmus
# Abrir: http://localhost:9091
# Login: admin/litmus
```

### Chaos Mesh (Gratuito)

```bash
# Instalar via Helm
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-mesh --create-namespace

# Dashboard
kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333
# Abrir: http://localhost:2333
```

### Toxiproxy (Gratuito - Network Chaos)

```bash
# Docker
docker run -d --name toxiproxy -p 8474:8474 -p 8475:8475 ghcr.io/shopify/toxiproxy

# CLI
brew install toxiproxy  # macOS
```

---

## 🚀 Execução de Experimentos

### Litmus - Pod Delete

```yaml
# pod-delete.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: pod-delete-chaos
spec:
  appinfo:
    appns: default
    applabel: app=myapp
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '30'
```

```bash
kubectl apply -f pod-delete.yaml
```

### Chaos Mesh - Network Delay

```yaml
# network-delay.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay
spec:
  action: delay
  mode: all
  selector:
    labelSelectors:
      app: myapp
  delay:
    latency: '100ms'
  duration: '30s'
```

---

## 🎯 Funcionalidades

- ✅ Network latency injection
- ✅ Service failure simulation
- ✅ Resource exhaustion tests
- ✅ DNS failure tests
- ✅ Dependency failure
- ✅ Automated recovery validation

---

## 📁 Estrutura

```
13-chaos-engineering-qa/
├── litmus/
│   ├── pod-delete.yaml
│   ├── network-chaos.yaml
│   └── cpu-stress.yaml
├── chaos-mesh/
│   ├── network-delay.yaml
│   └── pod-failure.yaml
├── toxiproxy/
│   └── setup.sh
├── scripts/
│   └── run-experiments.sh
└── README.md
```

---

## 👤 Autor

**Isaac Meneguini Albuquerque**
- 📧 isaacmeneguini@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/isaac-meneguini-albuquerque/)
