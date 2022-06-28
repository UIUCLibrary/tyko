import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import React, {
  useState,
  useEffect,
  FC,
  Fragment,
  ReactElement,
  useReducer,
} from 'react';
import axios, {AxiosError} from 'axios';
import {IItemMetadata} from './ItemApp';
import {ApiEnum, sortNameAlpha, SelectDate} from './Items';
import {Button, ButtonGroup, Col, Spinner} from 'react-bootstrap';
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

const OpenReel: FC<IFormatType> = ({data, editMode}) => {
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

  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key='title' label="Title of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={title}/>
      </FormatDetail>
      <FormatDetail key='base' label="Base">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={base ? base.name : ''}/>
      </FormatDetail>
      <FormatDetail key='dateOfReel' label="Date Of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={dateOfReel}/>
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">{duration}</FormatDetail>
      <FormatDetail key='formatSubtype' label="Type">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={formatSubtype ? formatSubtype.name : ''}/>
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={generation ? generation.name : ''}/>
      </FormatDetail>
      <FormatDetail key='reelBrand' label="Brand of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelBrand}/>
      </FormatDetail>
      <FormatDetail key='reelDiameter' label="Diameter of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelDiameter ? reelDiameter.toString() : ''}/>
      </FormatDetail>
      <FormatDetail key='reelSpeed' label="Speed of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelSpeed ? reelSpeed.name : ''}/>
      </FormatDetail>
      <FormatDetail key='reelThickness' label="Thickness of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelThickness ? reelThickness.name : ''}/>
      </FormatDetail>
      <FormatDetail key='reelType' label="Type of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelType}/>
      </FormatDetail>
      <FormatDetail key='reelWidth' label="Width of Reel">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={reelWidth ? reelWidth.name : ''}/>
      </FormatDetail>
      <FormatDetail key='trackConfiguration' label="Track Configuration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={trackConfiguration ? trackConfiguration.name : ''}/>
      </FormatDetail>
      <FormatDetail key='trackCount' label="Track Count">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={trackCount ? trackCount.toString() : ''}/>
      </FormatDetail>
      <FormatDetail key='wind' label="Wind">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={wind ? wind.name : ''}/>
      </FormatDetail>
    </Fragment>
  );
};

const GroovedDisc: FC<IFormatType> = ({data, editMode}) => {
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
  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key='titleOfAlbum' label="Title of Album">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={titleOfAlbum}/>
      </FormatDetail>
      <FormatDetail key='titleOfDisc' label="Title of Disc">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={titleOfDisc}/>
      </FormatDetail>
      <FormatDetail key='discBase' label="Base">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={discBase ? discBase.name : ''}/>
      </FormatDetail>
      <FormatDetail key='dateOfDisc' label="Date Of Disc">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={dateOfDisc}/>
      </FormatDetail>
      <FormatDetail key='discDiameter' label="Disc Diameter">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={discDiameter ? discDiameter.name : ''}/>
      </FormatDetail>
      <FormatDetail key='discDirection' label="Disc Direction">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={discDirection ? discDirection.name : ''}/>
      </FormatDetail>
      <FormatDetail key='discMaterial' label="Disc Material">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={discMaterial ? discMaterial.name : ''}/>
      </FormatDetail>
      <FormatDetail key='playbackSpeed' label="Playback Speed">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={playbackSpeed ? playbackSpeed.name : ''}/>
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={sideALabel}/>
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={sideADuration}/>
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={sideBLabel}/>
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={sideBDuration}/>
      </FormatDetail>
    </Fragment>
  );
};

const Film: FC<IFormatType> = ({data, editMode}) => {
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

const Optical: FC<IFormatType> = ({data, editMode}) => {
  const titleOfItem = data['title_of_item'].value as string;
  const dateOfItem = data['date_of_item'].value as string;
  const duration = data['duration'].value as string;
  const label = data['label'].value as string;
  const type = data['type'].value as EnumMetadata;
  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key="titleOfItem" label="Title Of Item">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={titleOfItem}/>
      </FormatDetail>
      <FormatDetail key="dateOfItem" label="Date Of Item">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={dateOfItem}/>
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={duration}/>
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={label}/>
      </FormatDetail>
      <FormatDetail key="type" label="Type">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={type ? type.name : ''}/>
      </FormatDetail>
    </Fragment>
  );
};

const VideoCassette: FC<IFormatType> = ({data, editMode}) => {
  const dateOfCassette = data['date_of_cassette'].value as string;
  const duration = data['duration'].value as string;
  const label = data['label'].value as string;
  const titleOfCassette = data['title_of_cassette'].value as string;
  const generation = data['generation'].value as EnumMetadata;
  const cassetteType = data['cassette_type'].value as EnumMetadata;
  const readOnlyMode = true;
  return (
    <Fragment>
      <FormatDetail key="dateOfCassette" label="Date Of Cassette">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={dateOfCassette}/>
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={duration}/>
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={label}/>
      </FormatDetail>
      <FormatDetail key="titleOfCassette" label="Title Of Cassette">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={titleOfCassette}/>
      </FormatDetail>
      <FormatDetail key="generation" label="Generation">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={generation ? generation.name : ''}/>
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        <Form.Control size={'sm'} readOnly={readOnlyMode}
          defaultValue={cassetteType ? cassetteType.name : ''}/>
      </FormatDetail>
    </Fragment>
  );
};

