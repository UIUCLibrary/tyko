import React from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
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
    <Container>
      <Card className="mb-1">
        <Card.Header>{title}</Card.Header>
        <Card.Body>
          {children}
        </Card.Body>
      </Card>
    </Container>
  );
}

/**
 * Inactive div for panel
 * @constructor
 */
export function InactiveCover(
    {children}: {children ?: JSX.Element | JSX.Element[] | string},
) {
  return (
    <div
      style={
        {
          background: 'lightgray',
          width: '100%',
          height: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 0,
          opacity: '75%',
        }
      }
    >
      <div style={{top: '50%', left: '50%', position: 'absolute'}}>
        {children}
      </div>
    </div>
  );
}
