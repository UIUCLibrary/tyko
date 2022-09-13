import {LoadingIndeterminate} from '../reactComponents/Common';
import Panel from '../reactComponents/Panel';
import {useParams} from 'react-router-dom';
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
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {
  ProjectDetailDetails,
  IProjectApi,
  ProjectObjects,
} from '../reactComponents/ProjectDetails';
import {SelectDate} from '../reactComponents/Items';

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
            <Form.Select name="collection_id" defaultValue="" required>
              <option value="" disabled>Select a collection
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
  let notesPanel;
  if (!apiData) {
    detailsPanel = <LoadingIndeterminate/>;
    notesPanel = <LoadingIndeterminate/>;
  } else {
    detailsPanel = <ProjectDetailDetails
      apiData={apiData}
      apiUrl={apiUrl}
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
                <ObjectPanel
                  apiData={apiData}
                  submitNewObjectUrl={submitNewObjectUrl}
                  onUpdated={()=>setApiData(null)}
                />
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

interface ObjectPanelProps {
  apiData: IProjectApi| undefined | null,
  submitNewObjectUrl: string,
  onUpdated: ()=>void
}

const ObjectPanel: FC<ObjectPanelProps> = ({
  apiData,
  submitNewObjectUrl,
  onUpdated,
}) =>{
  const handleRedirect = (url: string) =>{
    document.location.href = url;
  };
  if (!apiData) {
    return (
      <>
        <div style={{textAlign: 'center'}}>
          <LoadingIndeterminate/>
        </div>
      </>
    );
  }
  return <ProjectObjects
    apiData={apiData}
    submitUrl={submitNewObjectUrl}
    onRedirect={handleRedirect}
    onUpdated={onUpdated}/>;
};
