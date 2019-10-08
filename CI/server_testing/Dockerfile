FROM python:3.7

ADD requirements.txt ./
RUN pip install --no-cache-dir \
    tox \
    pytest \
    pytest-bdd \
    mypy \
    flake8 \
    coverage \
    pylint \
    sqlalchemy-stubs \
     -r requirements.txt