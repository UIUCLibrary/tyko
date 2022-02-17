/**
 * @jest-environment jsdom
 */

'use strict';

import * as formatOptions from '../tyko/static/js/load_format_options';

jest.mock('../tyko/static/js/request.js');
jest.mock('../tyko/static/js/api.js');

describe('Testing loadInputEnumOptionclass', () => {
  beforeEach(() => {
    document.body.innerHTML =`
      <form id="newEntity" 
            class="tyko-form-new-entity" 
            data-addapiurl="/api/new">
        <div class="form-group row cassette-row format-row">
          <label for="dummy" class="col-sm-2 col-form-label">Audio type</label>
          <div class="col-sm-10">
            <select id="dummy" 
                    class="form-control tyko-input-enum-api-options" 
                    data-enumapi="/api/formats" 
                    name="format_details.format_type_id"></select>
          </div>
        </div>
      </form>`;
    formatOptions.loadTykoClasses();
  });
  test('loadInputEnumOptionclass changes', () => {
    expect($('#dummy > *').length).toBe(8);
  });
});
