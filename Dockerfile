FROM python:3.7-alpine
RUN apk add --no-cache gcc musl-dev linux-headers mariadb-client mariadb-dev libressl-dev
COPY requirements.txt .
RUN python -m pip install pip --upgrade
RUN pip install -r requirements.txt
RUN pip install -U setuptools wheel tox mypy flake8 pytest pytest-bdd