# syntax = docker/dockerfile:1.2

FROM python:3.10-alpine as builder

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk add \
        gcc \
        build-base \
        musl-dev \
        linux-headers \
        mariadb-client \
        mariadb-dev \
        libressl-dev \
        libxml2-dev \
        libxslt-dev \
        npm


WORKDIR /build
COPY ["requirements.txt", "setup.py", "setup.cfg", "webpack.config.js", "pyproject.toml","MANIFEST.in", "package.json", "package-lock.json", "/build/"]
RUN --mount=type=cache,id=custom-pip,target=/root/.cache/pip python -m pip install pip --upgrade &&\
    pip install gunicorn mysqlclient lxml flask sqlalchemy build && \
    pip wheel --wheel-dir /build/wheels gunicorn mysqlclient -r /build/requirements.txt

COPY tyko/ /build/tyko/
RUN python -m build --wheel

FROM python:3.10-alpine as app
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk  \
    apk add \
        mariadb-client \
        mariadb-connector-c \
        curl

COPY requirements.txt ./requirements.txt
COPY --from=builder /build/wheels/*.whl ./wheel/
COPY --from=builder /build/dist/*.whl ./dist/


RUN pip install --no-index --find-links=./wheel dist/tyko-*.whl gunicorn mysqlclient -r requirements.txt


WORKDIR /app
VOLUME /database
ARG TYKO_SERVER_COLOR
ARG TYKO_USERNAME
ARG TYKO_PASSWORD
ARG DB_URI=sqlite:////tyko.db
# Create a config file
RUN echo "SQLALCHEMY_DATABASE_URI = '${DB_URI}'" > /app/config.cfg \
  && echo "SQLALCHEMY_TRACK_MODIFICATIONS = False" >> /app/config.cfg \
  && echo "USERNAME = '${TYKO_USERNAME}'" >> /app/config.cfg \
  && echo "PASSWORD = '${TYKO_PASSWORD}'" >> /app/config.cfg

RUN if [ ! -z "$TYKO_SERVER_COLOR" ]; \
    then \
        echo "TYKO_SERVER_COLOR = '${TYKO_SERVER_COLOR}'" >> /app/config.cfg; \
    fi
RUN pip install alembic
ADD deploy/tyko/alembic.ini deploy/tyko/setup_alembic.py /tmp/
RUN python /tmp/setup_alembic.py ${DB_URI} > /app/alembic.ini
ADD alembic /app/alembic/

EXPOSE 9182
ENV TYKO_SETTINGS=/app/config.cfg
ADD deploy/tyko/gunicorn.conf.py gunicorn.conf.py
HEALTHCHECK --start-period=5s CMD curl --fail http://localhost:9182/ || exit 1
#CMD alembic upgrade head
#TODO: create a way to run alembic upgrade head from startup
#CMD alembic upgrade head && gunicorn -c gunicorn.conf.py "tyko.run:create_app()"
#CMD alembic upgrade head && gunicorn -c gunicorn.conf.py "tyko.run:create_app()"
CMD python -m tyko init-db && alembic upgrade head && gunicorn -c gunicorn.conf.py "tyko.run:create_app()"
