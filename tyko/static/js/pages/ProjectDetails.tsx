import Panel from '../reactComponents/Panel';
import {Link, useParams} from 'react-router-dom';
import TykoNavBar from '../reactComponents/TykoNavBar';
import {Col, Container, Form, Row} from 'react-bootstrap';
import React, {useEffect, useState, FC} from 'react';
import {EditableField} from '../reactComponents/ItemApp';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

const updateData = async (url: string, key: string, value: string) => {
  const data: {[key: string]: string} = {};
  data[key] = value;
  return axios.put(url, data);
};


interface IObject {
  barcode: string|null
  collection_id: number
  // "contact": null,
  // "items": [
  //   {
  //     "format": {
  //       "id": 6,
  //       "name": "film"
  //     },
  //     "item_id": 1,
  //     "name": "l;lkl"
  //   }
  // ],
  name: string
  // "notes": [],
  // "object_id": 1,
  // "originals_rec_date": null,
  // "originals_return_date": null,
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
// interface IProjectDetails {
//   projectId: number
// }

interface IProjectDetails {
  apiData: IProjectApi
  apiUrl: string
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

const ProjectObjects: FC<IProjectDetails> = (
    {apiData, apiUrl, onUpdated},
) =>{
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
    {table}
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
  const fetchData = async (url: string) => {
    setApiData(((await axios.get(url)).data as IProjectApi));
  };

  const apiUrl = projectId? `/api/project/${projectId}` : '';

  useEffect(()=>{
    if (!loading) {
      if (projectId && !apiData) {
        setLoading(true);
        fetchData(apiUrl).then(()=>setLoading(false)).catch(console.log);
      }
    }
  }, [loading, apiData, projectId]);

  let detailsPanel;
  let objectsPanel;
  let notesPanel;
  if (!apiData) {
    detailsPanel = <h1>Loading...</h1>;
    objectsPanel = <h1>Loading...</h1>;
    notesPanel = <h1>Loading...</h1>;
  } else {
    detailsPanel = <ProjectDetailDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    objectsPanel = <ProjectObjects
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    notesPanel = <>do stuff here</>;
  }
  return (
    <div>
      <TykoNavBar/>
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
    </div>
  );
}

