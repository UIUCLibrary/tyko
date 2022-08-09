import $ from 'expose-loader?exposes=$,jQuery!jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Datepicker} from 'vanillajs-datepicker';
import '../css/main.scss';
import {loadNotesTable, loadNoteTypes} from './notes.mjs';
import {configureNoteEditor, RemoveConfirm} from './editors.mjs';
import * as tyko from './tyko.mjs';
import AboutApp from './reactComponents/AboutApp';
import FormatDetails from './reactComponents/FormatDetails';
import {VendorDataEdit} from './reactComponents/Vendor'
import Items, {NewItemButton, ObjectItemsApp} from './reactComponents/Items';
import {ItemDetails} from './reactComponents/ItemApp';
import axios from 'axios';
import Panel from './reactComponents/Panel';
import {LoadingIndeterminate} from './reactComponents/Common';
import {ProjectDetailDetails} from './reactComponents/ProjectDetails';
import {ObjectDetails} from './reactComponents/ObjectDetails';
import {Treatment} from './reactComponents/Treatment';

import('bootstrap');
import('bootstrap-table');
window.$ = $;
/**
 * Add a date selection helper
 * @param {String} elementId - ID for the input element
 */
export function openDateSelect(elementId, format='yyyy-mm-dd') {
  const element = document.getElementById(elementId);
  const datepicker = new Datepicker(element, {
    buttonClass: 'btn',
    format: format,
  });
  datepicker.show();
  element.addEventListener('focusout', () =>{
    console.log('close');
    datepicker.destroy();
  }, {once: true});
}


export const notes = {
  loadNotesTable: loadNotesTable,
  loadNoteTypes: loadNoteTypes,
};
export const editor = {
  configureNoteEditor: configureNoteEditor,
  RemoveConfirm: RemoveConfirm,
};

/**
 *
 * @param {HTMLTableElement} element
 */
function loadTableFiles(element) {
  const resp = fetch(element.dataset.tykoApiUrl)
      .then((r) => r.json(), (r) => console.error(r));

  resp.then((jsonData)=> {
    $(element).bootstrapTable({
      data: jsonData.item.files,
    });
  });
}

function loadDynamicEnums(element) {
  if (!element.dataset.enumUrl) {
    console.warn(`${element.id} element does not have a data-enum-url property`);
    return;
  }
  fetch(element.dataset.enumUrl).then((response) => response.json()).then((newData) => {
    for ( const data of newData) {
      const newOption = document.createElement('option');
      newOption.setAttribute('value', data.id);
      newOption.innerText = data.name;
      element.appendChild(newOption);
    }
  });
}

function loadTykoTypes() {
  for (const element of document.getElementsByClassName('tyko')) {
    if (element.classList.contains('tyko-editor')) {
      tyko.configureTykoEditorTags(element);
    }

    if (element.classList.contains('tyko-enum-dynamic')) {
      loadDynamicEnums(element);
    }
    if (element.classList.contains('tyko-table-files')) {
      loadTableFiles(element);
    }
  }
}

