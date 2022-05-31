import axios from 'axios';
import React from 'react';

export const FormatDetails = (props) => {
  const [state, setState] = React.useState({
    isLoaded: false,
    error: null,
    item: null,
  });
  const changedMetadata = () => {
    axios.get(props.apiUrl)
        .then(
            (result) => {
              setState({
                isLoaded: true,
                item: result.data.item,
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
    return (<div>Loading...</div>);
  }
  if (state.error) {
    return (<div>Error</div>);
  }
  const elements = [];
  const formatDetails = state.item['format_details'];
  Object.keys(formatDetails).forEach((objectKey) => {
    elements.push({
      key: objectKey,
      value: formatDetails[objectKey],
    });
  });

  const values = elements.map(((item, index) => {
    const value = item.value ? item.value : '';
    return (
      <tr key={index}>
        <th scope="row" width="16.66%">{item.key}</th>
        <td>
          <div className="container-sm"><p>{value}</p></div>
        </td>
      </tr>
    );
  }));
  return (
    <table className="table table-sm">
      <tbody>
        {values}
      </tbody>
    </table>
  );
};