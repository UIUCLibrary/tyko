from unittest.mock import Mock

import pytest
import tyko.utils

good_test_data = [
    ("1993", 1),
    ("11/1950", 2),
    ("11/26/1993", 3),
    ("11/6/1993", 3),
    ("1/6/1993", 3),
]


@pytest.mark.parametrize("date, expected", good_test_data)
def test_date_identify_precision(date, expected):
    assert tyko.utils.identify_precision(date) == expected


bad_test_data = [
    "11-46-1993",
    "31-6-1993"
]


@pytest.mark.parametrize("date", bad_test_data)
def test_date_identify_bad_precision(date):
    with pytest.raises(AttributeError):
        assert tyko.utils.identify_precision(date)


class TestGitVersionStrategy:

    def test_get_git_commit(self, monkeypatch):
        strategy = tyko.utils.GitVersionStrategy()
        check_output = Mock()
        with monkeypatch.context() as context:
            context.setattr(
                tyko.utils.subprocess,
                "check_output",
                check_output
            )
            context.setattr(
                tyko.utils.os.path,
                "exists",
                lambda path: path == "fake_git"
            )
            strategy.get_git_commit(git_command="fake_git")
        assert check_output.called is True

    def test_get_version_starts_with_prefix(self, monkeypatch):

        monkeypatch.setattr(
            tyko.utils.GitVersionStrategy,
            "get_git_commit",
            lambda *_: "somevalue"
        )
        strategy = tyko.utils.GitVersionStrategy()
        assert strategy.get_version().startswith("GIT")

