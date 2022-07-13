import {Link} from 'react-router-dom';
import Panel from '../reactComponents/Panel';
/**
 * k
 * @constructor
 */
export default function More() {
  return <div>
    <h1>More</h1>
    <Panel title="Entities">
      <ul>
        <li><Link to="/collections">Collections</Link></li>
        <li><Link to="/formats">Formats</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/vendors">Vendors</Link></li>
      </ul>
    </Panel>
    <Panel title="Forms">
      <ul>
        <li><Link to="/collection/new">New Collection</Link></li>
      </ul>
    </Panel>
  </div>;
}
