import TykoNavBar from '../reactComponents/TykoNavBar';
import React, {useEffect, useState} from 'react';
import {Col, Container, Form, Row} from 'react-bootstrap';
import Panel from '../reactComponents/Panel';
import {
  ItemDetails as ItemDetailsDetails,
  IItemMetadata,
} from '../reactComponents/ItemApp';
import FormatDetails from '../reactComponents/FormatDetails';
import {useParams} from 'react-router-dom';
import axios from 'axios';
interface IApiData {
  files: any[]
}
/**
 * d
 * @constructor
 */
export default function ItemDetails() {
  const {projectId} = useParams<string>();
  const {objectId} = useParams<string>();
  const {itemId} = useParams<string>();

  const [apiData, setApiData] = useState<IItemMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (url: string) => {
    setApiData(((await axios.get(url)).data as IItemMetadata));
  };

  const apiUrl = (projectId && objectId && itemId) ?
    `/api/project/${projectId}/object/${objectId}/item?item_id=${itemId}` : '';

  useEffect(()=>{
    if (!loading) {
      if (projectId && !apiData) {
        setLoading(true);
        fetchData(apiUrl).then(()=>setLoading(false)).catch(console.log);
      }
    }
  }, [loading, apiData, projectId]);

  let detailsPanel;
  let formatDetailsPanel;
  let filesPanel;
  let notesPanel;
  if (!apiData) {
    detailsPanel = <h1>Loading...</h1>;
    formatDetailsPanel = <h1>Loading...</h1>;
    filesPanel = <h1>Loading...</h1>;
    notesPanel = <h1>Loading...</h1>;
  } else {
    detailsPanel = <ItemDetailsDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    formatDetailsPanel = <FormatDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(null)}/>;
    filesPanel = <>do stuff here</>;
    notesPanel = <>do stuff here</>;
  }
  return (
    <div>
      <TykoNavBar/>
      <Container fluid={true}>
        <h1>Items</h1>
        <Row>
          <Col md={{span: 6}}>
            <Row>
              <Panel title="Details">
                {detailsPanel}
              </Panel>
              <Panel title="Format Details">
                {formatDetailsPanel}
              </Panel>
            </Row>
          </Col>
          <Col md={{span: 6}}>
            <Row>
              <Panel title="Files">
                {filesPanel}
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
