$(document).ready(
    function() {
      applyStyles();
    },
);

/**
 * Apply all the styles to the elements with special classes
 */
export function applyStyles() {
  $.each($('.tyko-metadata-entity'), (i, row) => {
    metadataEntry(row);
  });
}

(function($) {
  $.fn.extend({
    loadEnumData: function(data) {
      return $.each(this, function(i, e) {
        const widget = $(e).data('widget');
        if (widget === undefined) {
          throw new Error('Unable to enumerated data widget');
        }
        widget.options = data;
      });
    },
  });
}(jQuery));

/**
 * Replace any existing content in a row with the rendered version
 * @param {jQuery} row
 */
function metadataEntry(row) {
  $(row).empty();
  const builder = new MetadataWidgetBuilder();
  builder.setMetadataDisplay($(row).data('name'));
  builder.setDisplayText($(row).data('displaydata'));

  builder.setEdit($(row).is('.tyko-metadata-entity-editable'));

  if ($(row).hasClass('tyko-metadata-entity-fulldate')) {
    builder.setMetadataWidget(MetadataEditDateWidget);
  }

  if ($(row).hasClass('tyko-metadata-entity-enum')) {
    builder.setMetadataWidget(MetadataEditSelectEnumWidget);
    const data = $(row).data('enumoptions');
    if ($(row).data('value')) {
      builder.setCurrentValue($(row).data('value'));
    }
    builder.setDisplayText($(row).data('displaydata'));
    if (data) {
      data.forEach((i) => {
        builder.options.push(i);
      });
    }
    builder.setEnumUrl(
        $(row).data('enumurl') !== undefined ? $(row).data('enumurl') : null,
    );
  }

  const widget = builder.build(row);
  $(widget.metadataValueElement).empty();
  widget.apiUrl = $(row).data('apiroute') !== undefined ?
      $(row).data('apiroute') :
      null;
  widget.metadataKey = $(row).data('metadatakey') !== undefined ?
      $(row).data('metadatakey') :
      null;
  widget.draw();
  $(row).data('widget', widget);
}

/**
 * Widget state for MetadataWidget
 */
class MetadataWidgetState {
  /**
   * Set up the state of a widget
   * @param {jQuery} parent
   */
  constructor(parent) {
    this._parent = parent;
  }

  /**
   * Draw the widget for the given stage.
   * @abstract
   */
  draw() {
  }

  /**
   * check if target is outside of the row
   * @param {jQuery} target
   * @return {boolean} - if clicked outside the row return true else return
   *  false
   */
  isClickedOutsideOfRow(target) {
    if ($(this._parent.parent).is(target)) {
      return false;
    }
    if ($(this._parent.parent).has(target).length > 0) {
      return false;
    }
    if (this._parent.targetInEditDelegate(target)) {
      return false;
    }
    return true;
  };

  /**
   * Check if use has clicked outside the row
   * @param {Event} event
   * @param {jQuery} row
   */
  clickOffRow(event, row) {
  }

  /**
   * What to do when an edit delegate is canceled by user
   */
  onCancel() {
  }
}

/**
 * View state for MetadataWidgets
 */
class ViewState extends MetadataWidgetState {
  /**
   * Draw the view widget
   * @param {jQuery} parent
   * @param {jQuery} row
   * @param {String|Number} value
   */
  draw(parent, row, value) {
    $(parent).text(value);
    this._parent.makeEditButtonVisible();
    this._parent.makeConfirmButtonInvisible();
    $(parent).removeClass('edit').addClass('view');
  }
}

/**
 * Edit state for MetadataWidgets
 */
class EditState extends MetadataWidgetState {
  /**
   * Draw the edit widget
   * @param {jQuery} parent
   * @param {jQuery} row
   * @param {String|Number} value - starting value
   */
  draw(parent, row, value) {
    this._parent.makeEditButtonInvisible();
    this._parent.makeConfirmButtonVisible();
    const elements = this._parent.buildInputGroup(value);
    $(parent).append(elements.join(''));
    $(parent).removeClass('view').addClass('edit');
    $(row).find('#btnCancelEdit').off().on('click', () => {
      this.onCancel();
    });
    $(row).find('#btnConfirmEdit').off().on('click', () => {
      this.onConfirm();
    });
    this._parent.assignEditHandles(parent);
  }

