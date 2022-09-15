import {LoadingIndeterminate} from '../reactComponents/Common';
import Panel from '../reactComponents/Panel';
import {useParams} from 'react-router-dom';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import React, {useEffect, useState, FC} from 'react';
import axios from 'axios';
import {
  ProjectDetailDetails,
  IProjectApi,
  ProjectObjects,
} from '../reactComponents/ProjectDetails';

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
