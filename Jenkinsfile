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
                    remote.host = ''
                    remote.allowAnyHosts = true
                    remote.user = env.THLINUX_CREDS_USR
                    remote.password = env.THLINUX_CREDS_PSW

                    sshCommand remote: remote, command: 'cd /home/thadeu/wppconnect-server && ./restart_all_api.sh'
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