import React from 'react';

/**
 * Format a row of a key value pair
 * @param {value} value of pair
 * @param {label} displayed label
 * @constructor
 */
export const FormatDetail: React.FC<{ value: string, label: string }> = ({value, label}) =>{
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        <div className="container-sm">
          {value ? <p>{value.toString()}</p>: null}
        </div>
      </td>
    </tr>
  );
};

