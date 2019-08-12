from setuptools import setup

setup(
    name='avforms',
    version='0.0.1',
    url='https://github.com/UIUCLibrary/avdatabase',
    license='University of Illinois/NCSA Open Source License',
    author='University Library at The University of Illinois at Urbana '
           'Champaign: Preservation Services',
    author_email='prescons@library.illinois.edu',
    description='Database for handling entering metadata for AV content',
    packages=['avforms'],
    package_data={
        "": [
            "templates/*.html",
            "static/css/*.css",
            "static/css/*.css.map",
            "static/js/*.js",
            "static/js/*.js.map",

        ]
    },
    setup_requires=["pytest-runner"],
    tests_require=["pytest", "pytest-bdd"],
    install_requires=[
        "sqlalchemy",
        # "mysqlclient",
        "flask"
        ],
    entry_points={
        "console_scripts": [
            "avdata=avforms.run:main"
        ]
    }
)
