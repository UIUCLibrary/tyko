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
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {SelectDate} from '../reactComponents/Items';
import {
  ProjectDetailDetails,
  IProjectApi,
} from '../reactComponents/ProjectDetails';

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
          <Form.Label
            htmlFor='projectName'
            className="col-sm-2 col-form-label"
          >
            Name
          </Form.Label>
          <Form.Group className="col-sm-10">
            <Form.Control id='projectName' name="name" required/>
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


interface IProjectObjectDetails {
  apiData: IProjectApi
  submitUrl: string
  onUpdated: ()=>void
}

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

