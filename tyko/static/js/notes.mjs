import {loadNotes} from "./item_details.mjs";

export function loadNoteTypes (types, selectElement) {
    for (const t of types){
        const newOption = document.createElement('option');
        newOption.text = t.name
        newOption.value = t.note_types_id
        selectElement.add(newOption)
    }
}

export function loadNotesTable(notes, notesTable){
    loadNotes(notes, notesTable)
}
