from setuptools import setup

setup(
    name='tyko',
    version='0.0.1.dev1',
    url='https://github.com/UIUCLibrary/avdatabase',
    license='University of Illinois/NCSA Open Source License',
    author='University Library at The University of Illinois at Urbana '
           'Champaign: Preservation Services',
    author_email='prescons@library.illinois.edu',
    description='Database for handling entering metadata for AV content',
    packages=[
        'tyko',
        'tyko.schema',
        'tyko.views',
        'tyko.pbcore',
        'tyko.pbcore.templates',
    ],
    package_data={
        "": [
            "templates/*.html",
            "templates/forms/*.html",
            "static/css/*.css",
            "static/css/*.css.map",
            "static/js/*.js",
            "static/js/*.mjs",
            "static/js/*.js.map",
        ],
        "tyko.pbcore.templates":[
            "*.xml"
        ]
    },
    setup_requires=["pytest-runner"],
    tests_require=["pytest", "pytest-bdd"],
    install_requires=[
        "sqlalchemy",
        # "mysqlclient",
        "flask",
        "Flask-SQLAlchemy",
        "lxml",
        "Jinja2"
        ],
    python_requires='>3.7',
    entry_points={
        "console_scripts": [
            "avdata=tyko.run:main"
        ]
    }
)
