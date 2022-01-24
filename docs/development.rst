===========
Development
===========

Setting up a Development Environment
====================================


1) Create a virtual environment

    Unix systems::

        python3 -m venv venv

    Windows::

        py -m venv venv

2) Activate virtual environment

    Unix systems::

        venv/bin/activate

    Windows::

        venv\\Scripts\\activate


3) Install dependencies::

    pip install -r requirements.txt -r CI/docker/jenkins/requirements-ci.txt



Run static analysis tools
=========================

Note: this requires to tox to be install in your python environment

Flake8
------

Good for finding code style violations::

    tox -e flake8

mypy
----

Good for finding error using the wrong argument type::

    tox -e mypy

pylint
------

Good for finding errors and code smells::

    tox -e pylint
