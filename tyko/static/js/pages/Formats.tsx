import TykoNavBar from '../reactComponents/TykoNavBar';
import Table from 'react-bootstrap/Table';
import {useEffect, useState} from 'react';
import axios from 'axios';
interface IFormat{
  id: number
  name: string
}
/**
 * ddd
 * @constructor
 */
export default function Formats() {
  const [data, setData] = useState<IFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      setData((await axios.get('/api/format')).data as IFormat[]);
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
      rows = <tr><td>Loading</td><td></td></tr>;
    } else {
      rows = <tr><td>failed</td></tr>;
    }
  } else {
    rows = data.map((formatElement) => {
      return <tr key={formatElement.id}>
        <td>{formatElement.name}</td><td>{formatElement.id}</td>
      </tr>;
    });
  }
  return (
    <div>
      <TykoNavBar/>
      <h1>Formats</h1>
      <Table variant='striped'>
        <thead>
          <tr>
            <th>Format Name</th>
            <th>Format Id</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    </div>
  );
}
