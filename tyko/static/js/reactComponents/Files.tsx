import React, {
  forwardRef,
  Ref,
  RefObject,
  useReducer,
  useRef,
  FC,
  useCallback, useState, useImperativeHandle, useEffect,
} from 'react';
import {IItemMetadata} from './ItemApp';
import axios, {AxiosError} from 'axios';
import {
  AlertDismissible, ConfirmDialog,
  RefAlertDismissible,
  RefConfirmDialog,
  EditOptionsDropDown,
  ComponentTable,
} from './Common';
import {ButtonGroup, CloseButton} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
export interface FileProps {
  apiUrl: string,
  apiData?: IItemMetadata,
  onUpdated?: ()=>void
  onRedirect?: (url: string)=>void
  onAccessibleChange? : (busy: boolean)=>void
  onError? : (e: Error | AxiosError)=>void
}
export interface FileRef {
  editMode: boolean,
  errorMessageAlert: RefObject<RefAlertDismissible>
  forwardingUrl: string | undefined
}

interface IFile{
  generation: string
  id: number
  name: string
  routes:{
    api: string
    frontend: string
  }
}

interface IBase {
  onRemove?: (id: number, itemDisplayName?:string)=>void
  onEdit?: (link: string)=>void
  editMode?: boolean
}

interface IEditableRowProps2 extends IBase{
  file: IFile,
}

