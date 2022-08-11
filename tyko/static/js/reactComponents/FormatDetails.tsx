import Form from 'react-bootstrap/Form';
import {EditSwitchFormField, LoadingPercent} from './Common';
import React, {
  useState,
  useEffect,
  FC,
  useReducer, useRef,
} from 'react';
import axios, {AxiosResponse} from 'axios';
import {IItemMetadata} from './ItemApp';
import {ApiEnum, sortNameAlpha, SelectDate} from './Items';
import {Button, ButtonGroup} from 'react-bootstrap';
export interface EnumMetadata {
  id: number
  name: string
}

interface Element {
  key: string,
  value: string | number | boolean | EnumMetadata | null,
}

const createEnumField = (
    name: string,
    current: EnumMetadata,
    all: ApiEnum[] | null,
)=>{
  return (
    <>
      <Form.Select name={name} defaultValue={current ? current.id : ''}>
        <option key={-1} value=''/>
        {all ? createEnumOptions(all) :(<></>)}
      </Form.Select>
    </>
  );
};

const createEnumOptions = (enumList: EnumMetadata[])=>{
  return enumList.map((item) => {
    return (<option key={item.id} value={item.id}>{item.name}</option>);
  });
};


const OpenReel: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['bases', '/api/formats/open_reel/base'],
        ['reel_diameters', '/api/formats/open_reel/reel_diameter'],
        ['sub_types', '/api/formats/open_reel/sub_types'],
        ['generations', '/api/formats/open_reel/generation'],
        ['reel_thicknesses', '/api/formats/open_reel/reel_thickness'],
        ['reel_speeds', '/api/formats/open_reel/reel_speed'],
        ['reel_widths', '/api/formats/open_reel/reel_width'],
        ['track_configurations', '/api/formats/open_reel/track_configuration'],
        ['winds', '/api/formats/open_reel/wind'],
      ]: null,
  );
  const [tapeBases, setTapeBases] = useState<ApiEnum[]|null>(null);
  const [
    formatSubtypes,
    setFormatSubtypes,
  ] = useState<ApiEnum[]|null>(null);
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [reelDiameters, setReelDiameters] = useState<ApiEnum[]|null>(null);
  const [reelSpeeds, setReelSpeeds] = useState<ApiEnum[]|null>(null);
  const [reelThicknesses, setReelThicknesses] = useState<ApiEnum[]|null>(null);
  const [reelWidths, setReelWidths] = useState<ApiEnum[]|null>(null);
  const [
    trackConfigurations,
    setTrackConfigurations,
  ] = useState<ApiEnum[]|null>(null);
  const [winds, setWinds] = useState<ApiEnum[]|null>(null);

  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setTapeBases(enums['bases']);
          setReelDiameters(enums['reel_diameters']);
          setFormatSubtypes(enums['sub_types']);
          setReelSpeeds(enums['reel_speeds']);
          setGenerations(enums['generations']);
          setReelWidths(enums['reel_widths']);
          setReelThicknesses(enums['reel_thicknesses']);
          setTrackConfigurations(enums['track_configurations']);
          setWinds(enums['winds']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>;
  }
  return (
    <div>
      <EditSwitchFormField
        label='Title of Reel'
        editMode={editMode}
        display={data['title_of_reel'].value as string}>
        {
          createTextField(
              'title_of_reel',
                data['title_of_reel'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Base'
        editMode={editMode}
        display={
        data['base'].value ?
            (data['base'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'base_id',
              data['base'].value as EnumMetadata,
              tapeBases,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Date Of Reel'
        editMode={editMode}
        display={data['date_of_reel'].value as string}>
        {
          createDateField(
              'date_of_reel',
                data['date_of_reel'].value as string,
                'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Duration'
        editMode={editMode}
        display={data['duration'].value as string}>
        {createTextField('duration', data['duration'].value as string)}
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Type'
        editMode={editMode}
        display={
        data['format_subtype'].value ?
            (data['format_subtype'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'format_subtype_id',
              data['format_subtype'].value as EnumMetadata,
              formatSubtypes,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Generation'
        editMode={editMode}
        display={
        data['generation'].value ?
            (data['generation'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Brand of Reel'
        editMode={editMode}
        display={data['reel_brand'].value as string}>
        {createTextField('reel_brand', data['reel_brand'].value as string)}
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Diameter of Reel'
        editMode={editMode}
        display={
        data['reel_diameter'].value ?
            (data['reel_diameter'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'reel_diameter_id',
              data['reel_diameter'].value as EnumMetadata,
              reelDiameters,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Speed of Reel'
        editMode={editMode}
        display={
        data['reel_speed'].value ?
            (data['reel_speed'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'reel_speed_id',
              data['reel_speed'].value as EnumMetadata,
              reelSpeeds,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Thickness of Reel'
        editMode={editMode}
        display={
        data['reel_thickness'].value ?
            (data['reel_thickness'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'reel_thickness_id',
              data['reel_thickness'].value as EnumMetadata,
              reelThicknesses,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Type of Reel'
        editMode={editMode}
        display={data['reel_type'].value as string}>
        {createTextField('reel_type', data['reel_type'].value as string)}
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Width of Reel'
        editMode={editMode}
        display={
        data['reel_width'].value ?
            (data['reel_width'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'reel_width_id',
              data['reel_width'].value as EnumMetadata,
              reelWidths,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Track Configuration'
        editMode={editMode}
        display={
        data['track_configuration'].value ?
            (data['track_configuration'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'track_configuration_id',
              data['track_configuration'].value as EnumMetadata,
              trackConfigurations,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Track Count'
        editMode={editMode}
        display={
        data['track_count'].value ?
            data['track_count'].value.toString() : ''
        }
      >
        {
          createNumberField(
              'track_count',
              data['track_count'] ?
                  data['track_count'].value as number :
                  null,
              0,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Wind'
        editMode={editMode}
        display={
        data['wind'].value ?
            (data['wind'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'wind_id',
              data['wind'].value as EnumMetadata,
              winds,
          )
        }
      </EditSwitchFormField>
    </div>
  );
};

const GroovedDisc: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['disc_base', '/api/formats/grooved_disc/disc_base'],
        ['disc_diameter', '/api/formats/grooved_disc/disc_diameter'],
        ['playback_direction', '/api/formats/grooved_disc/playback_direction'],
        ['disc_material', '/api/formats/grooved_disc/disc_material'],
        ['playback_speed', '/api/formats/grooved_disc/playback_speed'],
      ]: null,
  );

  const [discBases, setDiscBases] = useState<ApiEnum[]|null>(null);
  const [discDiameters, setDiscDiameter] = useState<ApiEnum[]|null>(null);
  const [
    playbackDirections,
    setPlaybackDirections,
  ] = useState<ApiEnum[]|null>(null);
  const [discMaterials, setDiscMaterials] = useState<ApiEnum[]|null>(null);
  const [playbackSpeeds, setPlaybackSpeeds] = useState<ApiEnum[]|null>(null);
  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setDiscBases(enums['disc_base']);
          setDiscDiameter(enums['disc_diameter']);
          setPlaybackDirections(enums['playback_direction']);
          setDiscMaterials(enums['disc_material']);
          setPlaybackSpeeds(enums['playback_speed']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>;
  }
  return (
    <div>
      <EditSwitchFormField
        label='Title of Album'
        editMode={editMode}
        display={data['title_of_album'].value as string}>
        {
          createTextField(
              'title_of_album',
              data['title_of_album'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Title of Disc'
        editMode={editMode}
        display={data['title_of_disc'].value as string}>
        {
          createTextField(
              'title_of_disc',
              data['title_of_disc'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Base'
        editMode={editMode}
        display={
        data['disc_base'].value ?
            (data['disc_base'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'disc_base_id',
              data['disc_base'].value as EnumMetadata,
              discBases,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Date Of Disc'
        editMode={editMode}
        display={data['date_of_disc'].value as string}>
        {
          createDateField(
              'date_of_disc',
                data['date_of_disc'].value as string,
                'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Disc Diameter'
        editMode={editMode}
        display={
        data['disc_diameter'].value ?
            (data['disc_diameter'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'disc_diameter_id',
              data['disc_diameter'].value as EnumMetadata,
              discDiameters,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Playback Direction'
        editMode={editMode}
        display={
        data['playback_direction'].value ?
            (data['playback_direction'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'playback_direction_id',
              data['playback_direction'].value as EnumMetadata,
              playbackDirections,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Disc Material'
        editMode={editMode}
        display={
        data['disc_material'].value ?
            (data['disc_material'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'disc_material_id',
              data['disc_material'].value as EnumMetadata,
              discMaterials,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Playback Speed'
        editMode={editMode}
        display={
        data['playback_speed'].value ?
            (data['playback_speed'].value as EnumMetadata).name : ''}
      >
        {
          createEnumField(
              'playback_speed_id',
              data['playback_speed'].value as EnumMetadata,
              playbackSpeeds,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side A Label'
        editMode={editMode}
        display={data['side_a_label'].value as string}>
        {
          createTextField(
              'side_a_label',
              data['side_a_label'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side A Duration'
        editMode={editMode}
        display={data['side_a_duration'].value as string}>
        {
          createTextField(
              'side_a_duration',
              data['side_a_duration'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side B Label'
        editMode={editMode}
        display={data['side_b_label'].value as string}>
        {
          createTextField(
              'side_b_label',
              data['side_b_label'].value as string,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side B Duration'
        editMode={editMode}
        display={data['side_b_duration'].value as string}>
        {
          createTextField(
              'side_b_duration',
              data['side_b_duration'].value as string,
          )
        }
      </EditSwitchFormField>
    </div>
  );
};

const createNumberField = (
    name: string,
    current: number | null,
    minimum: number | null = null,
    maximum: number | null = null,
)=>{
  return (
    <Form.Control
      name={name}
      type='number'
      min={minimum === null ? undefined: minimum}
      max={maximum === null ? undefined: maximum}
      defaultValue={current ? current: undefined}/>
  );
};
const createTextField = (name: string, current: string)=>{
  return (
    <Form.Control
      name={name}
      defaultValue={current}/>
  );
};


const createDateField = (
    name: string,
    current: string | null,
    dateFormat: string,
)=>{
  return (
    <Form.Group>
      <SelectDate
        name={name}
        dateFormat={dateFormat}
        defaultValue={current ? current: ''}
      />
    </Form.Group>
  );
};

const Film: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['film_speeds', '/api/formats/film/film_speed'],
        ['film_bases', '/api/formats/film/film_base'],
        ['image_types', '/api/formats/film/image_type'],
        ['soundtracks', '/api/formats/film/soundtrack'],
        ['colors', '/api/formats/film/color'],
        ['winds', '/api/formats/film/wind'],
        ['film_emulsions', '/api/formats/film/film_emulsion'],
        ['film_gauges', '/api/formats/film/film_gauge'],
      ]: null,
  );
  const adStripTest = data['ad_strip_test'].value;

  const [
    adStripPerformed,
    setAdStripPerformed,
  ] = useReducer((state) => !state, adStripTest as boolean);

  const [speeds, setSpeeds] = useState<ApiEnum[]|null>(null);
  const [bases, setBases] = useState<ApiEnum[]|null>(null);
  const [imageTypes, setImageTypes] = useState<ApiEnum[]|null>(null);
  const [soundtracks, setSoundtracks] = useState<ApiEnum[]|null>(null);
  const [filmGauges, setFilmGauges] = useState<ApiEnum[]|null>(null);
  const [colors, setColors] = useState<ApiEnum[]|null>(null);
  const [winds, setWinds] = useState<ApiEnum[]|null>(null);
  const [emulsions, setEmulsions] = useState<ApiEnum[]|null>(null);

  const [adTestDate, setAdTestDate] = useState<string|null>(null);

  const adTestLevel = data['ad_test_level'].value as string;
  const selectedAdStrip = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const value = adStripPerformed ?
          data['ad_test_date'].value as string : '';
    setAdTestDate(value);
  }, [data, adStripPerformed]);

  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setSpeeds(enums['film_speeds']);
          setBases(enums['film_bases']);
          setImageTypes(enums['image_types']);
          setSoundtracks(enums['soundtracks']);
          setColors(enums['colors']);
          setWinds(enums['winds']);

          const filmEmulsions = enums['film_emulsions'];
          filmEmulsions.sort(sortNameAlpha);
          setEmulsions(filmEmulsions);

          setFilmGauges(enums['film_gauges']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>;
  }
  const adTestLevelValue = adTestLevel ? parseInt(adTestLevel): null;
  const checkbox = '\u2713';
  return (
    <div>
      <EditSwitchFormField
        label='Date Of Film'
        editMode={editMode}
        display={data['date_of_film'].value as string}>
        {
          createDateField(
              'date_of_film',
                data['date_of_film'].value as string,
                'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='AD Strip Test Performed'
        editMode={editMode}
        display={adStripPerformed ? checkbox: ''}>
        <Form.Check
          checked={adStripPerformed}
          name='ad_test_performed'
          type="checkbox"
          ref={selectedAdStrip}
          onChange={setAdStripPerformed}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='AD Test Date'
        editMode={editMode}
        display={
        data['ad_test_date'].value ?
            data['ad_test_date'].value.toString() : ''
        }
      >
        <fieldset disabled={!adStripPerformed}>
          {
            createDateField(
                'ad_test_date',
                adTestDate,
                'm/dd/yyyy',
            )
          }
        </fieldset>
      </EditSwitchFormField>
      <EditSwitchFormField
        label='AD Test Level'
        editMode={editMode}
        display={
        data['ad_test_level'].value ?
            data['ad_test_level'].value.toString() : ''
        }
      >
        <fieldset disabled={!adStripPerformed}>
          {
            createNumberField(
                'ad_test_level',
                adTestLevelValue,
                0,
            )
          }
        </fieldset>
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Can Label'
        editMode={editMode}
        display={data['can_label'].value as string}>
        <Form.Control
          name='can_label'
          defaultValue={data['can_label'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Duration'
        editMode={editMode}
        display={data['duration'].value as string}>
        <Form.Control
          name='duration'
          defaultValue={data['duration'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Title'
        editMode={editMode}
        display={data['film_title'].value as string}>
        <Form.Control
          name='film_title'
          defaultValue={data['film_title'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Leader Label'
        editMode={editMode}
        display={data['leader_label'].value as string}>
        <Form.Control
          name='leader_label'
          defaultValue={data['leader_label'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Length'
        editMode={editMode}
        display={
        data['film_length'].value ?
            `${data['film_length'].value.toString()} ft` : ''
        }
      >
        {
          createNumberField(
              'film_length',
              data['film_length'] ?
                  data['film_length'].value as number :
                  null,
              0,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Edge Code Date'
        editMode={editMode}
        display={
        data['edge_code_date'].value ?
            data['edge_code_date'].value.toString() : ''
        }
      >
        {
          createNumberField(
              'edge_code_date',
              data['edge_code_date'] ?
                  data['edge_code_date'].value as number :
                  null,
              0,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Shrinkage'
        editMode={editMode}
        display={
        data['film_shrinkage'].value ?
            `${data['film_shrinkage'].value.toString()}%` : ''
        }
      >
        {
          createNumberField(
              'film_shrinkage',
              data['film_shrinkage'] ?
                  data['film_shrinkage'].value as number :
                  null,
              0,
              100,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Color'
        editMode={editMode}
        display={
        data['color'].value ?
            (data['color'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'film_color_id',
              data['color'].value as EnumMetadata,
              colors,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Base'
        editMode={editMode}
        display={
        data['film_base'].value ?
            (data['film_base'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'film_base_id',
              data['film_base'].value as EnumMetadata,
              bases,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Emulsion'
        editMode={editMode}
        display={
        data['film_emulsion'].value ?
            (data['film_emulsion'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'film_emulsion_id',
              data['film_emulsion'].value as EnumMetadata,
              emulsions,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Image Type'
        editMode={editMode}
        display={
        data['film_image_type'].value ?
            (data['film_image_type'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'image_type_id',
              data['film_image_type'].value as EnumMetadata,
              imageTypes,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Speed'
        editMode={editMode}
        display={
        data['film_speed'].value ?
            (data['film_speed'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'film_speed_id',
              data['film_speed'].value as EnumMetadata,
              speeds,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Film Gauge'
        editMode={editMode}
        display={
        data['film_gauge'].value ?
            (data['film_gauge'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'film_gauge_id',
              data['film_gauge'].value as EnumMetadata,
              filmGauges,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Soundtrack'
        editMode={editMode}
        display={
        data['soundtrack'].value ?
            (data['soundtrack'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'soundtrack_id',
              data['soundtrack'].value as EnumMetadata,
              soundtracks,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Wind'
        editMode={editMode}
        display={
        data['wind'].value ?
            (data['wind'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'wind_id',
              data['wind'].value as EnumMetadata,
              winds,
          )
        }
      </EditSwitchFormField>
    </div>
  );
};
const checkCompletedEnumsLoaded = (
    mappings: Array<[string, string]>| null,
    values: {[key: string]:ApiEnum[]},
) =>{
  if (!mappings || !values) {
    return 0;
  }
  let completed = 0;
  mappings.forEach((enumSet) => {
    const enumValue = enumSet[0];
    if (values[enumValue]) {
      completed = completed + 1;
    }
  });
  return completed;
};

const appendExistingEnums = (
    dataKey: string,
    newEnums: ApiEnum[],
    existingData: {[key: string]:ApiEnum[]},
)=>{
  const replacementData: { [key: string]: ApiEnum[] } = {};
  replacementData[dataKey] = newEnums;
  return {...existingData, ...replacementData};
};

const createNewEnumData = (dataKey: string, newEnums: ApiEnum[])=>{
  const newData: { [key: string]: ApiEnum[] } = {};
  newData[dataKey] = newEnums;
  return newData;
};

const updateEnums = (
    key: string,
    data: ApiEnum[],
    prevState: {[key: string]:ApiEnum[]} | null,
) => {
  return (prevState === null)?
      createNewEnumData(key, data):
      appendExistingEnums(key, data, prevState);
};
const useEnums = (mapping: Array<[string, string]>| null):
    [number, { [key: string]: ApiEnum[]} | null, boolean] => {
  const [loading, setLoading] = useState(false);
  const [loadedEnums, setLoadedEnums] = useState(0);
  const [enums, setEnums] = useState<{[key: string]:ApiEnum[]}| null>(null);
  const handleUpdatingEnums = (res: AxiosResponse, key: string) =>{
    const data = res.data as ApiEnum[];
    setEnums((prevState)=>updateEnums(key, data, prevState));
  };
  const update = () =>{
    if (!loading && mapping) {
      mapping?.forEach(([key, url]) => {
        setLoading(true);
        axios.get(url)
            .then((res)=>handleUpdatingEnums(res, key))
            .catch(console.error);
      });
    }
  };
  useEffect(()=>{
    update();
  }, [mapping, loading, enums]);
  useEffect(()=>{
    if (enums) {
      setLoadedEnums(checkCompletedEnumsLoaded(mapping, enums));
    }
  }, [enums, mapping]);
  const percentDone = mapping ? (loadedEnums/mapping.length): 0;
  return [percentDone, enums, loading];
};

const Optical: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [opticalTypes, setOpticalTypes] = useState<ApiEnum[]|null>(null);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['optical_types', '/api/formats/optical/optical_types'],
      ]: null,
  );
  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setOpticalTypes(enums['optical_types']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>;
  }
  return (
    <div>
      <EditSwitchFormField
        label='Title Of Item'
        editMode={editMode}
        display={data['title_of_item'].value as string}>
        <Form.Control
          name='title_of_item'
          defaultValue={data['title_of_item'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Date Of Item'
        editMode={editMode}
        display={data['date_of_item'].value as string}>
        {
          createDateField(
              'date_of_item',
                data['date_of_item'].value as string,
                'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Duration'
        editMode={editMode}
        display={data['duration'].value as string}>
        <Form.Control
          name='duration'
          defaultValue={data['duration'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Label'
        editMode={editMode}
        display={data['label'].value as string}>
        <Form.Control
          name='label'
          defaultValue={data['label'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Type'
        editMode={editMode}
        display={
        data['type'].value ?
            (data['type'].value as EnumMetadata).name :
            ''}
      >
        {
          createEnumField(
              'type_id',
              data['type'].value as EnumMetadata,
              opticalTypes,
          )
        }
      </EditSwitchFormField>
    </div>
  );
};

const VideoCassette: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['generations', '/api/formats/video_cassette/generations'],
        ['subtypes', '/api/formats/video_cassette/cassette_types'],
      ]: null,
  );
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [cassetteTypes, setCassetteTypes] = useState<ApiEnum[]|null>(null);

  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setGenerations(enums['generations']);
          setCassetteTypes(enums['subtypes']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
    );
  }
  const dateOfCassette = data['date_of_cassette'].value as string;
  const duration = data['duration'].value as string;
  const label = data['label'].value as string;
  const titleOfCassette = data['title_of_cassette'].value as string;
  return (
    <div>
      <EditSwitchFormField
        label='Date Of Cassette'
        editMode={editMode}
        display={dateOfCassette}>
        {
          createDateField(
              'date_of_cassette',
              dateOfCassette,
              'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField label='Duration'
        editMode={editMode}
        display={duration}>
        <Form.Control name='duration' defaultValue={duration}/>
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Label'
        editMode={editMode}
        display={label}>
        <Form.Control name='label' defaultValue={label}/>
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Title Of Cassette'
        editMode={editMode}
        display={titleOfCassette}>
        <Form.Control name='title_of_cassette' defaultValue={titleOfCassette}/>
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Generation'
        editMode={editMode}
        display={
          data['generation'].value ?
            (data['generation'].value as EnumMetadata).name :
              ''}
      >
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Type'
        editMode={editMode}
        display={
          data['cassette_type'].value ?
            (data['cassette_type'].value as EnumMetadata).name :
              ''}
      >
        {
          createEnumField(
              'cassette_type_id',
              data['cassette_type'].value as EnumMetadata,
              cassetteTypes,
          )
        }
      </EditSwitchFormField>
    </div>
  );
};

const AudioCassette: FC<IFormatType> = ({data, editMode}) => {
  const [loading, setLoading] = useState(false);
  const [percentEnumsLoaded, enums, enumsLoading] = useEnums(
      editMode ? [
        ['generations', '/api/formats/audio_cassette/generation'],
        ['subtypes', '/api/formats/audio_cassette/subtype'],
      ]: null,
  );
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [subtypes, setSubTypes] = useState<ApiEnum[]|null>(null);
  useEffect(()=>{
    if (editMode) {
      if (enumsLoading) {
        setLoading(true);
      }
      if (percentEnumsLoaded === 1) {
        setLoading(false);
        if (enums) {
          setGenerations(enums['generations']);
          setSubTypes(enums['subtypes']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode, enumsLoading]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>;
  }
  const cassetteType =
      data['cassette_type'].value ?
          (data['cassette_type'].value as EnumMetadata).name :
          '';

  return (
    <div>
      <EditSwitchFormField
        label='Cassette Title'
        editMode={editMode}
        display={data['cassette_title'].value as string}>
        <Form.Control
          name='cassette_title'
          defaultValue={data['cassette_title'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Type'
        editMode={editMode}
        display={cassetteType}>
        {
          createEnumField(
              'cassette_type_id',
              data['cassette_type'].value as EnumMetadata,
              subtypes,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Date of Cassette'
        editMode={editMode}
        display={data['date_of_cassette'].value as string}>
        {
          createDateField(
              'date_of_cassette',
              data['date_of_cassette'].value as string,
              'm/dd/yyyy',
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Generation'
        editMode={editMode}
        display={cassetteType}>
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
          )
        }
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side A Label'
        editMode={editMode}
        display={data['side_a_label'].value as string}>
        <Form.Control
          name='side_a_label'
          defaultValue={data['side_a_label'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side A Duration'
        editMode={editMode}
        display={data['side_a_duration'].value as string}>
        <Form.Control
          name='side_a_duration'
          defaultValue={data['side_a_duration'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side B Label'
        editMode={editMode}
        display={data['side_b_label'].value as string}>
        <Form.Control
          name='side_b_label'
          defaultValue={data['side_b_label'].value as string}
        />
      </EditSwitchFormField>
      <EditSwitchFormField
        label='Side B Duration'
        editMode={editMode}
        display={data['side_b_duration'].value as string}>
        <Form.Control
          name='side_b_duration'
          defaultValue={data['side_b_duration'].value as string}
        />
      </EditSwitchFormField>
    </div>
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

  const items = data.map(
      (
          item: {
          value?: string | number | boolean | EnumMetadata | null,
          key: string
        },
      ) => {
        return <p key={item.key}>{item.value ? item.value.toString() : ''}</p>;
      });
  return <>{items}</>;
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
        {values}
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
