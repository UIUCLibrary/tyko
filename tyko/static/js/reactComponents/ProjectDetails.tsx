import React, {
  FC, forwardRef,
  RefObject, Ref,
  useCallback,
  useReducer,
  useRef,
  useState, useImperativeHandle, useEffect,
} from 'react';
import {Button, ButtonGroup, CloseButton, Form} from 'react-bootstrap';
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
import {SelectDate} from './Items';
import Modal from 'react-bootstrap/Modal';

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
    setAccessible(false);
    axios.put(apiUrl, convertToProps(event.target as HTMLFormElement))
        .then(()=>{
          setAccessible(true);
          if (onUpdated) {
            onUpdated();
          }
        })
        .catch(console.error);
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
  apiData?: IProjectApi
  submitUrl: string
  onUpdated?: ()=>void
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

export const convertToProps = (target: HTMLFormElement)=>{
  const formData = new FormData(target);
  return Object.fromEntries(formData);
};
export interface ProjectObjectsRef {
  editMode: boolean,
  errorMessageAlert: RefObject<RefAlertDismissible>
  forwardingUrl: string | undefined
  accessible: boolean,
  collections: ICollection[] | null
}
export const ProjectObjects = forwardRef(
    (
        props: IProjectObjectDetails,
        ref: Ref<ProjectObjectsRef>,
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
      const [collections, loading] = useGetCollections();
      const errorMessageAlert = useRef<RefAlertDismissible>(null);
      const confirmDialog = useRef<RefConfirmDialog>(null);
      useEffect(()=>{
        setAccessible(!loading);
      }, [loading]);

      const handleCreateObject = () =>{
        setNewObjectDialogShown(true);
      };
      const onErrorNewObject = (reason: AxiosError|Error)=>{
        if (errorMessageAlert.current) {
          const messageBox = errorMessageAlert.current;
          messageBox.setMessage(reason.toString());
          messageBox.setShow(true);
        }
      };
      const onAcceptedNewObject = ()=>{
        setNewObjectDialogShown(false);
        if (props.onUpdated) {
          props.onUpdated();
        }
      };
      const handleClosedNewDialogBox = () => {
        setNewObjectDialogShown(false);
      };

      const onRedirect = props.onRedirect;
      const handleOpenEdit = useCallback((url: string) =>{
        setForwardingUrl(url);
        if (onRedirect) {
          onRedirect(url);
        }
      }, [onRedirect],
      );

      const onUpdated = props.onUpdated;
      const handelOnUpdatedCallback = useCallback(()=>{
        if (onUpdated) {
          onUpdated();
        }
      }, [onUpdated]);

      const onAccessibleCallback = props.onAccessibleChange;
      const resetAccessibilityState = useCallback(()=>{
        setAccessible(true);
        if (onAccessibleCallback) {
          onAccessibleCallback(true);
        }
      }, [onAccessibleCallback]);
      const onError = props.onError;
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
      useImperativeHandle(ref, ()=>({
        collections: collections,
        editMode: editMode,
        errorMessageAlert: errorMessageAlert,
        forwardingUrl: forwardingUrl,
        accessible: accessible,
      }), [collections, accessible, forwardingUrl, editMode]);
      const table = props.apiData ?
      (
          <ComponentTable
            items={props.apiData.project.objects}
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
      if (loading) {
        return (<>Loading...</>);
      }
      return (<>
        <AlertDismissible ref={errorMessageAlert}/>
        <NewObjectModal
          show={newObjectDialogShown}
          collections={collections}
          onAccepted={
            (event)=>handleAcceptedNewObject(
                event,
                props.submitUrl,
                onAcceptedNewObject,
                onErrorNewObject,
            )
          }
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
    });
ProjectObjects.displayName = 'ProjectObjects';


const handleAcceptedNewObject = (
    event: React.SyntheticEvent,
    submitUrl: string,
    onSuccess: ()=>void,
    onError: (reason: AxiosError|Error)=>void,
) => {
  axios.post(
      submitUrl,
      convertToProps(event.target as HTMLFormElement),
  )
      .then(onSuccess)
      .catch(onError);
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

interface NewObjectModalProps{
  show: boolean,
  onAccepted?: (event: React.SyntheticEvent)=>void
  onClosed?: ()=>void
  onAccessibleChange?: (value: boolean)=>void
  collections: ICollection[] | undefined | null
}

interface ICollection {
    collection_id: number
    collection_name: string
}

interface ICollectionsApi {
  collections: ICollection[];
}

export const NewObjectModal: FC<NewObjectModalProps> = (
    {show, onAccepted, onClosed, onAccessibleChange, collections},
)=>{
  const [isOpen, setIsOpen] = useState(false);
  const newItemDialog = useRef(null);
  useEffect(()=>{
    setIsOpen(show);
  },
  [show],
  );
  const handleClose = () => {
    setIsOpen(false);
    if (onClosed) {
      onClosed();
    }
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (onAccepted) {
      onAccepted(event);
    }
  };
  let form;
  if (collections) {
    const collectionsOptions = collections.map((collection) =>{
      return (
        <option
          key={collection.collection_id}
          value={collection.collection_id}>
          {collection.collection_name}
        </option>
      );
    });
    form = (
      <>
        <Form.Group className="mb-3 row">
          <Form.Label
            htmlFor='projectName'
            className="col-sm-2 col-form-label"
          >
            Name
          </Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Control id='projectName' name="name" required/>
          </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3 row">
          <Form.Label
            className="col-sm-2 col-form-label"
            htmlFor="collectionSelect"
          >
              Collection
          </Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Select
              id="collectionSelect"
              name="collection_id"
              defaultValue=""
              required
            >
              <option value="" disabled>Select a collection
              </option>
              {collectionsOptions}
            </Form.Select>
          </Form.Group>
        </Form.Group>

        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">
                Originals Received
          </Form.Label>
          <Form.Group className="col-sm-10">
            <SelectDate
              name='originals_rec_date'
              dateFormat='m/dd/yyyy'
            />
          </Form.Group>
        </Form.Group>
      </>
    );
  } else {
    form = <LoadingIndeterminate/>;
  }
  const modalFooter = collections ? (
    <ButtonGroup>
      <Button variant='danger' onClick={handleClose}>Cancel</Button>
      <Button variant="primary" type="submit">Create</Button>
    </ButtonGroup>
  ) : (
      <ButtonGroup>
        <Button variant='danger' onClick={handleClose}>Cancel</Button>
      </ButtonGroup>
  );
  return (
    <Modal
      data-testid='newObjectModal'
      show={isOpen}
      onHide={handleClose}
      size="lg"
      ref={newItemDialog}>
      <Modal.Header>
        <h5 className="modal-title" id="titleId">New Object</h5>
        <CloseButton
          aria-label="Close"
          onClick={handleClose}
        />
      </Modal.Header>
      <form id="formId" title='newObject' onSubmit={handleSubmit}>
        <Modal.Body>
          {form}
        </Modal.Body>
        <Modal.Footer>{modalFooter}</Modal.Footer>
      </form>
    </Modal>
  );
};

const useGetCollections = ():[ICollection[] | null, boolean] =>{
  const [loading, setLoading] = useState(false);
  const [
    collections,
    setCollections,
  ] = useState<ICollection[] | null>(null);
  useEffect(()=>{
    const fetchData = async (url: string)=> {
      const data = ((await axios.get(url)).data as ICollectionsApi);
      return data.collections;
    };
    setLoading(true);
    fetchData('/api/collection')
        .then((s)=> {
          if (s != undefined) {
            setCollections(s);
          }
        })
        .catch(console.error)
        .finally(()=>setLoading(false));
    setCollections([]);
  }, []);
  return [collections, loading];
};
