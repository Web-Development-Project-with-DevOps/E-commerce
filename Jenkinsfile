pipeline {
    agent any
    stages {
        stage('Clear Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/Web-Development-Project-with-DevOps/E-commerce.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ecommerce:latest .'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh 'docker run -d  --name ecommerce -p 8000:8000 ecommerce:latest'
                }
            }
        }
    }
}
