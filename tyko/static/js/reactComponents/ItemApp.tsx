import React, {
  FC,
  FocusEvent, FormEvent, useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import {AxiosError} from 'axios';
import {Button, Form} from 'react-bootstrap';
import {
  EditSwitchFormField,
  EditControl,
  submitEvent,
  submitFormUpdates,
} from './Common';
import {ITreatment} from './Treatment';
import {EnumMetadata} from './FormatDetails';
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
  format_details: {
    [key: string]: string | number | null | boolean | EnumMetadata
  }
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
  transfer_date?: string,
  treatment: ITreatment[]
}

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
export const ItemDetails: FC<IItemDetails> = (
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
  const handleSubmit = (event: FormEvent)=>{
    event.preventDefault();
    if (apiUrl) {
      setAccessible(false);
      submitFormUpdates(apiUrl, new FormData(event.target as HTMLFormElement))
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
  useEffect(()=>{
    if (onAccessibleChange) {
      onAccessibleChange(!accessible);
    }
  }, [accessible, onAccessibleChange]);
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
          editorId='barcode'
          display={barcode}>
          <Form.Control
            name='barcode'
            defaultValue={barcode}
            id='barcode'
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
