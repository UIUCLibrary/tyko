import TykoNavBar from '../reactComponents/TykoNavBar';
import Form from 'react-bootstrap/Form';
import {Col, Row} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import React from 'react';
import axios from 'axios';

interface NewProjectResponse {
  id: number
  url: string
}
/**
 * d
 * @constructor
 */
export default function NewProject() {
  const API_URL = '/api/project';


  const submitNewProject = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(API_URL, formProps)
        .then((resp)=>{
          const data = resp.data as NewProjectResponse;
          window.location.href=data.url;
        })
        .catch(console.error);
  };

  const projectStatusOptions = (
    <>
      <option value='Complete'>Complete</option>
      <option value='No Work Done'>No Work Done</option>
      <option value='In Progress'>In Progress</option>
    </>
  );
  return (
    <div>
      <h1>New Project</h1>
      <Form onSubmit={submitNewProject}>
        <Form.Group>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Title</Form.Label>
            </Col>
            <Col>
              <Form.Control name="title" required/>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Project Code</Form.Label>
            </Col>
            <Col>
              <Form.Control name="project_code"/>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Project Status</Form.Label>
            </Col>
            <Col>
              <Form.Select name="status">
                {projectStatusOptions}
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={2}>
              <Form.Label>Current Location</Form.Label>
            </Col>
            <Col>
              <Form.Control name="current_location"/>
            </Col>
          </Row>
        </Form.Group>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
