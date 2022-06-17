import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import {useState, useEffect, FC, Fragment, ReactElement} from 'react';
import axios, {AxiosError} from 'axios';
import Panel from './Panel';
interface EnumMetadata {
  id: number
  name: string
}

interface Element {
  key: string,
  value: string | number | boolean | EnumMetadata
}

interface FormatApiData {
  format: EnumMetadata
  elements: Element[]
}

interface ApiData {
  item: {
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
  const [error, setError] = useState<Error | AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
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
        .then(() => setLoading(false))
        .catch((e: AxiosError | Error) => {
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
    }> = ({label, children}) => {
      return (
        <tr>
          <th style={{width: '25%'}} scope="row">{label}</th>
          <td>
            <div className="container-sm">
              {children}
            </div>
          </td>
        </tr>
      );
    };

const OpenReel: FC<{ data: { [key: string]: Element } }> = ({data}) => {
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
      <FormatDetail key='base' label="Base">
        {base ? base.name : ''}
      </FormatDetail>
      <FormatDetail key='dateOfReel' label="Date Of Reel">
        {dateOfReel}
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">{duration}</FormatDetail>
      <FormatDetail key='formatSubtype' label="Type">
        {formatSubtype ? formatSubtype.name : ''}
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {generation ? generation.name : ''}
      </FormatDetail>
      <FormatDetail key='reelBrand' label="Brand of Reel">
        {reelBrand}
      </FormatDetail>
      <FormatDetail key='reelDiameter' label="Diameter of Reel">
        {reelDiameter ? reelDiameter.toString() : ''}
      </FormatDetail>
      <FormatDetail key='reelSpeed' label="Speed of Reel">
        {reelSpeed ? reelSpeed.name : ''}
      </FormatDetail>
      <FormatDetail key='reelThickness' label="Thickness of Reel">
        {reelThickness ? reelThickness.name : ''}
      </FormatDetail>
      <FormatDetail key='reelType' label="Type of Reel">
        {reelType}
      </FormatDetail>
      <FormatDetail key='reelWidth' label="Width of Reel">
        {reelWidth ? reelWidth.name : ''}
      </FormatDetail>
      <FormatDetail key='trackConfiguration' label="Track Configuration">
        {trackConfiguration ? trackConfiguration.name : ''}
      </FormatDetail>
      <FormatDetail key='trackCount' label="Track Count">
        {trackCount ? trackCount.toString() : ''}
      </FormatDetail>
      <FormatDetail key='wind' label="Wind">
        {wind ? wind.name : ''}
      </FormatDetail>
    </Fragment>
  );
};

const GroovedDisc: FC<{ data: { [key: string]: Element } }> = ({data}) => {
  const discBase = data['disc_base'].value as EnumMetadata;
  const dateOfDisc = data['date_of_disc'].value as string;
  const discDiameter = data['disc_diameter'].value as EnumMetadata;
  const discDirection = data['disc_direction'].value as EnumMetadata;
  const discMaterial = data['disc_material'].value as EnumMetadata;
  const playbackSpeed = data['playback_speed'].value as EnumMetadata;
  const titleOfAlbum = data['title_of_album'].value as string;
  const titleOfDisc = data['title_of_disc'].value as string;
  const sideADuration = data['side_a_duration'].value as string;
  const sideALabel = data['side_a_label'].value as string;
  const sideBDuration = data['side_b_duration'].value as string;
  const sideBLabel = data['side_b_label'].value as string;

  return (
    <Fragment>
      <FormatDetail key='titleOfAlbum' label="Title of Album">
        {titleOfAlbum}
      </FormatDetail>
      <FormatDetail key='titleOfDisc' label="Title of Disc">
        {titleOfDisc}
      </FormatDetail>
      <FormatDetail key='discBase' label="Base">
        {discBase ? discBase.name : ''}
      </FormatDetail>
      <FormatDetail key='dateOfDisc' label="Date Of Disc">
        {dateOfDisc}
      </FormatDetail>
      <FormatDetail key='discDiameter' label="Disc Diameter">
        {discDiameter ? discDiameter.name : ''}
      </FormatDetail>
      <FormatDetail key='discDirection' label="Disc Direction">
        {discDirection ? discDirection.name : ''}
      </FormatDetail>
      <FormatDetail key='discMaterial' label="Disc Material">
        {discMaterial ? discMaterial.name : ''}
      </FormatDetail>
      <FormatDetail key='playbackSpeed' label="Playback Speed">
        {playbackSpeed ? playbackSpeed.name : ''}
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

const Film: FC<{ data: { [key: string]: Element } }> = ({data}) => {
  const adStripTest = data['ad_strip_test'].value;
  const adTestDate = data['ad_test_date'].value as string;
  const adTestLevel = data['ad_test_level'].value as string;
  const canLabel = data['can_label'].value as string;
  const dateOfFilm = data['date_of_film'].value as string;
  const duration = data['duration'].value as string;
  const filmTitle = data['film_title'].value as string;
  const leaderLabel = data['leader_label'].value as string;
  const edgeCodeDate = data['edge_code_date'].value as number;
  const filmLength = data['film_length'].value as number;
  const filmShrinkage = data['film_shrinkage'].value as number;
  const color = data['color'].value as EnumMetadata;
  const filmGauge = data['film_gauge'].value as EnumMetadata;
  const filmBase = data['film_base'].value as EnumMetadata;
  const filmEmulsion = data['film_emulsion'].value as EnumMetadata;
  const filmImageType = data['film_image_type'].value as EnumMetadata;
  const filmSpeed = data['film_speed'].value as EnumMetadata;
  const soundtrack = data['soundtrack'].value as EnumMetadata;
  const wind = data['wind'].value as EnumMetadata;

  let adStripTestDisplay: string;
  switch (adStripTest) {
    case false:
      adStripTestDisplay = 'No';
      break;
    case true:
      adStripTestDisplay = 'Yes';
      break;
    default:
      adStripTestDisplay = '';
  }
  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key='dateOfFilm' label="Date Of Film">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={dateOfFilm}/>
      </FormatDetail>
      <FormatDetail key='adStripTest' label="AD Strip Test Performed">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={adStripTestDisplay}/>
      </FormatDetail>
      <FormatDetail key='adTestDate' label="AD Test Date">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={adTestDate}/>
      </FormatDetail>
      <FormatDetail key='adTestLevel' label="AD Test Level">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={adTestLevel}/>
      </FormatDetail>
      <FormatDetail key='canLabel' label="Can Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={canLabel}/>
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={duration}/>
      </FormatDetail>
      <FormatDetail key='filmTitle' label="Film Title">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmTitle}/>
      </FormatDetail>
      <FormatDetail key='leaderLabel' label="Leader Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={leaderLabel}/>
      </FormatDetail>
      <FormatDetail key='edgeCodeDate' label="Edge Code Date">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={edgeCodeDate ? edgeCodeDate.toString() : ''}/>
      </FormatDetail>
      <FormatDetail key='filmLength' label='Film Length'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmLength ? filmLength.toString() : ''}/>
      </FormatDetail>
      <FormatDetail key='filmShrinkage' label='Film Shrinkage'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmShrinkage ? filmShrinkage.toString() : ''}/>
      </FormatDetail>
      <FormatDetail key='color' label='Color'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={color ? color.name : ''}/>
      </FormatDetail>
      <FormatDetail key='filmBase' label='Film Base'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmBase ? filmBase.name : ''}/>
      </FormatDetail>
      <FormatDetail key='filmEmulsion' label='Film Emulsion'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmEmulsion ? filmEmulsion.name : ''}/>
      </FormatDetail>
      <FormatDetail key='filmImageType' label='Film Image Type'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmImageType ? filmImageType.name : ''}/>
      </FormatDetail>
      <FormatDetail key='filmSpeed' label='Film Speed'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmSpeed ? filmSpeed.name : ''}/>
      </FormatDetail>
      <FormatDetail key='filmGauge' label='Film Gauge'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={filmGauge ? filmGauge.name : ''}/>
      </FormatDetail>
      <FormatDetail key='soundtrack' label='Soundtrack'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={soundtrack ? soundtrack.name : ''}/>
      </FormatDetail>
      <FormatDetail key='wind' label='Wind'>
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={wind ? wind.name : ''}/>
      </FormatDetail>
    </Fragment>
  );
};

