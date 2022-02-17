/**
 * @jest-environment jsdom
 */
import * as tyko from '../tyko/static/js/tyko.mjs';
describe('Testing tyko', ()=> {
  document.body.innerHTML = `
    <div id="rootDiv">
      <form onsubmit="return false;">
        <label for="noteTypeSelect" 
               class="col-sm-2 col-form-label">Type:</label>
        <div class="col-sm-10">
            <select class="form-select" 
                    name="note_type_id"
                    id="noteTypeSelect"></select>
        </div>
        <button class="tyko-accept" 
                id="submitData" 
                type="submit">Submit</button>
      </form>
    </div>
  `;

  describe('configureTykoEditorTags', ()=>{
    const div = document.querySelector('#rootDiv');
    const handler = jest.fn();
    div.addEventListener('saveEdit', handler);
    tyko.configureTykoEditorTags(div);
    const button = div.querySelector('#submitData');
    test('click button triggers saveEdit event', ()=> {
      button.click();
      return Promise.resolve().then(() => {
        expect(handler).toHaveBeenCalled();
      });
    });
  });
});
