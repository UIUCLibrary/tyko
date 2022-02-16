import {loadNotes} from './item_details.mjs';

/**
 * Load note types into selected element.
 * @param {Object[]} types
 * @param {HTMLSelectElement} selectElement
 */
export function loadNoteTypes(types, selectElement) {
  for (const t of types) {
    const newOption = document.createElement('option');
    newOption.text = t.name;
    newOption.value = t.note_types_id;
    selectElement.add(newOption);
  }
}

/**
 * Load notes table data
 * @param {Object[]} notes
 * @param {HTMLTableElement} notesTable
 */
export function loadNotesTable(notes, notesTable) {
  loadNotes(notes, notesTable);
}
