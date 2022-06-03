import {useState, useEffect, FC} from 'react';
import axios, {AxiosError} from 'axios';
interface FormatApiData{
    key: string,
    value: string
}
interface ApiData{
    item:{
        format_details: {
            [key: string]: string
        }
    }
}
/**
 * Get api data for format.
 * @param {url} url of api
 * @return {unknown[]}
 */
const useFormatDetailsApi = (url: string) => {
  const [data, setData] = useState<FormatApiData[] | null>(null);
  const [error, setError] = useState<Error|AxiosError| null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      const dataValue: ApiData = (await axios.get(url)).data as ApiData;
      const elements: FormatApiData[] = [];
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
        .catch((e: AxiosError | Error)=> {
          setError(e);
        });
  }, [url]);

  return [data, error, loading];
};

/**
 * Format a row of a key value pair
 * @param {value} value of pair
 * @param {label} displayed label
 * @constructor
 */
const FormatDetail: FC<{ value: string, label: string }> = (
    {value, label},
) =>{
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

/**
 * Display format details
 * @param {apiUrl} URL for api
 * @return {JSX.Element|null}
 * @constructor
 */
export default function FormatDetails({apiUrl}: { apiUrl: string }) {
  const [data, error, loading] = useFormatDetailsApi(apiUrl) as [
      data: FormatApiData[],
      error: undefined,
      loading: boolean
  ];

  if (loading) {
    return (<p>Loading...</p>);
  }
  if (error) {
    return (<p>Failed</p>);
  }
  if (data === null) {
    return null;
  }
  const values: JSX.Element[] = data.map(
      (item: {value?: string, key: string}, index: number) => {
        const value = item.value ? item.value : '';
        return (
          <FormatDetail key={index.toString()} label={item.key} value={value}/>
        );
      });
  return (
    <div>
      <table className="table table-sm" data-testid='dummy'>
        <tbody>
          {values}
        </tbody>
      </table>
    </div>
  );
}