function loadReactComponents() {
  for (const element of document.getElementsByClassName('new-item-button')) {
    const root = createRoot(element);

    root.render(<NewItemButton apiPath={element.dataset.tykoApiUrl}/>);
  }
  const objectItemsApp = document.getElementById('objectItemsApp');
  if (objectItemsApp) {
    const root = createRoot(objectItemsApp);
    root.render(
        <ObjectItemsApp
          apiUrl={objectItemsApp.dataset.tykoApiUrl}
          projectId={objectItemsApp.dataset.projectId}
          objectId={objectItemsApp.dataset.objectId}
          newItemSubmitUrl={objectItemsApp.dataset.newItemSubmitUrl}
        />,
    );
  }

  const objectDetails = document.getElementById('objectDetails');
  if (objectDetails) {
    const root = createRoot(objectDetails);
    root.render(
        <Panel title='Details'>
            Loading...
        </Panel>,
    );
    axios.get(objectDetails.dataset.tykoApiUrl).then(
        (data) =>{
          root.render(
              <ObjectDetails
                  name={data.data.name}
                  collectionId={data.data.collection_id}
                  originalsReceivedDate={data.data.originals_rec_date}
                  originalsReturnedDate={data.data.originals_return_date}
                  apiUrl={`/api/object/${objectDetails.dataset.objectId}`}
                  onUpdated={()=> {location.reload();}}
              />
          );
        }
    )
  }
  const objectItems = document.getElementById('objectItem');

  if (objectItems) {

    const root = createRoot(objectItems);
    root.render(<Items apiUrl={objectItems.dataset.tykoApiUrl}/>);
  }

  const projectDetailsComponent = document.getElementById('projectDetailsDetails');
  if (projectDetailsComponent) {
    const root = createRoot((projectDetailsComponent))
    root.render(
        <Panel title='Details'>
            Loading...
        </Panel>,
    );
    axios.get(projectDetailsComponent.dataset.tykoApiUrl)
      .then((resp)=> {
          root.render(
              <Panel title='Details'>
                <ProjectDetailDetails
                    apiData={resp.data}
                    apiUrl={projectDetailsComponent.dataset.tykoApiUrl}
                    onUpdated={()=> {location.reload();}}/>
              </Panel>
          );
        });
  }
  const itemVendorDetailsComponent = document.getElementById('itemVendorDetails');
  if (itemVendorDetailsComponent) {
    const root = createRoot(itemVendorDetailsComponent);
    root.render(
        <Panel title='Vendor'>
            Loading...
        </Panel>,
    );
    axios.get(itemVendorDetailsComponent.dataset.tykoApiUrl).then((resp)=>{
      const vendorData = resp.data.item.vendor
      root.render(
        <Panel title='Vendor'>
          <VendorDataEdit
               vendorName={
                  vendorData['vendor_name'] ?
                      vendorData['vendor_name'] : undefined
                }
                deliverableReceivedDate={
                  vendorData['deliverable_received_date'] ?
                      vendorData['deliverable_received_date'] : undefined
                }
                originalsReceivedDate={
                  vendorData['originals_received_date'] ?
                      vendorData['originals_received_date'] : undefined
                }
               apiUrl={itemVendorDetailsComponent.dataset.tykoApiUrl}
               onUpdated={()=> {location.reload();}}
          />
        </Panel>,
    );
    });
  }
  const formatDetailsComponent = document.getElementById('formatDetails');
  if (formatDetailsComponent) {
    const root = createRoot(formatDetailsComponent);
    root.render(
        <Panel title='Format Details'>
            Loading...
        </Panel>,
    );
    axios.get(formatDetailsComponent.dataset.tykoApiUrl).then((resp)=>{
      root.render(
          <Panel title='Format Details'>
            <FormatDetails
              apiData={resp.data.item}
              apiUrl={formatDetailsComponent.dataset.tykoApiUrl}
              onUpdated={()=> {location.reload();}}
            />
          </Panel>,
      );
    });
  }


  const itemDetails = document.getElementById('itemDetails');
  if (itemDetails) {
    const root = createRoot(itemDetails);
    root.render(
        <Panel title='Details'>
          <LoadingIndeterminate/>;
        </Panel>);
    axios.get(formatDetailsComponent.dataset.tykoApiUrl).then((resp)=>{
      const itemData = resp.data.item
      root.render(
          <Panel title='Details'>
            <ItemDetails
                objectName={itemData.name}
                formatName={itemData.format.name}
                objectSequence={itemData.obj_sequence}
                apiUrl={formatDetailsComponent.dataset.tykoApiUrl}
                onUpdated={()=> {location.reload();}}
            />
          </Panel>,
      );
    });
  }
  const itemTreatmentDetails = document.getElementById('itemTreatmentDetails');
  if (itemTreatmentDetails) {
    const root = createRoot(itemTreatmentDetails);

    root.render(
      <Panel title='Treatment'>
        Loading...
      </Panel>,
    )
    console.log(itemTreatmentDetails.dataset.tykoApiUrl)
    axios.get(itemTreatmentDetails.dataset.tykoApiUrl).then(
        (data) =>{
          const treatmentData = data.data.item
          root.render(
              <Panel title='Treatment'>
                <Treatment
                    apiUrl={itemTreatmentDetails.dataset.tykoApiTreatment}
                    apiData={treatmentData}
                    onUpdated={()=> {location.reload();}}
                />
              </Panel>
          );
        }
    )
  }

  const aboutComponent = document.getElementById('aboutApp');
  if (aboutComponent) {
    const root = createRoot(aboutComponent);
    root.render(<AboutApp apiUrl={aboutComponent.dataset.apiUrl}/>);
  }
}

loadReactComponents();
loadTykoTypes();

