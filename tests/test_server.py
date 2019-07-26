import avforms
import pytest
import json

@pytest.fixture(scope="module")
def server():
    app = avforms.create_app("sqlite:///:memory:")
    app.config["TESTING"] = True
    return app.test_client()

@pytest.mark.parametrize(
    "route", ["/",
              "/about",
              "/api",
              "/api/formats",
              "/api/projects",
              "/api/collections",
              ]
)
def test_static(route):
    app = avforms.create_app("sqlite:///:memory:")
    app.config["TESTING"] = True
    with app.test_client() as server:
        resp = server.get(route)
        assert resp.status == "200 OK"



def test_api_formats(server):
    resp = server.get("/api/formats")
    assert resp.status == "200 OK"
    tmp_data = json.loads(resp.data)

    for k, v in  avforms.scheme.format_types.items():
        for entry in tmp_data:
            if entry["name"] == k:
                assert entry["id"] == v[0]
                break
        else:
            assert False
