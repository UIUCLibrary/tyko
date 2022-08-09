import {
  ButtonGroup,
  CloseButton,
  Form,
  ProgressBar,
  Spinner,
} from 'react-bootstrap';
import React, {
  Dispatch,
  FC,
  forwardRef,
  Ref,
  SetStateAction,
  useId,
  useImperativeHandle,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import axios, {AxiosResponse} from 'axios';
import Modal from 'react-bootstrap/Modal';

export const LoadingIndeterminate = ({message}: {message?: string}) => {
  return (
    <div style={{textAlign: 'center'}}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">
          {message ? message :'Loading...'}
        </span>
      </Spinner>
    </div>
  );
};


export const LoadingPercent : FC<{percentLoaded?: number}>= (
    {percentLoaded},
) =>{
  const label = percentLoaded? `Loading... ${percentLoaded}%` : 'Loading... ';
  return (
    <ProgressBar
      now={percentLoaded ? percentLoaded : 0}
      label={label}
    />
  );
};


interface IEditControl {
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  onConfirm?: ()=>void
}
export const EditControl: FC<IEditControl> = (
    {editMode, setEditMode, onConfirm},
) =>{
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
        <Button onClick={handleConfirm} variant={'outline-primary'}>
          Confirm
        </Button>
      </ButtonGroup>
      <Button hidden={editMode} onClick={handleEditModeChange}>Edit</Button>
    </>
  );
};


interface IEditData {
  label: string,
  display: string | null | undefined,
  editMode: boolean,
  editorId?: string
  children?: string | JSX.Element | JSX.Element[]
}

export const EditSwitchFormField: FC<IEditData> = (
    {label, editMode, display, children, editorId},
) => {
  const generatedId = useId();
  const formId = editorId ? editorId : generatedId;
  const labelElement = (
    <Form.Label column='sm'
      htmlFor={formId}
    >
      {label}
    </Form.Label>
  );
  if (!editMode) {
    return (
      <Form.Group className="mb-3 row">
        {labelElement}
        <Form.Text as={'span'} id={formId} aria-label={label}
          className='col-sm-8'>
          {display}
        </Form.Text>
      </Form.Group>
    );
  }
  return (
    <Form.Group className="mb-2 row">
      {labelElement}
      <Form.Group className="col-sm-8">
        {children}
      </Form.Group>
    </Form.Group>
  );
};

export const submitEvent = (target: EventTarget)=>{
  target.dispatchEvent(
      new Event(
          'submit', {
            cancelable: true,
            bubbles: true,
          }),
  );
};


export const submitFormUpdates = (
    apiUrl: string,
    formData: FormData,
): Promise<AxiosResponse> =>{
  const formProps = Object.fromEntries(formData);
  return axios.put(apiUrl, formProps);
};


interface IConfirmDialog {
  children?: string | JSX.Element | JSX.Element[]
  title?: string
  show?: boolean
  onConfirm?: ()=>void
  onCancel?: ()=>void
}
export interface RefConfirmDialog {
  handleClose: ()=>void,
  setTitle: (title: string)=>void,
  setShow: (show: boolean)=>void,
  setOnConfirm: (callback:()=> void)=>void,
  setOnCancel: (callback:()=> void)=>void,
}

export const ConfirmDialog = forwardRef((
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
