import React, {
  FC,
  FormEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import axios, {AxiosError} from 'axios';
import {
  EditControl,
  EditSwitchFormField,
  LoadingIndeterminate,
  submitEvent,
  submitFormUpdates,
} from './Common';
import {Form} from 'react-bootstrap';
import {SelectDate} from './Items';
interface IDetails2 {
  name: string
  collectionId: number
  originalsReceivedDate?: string
  originalsReturnedDate?: string
  apiUrl: string
  onUpdated: ()=>void
  onError? : (error: Error| AxiosError)=>void
}

interface ICollectionAPI {
  collection_id: number | null,
  collection_name: string
}

export const ObjectDetails: FC<IDetails2> = (
    {
      name,
      collectionId,
      originalsReceivedDate,
      originalsReturnedDate,
      apiUrl,
      onUpdated,
      onError,
    },
) =>{
  const [loading, setLoading] = useState(false);
  const [accessible, setAccessible] = useState(true);
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const [
    collectionData,
    setCollectionData,
  ] = useState<ICollectionAPI[] | null>(null);

  const form = useRef<HTMLFormElement>(null);
  const fetchCollections = async (url: string) =>{
    return (
        (await axios.get(url)).data as {collections: ICollectionAPI[]}
    ).collections;
  };
  const handleConfirm = ()=>{
    if (form.current) {
      submitEvent(form.current);
    }
  };
  useEffect(()=> {
    if (!loading) {
      if (!collectionData) {
        setLoading(true);
        fetchCollections('/api/collection').then(
            (data) => {
              setCollectionData(data);
            },
        ).catch(console.log).finally(
            ()=> {
              setLoading(false);
            },
        );
      }
    }
  }, [collectionData, loading]);
  if (loading || !collectionData) {
    return <LoadingIndeterminate
      message='Loading collection data'
    />;
  }
  const handleSubmit = (event: FormEvent)=>{
    event.preventDefault();
    if (apiUrl) {
      setAccessible(false);
      submitFormUpdates(
          apiUrl,
          new FormData(event.target as HTMLFormElement),
      )
          .then(()=>{
            if (onUpdated) {
              onUpdated();
            }
          })
          .catch(onError?onError:console.error)
          .finally(()=> {
            setEditMode();
            setAccessible(true);
          });
    }
  };
  // to do: finish ObjectDetailsDetails
  let currentCollection: ICollectionAPI = {
    collection_name: '',
    collection_id: null,
  };
  const collectionOptions = collectionData.map((collection)=>{
    return (
      <option
        key={collection.collection_id}
        value={collection.collection_id ? collection.collection_id: ''}
      >
        {collection.collection_name}
      </option>
    );
  });
  for (const collection of collectionData) {
    if (collection.collection_id === null) {
      continue;
    }
    if (collection.collection_id === collectionId) {
      currentCollection = collection;
      break;
    }
  }
  return (
    <>
      <Form ref={form} onSubmit={handleSubmit}>
        <EditSwitchFormField
          label='Name'
          editMode={editMode}
          display={name}>
          <Form.Control
            name='name'
            defaultValue={name}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Collection'
          editMode={editMode}
          display={currentCollection.collection_name}>
          <Form.Select
            name='collection_id'
            defaultValue={
              currentCollection.collection_id ?
                  currentCollection.collection_id :
                  ''
            }>
            <option key={-1} value=''/>
            {collectionOptions}
          </Form.Select>
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Originals Received Date'
          editMode={editMode}
          display={originalsReceivedDate}>
          <SelectDate
            name='originals_rec_date'
            dateFormat='m/dd/yyyy'
            defaultValue={originalsReceivedDate}
          />
        </EditSwitchFormField>
        <EditSwitchFormField
          label='Originals Returned Date'
          editMode={editMode}
          display={originalsReturnedDate}>
          <SelectDate
            name='originals_return_date'
            dateFormat='m/dd/yyyy'
            defaultValue={originalsReturnedDate}
          />
        </EditSwitchFormField>
        <EditControl
          editMode={editMode}
          setEditMode={setEditMode}
          onConfirm={handleConfirm}
        />
      </Form>
    </>
  );
};
