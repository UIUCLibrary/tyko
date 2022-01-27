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
