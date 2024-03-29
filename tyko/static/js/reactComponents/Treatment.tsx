import React, {
  FC,
  useReducer,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  Ref, useEffect, RefObject,
} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {ButtonGroup, CloseButton, ListGroup} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {
  ConfirmDialog,
  RefConfirmDialog,
  AlertDismissible,
  RefAlertDismissible} from './Common';
import {IItemMetadata} from '../reactComponents/ItemApp';
export enum TreatmentType {
  Needed = 'needed',
  Performed = 'done'
}
interface NewTreatment {
  type: TreatmentType
  message?: string
}
export interface ITreatment {
  type: string
  message: string
  item_id: number
  treatment_id: number
}
interface PropsTreatmentDialog {
  show?: boolean
  title?: string
  onAccepted?: (results: NewTreatment)=>void
  onCancel?: ()=>void
}

export interface TreatmentDialogRef {
  handleClose: ()=>void
  visible: boolean,
  setTitle: (title: string)=>void
  setShow: (visible: boolean)=>void
  setType: (value: TreatmentType)=>void
  setDescription: (text: string|null)=>void
  accept: ()=>void
  reject: ()=>void
  setOnAccepted: (callback:(data: NewTreatment)=> void)=>void,
  setOnRejected: (callback:()=> void)=>void,
}
export const TreatmentDialog = forwardRef(
    (
        props: PropsTreatmentDialog,
        ref: Ref<TreatmentDialogRef> ) => {
      const [title, setTitle] = useState(props.title);
      const [description, setDescription] = useState<string|null>(null);
      const type = useRef<TreatmentType>();
      const [
        visible,
        setVisible,
      ] = useState<boolean>(props.show ? props.show : false);
      const treatmentContent = useRef<HTMLTextAreaElement>(null);
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
        setType: (value) => type.current = value,
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
          if (type.current) {
            onAccepted.current({
              type: type.current,
              message: treatmentContent.current?.value,
            });
          }
        }
        handleClose();
      };
      const validateContent = () =>{
        if (saveButton.current && treatmentContent.current) {
          saveButton.current.disabled =
            treatmentContent.current.value.length == 0;
        }
      };
      return (
        <Modal show={visible} onShow={validateContent}>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <CloseButton
              aria-label="Close"
              onClick={handleCanceled}
            />
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  ref={treatmentContent}
                  autoFocus={true}
                  as="textarea" rows={3}
                  onChange={validateContent}
                  defaultValue={description ? description : undefined}
                />
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

TreatmentDialog.displayName = 'TreatmentDialog';

const parseTreatmentType = (
    data: IItemMetadata,
    type: TreatmentType,
): IElement[] =>{
  const items: {content: string, id: number}[]= [];
  for (const treatment of data.treatment) {
    if (treatment.type === type.toString()) {
      items.push(
          {
            content: treatment.message,
            id: treatment.treatment_id,
          },
      );
    }
  }
  return items;
};

export interface TreatmentProps {
  apiUrl: string,
  apiData?: IItemMetadata,
  onUpdated?: ()=>void
  onAccessibleChange? : (busy: boolean)=>void
  onError? : (e: Error | AxiosError)=>void
}
export interface TreatmentRef {
  editMode: boolean,
  treatmentsDialog: RefObject<TreatmentDialogRef>,
  confirmDialog: RefObject<RefConfirmDialog>,
  errorMessageAlert: RefObject<RefAlertDismissible>
  openNewDialog: (type: TreatmentType)=>void,
  openConfirmDialog: (id: number, type: TreatmentType)=>void,
  openEditDialog: (id: number, type: TreatmentType)=>void,
  add: (type: TreatmentType, message: string)=>void
  edit: (id: number, data: NewTreatment)=> void
  remove: (id: number)=> void
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
export const Treatment = forwardRef(
    (
        props: TreatmentProps,
        ref: Ref<TreatmentRef> ) => {
      const [
        editMode,
        setEditMode,
      ] = useReducer((mode)=>!mode, false);
      const [accessible, setAccessible] = useState(true);
      const treatmentsDialog = useRef<TreatmentDialogRef>(null);
      const onError = useCallback((e: Error | AxiosError)=>{
        updateErrorMessage(errorMessageAlert, e);
        if (props.onError) {
          props.onError(e);
        }
      }, [props]);
      const handleUpdate = useCallback(() =>{
        if (props.onUpdated) {
          props.onUpdated();
        }
      }, [props]);
      const handleEditData = useCallback((id: number, data: NewTreatment)=> {
        const putUrl = `${props.apiUrl}&treatment_id=${id}`;
        setAccessible(false);
        axios.put(putUrl, data)
            .then(handleUpdate)
            .catch(onError)
            .finally(()=>setAccessible(true));
      }, [handleUpdate, onError, props.apiUrl]);
      const handleCreateNew = useCallback((data: NewTreatment)=>{
        setAccessible(false);
        axios.post(props.apiUrl, data)
            .then(handleUpdate)
            .catch(onError)
            .finally(()=>setAccessible(true));
      }, [handleUpdate, onError, props.apiUrl]);
      const handleOpenEditDialog =
          useCallback((id: number, type: TreatmentType) =>{
            axios.get(props.apiUrl, {params: {treatment_id: id}})
                .then((response: AxiosResponse<ITreatment>)=> {
                  if (treatmentsDialog.current) {
                    treatmentsDialog.current.setTitle(
                        `Edit ${response.data.type}`,
                    );
                    treatmentsDialog.current.setShow(true);
                    treatmentsDialog.current.setDescription(
                        response.data.message,
                    );
                    treatmentsDialog.current.setType(type);
                    treatmentsDialog.current.setOnAccepted(
                        (data)=>handleEditData(id, data),
                    );
                  }
                })
                .catch(onError);
          }, [handleEditData, onError, props.apiUrl]);
      const handleOpenNewDialogBox = useCallback((type: TreatmentType) =>{
        if (!treatmentsDialog.current) {
          return;
        }
        treatmentsDialog.current.setTitle('Create new');
        treatmentsDialog.current.setShow(true);
        treatmentsDialog.current.setDescription(null);
        treatmentsDialog.current.setType(type);
        treatmentsDialog.current.setOnAccepted(handleCreateNew);
      }, [handleCreateNew]);
      const removeTreatment = useCallback((id: number)=> {
        setAccessible(false);
        axios.delete(props.apiUrl, {data: {id: id}})
            .then(handleUpdate)
            .catch(onError)
            .finally(()=>setAccessible(true));
      }, [handleUpdate, onError, props.apiUrl]);
      const openRemovalDialog =
          useCallback((id: number, type: TreatmentType) =>{
            if (confirmDialog.current) {
              confirmDialog.current.setTitle(`Remove from ${type}`);
              confirmDialog.current.setShow(true);
              confirmDialog.current.setOnAccept(() => removeTreatment(id));
            }
          }, [removeTreatment]);
      useImperativeHandle(ref, () => (
        {
          editMode: editMode,
          treatmentsDialog: treatmentsDialog,
          confirmDialog: confirmDialog,
          errorMessageAlert: errorMessageAlert,
          add: (type: TreatmentType, message: string)=> handleCreateNew(
              {type: type, message: message},
          ),
          edit: handleEditData,
          openNewDialog: handleOpenNewDialogBox,
          openConfirmDialog: openRemovalDialog,
          openEditDialog: handleOpenEditDialog,
          remove: removeTreatment,
        }
      ), [
        editMode,
        handleCreateNew,
        handleEditData,
        handleOpenEditDialog,
        handleOpenNewDialogBox,
        openRemovalDialog,
        removeTreatment,
      ]);
      const form = useRef<HTMLFormElement>(null);
      useEffect(()=>{
        if (props.onAccessibleChange) {
          props.onAccessibleChange(!accessible);
        }
      }, [accessible, props.onAccessibleChange]);
      const confirmDialog = useRef<RefConfirmDialog>(null);
      const errorMessageAlert = useRef<RefAlertDismissible>(null);
      const treatmentNeededElements =
          props.apiData ?
              parseTreatmentType(props.apiData, TreatmentType.Needed):
              [];
      const treatmentPerformedElements =
          props.apiData ?
              parseTreatmentType(props.apiData, TreatmentType.Performed):
              [];
      return (
        <>
          <AlertDismissible ref={errorMessageAlert}/>
          <ConfirmDialog ref={confirmDialog}>Are you sure?</ConfirmDialog>
          <TreatmentDialog ref={treatmentsDialog}/>
          <Form ref={form}>
            <EditableListElement
              label='Treatment Needed'
              editMode={editMode}
              elements={treatmentNeededElements}
              onAddElement={()=>handleOpenNewDialogBox(TreatmentType.Needed)}
              onEdit={(id)=> handleOpenEditDialog(id, TreatmentType.Needed)}
              onRemove={(id)=> openRemovalDialog(id, TreatmentType.Needed)}
            />
            <EditableListElement
              label='Treatment Done'
              editMode={editMode}
              elements={treatmentPerformedElements}
              onAddElement={()=>handleOpenNewDialogBox(TreatmentType.Performed)}
              onEdit={(id)=> handleOpenEditDialog(id, TreatmentType.Performed)}
              onRemove={(id)=> openRemovalDialog(id, TreatmentType.Performed)}
            />
            <ButtonGroup hidden={!editMode} className={'float-end'}>
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
          </Form>
        </>
      );
    });
Treatment.displayName = 'Treatment';

interface IElement {
  content: string
  id: number
}
interface IEditableListElement {
  label: string
  elements: IElement[]
  editMode: boolean
  onRemove?: (id: number)=>void
  onEdit?: (id: number)=>void
  onAddElement?: ()=>void
}

export const EditableListElement: FC<IEditableListElement> = (
    {
      label,
      elements,
      onAddElement,
      onRemove,
      onEdit,
      editMode,
    },
) =>{
  const handleRemoval = (id: number) => {
    if (onRemove) {
      onRemove(id);
    }
  };
  const handleEdit = (id: number) => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleNew = () =>{
    if (onAddElement) {
      onAddElement();
    }
  };
  const mapElementsAsViewable = (element: IElement)=>{
    return (
      <li key={element.id}>
        <Form.Text>{element.content}</Form.Text>
      </li>
    );
  };
  const mapElementsAsEditable = (element: IElement)=>{
    const editButton = (
      <DropdownButton title='' size='sm'>
        <Dropdown.Item
          size='sm'
          onClick={()=>handleEdit(element.id)}
        >Edit</Dropdown.Item>
        <Dropdown.Item
          size='sm'
          onClick={()=>handleRemoval(element.id)}
        >Remove</Dropdown.Item>
      </DropdownButton>
    );

    return (
      <ListGroup.Item
        key={element.id}
        className="d-flex justify-content-between align-items-start"
      >
        {element.content}
        {editButton}
      </ListGroup.Item>
    );
  };
  const content = editMode ? (
    <ListGroup variant={'flush'}>
      {elements.map(mapElementsAsEditable)}
    </ListGroup>
  ) : (
      <ul>
        {elements.map(mapElementsAsViewable)}
      </ul>
  );
  return (
    <>
      <Form.Group className="mb-2 row">
        <Form.Label column='sm'>{label}</Form.Label>
        <Form.Group className="col-sm-8">
          <Form.Group className="mb-3 row">
            {content}
            <Form.Group>
              <ButtonGroup className={'float-end'} hidden={!editMode}>
                <Button size={'sm'} onClick={handleNew}>Add</Button>
              </ButtonGroup>
            </Form.Group>
          </Form.Group>
        </Form.Group>
      </Form.Group>
    </>
  );
};
