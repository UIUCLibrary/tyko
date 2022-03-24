import os
import shutil
from distutils.errors import DistutilsExecError
import distutils.command.build
from setuptools import setup, Command


class NewBuildCommand(distutils.command.build.build):
    def run(self):
        self.run_command('webpack')
        super(NewBuildCommand, self).run()


class WebPackCommand(Command):
    description = \
        "compile and bundle javascript source files and dependency libraries"

    user_options = [
        ("inplace", "i", "install javascript files inplace"),
        ("mode=", "i", "package mode"),
        (
            "npm-path=",
            None,
            "path to npm executable (defaults to one on the path"
        )
    ]

    def __init__(self, dist, **kw):
        super().__init__(dist, **kw)
        self.output_path = None
        self.node_modules_path = './node_modules'
        self.inplace = None
        self.npm_path = None
        self.mode = None

    def initialize_options(self):
        self.output_path = ''
        self.inplace = None
        self.npm_path = None
        self.mode = None

    def finalize_options(self):
        if self.mode is None:
            self.mode = "production"

        if self.npm_path is None:
            self.npm_path = shutil.which('npm')

        build_py_command = self.get_finalized_command('build_py')
        output_root = "" if self.inplace == 1 else build_py_command.build_lib
        self.output_path = os.path.join(
            output_root,
            'tyko',
            'static',
            'pack'
        )

    def run(self):
        if self.npm_path is None or os.path.exists(self.npm_path) is False:
            raise DistutilsExecError(
                "Required program missing from toolchain: npm"
            )
        if not os.path.exists(self.node_modules_path):
            self.announce("Installing npm")
            self.spawn([
                    self.npm_path,
                    'install'
            ])

        command = [
            self.npm_path,
            'run', 'env', '--',
            'webpack', f'--output-path={self.output_path}',
            f'--mode={self.mode}'
        ]
        self.announce("Running webpack")
        self.spawn(command)

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
            "static/pack/*",
        ],
        "tyko.pbcore.templates": [
            "*.xml"
        ]
    },
    setup_requires=["pytest-runner"],
    tests_require=["pytest", "pytest-bdd"],
    install_requires=[
        "SQLAlchemy>1.4",
        # "mysqlclient",
        "flask",
        "MarkupSafe<2",
        "Flask-SQLAlchemy",
        "lxml",
        "Jinja2<3.0,>2.0"
        ],
    python_requires='>3.7',
    entry_points={
        "console_scripts": [
            "avdata=tyko.run:main"
        ]
    },
    cmdclass={
        'webpack': WebPackCommand,
        'build': NewBuildCommand,
    },
)
