pipeline {
    agent any

    tools {
        jdk 'jdk17'
        maven ''
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        THLINUX_CREDS = credentials('thlinux')
        DOCKER_CRED_ID = 'docker'
        IMAGE_NAME = 'thsre/wppconnect'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout Git') {
            steps {
                git branch: 'main', url: ''
            }
        }
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        stage('Sonarqube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.java.binaries=. \
                        -Dsonar.projectKey=wppconnect
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Maven Build') {
            steps {
                sh 'mvn clean install'
            }
        }
        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('Determine Docker Image Version') {
            steps {
                script {
                    def latestVersion = sh(
                        script: "curl -s https://registry.hub.docker.com/v1/repositories/${IMAGE_NAME}/tags | jq -r '.[].name' | grep -E '^v[0-9]+' | sort -V | tail -n 1",
                        returnStdout: true
                    ).trim()
                    
                    if (latestVersion) {
                        def versionParts = latestVersion.tokenize('.')
                        def majorVersion = versionParts[0].replace('v', '').toInteger()
                        def newVersion = "v${majorVersion + 1}"
                        env.NEW_IMAGE_TAG = newVersion
                    } else {
                        env.NEW_IMAGE_TAG = 'v1'
                    }
                }
            }
        }
        stage('Build and Push to Docker Hub') {
            steps {
                script {
                    withDockerRegistry(credentialsId: DOCKER_CRED_ID) {
                        sh "docker build -t ${IMAGE_NAME}:${NEW_IMAGE_TAG} ."
                        sh "docker push ${IMAGE_NAME}:${NEW_IMAGE_TAG}"
                    }
                }
            }
        }
        stage('Trivy') {
            steps {
                sh "trivy image ${IMAGE_NAME}:${NEW_IMAGE_TAG} > trivy.txt"
            }
        }
        stage('Remote SSH to Server and Deploy to Container') {
            steps {
                script {
                    def remote = [:]
                    remote.name = 'thlinux'
                    remote.host = '172.16.123.135'
                    remote.allowAnyHosts = true
                    remote.user = env.THLINUX_CREDS_USR
                    remote.password = env.THLINUX_CREDS_PSW

                    sshCommand remote: remote, command: ""./restart_all_containers.sh"""
                }
            }
        }
    }
    post {
        always {
            sleep 5
        }
    }
}    