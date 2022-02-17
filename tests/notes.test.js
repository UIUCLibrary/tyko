/**
 * @jest-environment jsdom
 */
import * as notesModule from '../tyko/static/js/notes.mjs';

describe('Testing loadNoteTypes', ()=> {
  document.body.innerHTML = `
    <div id="rootDiv" class="mb-3 row">
      <label for="noteTypeSelect" 
             class="col-sm-2 col-form-label">Type:</label>
      <div class="col-sm-10">
          <select class="form-select" 
                  name="note_type_id"
                  id="noteTypeSelect"></select>
      </div>
    </div>
  `;
  const rootElement = document.getElementById('rootDiv');
  const selectElement = rootElement.querySelector('#noteTypeSelect');
  expect(selectElement.children.length).toEqual(0);

  test('loadNoteTypes', ()=>{
    const types = [{name: 'foo', note_type_id: 1}];
    notesModule.loadNoteTypes(types, selectElement);
    expect(selectElement.children.length).toEqual(1);
    expect(selectElement.children[0].innerHTML).toEqual('foo');
  });
});