const Optical: FC<{ data: { [key: string]: Element } }> = ({data}) => {
  const titleOfItem = data['title_of_item'].value as string;
  const dateOfItem = data['date_of_item'].value as string;
  const duration = data['duration'].value as string;
  const label = data['label'].value as string;
  const type = data['type'].value as EnumMetadata;
  return (
    <Fragment>
      <FormatDetail key="titleOfItem" label="Title Of Item">
        {titleOfItem}
      </FormatDetail>
      <FormatDetail key="dateOfItem" label="Date Of Item">
        {dateOfItem}
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        {duration}
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        {label}
      </FormatDetail>
      <FormatDetail key="type" label="Type">
        {type ? type.name : ''}
      </FormatDetail>
    </Fragment>
  );
};

const VideoCassette: FC<{
  data: { [key: string]: Element }
}> = ({data}) => {
  const dateOfCassette = data['date_of_cassette'].value as string;
  const duration = data['duration'].value as string;
  const label = data['label'].value as string;
  const titleOfCassette = data['title_of_cassette'].value as string;
  const generation = data['generation'].value as EnumMetadata;
  const cassetteType = data['cassette_type'].value as EnumMetadata;
  return (
    <Fragment>
      <FormatDetail key="dateOfCassette" label="Date Of Cassette">
        {dateOfCassette}
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        {duration}
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        {label}
      </FormatDetail>
      <FormatDetail key="titleOfCassette" label="Title Of Cassette">
        {titleOfCassette}
      </FormatDetail>
      <FormatDetail key="generation" label="Generation">
        {generation ? generation.name : ''}
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        {cassetteType ? cassetteType.name : ''}
      </FormatDetail>
    </Fragment>
  );
};
const AudioCassette: FC<{
  data: { [key: string]: Element }
}> = ({data}) => {
  const title = data['cassette_title'].value as string;
  const cassetteType = data['cassette_type'].value as EnumMetadata;
  const dateOfCassette = data['date_of_cassette'].value as string;
  const generation = data['generation'].value as EnumMetadata;
  const sideADuration = data['side_a_duration'].value as string;
  const sideALabel = data['side_a_label'].value as string;
  const sideBDuration = data['side_b_duration'].value as string;
  const sideBLabel = data['side_b_label'].value as string;
  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key='cassetteTitle' label="Cassette Title">
        <Form.Control size={'sm'} defaultValue={title}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        <Form.Control size={'sm'}
          defaultValue={cassetteType ? cassetteType.name : ''}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='dateOfCassette' label="Date of Cassette">
        <Form.Control size={'sm'} defaultValue={dateOfCassette}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        <Form.Control size={'sm'}
          defaultValue={generation ? generation.name : ''}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        <Form.Control size={'sm'} defaultValue={sideALabel}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        <Form.Control size={'sm'} defaultValue={sideADuration}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        <Form.Control size={'sm'} defaultValue={sideBLabel}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        <Form.Control size={'sm'} defaultValue={sideBDuration}
          readOnly={readOnlyMode}/>
      </FormatDetail>
    </Fragment>
  );
};

