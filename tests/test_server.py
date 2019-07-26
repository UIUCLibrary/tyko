import avforms
import pytest


@pytest.fixture()
def server():
    app = avforms.create_app("sqlite:///:memory:")
    app.config["TESTING"] = True
    yield app.test_client()
    print("Tearing down")


def test_root(server):
    resp = server.get("/")
    assert resp.status == "200 OK"
