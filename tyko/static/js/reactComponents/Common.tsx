import {Form, ProgressBar, Spinner} from 'react-bootstrap';
import React, {FC, useId} from 'react';

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

interface IEditData {
  label: string,
  display: string | null | undefined
  editMode: boolean
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
        <Form.Text id={formId}
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
