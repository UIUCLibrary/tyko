from tyko import middleware
from unittest.mock import Mock


class TestProjectMiddlewareEntity:
    def test_serialize_notes(self):
        data_provider = Mock()
        mw = middleware.ProjectMiddlwareEntity(data_provider)
        notes = [{"note_id": 1}]
        note_detail = {
                "note_id": 1,
                "note_type": "Inspection",
                "note_type_id": 1,
                "text": "dummy"
            }
        notes_middleware = Mock(spec=middleware.NotestMiddlwareEntity)
        notes_middleware.get = Mock(return_value=note_detail)
        assert [note_detail] == mw.serialize_notes(notes, notes_middleware)


class TestNotestMiddlewareEntity:
    def test_get_notes_remove_parent_info(self):
        data_provider = Mock()
        mw = middleware.NotestMiddlwareEntity(data_provider)
        mw._data_connector.get = Mock(
            return_value={
                "parent_project_ids": [],
                "parent_object_ids": [],
                "parent_item_ids": [],
            }
        )
        assert "parent_project_ids" not in mw.get(id=1, resolve_parents=False)
