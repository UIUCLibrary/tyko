import React, {
  FC,
  FocusEvent, FormEvent, useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import axios, {AxiosError} from 'axios';
import {Button, Form} from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import {EditSwitchFormField, EditControl, submitEvent} from './Common';

interface IEditableField{
  id?: string
  display: string | number | null
  type?: string
  inputProps?: { [key: string]: string | number| boolean }
  onSubmit? : (value: string)=>void
}


export const EditableField:FC<IEditableField> = (
    {display, type, inputProps, onSubmit, id},
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
              data-testid={`confirm-button-${id ? id: ''}`}
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
              role='edit'
              onClick={setEditMode}
              data-testid={`edit-button${id ? '-'+id : ''}`}
            >
              Edit
            </Button>
          </>,
      );
    }
  }, [editMode, display, handleAccept, handleCancel, id]);
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
        id={id}
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
  vendor?: {
    vendor_name: string
    deliverable_received_date: string | null
    originals_received_date: string | null
  },
  format_id: number,
  inspection_date?: string,
  item_id: number,
  name: string
  notes: INote[ ],
  barcode: string | null,
  obj_sequence: number,
  parent_object_id: number,
  transfer_date?: string
}

const updateData = async (url: string, key: string, value: string) => {
  const data: {[key: string]: string} = {};
  data[key] = value;
  return axios.put(url, data);
};
interface IItemDetails {
  objectName: string,
  formatName: string,
  objectSequence: number,
  barcode?: string,
  apiUrl?: string
  onAccessibleChange? : (busy: boolean)=>void
  onUpdated? : ()=>void
  onError? : (error: Error| AxiosError)=>void
}
export const ItemDetails2: FC<IItemDetails> = (
    {
      objectName,
      formatName,
      objectSequence,
      barcode,
      apiUrl,
      onAccessibleChange,
      onUpdated,
      onError,
    },
) =>{
  const [accessible, setAccessible] = useState(true);
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const form = useRef<HTMLFormElement>(null);
  const handleConfirm = ()=>{
    if (form.current) {
      submitEvent(form.current);
    }
  };
  useEffect(()=>{
    if (onAccessibleChange) {
      onAccessibleChange(!accessible);
    }
  }, [accessible, onAccessibleChange]);
  const handleSubmit = (event: FormEvent)=>{
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    if (apiUrl) {
      setAccessible(false);
      axios.put(apiUrl, formProps)
          .then(()=>{
            if (onUpdated) {
              onUpdated();
            }
          })
          .catch(onError?onError:console.error)
          .finally(()=> {
            setEditMode();
            setAccessible(true);
          });
    }
  };
  return (
    <>
      <Form ref={form} onSubmit={handleSubmit}>
        <EditSwitchFormField
          label='Name'
          editMode={editMode}
          display={objectName}>
          <Form.Control
            name='name'
            defaultValue={objectName}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Object Sequence'
          editMode={editMode}
          display={objectSequence ? objectSequence.toString() : null}>
          <Form.Control
            name='obj_sequence'
            type='number'
            defaultValue={objectSequence}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Barcode'
          editMode={editMode}
          display={barcode}>
          <Form.Control
            name='barcode'
            defaultValue={barcode}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Format Type'
          editMode={false}
          display={formatName}>
        </EditSwitchFormField>
        <EditControl
          editMode={editMode}
          setEditMode={setEditMode}
          onConfirm={handleConfirm}
        />
      </Form>
    </>
  );
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
    const barcode = apiData ? apiData.barcode : null;

    const handleUpdate = ()=>{
      if (onUpdated) {
        onUpdated();
      }
    };

    const tableBody = <>
      <tr>
        <th style={{width: '25%'}}>Name</th>
        <td>
          <EditableField
            display={objectName}
            onSubmit={(value)=> {
              updateData(apiUrl, 'name', value)
                  .then(handleUpdate)
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
                  .then(handleUpdate)
                  .catch(console.error);
            }}
          />
        </td>
      </tr>
      <tr>
      </tr>
      <tr>
        <th style={{width: '25%'}}>
          <Form.Label htmlFor='barcode'>Barcode</Form.Label>
        </th>
        <td>
          <EditableField
            id='barcode'
            display={barcode}
            onSubmit={(value)=> {
              updateData(apiUrl, 'barcode', value)
                  .then(handleUpdate)
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
