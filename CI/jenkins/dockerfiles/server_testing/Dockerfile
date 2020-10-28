FROM python:3.7

ADD requirements.txt ./
RUN pip install --no-cache-dir \
    "tox<3.10" \
    pytest \
    "pytest-bdd<4.0" \
    bandit \
    mypy \
    flake8 \
    coverage \
    pylint \
    pydocstyle \
    sqlalchemy-stubs \
     -r requirements.txt