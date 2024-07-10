pipeline {
    agent any

    environment {
        THLINUX_CREDS = credentials('thadeu')
    }
    stages {
        stage('Remote SSH to Server and Deploy to Container') {
            steps {
                script {
                    def remote = [:]
                    remote.name = 'thadeu'
                    remote.host = '172.16.123.135'  // Insira o endereço IP ou hostname correto
                    remote.allowAnyHosts = true
                    remote.user = env.THLINUX_CREDS_USR
                    remote.password = env.THLINUX_CREDS_PSW

                    sshCommand remote: remote, command: './restart_all_containers.sh'
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