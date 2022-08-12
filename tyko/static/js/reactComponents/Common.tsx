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
  SetStateAction, useCallback,
  useId,
  useImperativeHandle, useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import axios, {AxiosResponse} from 'axios';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

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


export interface PropsConfirmDialog {
  children?: string | JSX.Element | JSX.Element[]
  title?: string
  show?: boolean
  onAccepted?: ()=>void
  onCancel?: ()=>void
}
export interface RefConfirmDialog {
  handleClose: ()=>void,
  visible: boolean
  setTitle: (title: string)=>void,
  setShow: (show: boolean)=>void,
  accept: ()=>void,
  cancel: ()=>void,
  setOnAccept: (callback:()=> void)=>void,
  setOnCancel: (callback:()=> void)=>void,
}

export const ConfirmDialog = forwardRef((
    props: PropsConfirmDialog,
    ref: Ref<RefConfirmDialog>) =>{
  const [title, setTitle] = useState<string|undefined>(props.title);
  const [
    visible,
    setVisible,
  ] = useState<boolean>(props.show ? props.show : false);
  const onConfirm =
      useRef(props.onAccepted ? props.onAccepted : () => undefined);
  const onCancel = useRef(props.onCancel ? props.onCancel: ()=> undefined);
  const handleClose = useCallback(()=>{
    setVisible(false);
  }, [setVisible]);
  const handleCancel = useCallback(()=>{
    onCancel.current();
    handleClose();
  }, [onCancel, handleClose]);
  const handleConfirm = useCallback(()=>{
    onConfirm.current();
    handleClose();
  }, [handleClose, onConfirm]);
  useImperativeHandle(ref, () => (
    {
      setTitle: setTitle,
      setShow: setVisible,
      handleClose: handleClose,
      accept: handleConfirm,
      cancel: handleCancel,
      setOnAccept: (callback: ()=>void) => {
        onConfirm.current = callback;
      },
      visible: visible,
      setOnCancel: (callback: ()=>void) =>{
        onCancel.current = callback;
      },
    }
  ), [visible, handleConfirm, handleCancel, handleClose]);
  return (
    <Modal show={visible}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <CloseButton aria-label="Close" onClick={handleClose}/>
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


export interface PropsAlertDismissible {
  display?: boolean
  title?: string
  message?: string
}
export interface RefAlertDismissible {
  setTitle: (title: string)=>void,
  setMessage: (message: string)=>void,
  setShow: (show: boolean)=>void,
  visible: boolean
}
export const AlertDismissible = forwardRef((
    props: PropsAlertDismissible,
    ref: Ref<RefAlertDismissible>) =>{
  const [show, setShow] = useState(props.display ? props.display: false);
  const [title, setTitle] = useState<string|undefined>(props.title);
  const [message, setMessage] = useState<string|undefined>(props.message);
  useImperativeHandle(ref, () => ({
    setTitle: setTitle,
    setMessage: setMessage,
    setShow: setShow,
    visible: show,
  }));
  if (show) {
    return (
      <Alert variant="danger" onClose={() => setShow(false)} dismissible>
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  }
  return <></>;
});
AlertDismissible.displayName = 'AlertDismissible';
