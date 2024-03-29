FROM ubuntu:20.04 as base_image
# FROM python:3.9 as base_image
ENV TZ=America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY CI/docker/jenkins/apt/apt-packages.txt /packages/apt-packages.txt

RUN apt -y update && \
    xargs -a /packages/apt-packages.txt apt install -y && \
    rm -rf /var/lib/apt/lists/*

RUN npm cache clean -f && \
    npm install -g n

RUN n stable -y && \
    npm install -g npm && \
    mkdir /.npm && \
    chmod 777 /.npm

#==============================================================================

FROM base_image as SONAR_BUILDER
RUN apt-get update && \
    apt-get install -y unzip

ENV SONAR_SCANNER_VERSION=4.6.2.2472
ARG SONAR_SCANNER_HOME=/opt/sonar/${SONAR_SCANNER_VERSION}-linux
ENV SONAR_USER_HOME=/opt/sonar/.sonar

RUN curl --create-dirs -sSLo /tmp/sonar-scanner.zip \
        https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-$SONAR_SCANNER_VERSION-linux.zip && \
    unzip -o /tmp/sonar-scanner.zip -d /opt/sonar/ && \
    rm /tmp/sonar-scanner.zip && \
    mkdir -p $SONAR_USER_HOME/cache && \
    chmod -R 777 "${SONAR_USER_HOME}" &&\
    ln -s /opt/sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    which sonar-scanner


RUN curl --create-dirs -sSLo /tmp/build-wrapper-linux-x86.zip https://sonarcloud.io/static/cpp/build-wrapper-linux-x86.zip && \
    unzip -o /tmp/build-wrapper-linux-x86.zip -d /opt/ && \
    ln -s /opt/build-wrapper-linux-x86/build-wrapper-linux-x86-64 /usr/local/bin/build-wrapper-linux-x86-64 && \
    which build-wrapper-linux-x86-64
#==============================================================================

FROM base_image as wheel_builder

COPY CI/docker/jenkins/requirements-ci.txt requirements.txt ./
RUN python3 -m pip install pip --upgrade
RUN python3 -m pip install wheel

RUN python3 -m pip wheel -w /wheels/ \
    -r requirements-ci.txt \
    -r requirements.txt

#==============================================================================
FROM base_image
COPY --from=SONAR_BUILDER /opt/sonar /opt/sonar/
COPY --from=SONAR_BUILDER /opt/build-wrapper-linux-x86 /opt/build-wrapper-linux-x86/
ENV SONAR_SCANNER_VERSION=4.6.2.2472
ARG SONAR_SCANNER_HOME=/opt/sonar/${SONAR_SCANNER_VERSION}-linux
ENV SONAR_USER_HOME=/opt/sonar/.sonar
RUN npm install -g jsdoc
RUN ln -s /opt/sonar/sonar-scanner-${SONAR_SCANNER_VERSION}-linux/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    which sonar-scanner

RUN ln -s /opt/build-wrapper-linux-x86/build-wrapper-linux-x86-64 /usr/local/bin/build-wrapper-linux-x86-64 && \
    which build-wrapper-linux-x86-64

RUN mkdir -p /.sonar/cache && \
    chmod -R 777 /.sonar/cache

RUN chmod -R 777 $SONAR_USER_HOME

ENV SONAR_SCANNER_OPTS="-server"

COPY CI/docker/jenkins/requirements-ci.txt requirements.txt ./
COPY --from=wheel_builder /wheels /wheels/
RUN mkdir -p /.cache/pip && \
    chmod -R 777 /.cache
RUN python3 -m pip install --no-cache-dir  --find-links=/wheels/ \
    -r requirements-ci.txt \
    -r requirements.txt

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN if id $USER_ID ; then \
        echo 'Existing user id found: Creating an alias' ;\
        groupadd --non-unique --gid $GROUP_ID user ; \
        useradd  --non-unique --uid $USER_ID -s /bin/sh -m -d /home/user -g user user  ; \
    else \
        echo "Creating user id for $USER_ID" ;\
        groupadd -g $GROUP_ID user ; \
        echo "Create GROUP_ID $GROUP_ID" ;\
        useradd  -u $USER_ID -s /bin/sh -m -d /home/user -g user user ;\
    fi
