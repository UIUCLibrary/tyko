import {requests} from './request.js';
import * as metadataWidgets from './metadataWidgets.mjs';
import {parseUpdateRequestData} from './utils.mjs';

export const urls = {
  tapeTypesUrl: null,
  cassetteTypesUrl: null,
  cassetteTapeTapeThicknessURL: null,

};

export const data = {};

/**
 * Parse data and convert name to text and id to value
 * @param {Object} row
 * @return {{text: *, value: *}}
 */
function parseOptionsNameId(row) {
  return {text: row['name'], value: row['id']};
}

/**
 * Fetch data for the page
 * @return {Promise<{}>}
 */
export async function load() {
  const missingVariables = getMissingVariables();
  if (missingVariables.length > 0) {
    const missing = missingVariables.join(', ');
    throw new Error(`url is missing required data attributes: ${missing}`);
  }
  return Promise.all([
    requests.get(urls['tapeTypesUrl']).
        then((res) => {
          return {'type': 'tapeTypes', 'data': res};
        }),
    requests.get(urls['cassetteTypesUrl']).
        then((res) => {
          return {'type': 'formatTypes', 'data': res};
        }),
    requests.get(urls['cassetteTapeTapeThicknessURL']).
        then((res) => {
          return {'type': 'tapeThickness', 'data': res};
        }),
  ]).then(
      ((values) => {
        for (const v in values) {
          if (values.hasOwnProperty(v)) {
            data[values[v].type] = JSON.parse(values[v].data);
          }
        }
        return data;
      })).
      then((inData) => {
        inData.formatTypes = inData.formatTypes.map(parseOptionsNameId);
        inData.tapeTypes = inData.tapeTypes.map(parseOptionsNameId);
        inData.tapeThickness = inData.tapeThickness.map(parseOptionsUnits);
        return inData;
      });
}

/**
 * Tester for loading modules to make sure required data is included
 * @return {String[]}
 */
function getMissingVariables() {
  const missing = [];
  for (const i in urls) {
    if (urls[i] === null) {
      missing.push(i);
    }
  }
  return missing;
}

/**
 * Parse options data and join the value and the unit together if unit is not
 * null
 * @param {Object[]} row
 * @return {Object[]}
 */
function parseOptionsUnits(row) {
  const text = row['unit'] != null ?
      `${row['value']} ${row['unit']}` :
      row['value'];
  return {text: text, value: row['id']};
}

/**
 * Redraw data to page
 */
export function refresh() {
  $('#rowTapeTape').loadEnumData(data['tapeTypes']);
  $('#cassetteAudioType').loadEnumData(data['formatTypes']);
  $('#cassetteTapeThickness').loadEnumData(data['tapeThickness']);
}

$(metadataWidgets).ready(() => {
  refresh();

  $('#formatDetails').on('changesRequested', (event, InData, url) => {
    const parsedData = parseUpdateRequestData(InData);
    requests.put(url, parsedData).then((res) => {
      location.reload();
    }).catch((res) => {
      alert(res.responseText);
    });
  });
});


/**
 *
 * @param {Object[]} notes - List of Notes
 * @param {HTMLTableElement} notesTable - table used for notes
 */
export function loadNotes(notes, notesTable) {
  notes.forEach((note) => {
    const apiRoute = note['route']['api'];
    const onclickFunction =
        'notesTable.dispatchEvent(' +
        `new CustomEvent('openForEditing', {detail: '${apiRoute}'})` +
        ')';

    $(notesTable).append(`
      <tr>
        <td>${note['note_type']}</td>
        <td>${note['text']}</td>
        <td>
          <div class="btn-group float-end" role="group">
            <button 
              class="btn btn-primary btn-sm"
              data-title="Create New Note"
              data-noteId="${note['note_id']}"
              onclick="${onclickFunction}"
              >
              Edit
            </button>
          </div>
        </td>
      </tr>`,
    );
  });
}
/**
 * Controls a Note editor
 */
export class NoteEditor extends bootstrap.Modal {
  /**
   * Create a Note Editor
   * @param {HTMLTableElement} base
   * @param item
   */
  #item;
  #options = []


  /**
   *
   * @param item
   */
  constructor(item) {
    super(item);
    this.#item = item;
    this.url = null;
    const self = this;
    item.addEventListener('hidden.bs.modal', function (event) {
      self.clearNoteTypes();
    });
  }

  addNoteType(noteId, noteText) {
    this.#options.push({'id': noteId, 'text': noteText});
  }

  setApiUrl(url) {
    this.url = url;
  }
  open() {
    fetch(this.url)
        .then((r) => r.json(), (r) => console.log(r))
        .then((jsonData)=> {
          this.#setData(jsonData, this.#item);
          this.#item.dataset.apiUrl = this.url
          this.show();
        }, (r) => console.log(r));
  }

  clearNoteTypes(){
    this.#options = [];
    const noteTypeSelection = this.#item.querySelector('#noteTypeSelect');
    while (noteTypeSelection.firstChild) {
      noteTypeSelection.removeChild(noteTypeSelection.lastChild);
    }
  }

  /**
   *
   * @param {Object} data
   * @param {HTMLDivElement} item
   */
  #setData(data, item) {
    console.log(data.constructor)
    const noteTypeSelection = item.querySelector('#noteTypeSelect');
    for (const optionData of this.#options) {
      const option = document.createElement('option');
      option.text = optionData.text;
      option.value = optionData.id;
      if (data['note_type_id'] === optionData.id) {
        option.selected = true;
      }
      noteTypeSelection.add(option);
    }
    item.querySelector('#message-text').value = data['text'];
  }
}
