import {ButtonGroup, Col, Container, Row} from 'react-bootstrap';
import Panel from '../reactComponents/Panel';
import React, {
  FC,
  useEffect,
  useState,
} from 'react';
import {Link, useParams} from 'react-router-dom';
import axios, {AxiosError} from 'axios';
import Table from 'react-bootstrap/Table';
import {NewItemButton} from '../reactComponents/Items';
import {LoadingIndeterminate} from '../reactComponents/Common';

import {
  ObjectDetails as ObjectDetailsDetails,
} from '../reactComponents/ObjectDetails';

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
  onError? : (error: Error| AxiosError)=>void
}

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
// const ObjectDetailsDetails: FC<IDetails2> = (
//     {
//       name,
//       collectionId,
//       originalsReceivedDate,
//       originalsReturnedDate,
//       apiUrl,
//       onUpdated,
//       onError,
//     },
// ) =>{
//   const [loading, setLoading] = useState(false);
//   const [accessible, setAccessible] = useState(true);
//   const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
//   const [
//     collectionData,
//     setCollectionData,
//   ] = useState<ICollectionAPI[] | null>(null);
//
//   const form = useRef<HTMLFormElement>(null);
//   const fetchCollections = async (url: string) =>{
//     return (
//         (await axios.get(url)).data as {collections: ICollectionAPI[]}
//     ).collections;
//   };
//   const handleConfirm = ()=>{
//     if (form.current) {
//       submitEvent(form.current);
//     }
//   };
//   useEffect(()=> {
//     if (!loading) {
//       if (!collectionData) {
//         setLoading(true);
//         fetchCollections('/api/collection').then(
//             (data) => {
//               setCollectionData(data);
//             },
//         ).catch(console.log).finally(
//             ()=> {
//               setLoading(false);
//             },
//         );
//       }
//     }
//   }, [collectionData, loading]);
//   if (loading || !collectionData) {
//     return <LoadingIndeterminate
//       message='Loading collection data'
//     />;
//   }
//   const handleSubmit = (event: FormEvent)=>{
//     event.preventDefault();
//     if (apiUrl) {
//       setAccessible(false);
//       submitFormUpdates(
//           apiUrl,
//           new FormData(event.target as HTMLFormElement),
//       )
//           .then(()=>{
//             if (onUpdated) {
//               onUpdated();
//             }
//           })
//           .catch(onError?onError:console.error)
//           .finally(()=> {
//             setEditMode();
//             setAccessible(true);
//           });
//     }
//   };
//   // to do: finish ObjectDetailsDetails
//   let currentCollection: ICollectionAPI = {
//     collection_name: '',
//     collection_id: null,
//   };
//   const collectionOptions = collectionData.map((collection)=>{
//     return (
//       <option
//         key={collection.collection_id}
//         value={collection.collection_id ? collection.collection_id: ''}
//       >
//         {collection.collection_name}
//       </option>
//     );
//   });
//   for (const collection of collectionData) {
//     if (collection.collection_id === null) {
//       continue;
//     }
//     if (collection.collection_id === collectionId) {
//       currentCollection = collection;
//       break;
//     }
//   }
//   return (
//     <>
//       <Form ref={form} onSubmit={handleSubmit}>
//         <EditSwitchFormField
//           label='Name'
//           editMode={editMode}
//           display={name}>
//           <Form.Control
//             name='name'
//             defaultValue={name}
//           />
//         </EditSwitchFormField>
//         <EditSwitchFormField
//           label='Collection'
//           editMode={editMode}
//           display={currentCollection.collection_name}>
//           <Form.Select
//             name='collection_id'
//             defaultValue={
//               currentCollection.collection_id ?
//                   currentCollection.collection_id :
//                   ''
//             }>
//             <option key={-1} value=''/>
//             {collectionOptions}
//           </Form.Select>
//         </EditSwitchFormField>
//         <EditSwitchFormField
//           label='Originals Received Date'
//           editMode={editMode}
//           display={originalsReceivedDate}>
//           <SelectDate
//             name='originals_rec_date'
//             dateFormat='m/dd/yyyy'
//             defaultValue={originalsReceivedDate}
//           />
//         </EditSwitchFormField>
//         <EditSwitchFormField
//           label='Originals Returned Date'
//           editMode={editMode}
//           display={originalsReturnedDate}>
//           <SelectDate
//             name='originals_return_date'
//             dateFormat='m/dd/yyyy'
//             defaultValue={originalsReturnedDate}
//           />
//         </EditSwitchFormField>
//         <EditControl
//           editMode={editMode}
//           setEditMode={setEditMode}
//           onConfirm={handleConfirm}
//         />
//       </Form>
//     </>
//   );
// };

/**
 * d
 * @constructor
 */
export default function ObjectDetails() {
  const {projectId} = useParams<string>();
  const {objectId} = useParams<string>();
  const [apiData, setApiData] = useState<IObjectApi | null>(null);
  // const [
  //   collectionData,
  //   setCollectionData,
  // ] = useState<ICollectionAPI[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchApiData = async (url: string) => {
    setApiData(((await axios.get(url)).data as IObjectApi));
  };
  const newItemApiUrl = (projectId && objectId) ?
      `/api/project/${projectId}/object/${objectId}/item`: '';

  const apiUrl = (projectId && objectId) ?
    `/api/project/${projectId}/object/${objectId}` : '';
  const updateObjectUrl = objectId ? `/api/object/${objectId}` : '';
  useEffect(()=>{
    if (!loading) {
      if (projectId && !apiData) {
        setLoading(true);
        fetchApiData(apiUrl).then(()=>setLoading(false)).catch(console.log);
      }
    }
  }, [loading, apiData, projectId, apiUrl]);
  if (loading) {
    return <LoadingIndeterminate/>;
  }
  let detailsPanel;
  let notesPanel;
  let itemsPanel;
  if (!apiData) {
    detailsPanel = <LoadingIndeterminate/>;
    itemsPanel = <LoadingIndeterminate/>;
    notesPanel = <LoadingIndeterminate/>;
  } else {
    detailsPanel = <ObjectDetailsDetails
      name={apiData.name}
      collectionId={apiData.collection_id}
      originalsReceivedDate={apiData.originals_rec_date}
      originalsReturnedDate={apiData.originals_return_date}
      apiUrl={updateObjectUrl}
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

