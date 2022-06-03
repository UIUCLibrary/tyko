import {FunctionComponent, FC, useState, useEffect} from 'react';
import axios from 'axios';

const AboutHeader: FunctionComponent = ()=> {
  return (
    <div data-testid='header'>
      <h1 className="mt-5">About Tyko</h1>
      <p>For tracking av projects</p>
    </div>
  );
};


/**
 * Format tyko version information
 * @param {tykoVersion} version running
 * @param {extraData} additional data about configuration
 * @return {JSX.Element}
 * @constructor
 */
interface ExtraData{
    label: string
    data: string
}
interface AboutComponentProps {
    tykoVersion: string
    extraData: ExtraData[]
}
const AboutComponent: FC<AboutComponentProps> = (
    {extraData, tykoVersion},
) =>{
  const extraRows = extraData.map((item: ExtraData)=> {
    return (
      <dl key={item.label} className="row">
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
};

const LoadingComponent: FC = ()=> {
  return (
    <div>
      <AboutHeader/>
      <div>Loading...</div>
    </div>
  );
};

interface ApiData {
    version: string
    [key: string]: string
}

/**
 * Hook for getting application data from api
 * @param {url} url for api
 * @return {unknown[]}
 */
const useApplicationDataApi = (url: string) => {
  const [data, setData] = useState<ApiData|null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{
    setLoading(true);
    const fetchData = async () =>{
      const dataValue: ApiData = (await axios.get(url)).data;
      setData(dataValue);
      setLoading(false);
    };
    fetchData()
        .then(()=>setLoading(false))
        .catch((e)=> {
          setError(e);
        });
  }, [url]);
  return [data, error, loading];
};


/**
 * About tyko information
 * @param {apiUrl} url for api
 * @return {JSX.Element|null}
 * @constructor
 */
export default function AboutApp({apiUrl}: { apiUrl: string }) {
  const [data, error, loading] = useApplicationDataApi(apiUrl) as [
      data: ApiData,
      error: undefined,
      loading: boolean];

  if (loading) {
    return (<LoadingComponent/>);
  }
  if (error) {
    return (<p>Failed</p>);
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
