import $ from "expose-loader?exposes=$,jQuery!jquery";
import React from 'react'
import ReactDOM from 'react-dom'
import {Datepicker} from 'vanillajs-datepicker';
import '../css/main.scss'
import {loadNotesTable, loadNoteTypes} from "./notes.mjs";
import {configureNoteEditor, RemoveConfirm} from "./editors.mjs"
import * as tyko from "./tyko.mjs"
import {AboutApp} from "./reactComponents/about";
import {FormatDetails} from './reactComponents/formatDetails'

import('bootstrap');
import('bootstrap-table');
window.$ = $
/**
 * Add a date selection helper
 * @param {String} elementId - ID for the input element
 */
export function openDateSelect(elementId, format='yyyy-mm-dd'){
    const element = document.getElementById(elementId)
    const datepicker = new Datepicker(element, {
        buttonClass: 'btn',
        format: format
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

function loadDynamicEnums(element){
    if(!element.dataset.enumUrl){
      console.warn(`${element.id} element does not have a data-enum-url property`)
      return
    }
    fetch(element.dataset.enumUrl).then(response => response.json()).then(newData => {
        for( let data of newData){
          const newOption = document.createElement('option')
          newOption.setAttribute('value', data.id)
          newOption.innerText = data.name
          element.appendChild(newOption)
        }

    })
}

function loadTykoTypes(){
    for(const element of document.getElementsByClassName('tyko')){
      if(element.classList.contains('tyko-editor')){
        tyko.configureTykoEditorTags(element);
      }

      if(element.classList.contains('tyko-enum-dynamic')){
          loadDynamicEnums(element)
      }
      if(element.classList.contains('tyko-table-files')){
          loadTableFiles(element)
      }
    }
}

function loadReactComponents(){
  const formatDetailsComponent = document.getElementById('formatDetails')
  if(formatDetailsComponent){
    ReactDOM.render(<FormatDetails apiUrl={formatDetailsComponent.dataset.tykoApiUrl}/>, formatDetailsComponent)
  }

  const aboutComponent = document.getElementById('aboutApp')
  if(aboutComponent){
    ReactDOM.render(<AboutApp apiUrl={aboutComponent.dataset.apiUrl}/>, aboutComponent)
  }
}

loadReactComponents()
loadTykoTypes()
