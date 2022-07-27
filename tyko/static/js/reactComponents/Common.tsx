import {ButtonGroup, Form, ProgressBar, Spinner} from 'react-bootstrap';
import React, {Dispatch, FC, SetStateAction, useId} from 'react';
import Button from 'react-bootstrap/Button';

export const LoadingIndeterminate = () => {
  return (
    <div style={{textAlign: 'center'}}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
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
