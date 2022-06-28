import {useEffect, useState} from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
/**
 * @return {JSXElement} sdsd
 */

interface IProject{
  current_location: string
  notes: any[]
  objects: any[]
  project_code: string
  project_id: number
  status: string
  title: string
}
interface ProjectsReponse {
  projects: IProject[]
  total: number
}


/**
 * d
 * @constructor
 */
export default function Projects() {
  const [data, setData] = useState<IProject[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      setData(
          ((
              await axios.get('/api/project')
          ).data as ProjectsReponse).projects);
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
      rows = <tr>
        <td>Loading</td>
        <td></td>
      </tr>;
    } else {
      rows = <tr>
        <td>failed</td>
      </tr>;
    }
  } else {
    rows = data.map((project: IProject, index) =>{
      const newUrl = `/project/${project.project_id}`;
      return (
        <tr key={index}>
          <td><Link to={newUrl}>{project.title}</Link></td>
          <td>{project.status}</td>
        </tr>
      );
    },
    );
  }
  return <div>
    <h1>Projects</h1>
    <div>
      <Link to="/projects/new">
        <Button>Create</Button>
      </Link>
    </div>
    <Table variant='striped'>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Table>
  </div>;
}
