# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
from setuptools.config import read_configuration

sys.path.insert(0, os.path.abspath('..'))


def get_project_metadata():
    path = os.path.abspath(
        os.path.join(os.path.dirname(__file__),
                     "../setup.cfg")
    )

    return read_configuration(path)["metadata"]


# -- Project information -----------------------------------------------------
metadata = get_project_metadata()

project = metadata.get('name', 'Tyko')

copyright = \
    '2022, University Library at The University of Illinois at Urbana ' \
    'Champaign: Preservation Services'

author = metadata.get(
    'author',
    'University Library at The University of Illinois at Urbana Champaign: '
    'Preservation Services'
)


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.doctest',
    'sphinx_js'
]
js_source_path = '../tyko/static/js'
jsdoc_config_path = 'jsdocs_config.json'
# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'alabaster'
html_theme_options = {
    "logo": "full_mark_horz_bw.gif",
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']