import Table from 'react-bootstrap/Table';
import {Link} from 'react-router-dom';

const dummyVendorData = [
  {
    name: 'Vendor 1',
  },
  {
    name: 'Vendor 2',
  },
  {
    name: 'One fish Vendor',
  },
  {
    name: 'Two fish Vendor',
  },
  {
    name: 'red fish Vendor',
  },
  {
    name: 'blue fish Vendor',
  },
];

/**
 * List of vendors
 * @constructor
 */
export default function Vendors() {
  const data = dummyVendorData;
  const rows = data.map((vendor, index)=>{
    return (
      <tr key={index}>
        <td><Link to='#'>{vendor.name}</Link></td>
      </tr>
    );
  });
  return (
    <>
      <h1>Vendors</h1>
      <Table variant='striped'>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    </>
  );
}
