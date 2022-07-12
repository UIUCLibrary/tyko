import {ProgressBar, Spinner} from 'react-bootstrap';
import React, {FC} from 'react';

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
