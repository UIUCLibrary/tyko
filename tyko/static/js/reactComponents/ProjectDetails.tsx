import React, {FC, useReducer, useState} from 'react';
import {Button, ButtonGroup, Form} from 'react-bootstrap';
import axios from 'axios';
import {EditSwitchFormField, LoadingIndeterminate} from './Common';
import {InactiveCover} from './Panel';

interface IObject {
  barcode: string|null
  collection_id: number
  name: string
  routes: {
    api: string
    frontend: string
  }
}
export interface IProjectApi {
  project: {
    current_location: string,
    notes: any[],
    objects: IObject[],
    project_code: string,
    project_id: number,
    status: string,
    title: string
  }
}

interface IProjectDetails {
  apiData: IProjectApi
  apiUrl: string
  onUpdated?: ()=>void
}

export const ProjectDetailDetails: FC<IProjectDetails> = (
    {apiData, apiUrl, onUpdated},
) => {
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const [accessible, setAccessible] = useState(true);
  const handleUpdate = (event: React.SyntheticEvent)=> {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    setAccessible(false);
    axios.put(apiUrl, formProps).then(()=>{
      setAccessible(true);
      if (onUpdated) {
        onUpdated();
      }
    }).catch(console.error);
  };
  return (
    <div id='outer'>
      {
        accessible ?
          <></> :
          <InactiveCover><LoadingIndeterminate/></InactiveCover>
      }
      <Form onSubmit={handleUpdate}>
        <div>
          <Form.Group className="mb-3 row">
            <EditSwitchFormField
              label='Title'
              editorId='titleField'
              display={apiData.project.title}
              editMode={editMode}
            >
              <Form.Control
                id="titleField"
                name='title'
                defaultValue={apiData.project.title}
              />
            </EditSwitchFormField>
            <EditSwitchFormField
              label='Project Code'
              editorId='projectCodeField'
              display={apiData.project.project_code}
              editMode={editMode}
            >
              <Form.Control
                id="projectCodeField"
                name='project_code'
                defaultValue={apiData.project.project_code}
              />
            </EditSwitchFormField>
            <EditSwitchFormField
              label='Status'
              editorId='currentStatusField'
              display={apiData.project.status}
              editMode={editMode}>
              <Form.Select
                id="currentStatusField"
                name='status'
                defaultValue={apiData.project.status}
              >
                <option value=''></option>
                <option value='No Work Done'>No Work Done</option>
                <option value='In Progress'>In Progress</option>
                <option value='Complete'>Complete</option>
              </Form.Select>
            </EditSwitchFormField>
            <EditSwitchFormField
              label='Current Location'
              editorId='currentLocationField'
              display={apiData.project.current_location}
              editMode={editMode}>
              <Form.Control
                id="currentLocationField"
                name='current_location'
                defaultValue={apiData.project.current_location}
              />
            </EditSwitchFormField>
          </Form.Group>
        </div>
        <ButtonGroup hidden={!editMode}>
          <Button variant={'outline-danger'} onClick={setEditMode}>
            Cancel
          </Button>
          <Button type='submit' variant={'outline-primary'}>
            Confirm
          </Button>
        </ButtonGroup>
        <Button hidden={editMode} onClick={setEditMode}>Edit</Button>
      </Form>
    </div>
  );
};
