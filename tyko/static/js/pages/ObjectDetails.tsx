import {ButtonGroup, Col, Container, Form, Row} from 'react-bootstrap';
import Panel from '../reactComponents/Panel';
import React, {FC, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';
import {EditableField} from '../reactComponents/ItemApp';
import Table from 'react-bootstrap/Table';
import {NewItemButton} from '../reactComponents/Items';
import {LoadingIndeterminate} from '../reactComponents/Common';

interface IItem {
  format: {
    id: number,
    name: string
  }
  item_id: number
  name: string
  routes: {
    api: string
    frontend: string
  }
}

interface IObjectApi {
  barcode: string,
  collection_id: number,
  contact: string,
  items: IItem[]
  name: string,
  notes: any[],
  object_id: number,
  originals_rec_date: string,
  originals_return_date: string,
  parent_project_id: number,
  routes: {
    api: string,
    frontend: string
  }
}

interface IDetails {
  apiData: IObjectApi
  apiUrl: string
  onUpdated: ()=>void

}

const updateData = async (url: string, key: string, value: string) => {
  const data: {[key: string]: string} = {};
  data[key] = value;
  return axios.put(url, data);
};


const ObjectItems: FC<IDetails> = (
    {apiData, apiUrl, onUpdated},
) => {
  const handleNewItemSubmitted = (event: React.SyntheticEvent)=>{
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(apiUrl, formProps)
        .then(()=>{
          if (onUpdated) {
            onUpdated();
          }
        })
        .catch(console.error);
  };


  const rows = apiData.items.map((item, index) =>{
    return <tr key={index}>
      <td><Link to={item.routes.frontend}>{item.name}</Link></td>
      <td>{item.format.name}</td>
      <td><pre>TO DO: make editable</pre></td>
    </tr>;
  });
  const table = <Table>
    <thead>
      <tr>
        <td>Name</td>
        <td>Format</td>
        <td/>
      </tr>
    </thead>
    <tbody>
      {rows}
    </tbody>
  </Table>;

  return (
    <>
      {table}
      <ButtonGroup className={'float-end'}>
        <NewItemButton onAccepted={handleNewItemSubmitted}/>
      </ButtonGroup>
    </>
  );
};
const ObjectDetailsDetails: FC<IDetails> = (
    {apiData, apiUrl, onUpdated},
) =>{
  // to do: finish ObjectDetailsDetails
  return (
    <Form.Group className="mb-3 row">
      <Row>
        <Col sm={2}>
          <Form.Label>Name</Form.Label>
        </Col>
        <Col>
          <EditableField
            display={apiData.name}
            onSubmit={(value)=> {
              updateData(apiUrl, 'name', value)
                  .then(()=> onUpdated())
                  .catch(console.error);
            }}
          />
        </Col>
      </Row>
    </Form.Group>
  );
};

/**
 * d
 * @constructor
 */
export default function ObjectDetails() {
  const {projectId} = useParams<string>();
  const {objectId} = useParams<string>();
  const [apiData, setApiData] = useState<IObjectApi | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (url: string) => {
    setApiData(((await axios.get(url)).data as IObjectApi));
  };

  const newItemApiUrl = (projectId && objectId) ?
      `/api/project/${projectId}/object/${objectId}/item`: '';

  const apiUrl = (projectId && objectId) ?
    `/api/project/${projectId}/object/${objectId}` : '';

  useEffect(()=>{
    if (!loading) {
      if (projectId && !apiData) {
        setLoading(true);
        fetchData(apiUrl).then(()=>setLoading(false)).catch(console.log);
      }
    }
  }, [loading, apiData, projectId]);

  let detailsPanel;
  let notesPanel;
  let itemsPanel;
  if (!apiData) {
    detailsPanel = <LoadingIndeterminate/>;
    itemsPanel = <LoadingIndeterminate/>;
    notesPanel = <LoadingIndeterminate/>;
  } else {
    detailsPanel = <ObjectDetailsDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    itemsPanel = <ObjectItems
      apiData={apiData}
      apiUrl={newItemApiUrl}
      onUpdated={()=>setApiData(null)}/>;
    notesPanel = <h1>TO DO</h1>;
  }
  return (
    <div>
      <Container fluid={true}>
        <h1>Object</h1>
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
              <Panel title="Items">
                {itemsPanel}
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
