import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {LoadingPercent} from './Common';
import React, {
  useState,
  useEffect,
  FC,
  Fragment,
  ReactElement,
  useReducer, useRef,
} from 'react';
import axios from 'axios';
import {IItemMetadata} from './ItemApp';
import {ApiEnum, sortNameAlpha, SelectDate} from './Items';
import {Button, ButtonGroup} from 'react-bootstrap';
interface EnumMetadata {
  id: number
  name: string
}

interface Element {
  key: string,
  value: string | number | boolean | EnumMetadata
}

const createEnumField = (
    name: string,
    current: EnumMetadata,
    all: ApiEnum[] | null,
    editMode: boolean,
)=>{
  if (editMode) {
    return (
      <Form.Select
        name={name}
        defaultValue={current ? current.id : ''}
      >
        <option key={-1} value=''/>
        {all ? createEnumOptions(all) :(<></>)}
      </Form.Select>
    );
  }
  return (
    <Form.Control
      size={'sm'}
      readOnly={!editMode}
      plaintext={!editMode}
      defaultValue={current ? current.name : ''}
    />
  );
};

const createEnumOptions = (enumList: EnumMetadata[])=>{
  return enumList.map((item) => {
    return (<option key={item.id} value={item.id}>{item.name}</option>);
  });
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
  const [loadedEnums, setLoadedEnums] = useState(0);
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

  const trackCount = data['track_count'].value as number;

  const [loading, setLoading] = useState(false);

  const enumValues = [
    tapeBases,
    formatSubtypes,
    generations,
    reelSpeeds,
    reelThicknesses,
    reelWidths,
    trackConfigurations,
    reelDiameters,
    winds,
  ];

  useEffect(()=>{
    if (editMode) {
      let completed = 0;
      enumValues.forEach((enumValue) => {
        if (enumValue) {
          completed = completed + 1;
        }
      });
      setLoadedEnums(completed);

      if (!loading) {
        if (!tapeBases) {
          setLoading(true);
          axios.get('/api/formats/open_reel/base')
              .then((res)=> {
                setTapeBases((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!reelDiameters) {
          setLoading(true);
          axios.get('/api/formats/open_reel/reel_diameter')
              .then((res)=> {
                setReelDiameters((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!formatSubtypes) {
          setLoading(true);
          axios.get('/api/formats/open_reel/sub_types')
              .then((res)=> {
                setFormatSubtypes((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!reelSpeeds) {
          setLoading(true);
          axios.get('/api/formats/open_reel/reel_speed')
              .then((res)=> {
                setReelSpeeds((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!generations) {
          setLoading(true);
          axios.get('/api/formats/open_reel/generation')
              .then((res)=> {
                setGenerations((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!reelThicknesses) {
          setLoading(true);
          axios.get('/api/formats/open_reel/reel_thickness')
              .then((res)=> {
                setReelThicknesses((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!reelWidths) {
          setLoading(true);
          axios.get('/api/formats/open_reel/reel_width')
              .then((res)=> {
                setReelWidths((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
        if (!trackConfigurations) {
          setLoading(true);
          axios.get('/api/formats/open_reel/track_configuration')
              .then((res)=> {
                setTrackConfigurations(
                    (res.data as ApiEnum[]).sort(sortNameAlpha),
                );
              }).catch(console.error);
        }
        if (!winds) {
          setLoading(true);
          axios.get('/api/formats/open_reel/wind')
              .then((res)=> {
                setWinds((res.data as ApiEnum[]).sort(sortNameAlpha));
              }).catch(console.error);
        }
      } else {
        if (
          tapeBases &&
          formatSubtypes &&
          generations &&
          reelSpeeds &&
          reelThicknesses &&
          reelWidths &&
          reelDiameters &&
          winds &&
          trackConfigurations
        ) {
          setLoading(false);
        }
      }
    }
  }, [
    editMode,
    tapeBases,
    formatSubtypes,
    generations,
    reelSpeeds,
    reelThicknesses,
    reelWidths,
    winds,
    trackConfigurations,
  ]);
  if (loading) {
    const percentEnumsLoaded =
        Math.round((loadedEnums / enumValues.length) * 100);
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key='title' label="Title of Reel">
        {
          createTextField(
              'title_of_reel',
              data['title_of_reel'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='base' label="Base">
        {
          createEnumField(
              'base_id',
              data['base'].value as EnumMetadata,
              tapeBases,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='dateOfReel' label="Date Of Reel">
        {
          createDateField(
              'date_of_reel',
              data['date_of_reel'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">
        {
          createTextField(
              'duration',
              data['duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='formatSubtype' label="Type">
        {
          createEnumField(
              'format_subtype_id',
              data['format_subtype'].value as EnumMetadata,
              formatSubtypes,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelBrand' label="Brand of Reel">
        {
          createTextField('reel_brand',
              data['reel_brand'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelDiameter' label="Diameter of Reel">
        {
          createEnumField(
              'reel_diameter_id',
              data['reel_diameter'].value as EnumMetadata,
              reelDiameters,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelSpeed' label="Speed of Reel">
        {
          createEnumField(
              'reel_speed_id',
              data['reel_speed'].value as EnumMetadata,
              reelSpeeds,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelThickness' label="Thickness of Reel">
        {
          createEnumField(
              'reel_thickness_id',
              data['reel_thickness'].value as EnumMetadata,
              reelThicknesses,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelType' label="Type of Reel">
        {
          createTextField(
              'reel_type',
              data['reel_type'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='reelWidth' label="Width of Reel">
        {
          createEnumField(
              'reel_width_id',
              data['reel_width'].value as EnumMetadata,
              reelWidths,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='trackConfiguration' label="Track Configuration">
        {
          createEnumField(
              'track_configuration_id',
              data['track_configuration'].value as EnumMetadata,
              trackConfigurations,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='trackCount' label="Track Count">
        {createNumberField(
            'track_count',
            trackCount ? trackCount: null,
            editMode,
            0,
        )}
      </FormatDetail>
      <FormatDetail key='wind' label="Wind">
        {
          createEnumField(
              'wind_id',
              data['wind'].value as EnumMetadata,
              winds,
              editMode,
          )
        }
      </FormatDetail>
    </Fragment>
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

  // const [loadedEnums, setLoadedEnums] = useState(0);
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
  }, [enums, percentEnumsLoaded, editMode]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key='titleOfAlbum' label="Title of Album">
        {
          createTextField(
              'title_of_album',
              data['title_of_album'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='titleOfDisc' label="Title of Disc">
        {
          createTextField(
              'title_of_disc',
              data['title_of_disc'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='discBase' label="Base">
        {
          createEnumField(
              'disc_base_id',
              data['disc_base'].value as EnumMetadata,
              discBases,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='dateOfDisc' label="Date Of Disc">
        {
          createDateField(
              'date_of_disc',
              data['date_of_disc'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='discDiameter' label="Disc Diameter">
        {
          createEnumField(
              'disc_diameter_id',
              data['disc_diameter'].value as EnumMetadata,
              discDiameters,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='discDirection' label="Playback Direction">
        {
          createEnumField(
              'playback_direction_id',
              data['playback_direction'].value as EnumMetadata,
              playbackDirections,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='discMaterial' label="Disc Material">
        {
          createEnumField(
              'disc_material_id',
              data['disc_material'].value as EnumMetadata,
              discMaterials,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='playbackSpeed' label="Playback Speed">
        {
          createEnumField(
              'playback_speed_id',
              data['playback_speed'].value as EnumMetadata,
              playbackSpeeds,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        {
          createTextField(
              'side_a_label',
              data['side_a_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        {
          createTextField(
              'side_a_duration',
              data['side_a_duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        {
          createTextField(
              'side_b_label',
              data['side_b_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        {
          createTextField(
              'side_b_duration',
              data['side_b_duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
    </Fragment>
  );
};

const createNullField = (name: string) =>{
  return <Form.Control name={name} value='' readOnly={true} plaintext={true}/>;
};

const createNumberField = (
    name: string,
    current: number | null,
    editMode: boolean,
    minimum: number | null = null,
    maximum: number | null = null,
)=>{
  return (
    <Form.Control
      name={name}
      type='number'
      min={minimum === null ? undefined: minimum}
      max={maximum === null ? undefined: maximum}
      readOnly={!editMode}
      plaintext={!editMode}
      defaultValue={current ? current: undefined}/>
  );
};
const createTextField = (name: string, current: string, editMode: boolean)=>{
  return (
    <Form.Control
      name={name}
      readOnly={!editMode}
      plaintext={!editMode}
      defaultValue={current}/>
  );
};

const createDateField = (
    name: string,
    current: string | null,
    dateFormat: string,
    editMode: boolean,
)=>{
  if (editMode) {
    return (
      <Form.Group>
        <SelectDate
          name={name}
          dateFormat={dateFormat}
          defaultValue={current ? current: ''}
        />
      </Form.Group>
    );
  }
  return (
    <Form.Control
      name={name}
      readOnly={!editMode}
      plaintext={!editMode}
      defaultValue={current ? current: ''}/>
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

  const adTestLevel = data['ad_test_level'].value as string;
  const selectedAdStrip = useRef<HTMLInputElement>(null);

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
          setEmulsions(enums['film_emulsions']);
          setFilmGauges(enums['film_gauges']);
        }
      }
    }
  }, [enums, percentEnumsLoaded, editMode]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key='dateOfFilm' label="Date Of Film">
        {
          createDateField(
              'date_of_film',
              data['date_of_film'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='adStripTest' label="AD Strip Test Performed">
        <Form.Check
          checked={adStripPerformed}
          type="checkbox"
          ref={selectedAdStrip}
          onChange={setAdStripPerformed}
          disabled={!editMode}
        />
      </FormatDetail>
      <FormatDetail key='adTestDate' label="AD Test Date">
        <fieldset disabled={!adStripPerformed}>
          { adStripPerformed ?
              createDateField(
                  'ad_test_date',
                  data['ad_test_date'].value as string,
                  'm/dd/yyyy',
                  editMode,
              ): createNullField('adTestDate')
          }
        </fieldset>
      </FormatDetail>
      <FormatDetail key='adTestLevel' label="AD Test Level">
        <fieldset disabled={!adStripPerformed}>
          { adStripPerformed ?
              createNumberField(
                  'ad_test_level',
                adTestLevel ? parseInt(adTestLevel): null,
                editMode,
                0,
              ): createNullField('adTestLevel')
          }
        </fieldset>
      </FormatDetail>
      <FormatDetail key='canLabel' label="Can Label">
        {
          createTextField(
              'can_label',
              data['can_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='duration' label="Duration">
        {
          createTextField(
              'duration',
              data['duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmTitle' label="Film Title">
        {
          createTextField(
              'film_title',
              data['film_title'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='leaderLabel' label="Leader Label">
        {
          createTextField(
              'leader_label',
              data['leader_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='edgeCodeDate' label="Edge Code Date">
        {
          createNumberField(
              'edge_code_date',
              data['edge_code_date'].value as number,
              editMode,
              0,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmLength' label='Film Length'>
        {
          createNumberField(
              'film_length',
            data['film_length'].value as number,
            editMode,
            0,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmShrinkage' label='Film Shrinkage'>
        {
          createNumberField(
              'film_shrinkage',
            data['film_shrinkage'].value as number,
            editMode,
            0,
            100,
          )
        }
      </FormatDetail>
      <FormatDetail key='color' label='Color'>
        {
          createEnumField(
              'film_color_id',
              data['color'].value as EnumMetadata,
              colors,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmBase' label='Film Base'>
        {
          createEnumField(
              'film_base_id',
              data['film_base'].value as EnumMetadata,
              bases,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmEmulsion' label='Film Emulsion'>
        {
          createEnumField(
              'film_emulsion_id',
              data['film_emulsion'].value as EnumMetadata,
              emulsions,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmImageType' label='Film Image Type'>
        {
          createEnumField(
              'image_type_id',
              data['film_image_type'].value as EnumMetadata,
              imageTypes,
              editMode,
          )

        }
      </FormatDetail>
      <FormatDetail key='filmSpeed' label='Film Speed'>
        {
          createEnumField(
              'film_speed_id',
              data['film_speed'].value as EnumMetadata,
              speeds,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='filmGauge' label='Film Gauge'>
        {
          createEnumField(
              'film_gauge_id',
              data['film_gauge'].value as EnumMetadata,
              filmGauges,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='soundtrack' label='Soundtrack'>
        {
          createEnumField(
              'soundtrack_id',
              data['soundtrack'].value as EnumMetadata,
              soundtracks,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='wind' label='Wind'>
        {
          createEnumField(
              'wind_id',
              data['wind'].value as EnumMetadata,
              winds,
              editMode,
          )
        }
      </FormatDetail>
    </Fragment>
  );
};
const useEnums = (mapping: Array<[string, string]>| null):
    [number, { [key: string]: ApiEnum[]} | null, boolean] => {
  const [loading, setLoading] = useState(false);
  const [loadedEnums, setLoadedEnums] = useState(0);
  const [enums, setEnums] = useState<{[key: string]:ApiEnum[]}| null>(null);

  const checkCompleted = (values: {[key: string]:ApiEnum[]}) =>{
    if (!mapping) {
      return 0;
    }
    let completed = 0;
    if (!values) {
      return 0;
    }
    mapping.forEach(([enumValue, _url]) => {
      if (values[enumValue]) {
        completed = completed + 1;
      }
    });
    return completed;
  };

  useEffect(()=>{
    if (mapping) {
      if (!enums) {
        if (!loading) {
          mapping.forEach(([key, url]) => {
            setLoading(true);
            axios.get(url)
                .then((res) => {
                  const data = res.data as ApiEnum[];
                  setEnums((prevState) => {
                    if (prevState !== null) {
                      const newData: { [key: string]: ApiEnum[] } = {};
                      newData[key] = data;
                      return {...prevState, ...newData};
                    }
                    const newData: { [key: string]: ApiEnum[] } = {};
                    newData[key] = data;
                    return newData;
                  });
                })
                .catch(console.error);
          });
        }
      }
    }
  }, [mapping, loading, enums]);

  useEffect(()=>{
    if (mapping) {
      if (loading) {
        let loadedEverything = true;
        mapping.every(
            ([enumValue, _url]) => {
              if (enums !== null) {
                if ( (enumValue in enums) ) {
                  return true;
                }
                loadedEverything = false;
                return false;
              }
            },
        );
      }
    }
  }, [enums]);
  useEffect(()=>{
    if (enums) {
      setLoadedEnums(checkCompleted(enums));
    }
  }, [enums]);
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
  }, [enums, percentEnumsLoaded, editMode]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key="titleOfItem" label="Title Of Item">
        {
          createTextField(
              'title_of_item',
              data['title_of_item'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="dateOfItem" label="Date Of Item">
        {
          createDateField(
              'date_of_item',
              data['date_of_item'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        {
          createTextField(
              'duration',
              data['duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        {
          createTextField(
              'label',
              data['label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="type" label="Type">
        {
          createEnumField(
              'type',
              data['type'].value as EnumMetadata,
              opticalTypes,
              editMode,
          )
        }
      </FormatDetail>
    </Fragment>
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
  }, [enums, percentEnumsLoaded, editMode]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key="dateOfCassette" label="Date Of Cassette">
        {
          createDateField(
              'date_of_cassette',
              data['date_of_cassette'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="duration" label="Duration">
        {
          createTextField(
              'duration',
            data['duration'].value as string,
            editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="label" label="Label">
        {
          createTextField(
              'label',
              data['label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="titleOfCassette" label="Title Of Cassette">
        {
          createTextField(
              'title_of_cassette',
              data['title_of_cassette'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key="generation" label="Generation">
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        {
          createEnumField(
              'cassette_type',
              data['cassette_type'].value as EnumMetadata,
              cassetteTypes,
              editMode,
          )
        }
      </FormatDetail>
    </Fragment>
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
  }, [enums, percentEnumsLoaded, editMode]);
  useEffect(()=>{
    setLoading(enumsLoading);
  }, [enumsLoading]);
  if (loading) {
    return (
      <tr>
        <td rowSpan={2} style={{textAlign: 'center'}}>
          <LoadingPercent percentLoaded={percentEnumsLoaded * 100}/>
        </td>
      </tr>
    );
  }
  return (
    <Fragment>
      <FormatDetail key='cassetteTitle' label="Cassette Title">
        {
          createTextField(
              'cassette_title',
              data['cassette_title'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='cassetteType' label="Type">
        {
          createEnumField(
              'cassette_type_id',
              data['cassette_type'].value as EnumMetadata,
              subtypes,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='dateOfCassette' label="Date of Cassette">
        {
          createDateField(
              'date_of_cassette',
              data['date_of_cassette'].value as string,
              'm/dd/yyyy',
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='generation' label="Generation">
        {
          createEnumField(
              'generation_id',
              data['generation'].value as EnumMetadata,
              generations,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideALabel' label="Side A Label">
        {
          createTextField(
              'side_a_label',
              data['side_a_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideADuration' label="Side A Duration">
        {
          createTextField(
              'side_a_duration',
              data['side_a_duration'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideBLabel' label="Side B Label">
        {
          createTextField(
              'side_b_label',
              data['side_b_label'].value as string,
              editMode,
          )
        }
      </FormatDetail>
      <FormatDetail key='sideBDuration' label="Side B Duration">
        {
          createTextField(
              'side_b_duration',
              data['side_b_duration'].value as string,
              editMode,
          )
        }
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
