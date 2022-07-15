import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap';
import Panel, {InactiveCover} from '../reactComponents/Panel';
import {
  ItemDetails as ItemDetailsDetails,
  IItemMetadata,
} from '../reactComponents/ItemApp';
import FormatDetails from '../reactComponents/FormatDetails';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {LoadingIndeterminate} from '../reactComponents/Common';
import {IVendorJobData, VendorDataEdit} from '../reactComponents/Vendor';
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
  const [busy, setBusy] = useState(false);

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
  }, [loading, apiData, projectId, apiUrl]);

  let detailsPanel;
  let formatDetailsPanel;
  let filesPanel;
  let notesPanel;
  if (!apiData) {
    detailsPanel = <>
      <div style={{textAlign: 'center'}}>
        <LoadingIndeterminate/>
      </div>
    </>;

    formatDetailsPanel = <>
      <div style={{textAlign: 'center'}}>
        <LoadingIndeterminate/>
      </div>
    </>;

    filesPanel = <>
      <div style={{textAlign: 'center'}}>
        <LoadingIndeterminate/>
      </div>
    </>;

    notesPanel = <>
      <div style={{textAlign: 'center'}}>
        <LoadingIndeterminate/>
      </div>
    </>;
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

  const vendorData: IVendorJobData = {
    vendorName: 'foo',
    deliverableReceivedDate: '12/11/2009',
    originalsReceivedDate: '12/12/2009',
  };
  const handleBusy = (isBusy: boolean) =>{
    setBusy(isBusy);
    if (isBusy) {
      console.log('yup');
    } else {
      console.log('nope');
    }
  };
  const blocker = busy ?
      (
        <InactiveCover><LoadingIndeterminate/></InactiveCover>
      ) :
      <></>;
  return (
    <div>
      <h1>Item Details</h1>
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
          <Row>
            <Panel title='Vendor'>
              {blocker}
              <VendorDataEdit
                vendorName={vendorData.vendorName}
                deliverableReceivedDate={vendorData.deliverableReceivedDate}
                originalsReceivedDate={vendorData.originalsReceivedDate}
                apiUrl={apiUrl}
                onAccessibleChange={handleBusy}
              />
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
    </div>
  );
}
