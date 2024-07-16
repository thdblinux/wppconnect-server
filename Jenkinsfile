pipeline {
    agent any

    environment {
        THLINUX_CREDS = credentials('admdistri')
    }

    stages {
        stage('User Confirmation Timeout 3m') {
            steps {
                script {
                    timeout(time: 120, unit: 'SECONDS') {
                        def userInput = input(
                            id: 'Proceed1', 
                            message: 'Do you want to proceed with the deployment?', 
                            parameters: [
                                booleanParam(defaultValue: true, description: '', name: 'Proceed')
                            ]
                        )
                        if (!userInput) {
                            error("Deployment aborted by the user.")
                        }
                    }
                }
            }
        }

        stage('Remote SSH to Server and Deploy to Container') {
            steps {
                script {
                    def remote = [:]
                    remote.name = ''
                    remote.host = ''
                    remote.allowAnyHosts = true
                    remote.user = env.THLINUX_CREDS_USR
                    remote.password = env.THLINUX_CREDS_PSW

                    sshCommand remote: remote, command: "cd ~/dockers && echo ${env.THLINUX_CREDS_PSW} | sudo -S ./reinicia_api.sh wppconnect-server-<>"
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