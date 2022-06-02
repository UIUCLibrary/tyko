import React from 'react';
import axios from 'axios';

export const AboutHeader = ()=> {
  return (
    <div data-testid='header'>
      <h1 className="mt-5">About Tyko</h1>
      <p>For tracking av projects</p>
    </div>
  );
};

function AboutComponent({tykoVersion, extraData}) {
  const extraRows = extraData.map((item)=> {
    return (
      <dl className="row">
        <dt className="col-sm-3">{item.label}</dt>
        <dd className="col-sm-9">{item.data}</dd>
      </dl>
    );
  });
  return (
    <div>
      <AboutHeader/>
      <h2 className="mt-5">Tyko Details</h2>
      <dl className="row">
        <dt className="col-sm-3">Version</dt>
        <dd className="col-sm-9">{tykoVersion}</dd>
      </dl>
      {extraRows}
    </div>
  );
}

function LoadingComponent() {
  return (
    <div>
      <AboutHeader/>
      <div>Loading...</div>
    </div>
  );
}
function useApplicationDataApi(url) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{
    setLoading(true);
    const fetchData = async () =>{
      const dataValue = (await axios.get(url)).data;
      setData(dataValue);
      setLoading(false);
    };
    fetchData()
        .then(()=>setLoading(false))
        .catch((e)=> {
          setError(e);
        });
  }, []);
  return [data, error, loading];
}

export default function AboutApp(props) {
  const [data, error, loading] = useApplicationDataApi(props.apiUrl);

  if (loading) {
    return (<LoadingComponent/>);
  }
  if (error) {
    return (<p>'failed'</p>);
  }
  if (data === null) {
    return null;
  }
  const tykoVersion = data['version'];
  const serverColor = data['server_color'] ? data['server_color'] : null;
  const extraData = [];
  if (serverColor) {
    extraData.push(
        {
          label: 'Server Environment',
          data: serverColor,
        },
    );
  }
  return (<AboutComponent tykoVersion={tykoVersion} extraData={extraData}/>);
}
