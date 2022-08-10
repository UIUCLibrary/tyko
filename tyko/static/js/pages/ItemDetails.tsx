import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap';
import Panel, {InactiveCover} from '../reactComponents/Panel';
import {
  IItemMetadata, ItemDetails as ItemDetailsComponent,
} from '../reactComponents/ItemApp';
import FormatDetails from '../reactComponents/FormatDetails';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {LoadingIndeterminate} from '../reactComponents/Common';
import {VendorDataEdit} from '../reactComponents/Vendor';
import {Treatment} from '../reactComponents/Treatment';
/**
 * Item details
 * @constructor
 */
export default function ItemDetails() {
  const {projectId} = useParams<string>();
  const {objectId} = useParams<string>();
  const {itemId} = useParams<string>();

  const [apiData, setApiData] = useState<IItemMetadata | undefined>(undefined);
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
    detailsPanel = <ItemDetailsComponent
      objectName={apiData.name}
      formatName={apiData.format.name}
      barcode={apiData.barcode ? apiData.barcode: undefined}
      objectSequence={apiData.obj_sequence}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(undefined)}
    />;
    formatDetailsPanel = <FormatDetails
      apiData={apiData}
      apiUrl={apiUrl}
      onUpdated={()=>setApiData(undefined)}/>;
    filesPanel = <>do stuff here</>;
    notesPanel = <>do stuff here</>;
  }
  const vendorInfo = apiData?.vendor ?
      apiData.vendor :
      {
        'vendor_name': null,
        'deliverable_received_date': null,
        'originals_received_date': null,
      };
  const vendorPanel = <VendorDataEdit
    vendorName={
      vendorInfo['vendor_name'] ?
          vendorInfo['vendor_name'] : undefined
    }
    deliverableReceivedDate={
      vendorInfo['deliverable_received_date'] ?
          vendorInfo['deliverable_received_date'] : undefined
    }
    originalsReceivedDate={
      vendorInfo['originals_received_date'] ?
          vendorInfo['originals_received_date'] : undefined
    }
    apiUrl={apiUrl}
    onAccessibleChange={setBusy}
    onUpdated={()=> {
      setBusy(false);
      setApiData(undefined);
    }}
  />;
  const blocker = busy ?
      (
        <InactiveCover><LoadingIndeterminate/></InactiveCover>
      ) :
      <></>;
  const treatmentUrl = (itemId && projectId && objectId) ? (
`/api/project/${projectId}/object/${objectId}/itemTreatment?item_id=${itemId}`
  ) : '';
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
              {vendorPanel}
            </Panel>
          </Row>
        </Col>
        <Col md={{span: 6}}>
          <Row>
            <Panel title='Treatment'>
              {blocker}
              <Treatment
                apiUrl={treatmentUrl}
                apiData={apiData}
                onAccessibleChange={setBusy}
                onUpdated={()=>{
                  setApiData(undefined);
                }}
              />
            </Panel>
          </Row>
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
