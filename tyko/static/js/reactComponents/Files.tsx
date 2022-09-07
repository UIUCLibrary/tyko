import React, {
  forwardRef,
  Ref,
  RefObject,
  useReducer,
  useRef,
  FC,
  useCallback, useState, useImperativeHandle,
} from 'react';

import {IItemMetadata} from './ItemApp';
import axios, {AxiosError} from 'axios';
import {
  AlertDismissible, ConfirmDialog,
  RefAlertDismissible,
  RefConfirmDialog,
} from './Common';
import Table from 'react-bootstrap/Table';
import {ButtonGroup, CloseButton} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
export interface FileProps {
  apiUrl: string,
  apiData?: IItemMetadata,
  onUpdated?: ()=>void
  onAccessibleChange? : (busy: boolean)=>void
  onError? : (e: Error | AxiosError)=>void
}
export interface FileRef {
  editMode: boolean,
  errorMessageAlert: RefObject<RefAlertDismissible>
}

interface IEditableRollProps {
  generation: string,
  fileName: string,
  fileId: number,
  link: string,
  onRemove?: (id: number, itemDisplayName?:string)=>void
  onEdit?: (link: string)=>void,
}

export const EditableRow: FC<IEditableRollProps> = (
    {
      generation,
      fileName,
      fileId,
      link,
      onRemove,
      onEdit,
    },
)=>{
  const handleEdit = () => {
    if (onEdit) {
      onEdit(link);
    }
  };
  const handleRemoval = (id: number) => {
    if (onRemove) {
      onRemove(id, fileName);
    }
  };
  return (
    <tr>
      <td>{generation}</td>
      <td><a href={link}>{fileName}</a></td>
      <td>
        <div className={'float-end'}>
          <DropdownButton title='' size='sm' variant='secondary'>
            <Dropdown.Item
              size='sm'
              onClick={handleEdit}
            >Edit</Dropdown.Item>
            <Dropdown.Item
              size='sm'
              onClick={()=>handleRemoval(fileId)}
            >Remove</Dropdown.Item>
          </DropdownButton>
        </div>
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
  generation: FileGeneration
}
export interface FilesDialogRef {
  handleClose: ()=>void
  visible: boolean,
  setTitle: (title: string)=>void
  setShow: (visible: boolean)=>void
  setDescription: (text: string|null)=>void
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

const matchGenerationSelection = (
    value: keyof typeof FileGeneration,
): FileGeneration | null =>{
  for (const key of Object.keys(FileGeneration)) {
    if (key === value) {
      return FileGeneration[value];
    }
  }
  return null;
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
      const [description, setDescription] = useState<string|null>(null);
      const generation = useRef<FileGeneration>();
      const [
        visible,
        setVisible,
      ] = useState<boolean>(props.show ? props.show : false);
      const fileNameContent = useRef<HTMLInputElement>(null);
      const generationSelection = useRef<HTMLSelectElement>(null);
      const saveButton = useRef<HTMLButtonElement>(null);
      const onAccepted =
          useRef(props.onAccepted ? props.onAccepted : undefined);
      const onRejected =
          useRef(props.onCancel ? props.onCancel : () => undefined);

      useImperativeHandle(ref, () => ({
        setOnAccepted: (callback) => onAccepted.current = callback,
        setOnRejected: (callback) => onRejected.current = callback,
        setShow: setVisible,
        visible: visible,
        reject: handleCanceled,
        accept: handleAccepted,
        setGeneration: (value) => generation.current = value,
        handleClose: handleClose,
        setDescription: setDescription,
        setTitle: setTitle,
      }));
      const handleClose = () => setVisible(false);
      const handleCanceled = () => {
        onRejected.current();
        handleClose();
      };
      const handleAccepted = () => {
        if (onAccepted.current) {
          if (generationSelection.current) {
            const fileNameValue = fileNameContent.current ?
                fileNameContent.current.value :
                '';
            const selectedGeneration =
                generationSelection.current.value;
            const generationEnum = matchGenerationSelection(
                selectedGeneration as keyof typeof FileGeneration,
            );
            if (generationEnum != null) {
              onAccepted.current({
                generation: generationEnum,
                fileName: fileNameValue,
              });
            }
          }
        }
        handleClose();
      };
      const validateContent = () =>{
        if (
          saveButton.current &&
          fileNameContent.current &&
          generationSelection.current
        ) {
          if (fileNameContent.current.value.length == 0) {
            saveButton.current.disabled = true;
            return;
          }
          saveButton.current.disabled = false;
        }
      };
      const createEnumOptions = () =>{
        const elements = Object.keys(FileGeneration)
            .filter((key) => isNaN(Number(key)))
            .map((key, index) => {
              return (
                <option key={index}>{key}</option>
              );
            });
        return (
          <>
            {elements}
          </>
        );
      };
      return (
        <Modal show={visible} onShow={validateContent} size={'lg'}>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <CloseButton
              aria-label="Close"
              onClick={handleCanceled}
            />
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3 row">
                <Form.Label className="col-sm-2 col-form-label">
                  File Name
                </Form.Label>
                <Form.Group className="col-sm-10">
                  <Form.Control
                    ref={fileNameContent}
                    autoFocus={true}
                    onChange={validateContent}
                    defaultValue={description ? description : undefined}
                  />
                </Form.Group>
              </Form.Group>
              <Form.Group className="mb-3 row">
                <Form.Label className="col-sm-2 col-form-label">
                  Generation
                </Form.Label>
                <Form.Group className="col-sm-10">
                  <Form.Select
                    ref={generationSelection}
                    name='generation'
                    onChange={validateContent}>
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

      const [accessible, setAccessible] = useState(true);
      const filesDialog = useRef<FilesDialogRef>(null);
      const onError = useCallback((e: Error | AxiosError)=>{
        updateErrorMessage(errorMessageAlert, e);
        if (props.onError) {
          props.onError(e);
        }
      }, [props]);
      const handleUpdate = ()=>{
        if (props.onUpdated) {
          props.onUpdated();
        }
      };

      const removeFile = useCallback((id: number)=>{
        setAccessible(false);
        const url = `${props.apiUrl}?id=${id}`;
        axios.delete(url, {data: {id: id}})
            .then(handleUpdate)
            .catch(onError)
            .finally(()=>setAccessible(true));
      }, [handleUpdate, onError, props.apiUrl]);
      const handleOpenEditDialog = useCallback((url: string) =>{
        window.location.href = url;
      }, []);
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
      const row = props.apiData?.files.map((file, index) =>{
        return (
          <EditableRow key={index}
            generation={file.generation}
            fileName={file.name}
            fileId={file.id}
            link={file.routes.frontend}
            onEdit={handleOpenEditDialog}
            onRemove={openConfirmRemovalDialog}
          />
        );
      });
      const handelOnUpdated = () =>{
        if (props.onUpdated) {
          props.onUpdated();
        }
      };
      const handleNewFile = useCallback((data: NewFile) => {
        setAccessible(false);
        axios.post(
            props.apiUrl,
            {
              'file_name': data.fileName,
              'generation': data.generation as string,
            },
        )
            .then(handelOnUpdated)
            .catch(onError)
            .finally(()=>{
              setAccessible(true);
            });
      }, [onError, handelOnUpdated, props.apiUrl]);
      const handleOpenNewDialogBox = useCallback(()=>{
        if (!filesDialog.current) {
          return;
        }

        filesDialog.current.setTitle('New File');
        filesDialog.current.setOnAccepted(handleNewFile);
        filesDialog.current.setShow(true);
      }, [handleNewFile]);

      const errorMessageAlert = useRef<RefAlertDismissible>(null);
      const confirmDialog = useRef<RefConfirmDialog>(null);
      return (
        <>
          <AlertDismissible ref={errorMessageAlert}/>
          <FilesDialog ref={filesDialog}/>
          <ConfirmDialog ref={confirmDialog}>Are you sure?</ConfirmDialog>
          <Table>
            <thead>
              <tr>
                <td>Generation</td>
                <td>File Name</td>
                <td/>
              </tr>
            </thead>
            <tbody>
              {row}
            </tbody>
          </Table>
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