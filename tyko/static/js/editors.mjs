import {Modal} from 'bootstrap';

/**
 *
 * @param {String} apiUrl
 * @param {HTMLDivElement} modalElement
 * @param {HTMLInputElement} noteIdElement
 * @param {HTMLSelectElement} noteTypeElement
 * @param {HTMLTextAreaElement} noteMessageElement
 * @return {Promise}
 */
export function configureNoteEditor(
    apiUrl,
    modalElement,
    noteIdElement,
    noteTypeElement,
    noteMessageElement) {
  return fetch(apiUrl)
      .then((response)=>response.json())
      .then((json)=>{
        const modal = new Modal(modalElement);
        noteIdElement.value = json['note_id'];
        noteTypeElement.value = json['note_type_id'];
        noteMessageElement.value = json['text'];
        modal.show();
      });
}

/**
 * Confirm removal of item.
 */
export class RemoveConfirm {
  #modal;
  #rootElement;
  confirmButton = null;
  onAccepted = function() {
    console.log('here');
  };

  /**
   *
   * @param {HTMLDivElement} element
   */
  constructor(element) {
    this.#rootElement = element;
    this.#modal = new Modal(element);
  }

  /**
   * Set title message.
   * @param {String} message
   */
  setTitle(message) {
    this.#rootElement.querySelector('.modal-title').innerHTML = message;
  }

  /**
   *
   * @param {HTMLButtonElement} element
   */
  setConfirmButton(element) {
    this.confirmButton = element;
    const self = this;
    element.onclick = function() {
      self.accept();
    };
  }

  /**
   * Accept.
   */
  accept() {
    this.onAccepted();
  }

  /**
   * Show modal dialog.
   */
  show() {
    this.#modal.show();
  }
}
