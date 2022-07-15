import Table from 'react-bootstrap/Table';
import {EditSwitchFormField} from './Common';
import React, {
  Dispatch,
  FC, FormEvent,
  SetStateAction,
  useReducer,
  useRef,
  useState,
  useEffect,
} from 'react';
import Button from 'react-bootstrap/Button';
import {ButtonGroup, Form} from 'react-bootstrap';
import {SelectDate} from './Items';
import axios from 'axios';
export interface IItem {
  name: string,
  routes: {
    api: string
    frontend: string
  }
}
export interface IVendorJobData {
  vendorName: string,
  deliverableReceivedDate?: string,
  originalsReceivedDate?: string,
  items?: IItem[]
  apiUrl?: string
  onAccessibleChange? : (busy: boolean)=>void
  onUpdated? : ()=>void
}

export const VendorTable: React.FC<IVendorJobData> = (data) =>{
  const vendoData: IVendorJobData = data ? data : {
    vendorName: 'foo',
    deliverableReceivedDate: '12/11/2009',
    originalsReceivedDate: '12/12/2009',
  };
  return (
    <Table>
      <thead>
        <th>Vendor Name</th>
        <th>Deliverables Received Date</th>
        <th>Originals Received Date</th>
      </thead>
      <tbody>
        <tr>
          <td>{vendoData.vendorName}</td>
          <td>
            {
              vendoData.deliverableReceivedDate ?
                  vendoData.deliverableReceivedDate :
                  ''
            }
          </td>
          <td>
            {
              vendoData.originalsReceivedDate ?
                  vendoData.originalsReceivedDate :
                  ''
            }
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
interface IEditControl {
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  onConfirm?: ()=>void
}
const EditControl: FC<IEditControl> = ({editMode, setEditMode, onConfirm}) =>{
  const handleConfirm = ()=>{
    if (onConfirm) {
      onConfirm();
    }
  };
  const handleEditModeChange = ()=>{
    setEditMode(!editMode);
  };
  return (
    <>
      <ButtonGroup hidden={!editMode}>
        <Button variant={'outline-danger'} onClick={handleEditModeChange}>
          Cancel
        </Button>
        {/* <Button type='submit' variant={'outline-primary'}>*/}
        <Button onClick={handleConfirm} variant={'outline-primary'}>
          Confirm
        </Button>
      </ButtonGroup>
      <Button hidden={editMode} onClick={handleEditModeChange}>Edit</Button>
    </>
  );
};

export const VendorDataEdit: FC<IVendorJobData> = (
    {
      vendorName,
      deliverableReceivedDate,
      originalsReceivedDate,
      apiUrl,
      onAccessibleChange,
      onUpdated,
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
      axios.put(apiUrl, formProps).then(()=>{
        if (onUpdated) {
          onUpdated();
        }
      }).catch(console.error).finally(()=> {
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
          <Form.Control defaultValue={vendorName}/>
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Deliverables Received Date'
          editMode={editMode}
          display={deliverableReceivedDate}
        >
          <SelectDate
            name={'name'}
            dateFormat={'m/d/yyyy'}
            defaultValue={deliverableReceivedDate}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Originals Received Date'
          editMode={editMode}
          display={originalsReceivedDate}
        >
          <SelectDate
            name={'name'}
            dateFormat={'m/d/yyyy'}
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
