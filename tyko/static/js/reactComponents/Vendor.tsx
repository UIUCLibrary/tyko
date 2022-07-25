import {EditSwitchFormField, EditControl} from './Common';
import React, {
  FC, FormEvent,
  useReducer,
  useRef,
  useState,
  useEffect,
} from 'react';
import {Form} from 'react-bootstrap';
import {SelectDate} from './Items';
import axios, {AxiosError} from 'axios';
export interface IItem {
  name: string,
  routes: {
    api: string
    frontend: string
  }
}
export interface IVendorJobData {
  vendorName?: string,
  deliverableReceivedDate?: string,
  originalsReceivedDate?: string,
  items?: IItem[]
  apiUrl?: string
  onAccessibleChange? : (busy: boolean)=>void
  onUpdated? : ()=>void
  onError? : (error: Error| AxiosError)=>void
}

export const VendorDataEdit: FC<IVendorJobData> = (
    {
      vendorName,
      deliverableReceivedDate,
      originalsReceivedDate,
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
    form.current?.dispatchEvent(
        new Event(
            'submit', {
              cancelable: true,
              bubbles: true,
            }),
    );
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
          label='Vendor Name'
          editMode={editMode}
          display={vendorName}>
          <Form.Control
            name='vendor_name'
            defaultValue={vendorName}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Deliverables Received Date'
          editorId='deliverableReceivedDate'
          editMode={editMode}
          display={deliverableReceivedDate}
        >
          <SelectDate
            name='deliverable_received_date'
            editorId='deliverableReceivedDate'
            dateFormat='m/d/yyyy'
            defaultValue={deliverableReceivedDate}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Originals Received Date'
          editMode={editMode}
          editorId='originalsReceivedDate'
          display={originalsReceivedDate}
        >
          <SelectDate
            name='originals_received_date'
            dateFormat='m/d/yyyy'
            editorId='originalsReceivedDate'
            defaultValue={originalsReceivedDate}
          />
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
