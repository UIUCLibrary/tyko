import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {AboutComponent, LoadingComponent} from './aboutts';

/**
 * Hook for getting application data from api
 * @param {url} url for api
 * @return {unknown[]}
 */
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
useApplicationDataApi.propTypes = {
  url: PropTypes.string.isRequired,
};
/**
 * About tyko information
 * @param {apiUrl} url for api
 * @return {JSX.Element|null}
 * @constructor
 */
export default function AboutApp({apiUrl}) {
  const [data, error, loading] = useApplicationDataApi(apiUrl);

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
AboutApp.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};
