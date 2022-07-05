import Table from 'react-bootstrap/Table';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {LoadingIndeterminate} from '../reactComponents/Common';
interface ICollection {
      collection_id: number,
      collection_name: string,
      department: string,
}
interface IApi {
  collections: ICollection[]
}
/**
 * c
 * @constructor
 */
export default function Collections() {
  const [data, setData] = useState<ICollection[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      setData(
          ((
              await axios.get('/api/collection')
          ).data as IApi).collections);
    };
    fetchData()
        .then(()=>{
          setLoading(false);
        })
        .catch(console.error);
  }, []);
  let rows;
  if (!data) {
    if (loading) {
      rows = <tr><td><LoadingIndeterminate/></td><td></td></tr>;
    } else {
      rows = <tr><td>failed</td></tr>;
    }
  } else {
    rows = data.map((collection) => {
      const linkURL = `/collection/${collection.collection_id}`;
      return <tr key={collection.collection_id}>
        <td><Link to={linkURL}>{collection.collection_name}</Link></td>
        <td>{collection.department ? collection.department : '-'}</td>
      </tr>;
    });
  }
  return (
    <div>
      <h1>Collections</h1>
      <Table variant='striped'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    </div>
  );
}

