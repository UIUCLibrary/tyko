import React, {
  FC, useEffect, useReducer, useRef, useState, forwardRef,
} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal, {ModalProps} from 'react-bootstrap/Modal';
import {CloseButton, ListGroup} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const treatmentsNeeded = [
  {content: 'mold remediation', id: 1},
  {content: 'dust remediation', id: 3},
  {content: 'transfer', id: 5},
  {content: 're-shell', id: 7},
];
const treatmentsDone = [
  {content: 'mold remediation', id: 5},
  {content: 'dust remediation', id: 30},
  {content: 'transfer', id: 50},
  {content: 're-shell', id: 76},
  {content: 'other', id: 726},
];
enum TreatmentType {
  Needed = 'needed',
  Performed = 'done'
}
interface IModalAccepted {
  type: TreatmentType
  message?: string
}
interface NewTreatmentModalProps {
  type?: TreatmentType,
  defaultMessage?: string
  show: boolean,
  onAccepted?: (results: IModalAccepted)=>void,
  onClosed?: ()=>void
}
interface IModalDialog extends ModalProps{
  children?: string | JSX.Element | JSX.Element[]
  title: string
  onShow?: ()=>void
  onClosed?: ()=>void
  // onHide?: ()=>void
}
const TykoModalDialog: FC<IModalDialog> = (
    {children, title, show, backdrop, size, onClosed}: IModalDialog,
) =>{
  const [isOpen, setIsOpen] = useState(true);
  const handleClose = () => {
    setIsOpen(false);
    if (onClosed) {
      onClosed();
    }
  };
  return (
    <Modal
      show={isOpen}
      backdrop={backdrop} size={size}
      onHide={handleClose}
    >
      <Modal.Header>
        <h5 className="modal-title" id="titleId">{title}</h5>
        <CloseButton
          aria-label="Close"
          onClick={handleClose}
        />
      </Modal.Header>
      {children}
    </Modal>
  );
};
export const NewTreatmentModal: FC<NewTreatmentModalProps> = (
    {type, show, defaultMessage, onAccepted, onClosed},
)=>{
  const [isOpen, setIsOpen] = useState(true);
  const treatmentContent = useRef<HTMLTextAreaElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  useEffect(()=>{
    setIsOpen(show);
  }, [show],
  );

  const handleAccepted = () => {
    if (onAccepted) {
      if (type) {
        onAccepted({
          type: type,
          message: treatmentContent.current?.value,
        });
      }
    }
    handleClose();
  };
  const handleClose = () => {
    setIsOpen(false);
    if (onClosed) {
      onClosed();
    }
  };
  const getTitle = (treatmentType: TreatmentType | undefined) =>{
    switch (treatmentType) {
      case TreatmentType.Needed:
        return 'Treatment Needed';
      case TreatmentType.Performed:
        return 'Treatment Done';
      default:
        return 'Treatment';
    }
  };
  const validateData = ()=>{
    if (treatmentContent.current && saveButton.current) {
      setSaveButtonActive(treatmentContent.current.value.length == 0);
    }
  };
  const title = getTitle(type);
  // return (
  //   <>
  //     <TykoModalDialog
  //       onShow={validateData}
  //       data-testid='treatmentModal'
  //       show={isOpen}
  //       onHide={handleClose}
  //       backdrop="static"
  //       size="lg"
  //       title={title}
  //     >
  //       <Modal.Body>
  //         <Form>
  //           <Form.Group>
  //             <Form.Label>Description</Form.Label>
  //             <Form.Control
  //               ref={treatmentContent}
  //               autoFocus={true}
  //               as="textarea" rows={3}
  //               defaultValue={defaultMessage}
  //               onChange={validateData}/>
  //           </Form.Group>
  //         </Form>
  //       </Modal.Body>
  //       <Modal.Footer>
  //         <Button variant="secondary" onClick={handleClose}>
  //           Close
  //         </Button>
  //         <Button
  //           ref={saveButton}
  //           variant="primary"
  //           onClick={handleAccepted}
  //           disabled={saveButtonActive}
  //         >
  //           Save
  //         </Button>
  //       </Modal.Footer>
  //     </TykoModalDialog>
  //   </>
  // );
  // --------------------------------------------------------------------------
  return (
    <>
      <Modal
        onShow={validateData}
        data-testid='treatmentModal'
        show={isOpen}
        onHide={handleClose}
        backdrop="static"
        size="lg"
      >
        <Modal.Header>
          <h5 className="modal-title" id="titleId">{title}</h5>
          <CloseButton
            aria-label="Close"
            onClick={handleClose}
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
                defaultValue={defaultMessage}
                onChange={validateData}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            ref={saveButton}
            variant="primary"
            onClick={handleAccepted}
            disabled={saveButtonActive}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export const Treatment = ()=>{
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const [accessible, setAccessible] = useState(true);
  const [dialogShown, setDialogShown]= useState(false);
  const [dialogMessage, setDialogMessage]= useState<string | undefined>();
  const [
    dialogTreatmentType,
    setDialogTreatmentType,
  ] = useState<TreatmentType | undefined>();
  const apiUrl = '/api/project/1/object/1/itemTreatment?item_id=1';
  const onError = ()=>{
    console.error('Error');
  };
  const onUpdated = ()=>{
    console.log('updated');
  };
  const form = useRef<HTMLFormElement>(null);

  const handleNew = (type: TreatmentType) =>{
    console.log(`opening up new ${type}`);
    setDialogTreatmentType(type);
    setDialogMessage(undefined);
    setDialogShown(true);
    // todo: Make this use a POST request
  };

  const handleRemoval = (id: number, type: TreatmentType) =>{
    const data = {
      id: id,
      type: type,
    };
    // todo: request are you sure
    console.log(`calling delete ${apiUrl} with ${JSON.stringify(data)}`);
  };
  const handleEdit = (id: number, type: TreatmentType) =>{
    console.log(`calling get ${apiUrl} on id ${id}`);
    // todo: get data from api
    // todo: Make this use a PUT request
    setDialogTreatmentType(type);
    setDialogMessage('To do: get data from api and place it here');
    setDialogShown(true);
  };
  const handleAcceptedNew = (results: IModalAccepted) =>{
    if (results.message) {
      const data = {
        type: results.type,
        message: results.message,
      };
      console.log(`calling post ${apiUrl} with ${JSON.stringify(data)}`);
    }
  };
  const handleClosedNewDialogBox = ()=>{
    setDialogShown(false);
  };
  return (
    <>
      <NewTreatmentModal
        type={dialogTreatmentType}
        show={dialogShown}
        defaultMessage={dialogMessage}
        onAccepted={handleAcceptedNew}
        onClosed={handleClosedNewDialogBox}
      />
      <Form ref={form}>
        <EditableListElement
          label='Treatment Needed'
          elements={treatmentsNeeded}
          onAddElement={()=>handleNew(TreatmentType.Needed)}
          onEdit={(id)=> handleEdit(id, TreatmentType.Needed)}
          onRemove={(id)=> handleRemoval(id, TreatmentType.Needed)}
        />
        <EditableListElement
          label='Treatment Done'
          elements={treatmentsDone}
          onAddElement={()=>handleNew(TreatmentType.Performed)}
          onEdit={(id)=> handleEdit(id, TreatmentType.Performed)}
          onRemove={(id)=> handleRemoval(id, TreatmentType.Performed)}
        />
      </Form>
    </>
  );
};

interface IElement {
  content: string
  id: number
}
interface IEditableListElement {
  label: string
  elements: IElement[]
  onRemove?: (id: number)=>void
  onEdit?: (id: number)=>void
  onAddElement?: ()=>void
}

const EditableListElement: FC<IEditableListElement> = (
    {
      label,
      elements,
      onAddElement,
      onRemove,
      onEdit,
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
  const mapElements = (element: IElement)=>{
    return (
      <ListGroup.Item
        key={element.id}
        className="d-flex justify-content-between align-items-start"
      >
        <Form.Text>{element.content}</Form.Text>
        <DropdownButton title='' size='sm'>
          <Dropdown.Item
            size='sm'
            onClick={()=>handleEdit(element.id)}
          >
            Edit
          </Dropdown.Item>
          <Dropdown.Item
            size='sm'
            onClick={()=>handleRemoval(element.id)}
          >
            Remove
          </Dropdown.Item>
        </DropdownButton>
      </ListGroup.Item>
    );
  };
  return (
    <>
      <Form.Group className="mb-2 row">
        <Form.Label column='sm'>
          {label}
        </Form.Label>
        <Form.Group className="col-sm-8">
          <Form.Group className="mb-3 row">
            <ListGroup variant={'flush'}>
              {elements.map(mapElements)}
            </ListGroup>
            <Form.Group>
              <Button size={'sm'} onClick={handleNew}>Add</Button>
            </Form.Group>
          </Form.Group>
        </Form.Group>
      </Form.Group>
    </>
  );
};
