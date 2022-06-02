import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';

function FormatDetailsDisplay({children}) {
  return (
    <div>
      {children}
    </div>
  );
}
FormatDetailsDisplay.propTypes = {
  children: PropTypes.node.isRequired,
};


function FormatDetail({value, label}) {
  return (
    <tr>
      <th scope="row" width="16.66%">{label}</th>
      <td>
        <div className="container-sm">
          {value ? <p>{value.toString()}</p>: null}
        </div>
      </td>
    </tr>
  );
}
FormatDetail.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};


function useFormatDetailsApi(url) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{
    setLoading(true);
    const fetchData = async () =>{
      const dataValue = (await axios.get(url)).data;
      const elements = [];
      const formatDetails = dataValue.item['format_details'];
      Object.keys(formatDetails).forEach((objectKey) => {
        elements.push({
          key: objectKey,
          value: formatDetails[objectKey],
        });
      });
      setData(elements);
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

export default function FormatDetails({apiUrl}) {
  const [data, error, loading] = useFormatDetailsApi(apiUrl);
  if (loading) {
    return (<p>Loading...</p>);
  }
  if (error) {
    return (<p>Failed</p>);
  }
  if (data === null) {
    return null;
  }
  const values = data.map(((item, index) => {
    const value = item.value ? item.value : '';
    return (
      <FormatDetail key={index.toString()} label={item.key} value={value}/>
    );
  }));
  return (
    <FormatDetailsDisplay>
      <table className="table table-sm" data-testid='dummy'>
        <tbody>
          {values}
        </tbody>
      </table>
    </FormatDetailsDisplay>
  );
}
FormatDetails.propTypes = {
  apiUrl: PropTypes.string.isRequired,
};