  /**
   * Clicking off of a row
   * @param {Event} event
   * @param {jQuery} row
   */
  clickOffRow(event, row) {
    this.onCancel();
  }

  /**
   * When cancel remove the edit state widget and switch to the view mode
   */
  onCancel() {
    this._parent.viewMode();
    this._parent.tearDown();
    this._parent.draw();
  }

  /**
   * When confirmed, run onSubmit with the metadata and the api url
   */
  onConfirm() {
    this._parent.onSubmit(
        $('#editDelegate').val(),
        this._parent.metadataKey,
        this._parent.apiUrl,
    );
    this._parent.viewMode();
    this._parent.tearDown();
    this._parent.draw();
  }
}

/**
 * Base class for creating metadata editor
 */
class MetadataEditWidget {
  #state;
  apiUrl = null;
  metadataKey = null;

  /**
   *
   * @param {jQuery} parent
   * @param {Object} metadataKeyElement
   * @param {Object} displayElement
   * @param {Object} editElement
   * @param {String|Number} dataValue
   */
  constructor(
      parent, metadataKeyElement, displayElement, editElement, dataValue) {
    this.parent = parent;
    this.metadataKeyElement = metadataKeyElement;
    this.metadataValueElement = displayElement;
    this.editElement = editElement;
    this.dataValue = dataValue;
    this.#state = new ViewState(this);

    $(this.parent).on('draw:toggle', () => {
      this.toggleMode();
      this.tearDown();
      this.draw();
    });

    this.editButton = $(this.editElement).find('button');

    $(document).mouseup((event) => {
      if (this.#state.isClickedOutsideOfRow(event.target) === true) {
        this.#state.clickOffRow(event, this.parent);
      }
    });

    this.editButton.on('click', (() => {
      $(this.metadataValueElement).trigger('draw:toggle');
    }));
  }

  /**
   * @param {jQuery}target
   * @return {boolean}
   */
  isClickedOutsideOfRow(target) {
    if ($(this.parent).is(target)) {
      return false;
    }

    if ($(this.parent).has(target).length > 0) {
      return false;
    }
    return true;
  }

  /**
   * Trigger the changesRequested event
   * @param {Object} data
   * @param {String} key
   * @param {String} url
   */
  onSubmit(data, key, url) {
    this.parent.parent().
        trigger('changesRequested', [[{key: key, value: data}], url]);
  }

  /**
   * Check if the area clicked is outside of the ROI
   * @param {jQuery} target - Area clicked on by the user
   * @return {boolean} - Returns true the click was inside the widget,
   *  else returns false
   */
  targetInEditDelegate(target) {
    if ($(target).is('input')) {
      return true;
    }
    return false;
  }

  /**
   * Draw the widget to the DOM
   */
  draw() {
    this.#state.draw(this.metadataValueElement, this.parent, this.dataValue);
  }

  /**
   * Commands that need to run when destroying the widget
   */
  tearDown() {
    $(this.metadataValueElement).empty();
  }

  /**
   * Makes the edit button visible
   */
  makeEditButtonVisible() {
    $(this.editButton).parent().find('.edit').removeAttr('hidden');
  }

  /**
   * Make the confirm button invisible
   */
  makeConfirmButtonInvisible() {
    $(this.editButton).parent().find('.btn-group-confirm').attr('hidden', '');
  }

  /**
   * Make the confirm button visible
   */
  makeConfirmButtonVisible() {
    $(this.editButton).parent().find('.btn-group-confirm').removeAttr('hidden');
  }

  /**
   * Hide the edit button
   */
  makeEditButtonInvisible() {
    $(this.editButton).parent().find('.edit').attr('hidden', '');
  }

  /**
   * Configure any signals when editing
   * @param {jQuery} base
   */
  assignEditHandles(base) {
  }

  /**
   * Set the current mode to view
   */
  viewMode() {
    this.#state = new ViewState(this);
  }

  /**
   * Set the current mode to edit
   */
  editMode() {
    this.#state = new EditState(this);
  }

  /**
   * Fip modes, from View to Edit and vice-versa
   */
  toggleMode() {
    if ($(this.metadataValueElement).is('.edit')) {
      this.#state = new ViewState(this);
    } else {
      this.#state = new EditState(this);
    }
  }

