import React, {
  FC,
  FocusEvent, useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import {Button, Form} from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

interface IEditableField{
  display: string | number | null
  type?: string
  inputProps?: { [key: string]: string | number| boolean }
  onSubmit? : (value: string)=>void
}


export const EditableField:FC<IEditableField> = (
    {display, type, inputProps, onSubmit},
)=>{
  const [buttons, setButtons] = useState<JSX.Element|null>(null);
  const inputDisplay = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useReducer(
      (currentMode) => !currentMode,
      false,
  );

  const handleCancel = useCallback(()=>{
    if (inputDisplay.current) {
      inputDisplay.current.value = display as string;
    }
    setEditMode();
  }, [display]);

  const handleAccept = useCallback(() => {
    if (onSubmit) {
      if (inputDisplay.current) {
        onSubmit(inputDisplay.current.value);
      }
    }
    setEditMode();
  }, [onSubmit]);

  useEffect(()=>{
    if (editMode) {
      setButtons(
          <>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAccept}
              data-testid={`confirm-button-${display ? display: ''}`}
            >
              Confirm
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </>);
    } else {
      setButtons(
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={setEditMode}
              data-testid={`edit-button-${display ? display : ''}`}
            >
              Edit
            </Button>
          </>,
      );
    }
  }, [editMode, display, handleAccept, handleCancel]);
  const clickOutsideWidget = (event: FocusEvent)=>{
    if (editMode) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        handleCancel();
      }
    }
  };
  return (
    <InputGroup onBlur={clickOutsideWidget}>
      <Form.Control
        ref={inputDisplay}
        size={'sm'}
        defaultValue={display as string}
        type={type? type: 'string'} readOnly={!editMode}
        {...inputProps}
      />
      {buttons ? buttons: ''}
    </InputGroup>
  );
};
interface IFile{
  generation: string
  id: number
  name: string
  routes:{
    api: string
    frontend: string
  }
}
interface INote {
  note_id: number
  note_type: string
  note_type_id: number
  route: {[key: string]: string}
  text: string

}
export interface IItemMetadata {

  files: IFile[],
  format: {
    id: number,
    name: string
    },
  format_details: {[key: string]: string}
  format_id: number,
  inspection_date?: string,
  item_id: number,
  name: string
  notes: INote[ ],
  obj_sequence: number,
  parent_object_id: number,
  transfer_date?: string
}

const updateData = async (url: string, key: string, value: string) => {
  const data: {[key: string]: string} = {};
  data[key] = value;
  return axios.put(url, data);
};
interface IData {
  apiData: IItemMetadata
  apiUrl: string
  onUpdated?: ()=>void
}

/**
 * d
 * @constructor
 */
export function ItemDetails({apiData, apiUrl, onUpdated}: IData) {
  try {
    const objectName = apiData ? apiData.name : null;
    const formatName = apiData ? apiData.format.name : null;
    const objectSequence = apiData ? apiData.obj_sequence : null;
    const tableBody = <>
      <tr>
        <th style={{width: '25%'}}>Name</th>
        <td>
          <EditableField
            display={objectName}
            onSubmit={(value)=> {
              updateData(apiUrl, 'name', value)
                  .then(()=> {
                    if (onUpdated) {
                      onUpdated();
                    }
                  } )
                  .catch(console.error);
            }}
          />
        </td>
      </tr>
      <tr>
        <th style={{width: '25%'}}>Object Sequence</th>
        <td>
          <EditableField
            display={objectSequence}
            type='number'
            inputProps={{min: 1}}
            onSubmit={(value)=> {
              updateData(apiUrl, 'obj_sequence', value)
                  .then(()=> {
                    if (onUpdated) {
                      onUpdated();
                    }
                  } )
                  .catch(console.error);
            }}
          />
        </td>
      </tr>
      <tr>
      </tr>
      <tr>
        <th style={{width: '25%'}}>Format Type</th>
        <td>
          <Form.Control value={formatName ? formatName : ''} readOnly/>
        </td>
      </tr>
    </>;
    const table = <>
      <Table>
        <thead hidden>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Content</th>
          </tr>
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </Table>
    </>;
    return (<>{table}</>);
  } catch (errorThrown) {
    let message = '';

    if (errorThrown instanceof Error) {
      message = errorThrown.message;
      console.error(errorThrown.stack);
    }
    return (
      <Alert variant="danger">
        <h4>Failed to load the data</h4>
        <pre id="errorDetails">{message}</pre>
      </Alert>
    );
  }
}