const AudioCassette: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [subtypes, setSubTypes] = useState<ApiEnum[]|null>(null);

  useEffect(()=>{
    if (editMode) {
      if (!loading) {
        if (!generations) {
          setLoading(true);
          axios.get('/api/formats/audio_cassette/generation')
              .then((res)=> {
                setGenerations((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!subtypes) {
          setLoading(true);
          axios.get('/api/formats/audio_cassette/subtype')
              .then((res)=> {
                setSubTypes((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
      } else {
        if (generations && subtypes) {
          setLoading(false);
        }
      }
    }
  }, [editMode, generations, subtypes]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </td>

      </tr>
    );
  }

  const title = data['cassette_title'].value as string;
  const cassetteType = data['cassette_type'].value as EnumMetadata;
  const dateOfCassette = data['date_of_cassette'].value as string;
  const generation = data['generation'].value as EnumMetadata;
  const sideADuration = data['side_a_duration'].value as string;
  const sideALabel = data['side_a_label'].value as string;
  const sideBDuration = data['side_b_duration'].value as string;
  const sideBLabel = data['side_b_label'].value as string;
  const readOnlyMode = !editMode;

  const cassetteDateField =
      editMode ? (
            <Form.Group>
              <SelectDate
                name='date_of_cassette'
                dateFormat='m/dd/yyyy'
                defaultValue={dateOfCassette ? dateOfCassette: ''}
              />
            </Form.Group>
          ):
          (
              <Form.Control
                size={'sm'}
                defaultValue={dateOfCassette}
                plaintext={true}
                readOnly={readOnlyMode}
              />
          );

  const generationOptions = generations?.map((generation) => {
    return (
      <option key={generation.id} value={generation.id}>
        {generation.name}
      </option>
    );
  });

  const subtypeOptions = subtypes?.map((generation) => {
    return (
      <option key={generation.id} value={generation.id}>
        {generation.name}
      </option>
    );
  });
  const generationField =
      editMode ?
          (
              <Form.Select
                name='generation_id'
                defaultValue={generation ? generation.id : ''}
              >
                <option key={-1} value=''></option>
                {generationOptions}
              </Form.Select>
          ):
          (
            <Form.Control
              size={'sm'}
              plaintext={true}
              defaultValue={generation ? generation.name : ''}
              readOnly={readOnlyMode}
            />
          );
  const cassetteTypeField =
      editMode ?
          (
              <Form.Select
                name='cassette_type_id'
                defaultValue={cassetteType ? cassetteType.id: ''}
              >
                <option key={-1} value=''></option>
                {subtypeOptions}
              </Form.Select>
          ):
          (
              <Form.Control
                size={'sm'}
                defaultValue={cassetteType ? cassetteType.name : ''}
                plaintext={true}
                readOnly={readOnlyMode}/>
          );
  return (
    <Fragment>
      <FormatDetail key='cassetteTitle' label="Cassette Title">
        <Form.Control
          name='cassette_title'
          size={'sm'}
          defaultValue={title}
          plaintext={readOnlyMode}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        {cassetteTypeField}
      </FormatDetail>
      <FormatDetail key='dateOfCassette' label="Date of Cassette">
        {cassetteDateField}
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {generationField}
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        <Form.Control
          name="side_a_label"
          size={'sm'}
          defaultValue={sideALabel}
          plaintext={readOnlyMode}
          readOnly={readOnlyMode}/>
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        <Form.Control
          name="side_a_duration"
          size={'sm'}
          defaultValue={sideADuration}
          plaintext={readOnlyMode}
          readOnly={readOnlyMode}
        />
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        <Form.Control
          name="side_b_label"
          size={'sm'}
          defaultValue={sideBLabel}
          plaintext={readOnlyMode}
          readOnly={readOnlyMode}
        />
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        <Form.Control
          name="side_b_duration"
          size={'sm'}
          defaultValue={sideBDuration}
          plaintext={readOnlyMode}
          readOnly={readOnlyMode}/>
      </FormatDetail>
    </Fragment>
  );
};
interface IFormatType{
  data: { [key: string]: Element }
  editMode: boolean
}
/**
 * Gget the table body
 * @param {FormatType} formatType - Format type
 * @param {boolean} editMode - editMode
 * @param {Element[]} data - data
 * @return {Fragment}
 */
function getTableBody(
    formatType: FormatType,
    editMode: boolean,
    data: Element[],
): JSX.Element {
  const types: { [key: number]: FC<IFormatType> } = {
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
    return (
      <Type data={sortedData} editMode={editMode}/>
    );
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

interface IData {
  apiData: IItemMetadata
  apiUrl: string
  onUpdated: ()=>void
}

// function edited

/**
 * Display format details
 * @param {apiUrl} URL for api
 * @return {JSX.Element}
 * @constructor
 */
export default function FormatDetails({apiData, apiUrl, onUpdated}:IData ) {
  const [editMode, setEditMode] = useReducer((mode)=>!mode, false);
  const elements: Element[] = [];
  const formatDetails = apiData['format_details'];
  Object.keys(formatDetails).forEach((objectKey) => {
    elements.push({
      key: objectKey,
      value: formatDetails[objectKey],
    });
  });
  const values = getTableBody(apiData.format, editMode, elements);
  const handleUpdate = (event: React.SyntheticEvent)=> {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.put(apiUrl, {'format_details': formProps}).then(()=>{
      if (onUpdated) {
        onUpdated();
      }
    }).catch(console.error);
  };
  return (
    <>
      <Form onSubmit={handleUpdate}>
        <Table data-testid='dummy'>
          <tbody>
            {values}
          </tbody>
        </Table>
        <ButtonGroup hidden={!editMode}>
          <Button variant={'outline-danger'} onClick={setEditMode}>
            Cancel
          </Button>
          <Button type='submit' variant={'outline-primary'}>
            Confirm
          </Button>
        </ButtonGroup>
        <Button hidden={editMode} onClick={setEditMode}>Edit</Button>
      </Form>
    </>
  );
}
