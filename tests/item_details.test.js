/**
 * @jest-environment jsdom
 */

'use strict';
require('jest-fetch-mock').enableMocks();
jest.mock('../tyko/static/js/request.js');
import * as module from '../tyko/static/js/item_details.mjs';

describe('module', () => {
  beforeEach(() => {
    document.body.innerHTML = ``;
  });

  test('check missing data', async () => {
    return await expect(module.load()).rejects.toThrow(Error);
  });

  test('returns the data', async () => {
    module.urls['tapeTypesUrl'] =
        '/api/formats/cassette_tape/cassette_tape_tape_types';

    module.urls['cassetteTypesUrl'] =
        '/api/formats/cassette_tape/cassette_tape_format_types';

    module.urls['cassetteTapeTapeThicknessURL'] =
        '/api/formats/cassette_tape/cassette_tape_tape_thickness';

    return await expect(module.load()).resolves.toEqual(
        {
          'formatTypes': [
            {'value': 1, 'text': 'compact cassette'},
            {'value': 2, 'text': 'DAT'},
            {'value': 3, 'text': 'ADAT'},
            {'value': 4, 'text': 'Other'},
          ],
          'tapeTypes': [
            {'value': 1, 'text': 'I'},
            {'value': 2, 'text': 'II'},
            {'value': 3, 'text': 'IV'},
          ],
          'tapeThickness': [
            {'value': 1, 'text': '0.5 mm'},
            {'value': 2, 'text': '1.0 mm'},
            {'value': 3, 'text': '1.5 mm'},
            {'value': 4, 'text': 'unknown'},
          ],
        },
    );
  },
  );
});

describe('load Notes', ()=>{
  beforeEach(() => {
    document.body.innerHTML = `<table id="dummy""><tbody></tbody></table>`;
  });
  const notes = [
    {
      route: {
        api: '/api/foo',
      },
      note_type: 'production',
      note_id: 1,
      text: 'Just a test',
    },
  ];
  test('Adds a row', ()=>{
    const table = document.getElementById('dummy');
    module.loadNotes(notes, table);
    expect(table.childElementCount).toBeGreaterThan(0);
  });
});

describe('NoteEditor', ()=>{
  beforeEach(() => {
    fetch.resetMocks();
    document.body.innerHTML =`
<div class="modal fade tyko-editor" 
     id="noteEditor" 
     tabindex="-1" 
     role="dialog">
 <form id="notesForm">
   <div class="modal-body">
      <div class="form-group">
        <input type="hidden" id="noteId" name="noteId" value="36">
      </div>
      <div class="form-group">
        <label for="noteTypeSelect" class="col-form-label" >Type:</label>
        <select class="form-select" name="typeId"
                id="noteTypeSelect"></select>
        <label for="message-text" class="col-form-label">Note:</label>
        <textarea class="form-control" name="text"
                  id="message-text" required></textarea>
      </div>
    </div>
</form>
</div>
`;
  });
  test('add note types', async ()=>{
    fetch.mockResponseOnce(
        JSON.stringify(
            {
              note_id: 1,
              note_type_id: 1,
              text: 'Foo bar baz',
            },
        ),
    );
    const noteEditorDiv = document.getElementById('noteEditor');
    const noteEditor = new module.NoteEditor(noteEditorDiv);
    noteEditor.addNoteType(1, 'Production');
    noteEditor.setApiUrl('foo');
    await noteEditor.open();
    const noteTypeSelection = document.getElementById('noteTypeSelect');
    expect(noteTypeSelection.childElementCount).toEqual(1);
  });

  test('clear note types', async ()=>{
    const noteEditorDiv = document.getElementById('noteEditor');
    const noteTypeSelection = document.getElementById('noteTypeSelect');
    const noteEditor = new module.NoteEditor(noteEditorDiv);
    noteEditor.addNoteType(1, 'Production');
    noteEditor.clearNoteTypes();
    fetch.mockResponseOnce(
        JSON.stringify(
            {
              note_type_id: 1,
              text: 'Foo bar baz',
            },
        ),
    );
    noteEditor.setApiUrl('foo');
    await noteEditor.open();
    expect(noteTypeSelection.childElementCount).toEqual(0);
  });

  test('message text gets note text', async ()=> {
    fetch.mockResponseOnce(
        JSON.stringify(
            {
              note_type_id: 1,
              text: 'Foo bar baz',
            },
        ),
    );
    const noteEditorDiv = document.getElementById('noteEditor');
    const noteEditor = new module.NoteEditor(noteEditorDiv);
    noteEditor.setApiUrl('foo');
    noteEditor.addNoteType(1, 'Production');
    await noteEditor.open();

    expect(document.getElementById('message-text').value)
        .toEqual('Foo bar baz');
  });
});
