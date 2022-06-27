import TykoNavBar from '../reactComponents/TykoNavBar';
import Panel from '../reactComponents/Panel';
/**
 * k
 * @constructor
 */
export default function More() {
  return <div>
    <TykoNavBar/>
    <h1>More</h1>
    <Panel title="Entities">
      <ul>
        <li><a href="/collections">Collections</a></li>
        <li><a href="/formats">Formats</a></li>
        <li><a href="/projects">Projects</a></li>
      </ul>
    </Panel>
    <Panel title="Forms">
      <ul>
        <li><a href="/collection/new">New Collection</a></li>
      </ul>
    </Panel>
  </div>;
}
