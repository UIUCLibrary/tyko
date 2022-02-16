import * as metadataWidgets from "./metadataWidgets.mjs";
/**
 *  Assign element with tyko-editor class
 *  This provides saveEdit event
 * @param {HTMLDivElement} element
 */
function configureTykoEditorTags(element) {
    const saveNoteButton = element.querySelector(".tyko-accept")
    let form = element.querySelector("form")
    if(saveNoteButton) {

        saveNoteButton.addEventListener("click", () => {
            element.dispatchEvent(
                new CustomEvent(
                    'saveEdit',
                    {
                        detail: {
                            elements: packageElements(form.elements),
                            apiRoute: element.dataset.apiUrl
                        }
                    }
                )
            );
        })
    }
}

/**
 * @param {HTMLFormControlsCollection} elements
 * @return {Object}
 */
function packageElements(elements){
    let data = {}
    for (const element of elements) {
        data[element.name] = element.value
    }
    return data
}

/**
 * Set elements used by Tyko
 */
function setTykoClasses(){
    for (const element of document.getElementsByClassName("tyko-editor")){
        configureTykoEditorTags(element)
    }
    // for (const element of document.getElementsByClassName("tyko-date-selector")){
    //     // $(element).ready(() => {
    //     //     $(element).datepicker({
    //     //         uiLibrary: 'bootstrap4',
    //     //         format: 'yyyy-mm-dd'
    //     //     });
    //     // });
    // }

}

setTykoClasses()
