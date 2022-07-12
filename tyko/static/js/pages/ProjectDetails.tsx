import {LoadingIndeterminate} from '../reactComponents/Common';
import Panel from '../reactComponents/Panel';
import {Link, useParams} from 'react-router-dom';
import {
  ButtonGroup,
  CloseButton,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import React, {useEffect, useState, FC, useRef} from 'react';
import {EditableField} from '../reactComponents/ItemApp';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {ApiEnum, SelectDate, sortNameAlpha} from '../reactComponents/Items';

const updateData = async (url: string, key: string, value: string) => {
  const data: {[key: string]: string} = {};
  data[key] = value;
  return axios.put(url, data);
};


interface IObject {
  barcode: string|null
  collection_id: number
  name: string
  routes: {
    api: string
    frontend: string
  }
}
interface IProjectApi {
  project: {
    current_location: string,
    notes: any[],
    objects: IObject[],
    project_code: string,
    project_id: number,
    status: string,
    title: string
  }
}

interface ICollection {
        collection_id: number
      collection_name: string
}
interface ICollectionsApi {
  collections: ICollection[];

}

export const NewObjectModal: FC<NewObjectModalProps> = (
    {show, onAccepted, onClosed},
)=>{
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<ICollection[]| null>(null);
  const newItemDialog = useRef(null);
  useEffect(()=>{
    setIsOpen(show);
  },
  [show],
  );
  useEffect(()=>{
    const fetchData = async (url: string) => {
      const data = ((await axios.get(url)).data as ICollectionsApi);
      return data.collections;
    };
    fetchData('/api/collection')
        .then(setCollections)
        .catch(console.error);
  }, []);
  const handleClose = () => {
    setIsOpen(false);
    if (onClosed) {
      onClosed();
    }
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (onAccepted) {
      onAccepted(event);
    }
  };
  let form;
  if (collections) {
    const collectionsOptions = collections.map((collection) =>{
      return (
        <option
          key={collection.collection_id}
          value={collection.collection_id}>
          {collection.collection_name}
        </option>
      );
    });
    form = (
      <>
        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">Name</Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Control name="name" required/>
          </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">
                Collection
          </Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Select name="collection_id" required>
              <option value="" disabled selected>Select a collection
              </option>
              {collectionsOptions}
            </Form.Select>
          </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">
            Barcode
          </Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Control name="objectBarcode"/>
          </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3 row">
          <Form.Label className="col-sm-2 col-form-label">
                Originals Received
          </Form.Label>
          <Form.Group className="col-sm-10">
            <SelectDate
              name='originals_rec_date'
              dateFormat='m/dd/yyyy'
            />
          </Form.Group>
        </Form.Group>
      </>
    );
  } else {
    form = <LoadingIndeterminate/>;
  }
  const modalFooter = collections ? (
    <ButtonGroup>
      <Button variant='danger' onClick={handleClose}>Cancel</Button>
      <Button variant="primary" type="submit">Create</Button>
    </ButtonGroup>
  ) : (
      <ButtonGroup>
        <Button variant='danger' onClick={handleClose}>Cancel</Button>
      </ButtonGroup>
  );
  return (
    <Modal
      data-testid='newObjectModal'
      show={isOpen}
      onHide={handleClose}
      size="lg"
      ref={newItemDialog}>
      <Modal.Header>
        <h5 className="modal-title" id="titleId">New Object</h5>
        <CloseButton
          aria-label="Close"
          onClick={handleClose}
        />
      </Modal.Header>
      <form id="formId" title='newObject' onSubmit={handleSubmit}>
        <Modal.Body>
          {form}
        </Modal.Body>
        <Modal.Footer>{modalFooter}</Modal.Footer>
      </form>
    </Modal>
  );
};

interface IProjectDetails {
  apiData: IProjectApi
  apiUrl: string
  onUpdated: ()=>void
}
interface IProjectObjectDetails {
  apiData: IProjectApi
  submitUrl: string
  onUpdated: ()=>void
}

const ProjectDetailDetails: FC<IProjectDetails> = (
    {apiData, apiUrl, onUpdated},
) => {
  return (
    <Form.Group className="mb-3 row">
      <Row>
        <Col sm={2}>
          <Form.Label>Title</Form.Label>
        </Col>
        <Col>
          <EditableField
            display={apiData.project.title}
            onSubmit={(value)=> {
              updateData(apiUrl, 'title', value)
                  .then(()=> onUpdated())
                  .catch(console.error);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <Form.Label>Project Code</Form.Label>
        </Col>
        <Col>
          <EditableField
            display={apiData.project.project_code}
            onSubmit={(value)=> {
              updateData(apiUrl, 'project_code', value)
                  .then(()=> onUpdated())
                  .catch(console.error);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <Form.Label>Status</Form.Label>
        </Col>
        <Col>
          <EditableField
            display={apiData.project.status}
            onSubmit={(value)=> {
              updateData(apiUrl, 'status', value)
                  .then(()=> onUpdated())
                  .catch(console.error);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <Form.Label>Current Location</Form.Label>
        </Col>
        <Col>
          <EditableField
            display={apiData?.project.current_location}
            onSubmit={(value) => {
              updateData(apiUrl, 'current_location', value)
                  .then(()=> onUpdated())
                  .catch(console.error);
            }}
          />
        </Col>
      </Row>
    </Form.Group>
  );
};

interface NewObjectModalProps{
  show: boolean,
  onAccepted?: (event: React.SyntheticEvent)=>void
  onClosed?: ()=>void
}

const ProjectObjects: FC<IProjectObjectDetails> = (
    {apiData, submitUrl, onUpdated},
) =>{
  const [
    newObjectDialogShown,
    setNewObjectDialogShown,
  ] = useState<boolean>(false);
  const handleCreateObject = () =>{
    setNewObjectDialogShown(true);
  };
  const handleAcceptedNewObject = (event: React.SyntheticEvent) => {
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(submitUrl, formProps)
        .then(()=>{
          setNewObjectDialogShown(false);
          if (onUpdated) {
            onUpdated();
          }
        })
        .catch(console.error);
  };
  const handleClosedNewDialogBox = () => {
    setNewObjectDialogShown(false);
  };
  const rows = apiData.project.objects.map((data, index) => {
    return (
      <tr key={index}>
        <td>
          <Link to={data.routes.frontend}>{data.name}</Link>
          <pre>TO DO: make editable</pre>
        </td>
      </tr>
    );
  });
  const table = <Table>
    <thead>
      <tr>
        <td>Name</td>
      </tr>
    </thead>
    <tbody>
      {rows}
    </tbody>
  </Table>;
  return (<>
    <NewObjectModal
      show={newObjectDialogShown}
      onAccepted={handleAcceptedNewObject}
      onClosed={handleClosedNewDialogBox}
    />
    {table}
    <ButtonGroup className="float-end">
      {<Button onClick={handleCreateObject}>Add</Button>}
    </ButtonGroup>
  </>);
};

/**
 * j
 * @constructor
 */
export default function ProjectDetails() {
  const {projectId} = useParams<string>();
  const [apiData, setApiData] = useState<IProjectApi | null>(null);
  const [loading, setLoading] = useState(false);


  const apiUrl = projectId? `/api/project/${projectId}` : '';
  const submitNewObjectUrl =
      projectId ? `/api/project/${projectId}/object` : '';

  useEffect(()=>{
    const fetchData = async (url: string) => {
      setApiData(((await axios.get(url)).data as IProjectApi));
    };
    if (!loading) {
      if (projectId && !apiData) {
        setLoading(true);
        fetchData(apiUrl).then(()=>setLoading(false)).catch(console.log);
      }
    }
  }, [loading, apiData, projectId, apiUrl]);
  if (loading) {
    return <LoadingIndeterminate/>;
  }
  let detailsPanel;
  let objectsPanel;
  let notesPanel;
  if (!apiData) {
    detailsPanel = <LoadingIndeterminate/>;
    objectsPanel = <LoadingIndeterminate/>;
    notesPanel = <LoadingIndeterminate/>;
  } else {
    detailsPanel = <ProjectDetailDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    objectsPanel = <ProjectObjects
      apiData={apiData}
      submitUrl={submitNewObjectUrl}
      onUpdated={()=>setApiData(null)}/>;
    notesPanel = <>do stuff here</>;
  }
  return (
    <>
      <Container fluid={true}>
        <h1>Project</h1>
        <Row>
          <Col md={{span: 6}}>
            <Row>
              <Panel title="Details">
                {detailsPanel}
              </Panel>
            </Row>
          </Col>
          <Col md={{span: 6}}>
            <Row>
              <Panel title="Objects">
                {objectsPanel}
              </Panel>
            </Row>
            <Row>
              <Panel title="Notes">
                {notesPanel}
              </Panel>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