  /**
   * Get the row used by this widget
   * @return {(*|jQuery.fn.init|jQuery|HTMLElement)[]}
   */
  row() {
    return [
      $(this.metadataKeyElement),
      $(this.metadataValueElement),
      $(this.editElement),
    ];
  }

  /**
   * Do something when the user clicks off of the ROI
   * @param {Event} event
   * @param {jQuery} row
   */
  clickOffRow(event, row) {
    if ($(this.metadataValueElement).is('.edit')) {
      this.viewMode();
      this.tearDown();
      this.draw();
    }
  }
}

/**
 * Drop down widget for selecting based an enumerated values
 */
class MetadataEditSelectEnumWidget extends MetadataEditWidget {
  options = [];
  selected = null;

  /**
   * Build the a select/options-based dropdown input
   * @param {String} value - starting value
   * @param {String} id - Html id for the element being produced
   * @return {jQuery[]} - Elements to be used
   */
  buildInputGroup(value, id = 'editDelegate') {
    const elements = [];
    elements.push('<div class="input-group">');

    elements.push(`<select class="custom-select" id="${id}">`);
    this.options.forEach((option) => {
      if (this.selected === option['value']) {
        elements.push(
            `<option value="${option['value']}" selected>
                    ${option['text']}</option>`);
      } else {
        elements.push(
            `<option value="${option['value']}">${option['text']}</option>`);
      }
    });

    elements.push('</select>');
    elements.push('</div>');
    return elements;
  }
}

/**
 * Widget for editing a datetime field
 */
class MetadataEditDateWidget extends MetadataEditWidget {
  /**
   * Build form input element
   * @param {String} value - starting value
   * @param {String} id - Html id for the element being produced
   * @return {jQuery[]} - Elements to be used
   */
  buildInputGroup(value, id = 'editDelegate') {
    const elements = [];
    elements.push('<div class="input-group">');
    elements.push(
        `    <input id="${id}" class="form-control" value="${value}"/>`);
    elements.push('</div>');
    return elements;
  }

  /**
   * Check if the a target is outside the ROI of the edit row
   * @param {jQuery} target - ROI
   * @return {boolean} - Returns true if the target is outside of the ROI
   * else returns false
   */
  isClickedOutsideOfRow(target) {
    return super.isClickedOutsideOfRow(target);
  }

  /**
   * Check if the area clicked is outside of the ROI
   * @param {jQuery} target - Area clicked on by the user
   * @return {boolean} - Returns true the click was inside the widget,
   *  else returns false
   */
  targetInEditDelegate(target) {
    if ($('div[role=\'calendar\']').has(target).length > 0) {
      return true;
    }
    return false;
  }

  /**
   * Adds the correct date format and use bootstrap 4 style to match
   * @param {jQuery} base - source where the delegate datepicker is located
   */
  assignEditHandles(base) {
    $(base).find('#editDelegate').datepicker({
      format: 'mm-dd-yyyy',
      uiLibrary: 'bootstrap4',
    });

    // update the value of the input tag because gijgo datepicker doesn't
    $(base).find('#editDelegate').on('change', (e) => {
      if (e.currentTarget.value !== $(e.target).attr('value')) {
        $(e.target).attr('value', e.currentTarget.value);
      }
    });
    super.assignEditHandles(base);
  }

  /**
   * Destroy the datepicker widget when closing
   */
  tearDown() {
    const datePicker = $(this.metadataValueElement).find('#datepicker');
    if (datePicker.length > 0) {
      datePicker.datepicker().destroy();
    }
    super.tearDown();
  }
}

/**
 * Text line-edit widget
 */
class MetadataEditTextWidget extends MetadataEditWidget {
  /**
   * Build the a text input
   * @param {String} value - starting value
   * @param {String} id - Html id for the element being produced
   * @return {jQuery[]} - Elements to be used
   */
  buildInputGroup(value, id = 'editDelegate') {
    const elements = [];
    elements.push('<div class="input-group">');
    elements.push(`<input type="text" 
                          class="form-control"
                          id="${id}" 
                          value="${value}">`);
    elements.push('</div>');
    return elements;
  }
}

