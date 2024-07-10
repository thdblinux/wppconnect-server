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
<<<<<<< HEAD
                    remote.host = '<coloque_o_endereço_ip_ou_hostname_aqui>'
=======
                    remote.host = ''
>>>>>>> 160869b (feat: modificado o jenkinsfile)
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