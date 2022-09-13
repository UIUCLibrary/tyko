import React, {
  FC,
  RefObject,
  useCallback,
  useReducer,
  useRef,
  useState,
} from 'react';
import {Button, ButtonGroup, Form} from 'react-bootstrap';
import axios, {AxiosError} from 'axios';
import {
  ComponentTable,
  EditSwitchFormField,
  LoadingIndeterminate,
  IBase,
  EditOptionsDropDown,
  RefConfirmDialog,
  RefAlertDismissible,
  ConfirmDialog, AlertDismissible,
} from './Common';
import {InactiveCover} from './Panel';
import {NewObjectModal} from '../pages/ProjectDetails';

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

interface IProjectObjectDetails {
  apiData: IProjectApi
  submitUrl: string
  onUpdated: ()=>void
  onRedirect?: (url: string)=>void
  onAccessibleChange? : (busy: boolean)=>void
  onError? : (e: Error | AxiosError)=>void
}

const updateErrorMessage = (
    alertBox: RefObject<RefAlertDismissible>,
    error: Error | AxiosError,
) =>{
  if (alertBox.current) {
    alertBox.current.setTitle(error.name);
    alertBox.current.setMessage(error.message);
    alertBox.current.setShow(true);
  }
};

export const ProjectObjects: FC<IProjectObjectDetails> = (
    {apiData, submitUrl, onUpdated, onAccessibleChange, onRedirect, onError},
) =>{
  const [
    newObjectDialogShown,
    setNewObjectDialogShown,
  ] = useState<boolean>(false);
  const [
    editMode,
    setEditMode,
  ] = useReducer((mode)=>!mode, false);
  const [
    forwardingUrl,
    setForwardingUrl,
  ] = useState<string|undefined>(undefined);
  const [accessible, setAccessible] = useState(true);
  const errorMessageAlert = useRef<RefAlertDismissible>(null);
  const confirmDialog = useRef<RefConfirmDialog>(null);
  const handleCreateObject = () =>{
    setNewObjectDialogShown(true);
  };
  const handleAcceptedNewObject = (event: React.SyntheticEvent) => {
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(submitUrl, formProps)
        .then(()=>{
          setNewObjectDialogShown(false);
          if (onUpdated) {
            onUpdated();
          }
        })
        .catch((reason: AxiosError|Error)=>{
          if (errorMessageAlert.current) {
            const messageBox = errorMessageAlert.current;
            messageBox.setMessage(reason.toString());
            messageBox.setShow(true);
          }
        });
  };
  const handleClosedNewDialogBox = () => {
    setNewObjectDialogShown(false);
  };
  const handleOpenEdit = useCallback((url: string) =>{
    setForwardingUrl(url);
    if (onRedirect) {
      onRedirect(url);
    }
  }, [
    onRedirect,
  ],
  );
  const handelOnUpdatedCallback = useCallback(()=>{
    if (onUpdated) {
      onUpdated();
    }
  }, [onUpdated]);

  const onAccessibleCallback = onAccessibleChange;
  const resetAccessibilityState = useCallback(()=>{
    setAccessible(true);
    if (onAccessibleCallback) {
      onAccessibleCallback(true);
    }
  }, [onAccessibleCallback]);
  const onErrorCallback = useCallback((e: Error | AxiosError)=>{
    updateErrorMessage(errorMessageAlert, e);
    if (onError) {
      onError(e);
    }
  }, [onError]);

  const removeObject = useCallback((url: string)=> {
    setAccessible(false);
    if (onAccessibleCallback) {
      onAccessibleCallback(false);
    }
    axios.delete(url)
        .then(handelOnUpdatedCallback)
        .catch(onErrorCallback)
        .finally(resetAccessibilityState);
  },
  [
    handelOnUpdatedCallback,
    onAccessibleCallback,
    onErrorCallback,
    resetAccessibilityState,
  ]);
  const table = apiData ?
      (
          <ComponentTable
            items={apiData.project.objects}
            resourceName='object'
            onEdit={handleOpenEdit}
            onRemove={(url, args, displayName?: string) =>{
              confirmRemovalDialog(
                  confirmDialog.current,
                  removeObject,
                  url,
                  displayName,
              );
            }}
            editMode={editMode}
            itemComponent={EditableObjectRow as FC<IBase>}
            tableHeader={
              <tr>
                <th>Name</th>
                <th/>
              </tr>
            }
          />
      ):
      (<></>);

  return (<>
    <AlertDismissible ref={errorMessageAlert}/>
    <NewObjectModal
      show={newObjectDialogShown}
      onAccepted={handleAcceptedNewObject}
      onClosed={handleClosedNewDialogBox}
    />
    <ConfirmDialog ref={confirmDialog}>Are you sure?</ConfirmDialog>
    {table}
    <ButtonGroup hidden={!editMode} className={'float-end'}>
      <Button
        variant={'outline-primary'}
        onClick={handleCreateObject}
      >Add</Button>
      <Button
        variant={'outline-primary'}
        onClick={setEditMode}
      >
        Done
      </Button>
    </ButtonGroup>
    <ButtonGroup hidden={editMode} className={'float-end'}>
      <Button hidden={editMode} onClick={setEditMode}>Edit</Button>
    </ButtonGroup>
  </>);
};

interface IEditableRowProps2 extends IBase{
  object: IObject,
}

const EditableObjectRow: FC<IEditableRowProps2> = (
    {object, onRemove, onEdit, editMode},
) =>{
  const {name, routes} = object;
  const handleEdit = () =>{
    if (onEdit) {
      onEdit(routes.frontend);
    }
  };
  const handleRemove = () =>{
    if (onRemove) {
      onRemove(routes.api, {}, name);
    }
  };
  return (
    <tr>
      <td>
        <a href={object.routes.frontend}>{object.name}</a>
      </td>
      <td>
        {
            editMode ?
            <div className={'float-end'}>
              <EditOptionsDropDown
                onEdit={handleEdit}
                onRemoval={handleRemove}/>
            </div> :
                <div></div>
        }
      </td>
    </tr>
  );
};

const confirmRemovalDialog = (
    confirmDialog: RefConfirmDialog | null,
    removeObject: (url: string)=>void,
    url: string, displayName?: string,
) => {
  if (!confirmDialog) {
    return;
  }
  const dialogBox = confirmDialog;
  if (displayName) {
    dialogBox.setTitle(`Remove "${displayName}" from project?`);
  } else {
    dialogBox.setTitle('Remove object from project?');
  }
  dialogBox.setShow(true);
  dialogBox.setOnAccept(() => removeObject(url));
};