/**
 * Builder for generating a row of metadata in a table
 */
export class MetadataWidgetBuilder {
  #editable = true;
  #metadataDisplayText = '';
  #displayText = '';
  #widgetType = MetadataEditTextWidget;
  #enumUrl = null;
  #currentValue = null;
  options = [];

  /**
   * How the header for the metadata should be displayed
   * @param {string} text
   */
  setMetadataDisplay(text) {
    this.#metadataDisplayText = text;
  }

  /**
   *
   * @param {MetadataEditWidget.constructor} widget
   */
  setMetadataWidget(widget) {
    this.#widgetType = widget;
  }

  /**
   * How the content of the metadata should be displayed
   * @param {string} text
   */
  setDisplayText(text) {
    this.#displayText = text;
  }

  /**
   * Set if the field can be edited
   * @param {boolean} isEditble - a button should be added
   */
  setEdit(isEditble) {
    this.#editable = isEditble;
  }

  /**
   * Render the heading for the metadata
   * @param {string} text - Display the type of metadata
   * @return {string} - Rendered Html
   */
  static buildMetadataTitle(text) {
    return `<th class="metadata-key w-25 pb-4" scope="row">${text}</th>`;
  }

  /**
   * Build the value of the metadata
   * @param {string} text - How the value metadata should render
   * @return {string} Rendered HTML string
   */
  static buildMetadataValue(text) {
    return `<td class="metadata-value view"><div>${text}</div></td>`;
  }

  /**
   * Build the row
   * @param {jQuery} base
   * @return {MetadataEditWidget}
   */
  build(base) {
    const key = MetadataWidgetBuilder.buildMetadataTitle(
        this.#metadataDisplayText);
    const value = MetadataWidgetBuilder.buildMetadataValue(this.#displayText);
    const edit = MetadataWidgetBuilder.buildEditRow(this.#editable);

    $(base).append(key);
    $(base).append(value);
    $(base).append(edit);

    const newWidget = new this.#widgetType(
        $(base),
        $(base).find('.metadata-key')[0],
        $(base).find('.metadata-value')[0],
        $(base).find('.optionsRow')[0],
        this.#displayText,
    );
    if (newWidget instanceof MetadataEditSelectEnumWidget) {
      if (this.options.length > 0) {
        this.options.forEach((selection) => {
          newWidget.options.push(selection);
        });
      }
      if (this.#currentValue != null) {
        newWidget.selected = this.#currentValue;
      }

      if (this.#enumUrl != null) {
        newWidget.enumApiUrl = this.#enumUrl;
      }
    }

    $(base).on('mode:edit', function() {
      newWidget.editMode();
      newWidget.draw();
    });

    $(base).on('mode:view', function() {
      newWidget.viewMode();
      newWidget.draw();
    });

    return newWidget;
  }

  /**
   * Build the edit options column, if it can be edited, an edit button will be
   * drawn
   * @param {boolean} editable
   * @return {string} string html of the edit column
   */
  static buildEditRow(editable) {
    const items = [];
    items.push(
        '<td class="optionsRow" style=\'text-align:right;width: 93px\'>');
    if (editable === true) {
      items.push(
          `<div class="btn-group btn-group-sm btn-group-confirm" 
                role="group" 
                aria-label="Basic example" hidden>`);
      items.push(`<button id="btnConfirmEdit" 
class="btn btn-outline-primary btn-sm" 
type="button"><i class="material-icons">check</i> </button>`);
      items.push(`<button id="btnCancelEdit" 
                          class="btn btn-sm btn-outline-danger" 
                          type="button">
                          <i class="material-icons md-18">cancel</i>
                  </button>`);

      items.push('</div>');
      items.push(
          `<button class="btn btn-sm edit edit-delegate-text">
           <i class="material-icons">edit</i>
           </button>`);
    }

    items.push('</td>');
    return items.join('');
  }

  /**
   * Set the REST url used to request the valid enumerated values
   * @param {String} enumUrl - REST url
   */
  setEnumUrl(enumUrl) {
    this.#enumUrl = enumUrl;
  }

  /**
   * Set the starting value used by select/option drop down menu widgets
   * @param {String|Number} value - Starting value
   */
  setCurrentValue(value) {
    this.#currentValue = value;
  }
}
