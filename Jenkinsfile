// @Library(["devpi", "PythonHelpers"]) _
def parseBanditReport(htmlReport){
    script {
        try{
            def summary = createSummary icon: 'warning.gif', text: "Bandit Security Issues Detected"
            summary.appendText(readFile("${htmlReport}"))

        } catch (Exception e){
            echo "Failed to reading ${htmlReport}"
        }
    }
}

def startup(){
    parallel(
        [
            failFast: true,
            'Loading Reference Build Information': {
                node(){
                    checkout scm
                    discoverGitReferenceBuild(latestBuildIfNotFound: true)
                }
            },
            'Getting Distribution Info': {
                node('linux && docker') {
                    ws{
                        checkout scm
                        try{
                            docker.image('python').inside {
                                timeout(2){
                                    sh(
                                       label: 'Running setup.py with dist_info',
                                       script: '''python --version
                                                  PIP_NO_CACHE_DIR=off python setup.py dist_info
                                               '''
                                    )
                                    stash includes: '*.dist-info/**', name: 'DIST-INFO'
                                    stash includes: "deploy/**,database/**,alembic/**", name: 'SERVER_DEPLOY_FILES'
                                    archiveArtifacts artifacts: '*.dist-info/**'
                                }
                            }
                        } finally{
                            cleanWs()
                        }
                    }
                }
            }
        ]
    )
}
def get_props(){
    stage('Reading Package Metadata'){
        node() {
            try{
                unstash 'DIST-INFO'

                def metadataFiles = findFiles(glob: '*.dist-info/METADATA')
                if( metadataFiles.size() == 0){
                    error 'unable to located .dist-info/METADATA file'
                }
                def props = readProperties( interpolate: true, file: metadataFiles[0].path)
                return props
            } finally {
                cleanWs()
            }
        }
    }
}
def getDefaultParams(){
    def defaults = [:]
    defaults.USE_SONARQUBE = true
    return defaults
}