/**
 * Gget the table body
 * @param {FormatType} formatType - Format type
 * @param {Element[]} data - data
 * @return {Fragment}
 */
function getTableBody(formatType: FormatType, data: Element[]): JSX.Element {
  const types: { [key: number]: FC<{ data: { [key: string]: Element } }> } = {
    4: OpenReel,
    5: GroovedDisc,
    6: Film,
    7: AudioCassette,
    8: Optical,
    9: VideoCassette,
  };

  if (formatType.id in types) {
    const Type = types[formatType.id];

    const sortedData: { [key: string]: Element } = {};
    for (const element of data) {
      sortedData[element.key] = element;
    }
    return (<Type data={sortedData}/>);
  }

  const values: JSX.Element[] = data.map(
      (
          item: {
            value?: string | number | boolean | EnumMetadata,
            key: string
          },
          index: number,
      ) => {
        const children: ReactElement = <p>
          {item.value ? item.value.toString() : ''}
        </p>;
        return (
          <FormatDetail key={index.toString()} label={item.key}>
            {children}
          </FormatDetail>
        );
      });
  return (<Fragment>{values}</Fragment>);
}

interface FormatType {
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
    <Panel title="Format Details">
      <Table data-testid='dummy'>
        <tbody>
          {values}
        </tbody>
      </Table>
    </Panel>
  );
}

