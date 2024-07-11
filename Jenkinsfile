pipeline {
    agent any

    environment {
        THLINUX_CREDS = credentials('thlinux')
    }

    stages {
        stage('Remote SSH to Server') {
            steps {
                script {
                    def remote = [:]
<<<<<<< HEAD
                    remote.name = 'thadeu'
                    remote.host = ''
=======
                    remote.name = 'thlinux'
                    remote.host = '172.16.123.135'
>>>>>>> ffc4f5f (feat: modificado Jenkinsfile)
                    remote.allowAnyHosts = true
                    remote.user = env.THLINUX_CREDS_USR
                    remote.password = env.THLINUX_CREDS_PSW

<<<<<<< HEAD
                    sshCommand remote: remote, command: 'cd /home/thadeu/wppconnect-server && ./restart_all_api.sh'
=======
                    sshCommand(remote: remote, command: "rm -rf /Documents/Projects/Apps/wppconnect-server")
>>>>>>> ffc4f5f (feat: modificado Jenkinsfile)
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