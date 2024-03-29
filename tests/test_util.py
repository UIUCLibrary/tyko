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
    @pytest.fixture()
    def strategy(self):
        return tyko.utils.GitVersionStrategy()

    def test_get_git_commit(self, strategy, monkeypatch):
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

    def test_get_version_starts_with_prefix(self, strategy, monkeypatch):

        monkeypatch.setattr(
            tyko.utils.GitVersionStrategy,
            "get_git_commit",
            lambda *_: "somevalue"
        )
        assert strategy.get_version().startswith("GIT")

    def test_git_command_not_found(self, strategy, monkeypatch):
        with monkeypatch.context() as context:
            context.setattr(
                tyko.utils.os.path,
                "exists",
                lambda path: path != "invalid"
            )
            with pytest.raises(FileNotFoundError):
                strategy.get_git_commit(git_command="invalid")

    def test_get_git_commit_no_git_installed(self, strategy, monkeypatch):
        monkeypatch.setattr(tyko.utils.shutil, "which", lambda *args: None)
        with pytest.raises(tyko.utils.InvalidVersionStrategy):

            strategy.get_git_command()


def test_get_version_no_valid_raises():
    invalid_strategy = Mock(
        name="invalid_strategy",
        spec=tyko.utils.AbsGetVersionStrategy
    )
    invalid_strategy.get_version = Mock()
    invalid_strategy.get_version.side_effect = \
        tyko.utils.InvalidVersionStrategy()

    invalid_strategy_type = Mock(return_value=invalid_strategy)
    invalid_strategy_type.__name__ = "invalid_strategy"

    with pytest.raises(tyko.utils.NoValidStrategy):
        tyko.utils.get_version(strategies=[invalid_strategy_type])
