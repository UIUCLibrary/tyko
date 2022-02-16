import {Modal} from 'bootstrap';

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
    const onEditFunction =
        'notesTable.dispatchEvent(' +
        `new CustomEvent('openForEditing', {detail: '${apiRoute}'})` +
        ')';

    const onRemoveFunction =
        'notesTable.dispatchEvent(' +
        `new CustomEvent('removeNoteRequested', {detail: '${apiRoute}'})` +
        ')';

    const row = notesTable.querySelector('tbody').insertRow(-1);
    const notesTypeCell = row.insertCell(0);
    const noteMessageCell = row.insertCell(1);
    const editor = row.insertCell(2);
    notesTypeCell.innerHTML = `<td>${note['note_type']}</td>`;
    noteMessageCell.innerHTML = `<td>${note['text']}</td>`;
    editor.innerHTML = `
    <td>
      <div class="btn-group-sm d-flex justify-content-end" 
           role="group" aria-label="Edit">
        <button class="btn btn-sm btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                ></button>
        <div class="dropdown-menu dropdown-menu-end">
          <button class="btn btn-secondary btn-sm dropdown-item" 
                  onclick="${onEditFunction}">Edit</button>
          <button class="btn btn-secondary btn-danger btn-sm dropdown-item" 
                  onclick="${onRemoveFunction}">Remove</button>
        </div>
      </div>
    </td>`;
  });
}
/**
 * Controls a Note editor
 */
export class NoteEditor extends Modal {
  /**
   * Create a Note Editor
   * @param {HTMLTableElement} base
   * @param item
   */
  #item;
  #options = [];


  /**
   *
   * @param {HTMLDivElement} item
   */
  constructor(item) {
    super(item);
    this.#item = item;
    this.url = null;
    const self = this;
    item.addEventListener('hidden.bs.modal', function(event) {
      self.clearNoteTypes();
    });

    const notesForm = item.querySelector('#notesForm');
    notesForm.addEventListener('submit', (e)=>{
      location.reload();
    });
  }

  /**
   * Add note Type to dropdown selection
   * @param {String} noteId
   * @param {String} noteText
   */
  addNoteType(noteId, noteText) {
    this.#options.push({'id': noteId, 'text': noteText});
  }

  /**
   * Set the api URL to note
   * @param {String} url
   */
  setApiUrl(url) {
    this.url = url;
  }

  /**
   * Open the modal dialog box
   * @return {Promise<boolean>} - The Promise returns true is the window open.
   */
  open() {
    return fetch(this.url)
        .then((r) => r.json(), (r) => console.log(r))
        .then((jsonData)=> {
          this.#setData(jsonData, this.#item);
          this.#item.dataset.apiUrl = this.url;
          this.show();
          return true;
        }, (r) => {
          console.error(r);
          return false;
        });
  }

  /**
   * Clear the note type selections from dropdown box
   */
  clearNoteTypes() {
    this.#options = [];
    const noteTypeSelection = this.#item.querySelector('#noteTypeSelect');
    while (noteTypeSelection.firstChild) {
      noteTypeSelection.removeChild(noteTypeSelection.lastChild);
    }
  }

  /**
   *
   * @param {Object} newData
   * @param {HTMLDivElement} item
   */
  #setData(newData, item) {
    const noteId = item.querySelector('#noteId');
    noteId.value = newData['note_id'];
    const noteTypeSelection = item.querySelector('#noteTypeSelect');
    if (noteTypeSelection) {
      for (const optionData of this.#options) {
        const option = document.createElement('option');
        option.text = optionData.text;
        option.value = optionData.id;
        if (newData['note_type_id'] === optionData.id) {
          option.selected = true;
        }
        noteTypeSelection.add(option);
      }
    }
    const textArea = item.querySelector('#message-text');
    if (textArea) {
      textArea.value = newData['text'];
    } else {
      console.warn('message-text not found.');
    }
  }
}
