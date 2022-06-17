import React from 'react';
import Card from 'react-bootstrap/Card';

export interface IPanel{
  title: string
  children: JSX.Element | JSX.Element[] | string
}

/**
 * Panel
 * @param {string }title - title of panel
 * @param {JSX.Element | JSX.Element[] | string} children - children elements
 * @constructor
 */
export default function Panel({title, children}: IPanel) {
  return (
    <Card className="my-1">
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  );
}