const EditableFileRow: FC<IEditableRowProps2> = (
    {file, onRemove, onEdit, editMode},
) =>{
  const {name, generation, id, routes} = file;

  const handleEdit = () =>{
    if (onEdit) {
      onEdit(routes.frontend);
    }
  };
  const handleRemove = () =>{
    if (onRemove) {
      onRemove(id, name);
    }
  };

  return (
    <tr>
      <td>{generation}</td>
      <td><a href={routes.frontend}>{name}</a></td>
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
export enum FileGeneration {
  Access = 'Access',
  Preservation = 'Preservation',
  Mezzanine = 'Mezzanine',
}
interface NewFile {
  fileName: string,
  generation: string
}
export interface FilesDialogRef {
  handleClose: ()=>void
  visible: boolean,
  setTitle: (title: string)=>void
  setShow: (visible: boolean)=>void
  setFileName: (text: string|null)=>void
  accept: ()=>void
  reject: ()=>void
  setGeneration: (value: FileGeneration)=>void,
  setOnAccepted: (callback:(data: NewFile)=> void)=>void,
  setOnRejected: (callback:()=> void)=>void,
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

interface FilesDialogProps {
  show?: boolean
  title?: string
  onAccepted?: (results: NewFile)=>void
  onCancel?: ()=>void
}

export const FilesDialog = forwardRef(
    (
        props: FilesDialogProps,
        ref: Ref<FilesDialogRef> ) => {
      const [title, setTitle] = useState(props.title);
      const [fileName, setFileName] = useState<string|null>(null);
      const [generation, setGeneration] = useState<FileGeneration|null>(null);
      const [
        visible,
        setVisible,
      ] = useState<boolean>(props.show ? props.show : false);

      const fileNameContent = useRef<HTMLInputElement>(null);
      useEffect(()=>{
        if (fileNameContent.current) {
          fileNameContent.current.value = fileName? fileName : '';
        }
      }, [fileName]);

      const generationSelection = useRef<HTMLSelectElement>(null);

      useEffect(()=>{
        if (generation && generationSelection.current) {
          generationSelection.current.value = generation.toString();
        }
      }, [generation]);
      const saveButton = useRef<HTMLButtonElement>(null);
      const onAccepted =
          useRef(props.onAccepted ? props.onAccepted : undefined);
      const onRejected =
          useRef(props.onCancel ? props.onCancel : () => undefined);
      const handleClose = useCallback(() => setVisible(false), [setVisible]);
      const handleCanceled = useCallback(() => {
        onRejected.current();
        handleClose();
      }, [handleClose]);
      const handleAccepted = useCallback(() => {
        defaultAccepted(
            onAccepted.current,
            fileNameContent.current,
            generationSelection.current,
        );
        handleClose();
      }, [handleClose]);
      useImperativeHandle(ref, () => ({
        setOnAccepted: (callback) => onAccepted.current = callback,
        setOnRejected: (callback) => onRejected.current = callback,
        setShow: setVisible,
        visible: visible,
        reject: handleCanceled,
        accept: handleAccepted,
        setGeneration: (value) => {
          setGeneration(value);
        },
        handleClose: handleClose,
        setFileName: (value)=>{
          setFileName(value);
        },
        setTitle: setTitle,
      }), [
        handleClose,
        handleCanceled,
        handleAccepted,
        visible,
      ]);

      const createEnumOptions = () =>{
        const elements = Object.keys(FileGeneration)
            .filter((key) => isNaN(Number(key)))
            .map((key, index) => {
              return (
                <option key={index} value={key}>{key}</option>
              );
            });
        return (
          <>
            {elements}
          </>
        );
      };
      const runValidate = ()=>{
        validateContent(
            saveButton.current,
            fileNameContent.current,
        );
      };
      return (
        <Modal show={visible} onShow={runValidate} size={'lg'}>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <CloseButton aria-label="Close" onClick={handleCanceled}/>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3 row">
                <Form.Label
                  className="col-sm-2 col-form-label"
                  htmlFor='fileName'
                >
                  File Name
                </Form.Label>
                <Form.Group className="col-sm-10">
                  <Form.Control
                    id='fileName'
                    ref={fileNameContent}
                    autoFocus={true}
                    onChange={runValidate}
                    defaultValue={fileName ? fileName: undefined}
                  />
                </Form.Group>
              </Form.Group>
              <Form.Group className="mb-3 row">
                <Form.Label
                  className="col-sm-2 col-form-label"
                  htmlFor='generation'
                >
                  Generation
                </Form.Label>
                <Form.Group className="col-sm-10">
                  <Form.Select
                    ref={generationSelection}
                    id='generation'
                    name='generation'
                    onChange={runValidate}
                  >
                    {createEnumOptions()}
                  </Form.Select>
                </Form.Group>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCanceled}>
              Cancel
            </Button>
            <Button
              ref={saveButton}
              variant="primary"
              onClick={handleAccepted}
            >
            Save
            </Button>
          </Modal.Footer>
        </Modal>
      );
    });

FilesDialog.displayName = 'FilesDialog';

export const Files = forwardRef(
    (
        props: FileProps,
        ref: Ref<FileRef>,
    ) =>{
      const [
        editMode,
        setEditMode,
      ] = useReducer((mode)=>!mode, false);
      const [
        forwardingUrl,
        setForwardingUrl,
      ] = useState<string|undefined>(undefined);
      const [accessible, setAccessible] = useState(true);
      const filesDialog = useRef<FilesDialogRef>(null);
      const apiUrl = props.apiUrl;

      const onError = props.onError;
      const onErrorCallback = useCallback((e: Error | AxiosError)=>{
        updateErrorMessage(errorMessageAlert, e);
        if (onError) {
          onError(e);
        }
      }, [onError]);

      const onAccessibleCallback = props.onAccessibleChange;
      useEffect(()=>{
        if (onAccessibleCallback) {
          onAccessibleCallback(!accessible);
        }
      }, [accessible, onAccessibleCallback]);

      const onUpdated = props.onUpdated;
      const handelOnUpdatedCallback = useCallback(()=>{
        if (onUpdated) {
          onUpdated();
        }
      }, [onUpdated]);

      const resetAccessibilityState = useCallback(()=>{
        setAccessible(true);
        if (onAccessibleCallback) {
          onAccessibleCallback(true);
        }
      }, [onAccessibleCallback]);

      useImperativeHandle(ref, ()=>({
        editMode: editMode,
        errorMessageAlert: errorMessageAlert,
        forwardingUrl: forwardingUrl,
      }), [forwardingUrl, editMode]);
      const removeFile = useCallback((id: number)=>{
        setAccessible(false);
        if (onAccessibleCallback) {
          onAccessibleCallback(false);
        }
        const url = `${apiUrl}?id=${id}`;
        axios.delete(url, {data: {id: id}})
            .then(handelOnUpdatedCallback)
            .catch(onErrorCallback)
            .finally(resetAccessibilityState);
      }, [
        handelOnUpdatedCallback,
        onErrorCallback,
        apiUrl,
        onAccessibleCallback,
        resetAccessibilityState,
      ]);

      const redirectCallback = props.onRedirect;
      const handleOpenEdit = useCallback((url: string) =>{
        setForwardingUrl(url);
        if (redirectCallback) {
          redirectCallback(url);
        }
      }, [redirectCallback]);

      const openConfirmRemovalDialog = useCallback(
          (id: number, displayName?: string) =>{
            if (confirmDialog.current) {
              const dialogBox = confirmDialog.current;
              if (displayName) {
                dialogBox.setTitle(`Remove "${displayName}" from object?`);
              } else {
                dialogBox.setTitle('Remove File from object?');
              }
              dialogBox.setShow(true);
              dialogBox.setOnAccept(() => removeFile(id));
            }
          }, [removeFile]);
      const handleNewFile = useCallback((data: NewFile) => {
        setAccessible(false);
        if (onAccessibleCallback) {
          onAccessibleCallback(false);
        }
        axios.post(
            apiUrl,
            {
              'file_name': data.fileName,
              'generation': data.generation,
            },
        )
            .then(handelOnUpdatedCallback)
            .catch(onErrorCallback)
            .finally(resetAccessibilityState);
      }, [
        onErrorCallback,
        handelOnUpdatedCallback,
        onAccessibleCallback,
        apiUrl,
        resetAccessibilityState,
      ]);
      const handleOpenNewDialogBox = ()=> {
        if (!filesDialog.current) {
          return;
        }

        filesDialog.current.setTitle('New File');
        filesDialog.current.setOnAccepted(handleNewFile);
        filesDialog.current.setShow(true);
      };

      const errorMessageAlert = useRef<RefAlertDismissible>(null);
      const confirmDialog = useRef<RefConfirmDialog>(null);
      const table = props.apiData? (
          <ComponentTable
            items={props.apiData?.files}
            resourceName="file"
            itemComponent={EditableFileRow as FC<IBase>}
            onEdit={handleOpenEdit}
            onRemove={openConfirmRemovalDialog}
            tableHeader={
              <tr>
                <th style={{width: '15%'}}>Generation</th>
                <th>File Name</th>
                <th/>
              </tr>
            }
            editMode={editMode}
          />
      ):
          (<></>);
      return (
        <>
          <AlertDismissible ref={errorMessageAlert}/>
          <FilesDialog ref={filesDialog}/>
          <ConfirmDialog ref={confirmDialog}>Are you sure?</ConfirmDialog>
          {table}
          <ButtonGroup hidden={!editMode} className={'float-end'}>
            <Button
              variant={'outline-primary'}
              onClick={handleOpenNewDialogBox}>Add</Button>
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
        </>
      );
    },
);

Files.displayName = 'Files';

const FileTableHeader = () =>{
  return (
    <thead>
      <tr>
        <th style={{width: '15%'}}>Generation</th>
        <th>File Name</th>
        <th/>
      </tr>
    </thead>
  );
};

const defaultAccepted = (
    onAccepted: ((data: NewFile)=>void) | undefined,
    fileNameElement: HTMLInputElement | null,
    generationElement: HTMLSelectElement | null,
) =>{
  if (!fileNameElement) {
    return;
  }
  if (!generationElement) {
    return;
  }
  const generation = generationElement? generationElement.value : '';
  const fileName = fileNameElement ? fileNameElement.value: '';
  if (onAccepted) {
    onAccepted({
      generation: generation,
      fileName: fileName,
    });
  }
};

const validateContent = (
    saveButton: HTMLButtonElement | null,
    fileNameContent: HTMLInputElement | null,
) =>{
  if (
    saveButton &&
    fileNameContent
  ) {
    if (fileNameContent.value.length == 0) {
      saveButton.disabled = true;
      return;
    }
    saveButton.disabled = false;
  }
};
