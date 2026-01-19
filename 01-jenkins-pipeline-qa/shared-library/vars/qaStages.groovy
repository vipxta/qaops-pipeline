// Shared Library para QA Pipelines

def call(Map config = [:]) {
    def defaultConfig = [
        nodeVersion: '18',
        runE2E: true,
        coverageThreshold: 80,
        slackChannel: '#qa-alerts'
    ]
    
    config = defaultConfig + config
    
    pipeline {
        agent any
        
        stages {
            stage('Setup') {
                steps {
                    script {
                        setupEnvironment(config)
                    }
                }
            }
            
            stage('Test Suite') {
                steps {
                    script {
                        runTestSuite(config)
                    }
                }
            }
            
            stage('Quality Gate') {
                steps {
                    script {
                        checkQualityGate(config)
                    }
                }
            }
        }
    }
}

def setupEnvironment(Map config) {
    sh "nvm use ${config.nodeVersion} || true"
    sh 'npm ci'
}

def runTestSuite(Map config) {
    sh 'npm run test:unit -- --coverage'
    sh 'npm run test:integration'
    
    if (config.runE2E) {
        sh 'npm run test:e2e'
    }
}

def checkQualityGate(Map config) {
    def coverage = sh(
        script: "cat coverage/coverage-summary.json | jq '.total.lines.pct'",
        returnStdout: true
    ).trim().toFloat()
    
    if (coverage < config.coverageThreshold) {
        error "Coverage ${coverage}% below threshold ${config.coverageThreshold}%"
    }
    
    echo "✅ Quality Gate Passed - Coverage: ${coverage}%"
}

def notifySlack(String status, Map config) {
    def color = status == 'SUCCESS' ? 'good' : 'danger'
    def emoji = status == 'SUCCESS' ? '✅' : '❌'
    
    slackSend(
        channel: config.slackChannel,
        color: color,
        message: "${emoji} ${env.JOB_NAME} #${env.BUILD_NUMBER}: ${status}"
    )
}

return this
