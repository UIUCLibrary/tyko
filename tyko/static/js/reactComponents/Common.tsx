import {Spinner} from 'react-bootstrap';
import React from 'react';

export const LoadingIndeterminate = () => {
  return (
    <div style={{textAlign: 'center'}}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};
