import React from 'react';
import axios from "axios";

const AboutHeader = ()=> {
  return (
    <div>
      <h1 className="mt-5">About Tyko</h1>
      <p>For tracking av projects</p>
    </div>
  );
};


export function AboutApp(props) {
  const [state, setState] = React.useState({
    isLoaded: false,
    error: null,
    metadata: null,
  });
  const changedMetadata = () => {
    axios.get(props.apiUrl)
        .then(
            (result) => {
              setState({
                isLoaded: true,
                metadata: result.data,
              });
            },
            (error) => {
              setState({
                isLoaded: true,
                error: error,
              });
            },
        );
  };
  if (!state.isLoaded) {
    changedMetadata();
    return (
      <div>
        <AboutHeader/>
        <div>Loading...</div>
      </div>
    );
  }
  if (state.error) {
    return (<div>Error</div>);
  }
  const metadata = state.metadata;
  const tykoVersion = metadata['version'];
  const serverColor = metadata['server_color'] ? metadata['server_color']: null;

  let extraData = '';
  if (serverColor) {
    extraData = (
      <dl className="row">
        <dt className="col-sm-3">Server Environment</dt>
        <dd className="col-sm-9">{serverColor}</dd>
      </dl>
    );
  }

  return (
    <div>
      <AboutHeader/>
      <h2 className="mt-5">Tyko Details</h2>
      <dl className="row">
        <dt className="col-sm-3">Version</dt>
        <dd className="col-sm-9">{tykoVersion}</dd>
      </dl>
      {extraData}
    </div>
  );
}
