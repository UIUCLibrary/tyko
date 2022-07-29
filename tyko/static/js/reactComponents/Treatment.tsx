import React, {
  FC,
  useReducer,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal, {ModalProps} from 'react-bootstrap/Modal';
import {ButtonGroup, CloseButton, ListGroup} from 'react-bootstrap';
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
  onHide?: ()=>void
}
// const TykoModalDialog = forwardRef<typeof Modal, IModalDialog>(
interface RefObject {
  handleClose: ()=>void;
}

interface ITreatmentDialog {
  show?: boolean
  title?: string
  onAccepted?: (results: IModalAccepted)=>void
  onCancel?: ()=>void
}

interface TreatmentDialogRef {
  handleClose: ()=>void
  setVisible: (visible: boolean)=>void
  setTitle: (title: string)=>void
  setType: (value: TreatmentType)=>void
  setDescription: (text: string|null)=>void
  setOnAccepted: (callback:(data: IModalAccepted)=> void)=>void,
  setOnCancel: (callback:()=> void)=>void,
}
const TreatmentDialog = forwardRef(
    (
        props: ITreatmentDialog,
        ref: Ref<TreatmentDialogRef> ) => {
      const [title, setTitle] = useState(props.title);
      const [description, setDescription] = useState<string|null>(null);
      const [type, setType] = useState<TreatmentType>();

      const [visible, setVisible] = useState<boolean|undefined>(props.show);
      const [saveButtonActive, setSaveButtonActive] = useState(false);
      const treatmentContent = useRef<HTMLTextAreaElement>(null);
      const saveButton = useRef<HTMLButtonElement>(null);
      const [
        onAccepted,
        setOnAccepted,
      ] = useState<(results: IModalAccepted)=>void>(
          props.onAccepted? props.onAccepted : ()=> undefined,
      );
      const [
        onCancel,
        setOnCancel,
      ] = useState<()=>void>(props.onCancel ? props.onCancel: ()=> undefined);

      useImperativeHandle(ref, () => ({
        setOnAccepted: (callback) => {
          setOnAccepted(()=>{
            return callback;
          });
        },
        setOnCancel: (callback) =>{
          setOnCancel(()=>{
            return callback;
          });
        },
        setVisible(value) {
          setVisible(value);
        },
        setType(value) {
          setType(value);
        },
        handleClose() {
          handleClose();
        },
        setDescription: (value) => {
          setDescription(value);
        },
        setTitle: (value) => {
          setTitle(value);
        },
      }));
      const handleClose = () => {
        setVisible(false);
      };

      const handleCanceled = () => {
        if (onCancel) {
          onCancel();
        }
        handleClose();
      };

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
      return (
        <Modal show={visible}>
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
              disabled={saveButtonActive}
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
// const TykoModalDialog = forwardRef(
//     (
//         props: IModalDialog,
//         ref: Ref<RefObject>) =>{
//       useImperativeHandle(ref, () => ({
//         handleClose() {
//           handleClose();
//         },
//       }));
//       const [isOpen, setIsOpen] = useState(props.show);
//       const handleClose = () => {
//         setIsOpen(false);
//         if (props.onClosed) {
//           props.onClosed();
//         }
//       };
//       return (
//         <Modal
//           ref={ref}
//           show={isOpen}
//           backdrop={props.backdrop} size={props.size}
//           onHide={handleClose}
//         >
//           <Modal.Header>
//             <h5 className="modal-title" id="titleId">{props.title}</h5>
//             <CloseButton
//               aria-label="Close"
//               onClick={handleClose}
//             />
//           </Modal.Header>
//           {props.children}
//         </Modal>
//       );
//     });
// TykoModalDialog.displayName = 'TykoModalDialog';
interface IConfirmDialog {
  children?: string | JSX.Element | JSX.Element[]
  title?: string
  show?: boolean
  onConfirm?: ()=>void
  onCancel?: ()=>void
}
interface RefConfirmDialog {
  handleClose: ()=>void,
  setTitle: (title: string)=>void,
  setShow: (show: boolean)=>void,
  setOnConfirm: (callback:()=> void)=>void,
  setOnCancel: (callback:()=> void)=>void,
}

const ConfirmDialog = forwardRef((
    props: IConfirmDialog,
    ref: Ref<RefConfirmDialog>) =>{
  const [title, setTitle] = useState<string|undefined>(props.title);
  const [visible, setVisible] = useState<boolean|undefined>(props.show);
  const [
    onConfirm,
    setOnConfirm,
  ] = useState<()=>void>(props.onConfirm? props.onConfirm : ()=> undefined);
  const [
    onCancel,
    setOnCancel,
  ] = useState<()=>void>(props.onCancel ? props.onCancel: ()=> undefined);
  useImperativeHandle(ref, () => ({
    setTitle: (value) => {
      setTitle(value);
    },
    setShow: (value) => {
      setVisible(value);
    },
    handleClose: () => {
      handleClose();
    },
    setOnConfirm: (callback) => {
      setOnConfirm(()=>{
        return callback;
      });
    },
    setOnCancel: (callback) =>{
      setOnCancel(()=>{
        return callback;
      });
    },
  }));
  const handleClose = ()=>{
    setVisible(false);
  };
  const handleCancel = ()=>{
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };
  const handleConfirm = ()=>{
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };
  return (
    <Modal show={visible}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <CloseButton
          aria-label="Close"
          onClick={handleClose}
        />
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
        <Button variant="danger" onClick={handleConfirm}>Remove</Button>
      </Modal.Footer>
    </Modal>
  );
});
ConfirmDialog.displayName = 'ConfirmDialog';
interface ITreatment {
  apiUrl: string,
  onUpdated?: ()=>void
}
export const Treatment = ({apiUrl, onUpdated}: ITreatment)=>{
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const [accessible, setAccessible] = useState(true);
  const [dialogShown, setDialogShown]= useState(false);
  const [dialogMessage, setDialogMessage]= useState<string | undefined>();
  const onError = ()=>{
    console.error('Error');
  };
  const form = useRef<HTMLFormElement>(null);

  const handleNew = (type: TreatmentType) =>{
    console.log(`opening up new ${type}`);
    if (treatmentsDialog.current) {
      treatmentsDialog.current.setTitle('Create new');
      treatmentsDialog.current.setVisible(true);
      treatmentsDialog.current.setDescription(null);
      treatmentsDialog.current.setType(type);
      treatmentsDialog.current.setOnAccepted((data)=> {
        console.log(`calling post ${apiUrl} with ${JSON.stringify(data)}`);
        if (onUpdated) {
          onUpdated();
        }
      });
    // todo: Make this use a POST request
    }
  };

  const handleRemoval = (id: number, type: TreatmentType) =>{
    const data = {
      id: id,
      type: type,
    };
    if (confirmDialog.current) {
      confirmDialog.current.setTitle(`Remove ${id}`);
      confirmDialog.current.setShow(true);
      confirmDialog.current.setOnConfirm(()=> {
        console.log(`calling delete ${apiUrl} with ${JSON.stringify(data)}`);
        if (onUpdated) {
          onUpdated();
        }
      });
    }
  };
  const handleEdit = (id: number, type: TreatmentType) =>{
    if (treatmentsDialog.current) {
      console.log(`calling get ${apiUrl} on id ${id}`);
      treatmentsDialog.current.setTitle(`Edit ${id}`);
      treatmentsDialog.current.setVisible(true);
      treatmentsDialog.current.setDescription('true');
      treatmentsDialog.current.setType(type);
      treatmentsDialog.current.setOnAccepted((data)=> {
        console.log(`calling put ${apiUrl} with ${JSON.stringify(data)}`);
      });
    }
    // todo: get data from api
    // todo: Make this use a PUT request
  };
  const confirmDialog = useRef<RefConfirmDialog>(null);
  const treatmentsDialog = useRef<TreatmentDialogRef>(null);
  return (
    <>
      <ConfirmDialog ref={confirmDialog}>Are you sure?</ConfirmDialog>
      <TreatmentDialog
        ref={treatmentsDialog}
        onAccepted={(results)=> {
          console.log(JSON.stringify(results));
        }}
        onCancel={()=> {
          console.log('canceled');
        }}
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
              <ButtonGroup className={'float-end'}>
                <Button size={'sm'} onClick={handleNew}>Add</Button>
              </ButtonGroup>
            </Form.Group>
          </Form.Group>
        </Form.Group>
      </Form.Group>
    </>
  );
};
