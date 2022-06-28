import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {Col, Row} from 'react-bootstrap';
import React from 'react';
import axios from 'axios';

interface INewCollectionResponse{
  frontend_url: string
}

/**
 * NewCollection
 * @constructor
 */
export default function NewCollection() {
  const submitNewCollection = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post('/api/collection', formProps)
        .then((resp)=>{
          const data = resp.data as INewCollectionResponse;
          window.location.href=data.frontend_url;
        })
        .catch(console.error);
  };

  return (
    <div>
      <h1>New Collection</h1>
      <Form onSubmit={submitNewCollection}>
        <Form.Group>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Collection Name</Form.Label>
            </Col>
            <Col>
              <Form.Control name="collection_name" required/>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Department</Form.Label>
            </Col>
            <Col>
              <Form.Control name="department"/>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Record Series</Form.Label>
            </Col>
            <Col>
              <Form.Control name="record_series"/>
            </Col>
          </Row>
        </Form.Group>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