startup()
props = get_props()
defaultParamValues = getDefaultParams()
pipeline {
    agent none
    options {
        timeout(time: 1, unit: 'DAYS')
    }
    parameters {
        booleanParam(
                name: 'USE_SONARQUBE',
                defaultValue: defaultParamValues.USE_SONARQUBE,
                description: 'Send data test data to SonarQube'
            )
        booleanParam(name: "BUILD_CLIENT", defaultValue: false, description: "Build Client program")
        booleanParam(name: "TEST_RUN_TOX", defaultValue: false, description: "Run Tox Tests")
        booleanParam(name: "DEPLOY_SERVER", defaultValue: false, description: "Deploy server software to server")
    }
    stages {
        stage('Code Quality') {
            stages{
                stage('Testing'){
                    agent {
                      dockerfile {
                        filename 'CI/docker/jenkins/dockerfile'
                        label "linux && docker"
                        additionalBuildArgs '--build-arg USER_ID=$(id -u) --build-arg GROUP_ID=$(id -g)'
                        args '--mount source=sonar-cache-tyko,target=/opt/sonar/.sonar/cache'
                      }
                    }
                    stages{
                        stage('Setup Tests'){
                            parallel{
                                stage('Set Up Javascript Environment'){
                                    steps{
                                        sh 'npm install -y'
                                        sh 'mkdir -p reports'
                                    }
                                }
                                stage('Set Up C++ Test Environment'){
                                    steps{
                                        sh(
                                            label: 'Running conan',
                                            script: 'conan install . -if build/client'
                                        )
                                    }
                                }
                            }
                        }
                        stage("Running Tests"){
                            parallel {
                                stage("PyTest"){
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'UNSTABLE', message: 'Did not pass all pytest tests', stageResult: 'UNSTABLE') {
                                                tee('logs/pytest.log'){
                                                    sh(
                                                        label: "Run PyTest",
                                                        script: '''mkdir -p reports
                                                                   coverage run --parallel-mode --branch --source=tyko,tests -m pytest --junitxml=reports/test-report.xml
                                                                '''
                                                    )
                                                }
                                            }
                                        }
                                    }
                                    post {
                                        always{
                                            script{
                                                try{
                                                    // See CI/jenkins/scripts/python_warnings.groovy for more information about the groovyScript
                                                    recordIssues(qualityGates: [[threshold: 1, type: 'NEW', unstable: true]], tools: [groovyScript(parserId: 'pythonWarnings', pattern: 'logs/pytest.log')])
                                                } catch(Exception e){
                                                    echo "Unable to parse Python warnings. Reason: ${e}"
                                                }
                                            }
                                            junit "reports/test-report.xml"
                                        }
                                    }
                                }
                                stage("pydocstyle"){
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'Did not pass all pydocstyle tests', stageResult: 'UNSTABLE') {
                                                sh(
                                                    label: 'Run pydocstyle',
                                                    script: '''mkdir -p reports
                                                               pydocstyle tyko > reports/pydocstyle-report.txt
                                                            '''
                                                )
                                            }
                                        }

                                    }
                                    post {
                                        always{
                                            recordIssues(tools: [pyDocStyle(pattern: 'reports/pydocstyle-report.txt')])
                                        }
                                    }
                                }
                                stage('MyPy') {
                                    steps{
                                        timeout(10){
                                            tee('logs/mypy.log') {
                                                catchError(buildResult: 'SUCCESS', message: 'MyPy found issues', stageResult: 'UNSTABLE') {
                                                    sh(
                                                        label: "Running MyPy",
                                                        script: '''mkdir -p reports/mypy/html
                                                                   mkdir -p logs
                                                                   mypy tyko --html-report reports/mypy/html
                                                                   '''
                                                        )
                                                }
                                            }
                                        }
                                    }
                                    post {
                                        always {
                                            stash includes: "logs/mypy.log", name: 'MYPY_LOGS'
                                            publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false, reportDir: "reports/mypy/html/", reportFiles: 'index.html', reportName: 'MyPy HTML Report', reportTitles: ''])
                                            recordIssues(
                                                filters: [excludeFile('/stubs/*')],
                                                tools: [myPy(name: 'MyPy', pattern: 'logs/mypy.log')]
                                                )
                                        }
                                    }
                                }
                                stage('Bandit') {
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'Bandit found issues', stageResult: 'UNSTABLE') {
                                                sh(label: "Running bandit",
                                                    script: '''mkdir -p reports
                                                               bandit --format json --output reports/bandit-report.json --recursive tyko ||  bandit -f html --recursive tyko --output reports/bandit-report.html
                                                            '''
                                                )
                                            }
                                        }
                                    }
                                    post {
                                        always {
                                            archiveArtifacts "reports/bandit-report.json,reports/bandit-report.html"
                                            stash includes: "reports/bandit-report.json", name: 'BANDIT_REPORT'
                                        }
                                        unstable{
                                            script{
                                                if(fileExists('reports/bandit-report.html')){
                                                    parseBanditReport("reports/bandit-report.html")
                                                    addWarningBadge text: "Bandit security issues detected", link: "${currentBuild.absoluteUrl}"
                                                }
                                            }
                                        }
                                    }
                                }
                                stage('Flake8') {
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'Flake8 found issues', stageResult: 'UNSTABLE') {
                                                sh(
                                                    label: "Running Flake8",
                                                    script: '''mkdir -p logs
                                                               flake8 tyko --tee --output-file=logs/flake8.log
                                                               '''
                                                )
                                            }
                                        }
                                    }
                                    post {
                                        always {
                                            stash includes: "logs/flake8.log", name: 'FLAKE8_LOGS'
                                            archiveArtifacts 'logs/flake8.log'
                                            recordIssues(tools: [flake8(pattern: 'logs/flake8.log')])
                                        }
                                    }
                                }
                                stage('Pylint') {
                                    environment{
                                        PYLINTHOME="."
                                    }
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'Pylint found issues', stageResult: 'UNSTABLE') {
                                                sh(
                                                    label: "Running pylint",
                                                    script: '''mkdir -p reports
                                                               pylint --rcfile=./CI/jenkins/pylintrc tyko > reports/pylint.txt
                                                            '''
                                                )
                                            }
                                            sh(
                                                script: 'PYLINTHOME=. pylint  -r n --msg-template="{path}:{module}:{line}: [{msg_id}({symbol}), {obj}] {msg}" > reports/pylint_issues.txt',
                                                label: 'Running pylint for sonarqube',
                                                returnStatus: true
                                            )
                                        }
                                    }
                                    post{
                                        always{
                                            stash includes: "reports/pylint_issues.txt,reports/pylint.txt", name: 'PYLINT_REPORT'
                                            archiveArtifacts allowEmptyArchive: true, artifacts: "reports/pylint.txt"
                                            unstash "PYLINT_REPORT"
                                            recordIssues(tools: [pyLint(pattern: 'reports/pylint.txt')])
                                        }
                                    }
                                }
                                stage("Audit npm") {
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'Bandit found issues', stageResult: 'UNSTABLE') {
                                                sh(
                                                    label: "Running npm audit",
                                                    script: "npm audit"
                                                )
                                            }
                                        }
                                    }
                                }
                                stage('Jest'){
                                    environment{
                                        JEST_JUNIT_OUTPUT_NAME="js-junit.xml"
                                        JEST_JUNIT_ADD_FILE_ATTRIBUTE="true"
                                    }
                                    steps{
                                        timeout(10){
                                            withEnv(["JEST_JUNIT_OUTPUT_DIR=${WORKSPACE}/reports"]) {
                                                sh(
                                                    label:  "Running Jest",
                                                    script: '''
                                                               npm test -- --reporters=default --reporters=jest-junit --coverageReporters=cobertura --coverageReporters=lcov --collectCoverage   --coverageDirectory=$WORKSPACE/coverage-reports
                                                               '''
                                                )
                                            }
                                        }
                                    }
                                    post{
                                        always{
                                            stash includes: "reports/*.xml,coverage-reports/cobertura-coverage.xml", name: 'JEST_REPORT'
                                            junit "reports/*.xml"
                                            archiveArtifacts allowEmptyArchive: true, artifacts: "reports/*.xml"
                                        }
                                    }
                                }
                                stage('ESlint'){
                                    steps{
                                        timeout(10){
                                            catchError(buildResult: 'SUCCESS', message: 'ESlint found issues', stageResult: 'UNSTABLE') {
                                                sh(
                                                    label:  "Running ESlint",
                                                    script: './node_modules/.bin/eslint --format checkstyle tyko/static/js/ --ext=.js,.mjs  -o reports/eslint_report.xml -f json -o reports/eslint_report.json'
                                                )
                                            }
                                        }
                                    }
                                    post{
                                        always{
                                            archiveArtifacts allowEmptyArchive: true, artifacts: "reports/*.xml"
                                            recordIssues(tools: [esLint(pattern: 'reports/eslint_report.xml')])
                                        }
                                    }
                                }
                            }
                            post{
                                always{
                                    sh "coverage combine"
                                    sh "coverage xml -o coverage-reports/pythoncoverage-pytest.xml"
                                    stash includes: ".coverage.*,reports/pytest/junit-*.xml,coverage-reports/pythoncoverage-pytest.xml", name: 'PYTEST_COVERAGE_DATA'

                                    // remove this when publishCoverage works with cobertura coverage data produced by jest
                                    cobertura(
                                        autoUpdateHealth: false,
                                        autoUpdateStability: false,
                                        coberturaReportFile: 'coverage-reports/cobertura-coverage.xml',
                                        conditionalCoverageTargets: '70, 0, 0',
                                        enableNewApi: true,
                                        failUnhealthy: false,
                                        failUnstable: false,
                                        lineCoverageTargets: '80, 0, 0',
                                        maxNumberOfBuilds: 0,
                                        methodCoverageTargets: '80, 0, 0',
                                        onlyStable: false,
                                        sourceEncoding: 'ASCII',
                                        zoomCoverageChart: false
                                    )

                                    publishCoverage(
                                        adapters: [
                                                coberturaAdapter('coverage-reports/cobertura-coverage.xml'),
                                                coberturaAdapter('coverage-reports/pythoncoverage-pytest.xml')
                                                ],
                                        sourceFileResolver: sourceFiles('STORE_ALL_BUILD'),
                                    )
                                    archiveArtifacts allowEmptyArchive: true, artifacts: "coverage-reports/*.xml"
                                }
                            }
                        }
                        stage('Submit Test Results to Sonarcloud for Analysis'){
                            options{
                                lock('tyko-sonarcloud')
                            }
                            when{
                                equals expected: true, actual: params.USE_SONARQUBE
                                beforeAgent true
                                beforeOptions true
                            }
                            steps{
//                                 sh(
//                                     label: 'Preparing c++ coverage data available for SonarQube',
//                                     script: """mkdir -p build/coverage
//                                     find ./build -name '*.gcno' -exec gcov {} -p --source-prefix=${WORKSPACE}/ \\;
//                                     mv *.gcov build/coverage/
//                                     """
//                                     )

                                script{
                                    load('CI/jenkins/scripts/sonarqube.groovy').sonarcloudSubmit2(
                                        credentialsId: 'sonarcloud-token',
                                        projectVersion: props.Version
                                    )
//                                     load('ci/jenkins/scripts/sonarqube.groovy').sonarcloudSubmit('reports/sonar-report.json', 'sonarcloud-token')
                                }
                            }
                            post {
                                cleanup{
                                        cleanWs(
                                            deleteDirs: true,
                                            patterns: [
                                                [pattern: 'reports/', type: 'INCLUDE'],
                                                [pattern: 'logs/', type: 'INCLUDE'],
                                                [pattern: '.mypy_cache/', type: 'INCLUDE'],
                                                [pattern: '**/__pycache__/', type: 'INCLUDE'],
                                                [pattern: 'test-report.xml', type: 'INCLUDE'],
                                                [pattern: 'node_modules/', type: 'INCLUDE'],
                                            ]
                                        )
                                    }
                                }
//                                 always{
//                                     script{
//                                         if(fileExists('reports/sonar-report.json')){
//                                             recordIssues(tools: [sonarQube(pattern: 'reports/sonar-report.json')])
//                                         }
//                                     }
//                                 }
//                             }
                        }
                    }

                }
                stage("Tox") {
                    when {
                        equals expected: true, actual: params.TEST_RUN_TOX
                    }
                    agent {
                        dockerfile {
                            filename 'CI/docker/jenkins/dockerfile'
                            label "linux && docker"
                        }
                    }
                    steps {
                        timeout(10){
                            sh "mkdir -p logs"
                            script{
                                try{
                                    sh (
                                        label: "Run Tox",
                                        script: "tox --parallel=auto --parallel-live --workdir .tox -vv --result-json=logs/tox_report.json"
                                    )

                                } catch (exc) {
                                    sh(
                                        label: "Run Tox with new environments",
                                        script: "tox --recreate --parallel=auto --parallel-live --workdir .tox -vv --result-json=logs/tox_report.json"
                                    )
                                }
                            }
                        }
                    }
                    post {
                        always {
                            archiveArtifacts allowEmptyArchive: true, artifacts: '.tox/py*/log/*.log,.tox/log/*.log,logs/tox_report.json'
                            recordIssues(tools: [pep8(id: 'tox', name: 'Tox', pattern: '.tox/py*/log/*.log,.tox/log/*.log')])
                        }
                        cleanup{
                            cleanWs(
                                deleteDirs: true,
                                patterns: [
                                    [pattern: 'logs/', type: 'INCLUDE'],
                                    [pattern: '.tox/', type: 'INCLUDE'],
                                    ]
                            )
                        }
                    }
                }
            }
        }
        stage("Packaging") {
            failFast true
            parallel{
                stage('Packaging Client Software for Windows'){
                    agent {
                      dockerfile {
                        filename 'CI/jenkins/dockerfiles/build_VS2019/Dockerfile'
                        label "windows && docker"
                      }
                    }
                    when {
                        anyOf{
                            equals expected: true, actual: params.BUILD_CLIENT
                            changeset(pattern: "client/**,CI/build_VS2019/**,conanfile.py")
                        }
                        beforeAgent true
                    }
                    options{
                        timestamps()
                    }
                    stages{
                        stage("Build Client"){
                            steps{
                                bat "if not exist build mkdir build"

                                bat(
                                    label: "installing dependencies",
                                    script: "conan install . -if build"
                                    )
                                bat(
                                    label: "Configuring CMake Project",
                                    script:"cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE:FILE=${WORKSPACE}\\build\\conan_paths.cmake"
                                    )
                                bat(
                                    label: "Building project",
                                    script: "cmake --build build --config Release"
                                    )
                            }
                            post{
                                success{
                                    bat "dumpbin /DEPENDENTS build\\Release\\avdatabaseEditor.exe"
                                }
                            }
                        }
                        stage("Package Client"){
                            steps{
                                dir("build"){
                                    bat(script: "cpack -G WIX;ZIP;NSIS --verbose")
                                }
                            }
                        }
                    }
                    post{
                        success{
                            script{
                                def install_files = findFiles(glob: "build/tyko-*-win64.zip,build/tyko-*-win64.msi,build/tyko-*-win64.exe")
                                bat "if not exist dist mkdir dist"
                                install_files.each{
                                    powershell "Move-Item -Path ${it.path} -Destination .\\dist\\${it.name}"
                                }

                            }
                            stash includes: "dist/*", name: 'CLIENT_BUILD_PACKAGES'
                        }
                        failure{
                            bat "tree /A /F build"
                        }
                        cleanup{
                            cleanWs(
                                deleteDirs: true,
                                patterns: [
                                    [pattern: 'dist', type: 'INCLUDE'],
                                    [pattern: 'dist/', type: 'INCLUDE'],
                                    [pattern: 'build/', type: 'INCLUDE']
                                ]
                            )
                        }
                    }
                }
                stage("Creating Python Packages"){
                    agent {
                        dockerfile {
                            filename 'CI/docker/jenkins/dockerfile'
                            label "linux && docker"
                        }
                    }
                    steps{
                        timeout(10){
                            sh(script: "python3 setup.py sdist -d dist --format=zip,gztar bdist_wheel -d dist")
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: "dist/*.whl,dist/*.zip,dist/*.tar.gz", fingerprint: true
                            stash includes: "dist/*.whl,dist/*.zip,dist/*.tar.gz", name: 'PYTHON_PACKAGES'
                        }
                        unstable {
                            archiveArtifacts artifacts: "dist/*.whl,dist/*.zip,dist/*.tar.gz", fingerprint: true
                            stash includes: "dist/*.whl,dist/*.zip,dist/*.tar.gz,", name: 'PYTHON_PACKAGES'
                        }

                        cleanup{
                            cleanWs()
                        }
                    }
                }
            }
        }
        stage("Testing Package Installers"){
            agent {
                docker {
                    image 'mcr.microsoft.com/windows/servercore:ltsc2019'
                    label 'windows && docker'
                }
            }
            when {
                equals expected: true, actual: params.BUILD_CLIENT
                beforeAgent true
            }
            steps{
                unstash "CLIENT_BUILD_PACKAGES"
                script{
                    findFiles(glob: "dist/*.msi").each{
                        powershell (
                            label: "Installing ${it.name}",
                            script:"New-Item -ItemType Directory -Force -Path ${WORKSPACE}\\logs; msiexec /i ${it.path} /qn /norestart /L*v! ${WORKSPACE}\\logs\\msiexec.log"
                        )
                    }
                }
            }
            post{
                always{
                    archiveArtifacts allowEmptyArchive: true, artifacts: "logs\\msiexec.log"
                    bat 'dir "C:\\Program Files\\"'
                }
                success{
                    archiveArtifacts artifacts: "dist/*.msi,dist/*.exe,dist/*.zip"
                }
                cleanup{
                    cleanWs(
                        deleteDirs: true,
                        patterns: [
                            [pattern: 'build/', type: 'INCLUDE'],
                            [pattern: 'dist/', type: 'INCLUDE'],
                            [pattern: 'logs/', type: 'INCLUDE'],
                        ]
                    )
                }
            }
        }
        stage("Deploy"){
            options{
                lock("tyko-deploy")
            }
            parallel{
                stage("Deploy Server"){
                    agent {
                        label "!aws"
                    }
                    options {
                        skipDefaultCheckout true
                        retry(3)
                    }
                    when{
                        equals expected: true, actual: params.DEPLOY_SERVER
                        beforeInput true
                    }
                    input {
                      message 'Deploy to server'
                      parameters {
                        string(defaultValue: 'avdatabase.library.illinois.edu', description: 'Location where to install the server application', name: 'SERVER_URL', trim: false)
                        credentials credentialType: 'com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl', defaultValue: 'henryUserName', description: '', name: 'SERVER_CREDS', required: false
                        credentials credentialType: 'com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl', defaultValue: 'TYKO_DB_CREDS', description: '', name: 'DATABASE_CREDS', required: false
                        booleanParam defaultValue: false, description: 'Launch web server', name: 'START_WEBSERVER'
                        choice choices: ['green', 'blue'], description: 'Which server do you want to deploy this to?', name: 'SERVER_COLOR'
                      }
                    }
                    stages{
                        stage("Backing up database"){
                            steps{
                                script{
                                    def remote = [:]

                                    withCredentials([usernamePassword(credentialsId: SERVER_CREDS, passwordVariable: 'password', usernameVariable: 'username')]) {
                                        remote.name = 'test'
                                        remote.host = SERVER_URL
                                        remote.user = username
                                        remote.password = password
                                        remote.allowAnyHosts = true
                                    }
                                    def CONTAINER_NAME_DATABASE = "tyko_${SERVER_COLOR}_db_1"
                                    def backup_file_name = "tyko-${BRANCH_NAME}-${BUILD_NUMBER}-backup.sql"
                                    catchError(buildResult: 'SUCCESS', message: 'Unable to make a backup of database', stageResult: 'UNSTABLE') {
                                        withCredentials([usernamePassword(credentialsId: DATABASE_CREDS, passwordVariable: 'password', usernameVariable: 'username')]) {
                                            sshCommand(
                                                remote: remote,
                                                command: "docker exec ${CONTAINER_NAME_DATABASE} /bin/bash -c \"mysqldump av_preservation --user='${username}' --password='${password}' > /tmp/${backup_file_name}\" && docker cp ${CONTAINER_NAME_DATABASE}:/tmp/${backup_file_name} ~/backups/"
                                                )
                                        }
                                    }
                                }

                            }
                        }
                        stage("Deploying New Server"){

                            steps{
                                unstash "PYTHON_PACKAGES"
                                unstash "SERVER_DEPLOY_FILES"
                                script{
                                    def remote = [:]

                                    withCredentials([usernamePassword(credentialsId: SERVER_CREDS, passwordVariable: 'password', usernameVariable: 'username')]) {
                                        remote.name = 'test'
                                        remote.host = SERVER_URL
                                        remote.user = username
                                        remote.password = password
                                        remote.allowAnyHosts = true
                                    }
                                    sshRemove remote: remote, path: "package", failOnError: false
                                    sshCommand remote: remote, command: "mkdir -p package"
                                    sshPut remote: remote, from: 'dist', into: './package/'
                                    sshCommand remote: remote, command: "tar xvzf ./package/dist/tyko-${props.Version}.tar.gz -C ./package"
                                    sshCommand remote: remote, command: "mv ./package/tyko-${props.Version}/* ./package/"
                                    sshPut remote: remote, from: 'deploy', into: './package/'
                                    sshPut remote: remote, from: 'database', into: './package/'
                                    sshPut remote: remote, from: 'alembic', into: './package/'

                                    sshCommand remote: remote, command: """cd package &&
        docker-compose -f deploy/docker-compose.yml -p tyko build ${SERVER_COLOR}_api ${SERVER_COLOR}_db &&
        docker-compose -f deploy/docker-compose.yml -p tyko up -d ${START_WEBSERVER ? 'nginx': ''} ${SERVER_COLOR}_api ${SERVER_COLOR}_db"""
                                    // sshRemove remote: remote, path: "package", failOnError: false
                                    if(SERVER_COLOR == "green"){
                                        addBadge(icon: 'success.gif', id: '', link: "http://${SERVER_URL}:8000/", text: 'Server Application Deployed')
                                    } else if (SERVER_COLOR == "blue"){
                                        addBadge(icon: 'success.gif', id: '', link: "http://${SERVER_URL}:8001/", text: 'Server Application Deployed')
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
     }
}
