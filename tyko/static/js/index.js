import $ from "expose-loader?exposes=$,jQuery!jquery";
import('bootstrap');
// import {} from 'bootstrap';
import { Tooltip, Toast, Popover, Dropdown, Button, Modal } from 'bootstrap';
import {Datepicker} from 'vanillajs-datepicker';
import('bootstrap-table');
import bootstrapTable from "bootstrap-table/src/bootstrap-table";
import '../css/main.scss'
import {loadNoteTypes, loadNotesTable} from "./notes.mjs";
import {configureNoteEditor, RemoveConfirm} from "./editors.mjs"
import el from "vanillajs-datepicker/locales/el";
window.$ = $
/**
 * Add a date selection helper
 * @param {String} elementId - ID for the input element
 */
export function openDateSelect(elementId){
    const element = document.getElementById(elementId)
    const datepicker = new Datepicker(element, {
        buttonClass: 'btn',
        format: 'yyyy-mm-dd'
    });
    datepicker.show()
    element.addEventListener("focusout", () =>{
        console.log("close");
        datepicker.destroy()
    }, {once: true})
}




export const notes = {
    loadNotesTable: loadNotesTable,
    loadNoteTypes: loadNoteTypes
}
export const editor = {
    configureNoteEditor: configureNoteEditor,
    RemoveConfirm: RemoveConfirm
}

/**
 *
 * @param {HTMLTableElement} element
 */
function loadTableFiles(element){
    const resp = fetch(element.dataset.tykoApiUrl)
        .then((r) => r.json(), (r) => console.error(r));

    resp.then((jsonData)=> {
        $(element).bootstrapTable({
            data: jsonData.item.files,
        })
    })
}

function loadTykoTypes(){
    for(const element of document.getElementsByClassName('tyko')){
        if(element.classList.contains('tyko-table-files')){
            loadTableFiles(element)
        }
    }
}

loadTykoTypes()