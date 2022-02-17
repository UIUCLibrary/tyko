/**
 * @jest-environment jsdom
 */
'use strict';
require('jest-fetch-mock').enableMocks();
import * as editor from '../tyko/static/js/editors.mjs';
// describe('module', () => {
//   beforeEach(() => {
//     fetch.resetMocks();
//   });
//   test('ssss', ()=>{
//     document.body.innerHTML = ``;
//     fetch.mockResponseOnce(JSON.stringify({data: '12345'}));
//     const a = document.getElementById('dummy');
//     // editor.configureNoteEditor('onetwothree', a);
//   });
// });

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
                  id="confirmButtonId" 
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
});
