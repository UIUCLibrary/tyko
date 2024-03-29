import {useParams} from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Col, Form, Row} from 'react-bootstrap';
import {LoadingIndeterminate} from '../reactComponents/Common';
interface ICollection{
  collection_id: number
  collection_name: string
  contact?: string
  department?: string
  record_series?: string
  contact_id?: number
}
interface APIData {
  collection: ICollection
}
/**
 * @constructor
 */
export default function CollectionDetails() {
  const {collectionId} = useParams<string>();
  const [data, setData] = useState<ICollection|null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    const fetchData = async (url: string) => {
      setData(((await axios.get(url)).data as APIData).collection);
    };
    if (collectionId) {
      fetchData(`/api/collection/${collectionId}`)
          .then()
          .catch(console.log)
          .finally(()=>setLoading(false));
    }
  }, [collectionId]);
  let content;
  if (loading) {
    content = <LoadingIndeterminate/>;
  } else {
    if (!data) {
      content = <div></div>;
    } else {
      content = (
        <Form>
          <Form.Group>
            <Row>
              <Col sm={2}>
                <Form.Label>Name</Form.Label>
              </Col>
              <Col>
                <Form.Control
                  defaultValue={data.collection_name}
                  readOnly={true}/>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row>
              <Col sm={2}>
                <Form.Label>Department</Form.Label>
              </Col>
              <Col>
                <Form.Control defaultValue={data.department} readOnly={true}/>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row>
              <Col sm={2}>
                <Form.Label>Contact</Form.Label>
              </Col>
              <Col>
                <Form.Control defaultValue={data.contact} readOnly={true}/>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row>
              <Col sm={2}>
                <Form.Label>Record Series</Form.Label>
              </Col>
              <Col>
                <Form.Control defaultValue={data.record_series}
                  readOnly={true}/>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      );
    }
  }
  return (
    <div>
      <h1>Collection Details</h1>
      <div className="mb-3">
        <Card>
          {content}
        </Card>
      </div>
    </div>
  );
}
