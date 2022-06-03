import {useState, useEffect, FC, Fragment, ReactElement} from 'react';
import axios, {AxiosError} from 'axios';

interface EnumMetadata {
    id: number
    name: string
}
interface Element {
  key: string,
  value: string | number | EnumMetadata
}

interface FormatApiData{
    format: EnumMetadata
    elements: Element[]
}
interface ApiData{
    item:{
        format: EnumMetadata,
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
  const [data, setData] = useState<FormatApiData | null>(null);
  const [error, setError] = useState<Error|AxiosError| null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      const dataValue: ApiData = (await axios.get(url)).data as ApiData;
      const elements: Element[] = [];
      const formatDetails = dataValue.item['format_details'];
      Object.keys(formatDetails).forEach((objectKey) => {
        elements.push({
          key: objectKey,
          value: formatDetails[objectKey],
        });
      });
      setData({
        format: dataValue.item.format,
        elements: elements,
      });
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
 * @constructor
 */
const FormatDetail:
  FC<{
    label: string,
    children?: string | JSX.Element | JSX.Element[]
}> = ({label, children}) =>{
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        <div className="container-sm">
          {children}
        </div>
      </td>
    </tr>
  );
};

const OpenReel: FC<{data: {[key: string]: Element }}> = ({data}) => {
  const base = data['base'].value as EnumMetadata;
  const dateOfReel = data['date_of_reel'].value as string;
  const duration = data['duration'].value as string;
  const title = data['title_of_reel'].value as string;
  const formatSubtype = data['format_subtype'].value as EnumMetadata;
  const generation = data['generation'].value as EnumMetadata;
  const reelBrand = data['reel_brand'].value as string;
  const reelDiameter = data['reel_size'].value as number;
  const reelSpeed = data['reel_speed'].value as EnumMetadata;
  const reelThickness = data['reel_thickness'].value as EnumMetadata;
  const reelType = data['reel_type'].value as string;
  const reelWidth = data['reel_width'].value as EnumMetadata;
  const trackConfiguration = data['track_configuration'].value as EnumMetadata;
  const trackCount = data['track_count'].value as number;
  const wind = data['wind'].value as EnumMetadata;

  return (
    <Fragment>
      <FormatDetail key='title' label="Title of Reel">
        {title}
      </FormatDetail>
      <FormatDetail key='base' label="Base">{base.name}</FormatDetail>
      <FormatDetail key='dateOfReel' label="Date Of Reel">
        {dateOfReel}
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">{duration}</FormatDetail>
      <FormatDetail key='formatSubtype' label="Type">
        {formatSubtype.name}
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {generation.name}
      </FormatDetail>
      <FormatDetail key='reelBrand' label="Brand of Reel">
        {reelBrand}
      </FormatDetail>
      <FormatDetail key='reelDiameter' label="Diameter of Reel">
        {`${reelDiameter.toString()}"`}
      </FormatDetail>
      <FormatDetail key='reelSpeed' label="Speed of Reel">
        {reelSpeed.name}
      </FormatDetail>
      <FormatDetail key='reelThickness' label="Thickness of Reel">
        {reelThickness.name}
      </FormatDetail>
      <FormatDetail key='reelType' label="Type of Reel">
        {reelType}
      </FormatDetail>
      <FormatDetail key='reelWidth' label="Width of Reel">
        {reelWidth.name}
      </FormatDetail>
      <FormatDetail key='trackConfiguration' label="Track Configuration">
        {trackConfiguration.name}
      </FormatDetail>
      <FormatDetail key='trackCount' label="Track Count">
        {trackCount.toString()}
      </FormatDetail>
      <FormatDetail key='wind' label="Wind">
        {wind.name}
      </FormatDetail>
    </Fragment>
  );
};

const AudioCassette: FC<{data: {[key: string]: Element }}> = ({data}) => {
  const title = data['cassette_title'].value as string;
  const cassetteType = data['cassette_type'].value as EnumMetadata;
  const dateOfCassette = data['date_of_cassette'].value as string;
  const generation = data['generation'].value as EnumMetadata;
  const sideADuration = data['side_a_duration'].value as string;
  const sideALabel = data['side_a_label'].value as string;
  const sideBDuration = data['side_b_duration'].value as string;
  const sideBLabel = data['side_b_label'].value as string;

  return (
    <Fragment>
      <FormatDetail key='cassetteTitle' label="Cassette Title">
        {title}
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        {cassetteType.name}
      </FormatDetail>
      <FormatDetail key='dateOfCassette' label="Date of Cassette">
        {dateOfCassette}
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {generation.name}
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        {sideALabel}
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        {sideADuration}
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        {sideBLabel}
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        {sideBDuration}
      </FormatDetail>
    </Fragment>
  );
};

function getTableBody(formatType: FormatType, data: Element[]): JSX.Element {
  const types: {[key: number]: FC<{data: {[key: string]: Element }}>} = {
    4: OpenReel,
    7: AudioCassette,
  };

  if (formatType.id in types) {
    const Type = types[formatType.id];

    const sortedData: {[key: string]: Element } = {};
    for (const element of data) {
      sortedData[element.key] = element;
    }
    return (<Type data={sortedData}/>);
  }

  const values: JSX.Element[] = data.map(
      (
          item: {
              value?: string | number| EnumMetadata,
              key: string
          },
          index: number,
      ) => {
        const children: ReactElement =
          item.value ? <p>{item.value.toString()}</p>: <p/>;
        return (
          <FormatDetail key={index.toString()} label={item.key}>
            {children}
          </FormatDetail>
        );
      });
  return (<Fragment>{values}</Fragment>);
}

interface FormatType{
    id: number
    name: string
}

/**
 * Display format details
 * @param {apiUrl} URL for api
 * @return {JSX.Element}
 * @constructor
 */
export default function FormatDetails({apiUrl}: { apiUrl: string }) {
  const [data, error, loading] = useFormatDetailsApi(apiUrl) as [
      data: FormatApiData,
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

  const values = getTableBody(data.format, data.elements);
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

