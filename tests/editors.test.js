/**
 * @jest-environment jsdom
 */
'use strict';
require('jest-fetch-mock').enableMocks();
import * as editor from '../tyko/static/js/editors.mjs';
describe('module', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  test('test configureNoteEditor', async ()=> {
    document.body.innerHTML = `
        <div class="modal fade tyko-editor"
             id="noteEditor" 
             tabindex="-1" 
             role="dialog" 
             aria-labelledby="exampleModalLabel" 
             aria-hidden="true">
          <form id="notesForm">
            <div class="modal-body">
              <div class="form-group">
                   <input type="hidden" id="noteId" name="noteId" value="">
              </div>
              <div class="form-group">
                <div class="mb-3 row">
                  <label for="noteTypeSelect" 
                         class="col-sm-2 col-form-label" >Type:</label>
                  <div class="col-sm-10">
                    <select class="form-select tyko-notes" name="note_type_id"
                            id="noteTypeSelect"></select>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="message-text" 
                         class="col-sm-2 col-form-label">Note:</label>
                  <div class="col-sm-10">
                    <textarea class="form-control" name="text"
                              id="message-text" required></textarea>
                    </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary"
                      data-bs-dismiss="modal">Cancel
              </button>
              <button type="submit" class="btn btn-primary tyko-accept"
                      id="saveNoteButton" data-bs-dismiss="modal">Save
              </button>
            </div>
          </form>
        </div>`;
    const editorElement = document.getElementById('noteEditor');
    fetch.mockResponseOnce(
        JSON.stringify(
            {
              text: '12345',
              note_type_id: 1,
              note_id: 1,
            },
        ));
    await editor.configureNoteEditor(
        'onetwothree',
        editorElement,
        editorElement.querySelector('#noteId'),
        editorElement.querySelector('#noteTypeSelect'),
        editorElement.querySelector('#message-text'),
    );
    expect(editorElement.querySelector('#message-text').value)
        .toBe('12345');
  });
});

describe('RemoveConfirm', () => {
  document.body.innerHTML = `
    <div class="modal fade" 
         id="dummy" 
         tabindex="-1" 
         role="dialog" 
         aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered"
         role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="title">Remove Note</h5>
        </div>
        <div class="modal-body">
          <p>This action is permanent! Are you sure you want to remove this?</p>
        </div>
        <div class="modal-footer">
          <button type="button"
                  class="btn btn-secondary" 
                  data-bs-dismiss="modal">Cancel</button>
          <button type="button"
                  class="btn btn-primary"
                  id="confirmButton" 
                  data-bs-dismiss="modal">Remove</button>
        </div>
      </div>
    </div>
</div>`;

  const baseDiv = document.getElementById('dummy');
  const confirmEditor = new editor.RemoveConfirm(baseDiv);

  test('setTitle', ()=> {
    confirmEditor.setTitle('hello');
    const titleElement = baseDiv.querySelector('#title');
    expect(titleElement.innerHTML).toEqual('hello');
  });

  describe('setConfirmButton', ()=> {
    const confirmButton = baseDiv.querySelector('#confirmButton');
    confirmEditor.setConfirmButton(confirmButton);

    test('clicking confirm signals okay', ()=> {
      confirmEditor.onAccepted = jest.fn();
      confirmButton.click();

      expect(confirmEditor.onAccepted.mock.calls.length)
          .toBeGreaterThanOrEqual(1);
    });
  });
});
