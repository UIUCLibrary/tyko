import React, {
  ChangeEvent,
  FC,
  useEffect, useRef,
  useState,
  Component, SyntheticEvent,
} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import {Datepicker} from 'vanillajs-datepicker';
import {CalendarEvent} from 'react-bootstrap-icons';

import axios from 'axios';
import {Button, Col, Row, CloseButton} from 'react-bootstrap';
import {LoadingIndeterminate, LoadingPercent} from './Common';
export interface ApiEnum{
  id: number
  name: string
}

interface FormatDetails{
  [key: string]: string | number | boolean | ApiEnum
}

interface Item{
  files: string[]
  format: {
    id: number,
    name: string
  }
  elements: Element[]
  format_details: FormatDetails
  format_id: number
  item_id: number
  name: string
  routes: {
    api: string,
    frontend: string
  }
}

interface IObject {
  items: Item[]
  routes: {
    api: string
    frontend: string
  }
}


interface ConfirmRemovalDialogProps {
  modalName: string
  onAccepted?: (event: React.SyntheticEvent) => void
}


const mapEnumToOption = (i: ApiEnum) =>{
  return <option key={i.id} value={i.id}>{i.name}</option>;
};

/**
 * Confirm removal of item from object dialog box.
 */
class ConfirmRemovalDialog extends Component<ConfirmRemovalDialogProps> {
  modalName: string;
  onAccepted?: (event: React.SyntheticEvent)=>void;

  /**
   * Confirm removal dialog box.
   * @param {ConfirmRemovalDialogProps} props
   */
  constructor(props: ConfirmRemovalDialogProps) {
    super(props);

    this.modalName = props.modalName;
    this.onAccepted = this.props.onAccepted;
  }

  /**
   * Render
   * @return {JSXElement} element
   */
  render() {
    const modalTitleId = `${this.modalName}RemovalTitle`;
    const modalRemovalBodyId = `${this.modalName}RemovalBody`;
    const modalMessageId = `${this.modalName}Message`;
    const closeButtonHandler = (
      (event: React.SyntheticEvent) => {
        if (this.onAccepted) {
          this.onAccepted(event);
        }
      });
    return (
      <div className="modal fade" id={this.modalName} tabIndex={-1}
        role="dialog"
        aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={modalTitleId}>
                  Are you Sure?
              </h5>
              <button type="button" className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close">
              </button>
            </div>
            <div className="modal-body" id={modalRemovalBodyId}>
              <p id={modalMessageId}>
                  Are you sure you want to remove this?
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary"
                data-bs-dismiss="modal">Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={closeButtonHandler}
                id="confirmButton"
                data-bs-dismiss="modal">Remove Item
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Item edit option button
 * @param {string} frontendUrl url for details
 * @param {string} apiUrl api for deleting
 * @param {onRemoval} onRemoval callback for delete
 * @constructor
 */
function ItemOptionsButton(
    {
      frontendUrl,
      apiUrl,
      onRemoval,
    }: { frontendUrl: string, apiUrl: string, onRemoval?: (url: string)=>void},
) {
  const onAccepted = () =>{
    if (onRemoval) {
      onRemoval(apiUrl);
    }
  };

  return (
    <div className="btn-group-sm justify-content-end"
      role="group"
      aria-label="Options"
    >
      <button type="button"
        className="btn btn-sm btn-secondary dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
      </button>
      <div className="dropdown-menu">
        <button className="dropdown-item" onClick={()=> {
          window.location.href = frontendUrl;
        }}>Edit</button>
        <button className="dropdown-item btn-danger"
          data-bs-target="#removeItemModal" data-bs-toggle="modal"
          data-apiroute={apiUrl}>Remove
        </button>
      </div>
      <ConfirmRemovalDialog modalName="removeItemModal"
        onAccepted={onAccepted}
      />
    </div>
  );
}

/**
 * Items list
 * @constructor
 */
export default function Items(
    {
      items=[],
      onRemoval,
    }: { items?: Item[], onRemoval? :(url: string)=>void}) {
  const itemsRendered = items.map((i: Item) => {
    return (
      <tr key={i.item_id}>
        <td>
          <a href={i.routes.frontend}>{i.name} </a>
        </td>
        <td>{i.format.name}</td>
        <td>
          <ItemOptionsButton
            frontendUrl={i.routes.frontend}
            apiUrl={i.routes.api}
            onRemoval={onRemoval}
          />
        </td>
      </tr>
    );
  });
  return (
    <React.Fragment>
      {itemsRendered}
    </React.Fragment>
  );
}

interface ISelectDate{
  dateFormat: string,
  name: string
  defaultValue?: string
  placeholder?: string,
  disabled?: boolean
}

export const SelectDate: FC<ISelectDate> = (
    {dateFormat, name, placeholder, disabled, defaultValue},
) =>{
  const inputText = useRef<HTMLInputElement>(null);
  return (
    <Form.Group className="input-group">
      <Form.Control
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        ref={inputText}
        disabled={disabled ? disabled: false}
      />
      <Button
        type="button"
        variant="outline-secondary"
        onClick={() =>
          openDateSelect(
              inputText ? inputText.current : null,
              dateFormat,
          )
        }
        disabled={disabled ? disabled: false}
      >
        <CalendarEvent/>
      </Button>
    </Form.Group>
  );
};

/**
 * Open date select helper
 * @param {HTMLInputElement} target
 * @param {string} format
 */
function openDateSelect(
    target: HTMLInputElement | null,
    format = 'yyyy-mm-dd',
) {
  if (!target) {
    return;
  }
  const datepicker = new Datepicker(target, {
    buttonClass: 'btn',
    format: format,
  });
  datepicker.show();
}

export const sortNameAlpha = (a: ApiEnum, b: ApiEnum) =>{
  return a.name < b.name ? -1: 1;
};

const ADStripSection: FC = () =>{
  const [checked, setChecked] = useState(false);
  const handleToggle = (event:SyntheticEvent) =>{
    setChecked((event.target as HTMLInputElement).checked);
  };

  const toggle = <>
    <Form.Check onChange={handleToggle} type="checkbox" id="filmADStripTest"/>
  </>;

  const subSettings = <>
    <Col>
      <Form.Group as={Col} controlId="formFilmADStripTestDate">
        <Form.Label>A-D Strip Test Date</Form.Label>
        <SelectDate
          name="filmADStripTestDate"
          dateFormat='m/d/yyyy'
          disabled={!checked}/>
      </Form.Group>
    </Col>
    <Col>
      <Form.Group as={Col} controlId="FormFilmADStripTestLevel">
        <Form.Label>A-D Strip Level</Form.Label>
        <Form.Select name="filmADStripTestLevel" disabled={!checked}>
          <option value=""></option>
          <option value="1">0</option>
          <option value="2">1</option>
          <option value="3">2</option>
          <option value="4">3</option>
          <option value="5">4</option>
        </Form.Select>
      </Form.Group>
    </Col>
  </>;

  return (
    <>
      <Row>
        <Col sm={2}>
          <Form.Label>A-D Strip</Form.Label>
        </Col>
        <Col>
          {toggle}
        </Col>
      </Row>
      <Row>
        <Col sm={2}/>
        {subSettings}
      </Row>
    </>
  );
};

export const FilmOnlyData: FC = ()=>{
  const [filmSpeeds, setFilmSpeeds] = useState<ApiEnum[] | null>(null);
  const [filmBase, setFilmBase] = useState<ApiEnum[] | null>(null);
  const [filmImageType, setFilmImageType] = useState<ApiEnum[] | null>(null);
  const [filmSoundtrack, setFilmSoundtrack] = useState<ApiEnum[] | null>(null);
  const [filmColor, setFilmColor] = useState<ApiEnum[] | null>(null);
  const [wind, setWind] = useState<ApiEnum[] | null>(null);
  const [emulsion, setEmulsion] = useState<ApiEnum[] | null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);

  useEffect(()=>{
    const enums = [
      filmSpeeds,
      filmBase,
      filmImageType,
      filmSoundtrack,
      filmColor,
      wind,
      emulsion,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [
    filmSpeeds,
    filmBase,
    filmImageType,
    filmSoundtrack,
    filmColor,
    wind,
    emulsion,
  ]);
  useEffect(()=>{
    axios.get('/api/formats/film/film_speed')
        .then((res)=> {
          setFilmSpeeds((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/film/film_base')
        .then((res)=> {
          setFilmBase((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/film/image_type')
        .then((res)=> {
          setFilmImageType((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/film/soundtrack')
        .then((res)=> {
          setFilmSoundtrack((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/film/color')
        .then((res)=> {
          setFilmColor((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/film/wind')
        .then((res)=> {
          setWind((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/film/film_emulsion')
        .then((res)=> {
          setEmulsion((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (
    !filmSpeeds ||
    !filmBase ||
    !filmImageType ||
    !filmSoundtrack ||
    !filmColor ||
    !wind ||
    !emulsion
  ) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of film</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="filmTitle"
            placeholder="Transcription of information recorded on the can label"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Film</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="filmDate"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Can label</Form.Label>
        </Col>
        <Col>
          <Form.Control
            id="filmCanLabel"
            type="text"
            name="filmCanLabel"
            placeholder="Transcription of information recorded on the can label"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Leader label</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="filmLeaderLabel"
            placeholder=
              "Transcription of information recorded on the leader label"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Length (ft)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="number"
            min="0"
            id="filmLength"
            name="filmLength"
            placeholder="length of the film"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Duration (HH:MM:SS)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            id="filmDuration"
            className="form-control"
            name="filmDuration"
            placeholder="how long the content runs"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>
            Speed (fps)
          </Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmSpeedId"
            aria-label="filmSpeed"
            id="filmSpeed"
            defaultValue={''}
          >
            <option value=""/>
            {filmSpeeds.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Base</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmBaseId"
            id="filmBase"
            aria-label="base"
            defaultValue={''}
          >
            <option value=""/>
            {filmBase.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Image Type</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmImageTypeId"
            id="filmImageType"
            aria-label="imageType"
            defaultValue={''}>
            <option value=""/>
            {filmImageType.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Soundtrack</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmSoundtrackId"
            id="filmSoundtrack"
            aria-label="soundtrack"
            defaultValue={''}>
            <option value=""/>
            {filmSoundtrack.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Color</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmColorId"
            id="filmColor"
            aria-label="color"
            defaultValue={''}>
            <option value=""/>
            {filmColor.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Shrinkage (%)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="number"
            min="1900"
            id="filmEdgeCodeDate"
            name="filmEdgeCodeDate"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Film Wind</Form.Label>
        </Col>
        <Col>

          <Form.Select
            name="filmWindId"
            id="filmWind"
            aria-label="wind"
            defaultValue={''}>
            <option value=""/>
            {wind.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Emulsion</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="filmEmulsionId"
            id="filmEmulsion"
            aria-label="filmEmulsion"
            defaultValue={''}>
            <option value=""/>
            {emulsion.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <ADStripSection/>

      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Shrinkage (%)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="number"
            min="0"
            max="100"
            id="filmShrinkage"
            name="filmShrinkage"
          />
        </Col>
      </Form.Group>
    </>
  );
};
export const CassetteOnlyData: FC = ()=>{
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [subtypes, setSubTypes] = useState<ApiEnum[]|null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);
  useEffect(()=>{
    const enums = [
      generations,
      subtypes,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [
    generations,
    subtypes,
  ]);
  useEffect(()=>{
    axios.get('/api/formats/audio_cassette/generation')
        .then((res)=> {
          setGenerations((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/audio_cassette/subtype')
        .then((res)=> {
          setSubTypes((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (!generations || !subtypes) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Cassette</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            id="cassetteTitle"
            name="cassetteTitle"
            required
          />
        </Col>
      </Form.Group>

      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Cassette</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="dateOfCassette"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Cassette Type</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="cassetteTypeId"
            id="cassetteType"
            aria-label="subtype"
            defaultValue=''>
            <option value=""/>
            {subtypes.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Generation</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="generationId"
            id="generation"
            aria-label='generation'
            defaultValue={''}
          >
            <option value=""></option>
            {generations.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Side A</Form.Label>
        </Col>
        <Col>
          <Row>
            <Form.Group as={Col} controlId="cassetteSideALabel">
              <Form.Label>Label</Form.Label>
              <Form.Control type="text" name="cassetteSideALabel"/>
            </Form.Group>
            <Form.Group as={Col} controlId="cassetteSideADuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control type="text" name="cassetteSideADuration"/>
            </Form.Group>
          </Row>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Side B</Form.Label>
        </Col>
        <Col>
          <Row>
            <Form.Group as={Col} controlId="cassetteSideBLabel">
              <Form.Label>Label</Form.Label>
              <Form.Control type="text" name="cassetteSideBLabel"/>
            </Form.Group>
            <Form.Group as={Col} controlId="cassetteSideBDuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control type="text" name="cassetteSideBDuration"/>
            </Form.Group>
          </Row>
        </Col>
      </Form.Group>
    </>
  );
};


export const GrooveDiscOnlyData: FC = ()=>{
  const [discBase, setDiscBase] = useState<ApiEnum[] | null>(null);
  const [discDiameter, setDiscDiameter] = useState<ApiEnum[] | null>(null);
  const [discMaterial, setDiscMaterial] = useState<ApiEnum[] | null>(null);

  const [
    playbackDirection,
    setPlaybackDirection,
  ] = useState<ApiEnum[] | null>(null);

  const [playbackSpeed, setPlaybackSpeed] = useState<ApiEnum[] | null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);

  useEffect(()=>{
    const enums = [
      discBase,
      discDiameter,
      discMaterial,
      playbackDirection,
      playbackSpeed,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [
    discBase,
    discDiameter,
    discMaterial,
    playbackDirection,
    playbackSpeed,
  ]);
  useEffect(()=>{
    axios.get('/api/formats/grooved_disc/disc_base')
        .then((res)=> {
          setDiscBase((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get( '/api/formats/grooved_disc/disc_material')
        .then((res)=> {
          setDiscMaterial((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/grooved_disc/disc_diameter')
        .then((res)=> {
          setDiscDiameter(res.data as ApiEnum[]);
        }).catch(console.error);

    axios.get('/api/formats/grooved_disc/playback_direction')
        .then((res)=> {
          setPlaybackDirection((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/grooved_disc/playback_speed')
        .then((res)=> {
          setPlaybackSpeed((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (
    !discBase ||
    !discDiameter ||
    !discMaterial ||
    !playbackDirection ||
    !playbackSpeed
  ) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Album</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="groovedDiscTitleOfAlbum"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Disc</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="groovedDiscTitleOfDisc"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Side A</Form.Label>
        </Col>
        <Col>
          <Row>
            <Form.Group as={Col} controlId="groovedDiscSideALabel">
              <Form.Label>Label</Form.Label>
              <Form.Control type="text" name="groovedDiscSideALabel"/>
            </Form.Group>
            <Form.Group as={Col} controlId="groovedDiscSideADuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control type="text" name="groovedDiscSideADuration"/>
            </Form.Group>
          </Row>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Side B</Form.Label>
        </Col>
        <Col>
          <Row>
            <Form.Group as={Col} controlId="groovedDiscSideBLabel">
              <Form.Label>Label</Form.Label>
              <Form.Control type="text" name="groovedDiscSideBLabel"/>
            </Form.Group>
            <Form.Group as={Col} controlId="groovedDiscSideBDuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control type="text" name="groovedDiscSideBDuration"/>
            </Form.Group>
          </Row>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Disc (M/D/YYYY)</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="groovedDiscDateOfDisc"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Disc Diameter (inches)</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="groovedDiscDiscDiameterId"
            id="groovedDiscDiscDiameter"
            aria-label="discDiameter"
            defaultValue={''}>
            <option value=""></option>
            {discDiameter.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Disc Material</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="groovedDiscDiscMaterialId"
            id="groovedDiscDiscMaterial"
            aria-label="material"
            defaultValue={''}>
            <option value=""/>
            {discMaterial.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Disc Base</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="groovedDiscDiscBaseId"
            id="groovedDiscDiscBase"
            aria-label="base"
            defaultValue={''}>
            <option value=""></option>
            {discBase.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Playback Direction</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="groovedDiscDiscDirectionId"
            id="groovedDiscDiscDirection"
            aria-label="playbackDirection"
            defaultValue={''}>
            <option value=""/>
            {playbackDirection.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Playback Speed (rpm)</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="groovedDiscPlaybackSpeedId"
            id="groovedDiscPlaybackSpeed"
            aria-label="playbackSpeed"
            defaultValue={''}
          >
            <option value=""></option>
            {playbackSpeed.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
    </>
  );
};

export const OpenReelOnlyData: FC = ()=>{
  const [tapeBase, setTapeBase] = useState<ApiEnum[] | null>(null);
  const [generation, setGeneration] = useState<ApiEnum[] | null>(null);
  const [reelDiameter, setReelDiameter] = useState<ApiEnum[] | null>(null);
  const [reelSpeed, setReelSpeed] = useState<ApiEnum[] | null>(null);
  const [reelThickness, setReelThickness] = useState<ApiEnum[] | null>(null);
  const [reelWidth, setReelWidth] = useState<ApiEnum[] | null>(null);
  const [subTypes, setSubTypes] = useState<ApiEnum[] | null>(null);
  const [
    trackConfiguration,
    setTrackConfiguration,
  ] = useState<ApiEnum[] | null>(null);
  const [wind, setWind] = useState<ApiEnum[] | null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);

  useEffect(()=>{
    const enums = [
      tapeBase,
      generation,
      reelDiameter,
      reelSpeed,
      reelThickness,
      reelWidth,
      subTypes,
      trackConfiguration,
      wind,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [
    tapeBase,
    generation,
    reelDiameter,
    reelSpeed,
    reelThickness,
    reelWidth,
    subTypes,
    trackConfiguration,
    wind,
  ]);
  useEffect(()=>{
    axios.get('/api/formats/open_reel/base')
        .then((res)=> {
          setTapeBase((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get( '/api/formats/open_reel/generation')
        .then((res)=> {
          setGeneration((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/open_reel/reel_diameter')
        .then((res)=> {
          setReelDiameter(res.data as ApiEnum[]);
        }).catch(console.error);

    axios.get('/api/formats/open_reel/reel_speed')
        .then((res)=> {
          setReelSpeed((res.data as ApiEnum[]));
        }).catch(console.error);

    axios.get('/api/formats/open_reel/reel_thickness')
        .then((res)=> {
          setReelThickness((res.data as ApiEnum[]));
        }).catch(console.error);

    axios.get('/api/formats/open_reel/reel_width')
        .then((res)=> {
          setReelWidth((res.data as ApiEnum[]));
        }).catch(console.error);

    axios.get('/api/formats/open_reel/sub_types')
        .then((res)=> {
          setSubTypes((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);

    axios.get('/api/formats/open_reel/track_configuration')
        .then((res)=> {
          setTrackConfiguration((res.data as ApiEnum[]));
        }).catch(console.error);

    axios.get('/api/formats/open_reel/wind')
        .then((res)=> {
          setWind((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (
    !tapeBase ||
    !generation ||
    !reelDiameter ||
    !reelSpeed ||
    !reelThickness ||
    !reelWidth ||
    !subTypes ||
    !trackConfiguration ||
    !wind
  ) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Reel</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="openReelReelTitle"
            placeholder="item name per finding aid or catalog record"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Type</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelSubTypeId"
            id="openReelReelSubType"
            aria-label="subtypes"
            defaultValue={''}>
            <option value=""></option>
            {subTypes.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Width (inches)</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelReelWidthId"
            id="openReelReelWidth"
            aria-label="reelWidth"
            defaultValue={''}>
            <option value=""></option>
            {reelWidth.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Reel (M/D/YYYY)</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="openReelDateOfReel"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Track Count</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="number"
            name="openReelTrackCount"
            placeholder="how many tracks are included on the reel"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Size (inches)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="number"
            name="openReelReelSize"
            placeholder="measurement of the size of the reel"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>
            Reel Diameter (inches)
          </Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelReelDiameterId"
            id="openReelReelDiameter"
            aria-label="reelDiameter"
            defaultValue={''}>
            <option value=""></option>
            {reelDiameter.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel type</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="openReelReelType"
            placeholder="the type of reel"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Thickness (mil)</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelReelThicknessId"
            id="openReelReelThickness"
            aria-label="reelThickness"
            defaultValue={''}>
            <option value=""></option>
            {reelThickness.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Brand</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="openReelReelBrand"
            placeholder="the brand of the reel"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Base</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelBaseId"
            id="openReelBase"
            aria-label="base"
            defaultValue={''}>
            <option value=""></option>
            {tapeBase.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Wind</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelWindId"
            id="openReelWind"
            aria-label="wind"
            defaultValue={''}>
            <option value=""></option>
            {wind.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Reel Speed (ips)</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelReelSpeedId"
            id="openReelReelSpeed"
            aria-label="reelSpeed"
            defaultValue={''}>
            <option value=""></option>
            {reelSpeed.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Track Configuration</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelTrackConfigurationId"
            id="openReelTrackConfiguration"
            aria-label="trackConfiguration"
            defaultValue={''}>
            <option value=""></option>
            {trackConfiguration.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Duration (HH:MM:SS)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="openReelDuration"
            placeholder="how long the content runs"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Generation</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="openReelGenerationId"
            id="openReelGeneration"
            aria-label="generation"
            defaultValue={''}>
            <option value=""></option>
            {generation.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
    </>
  );
};


export const OpticalOnlyData: FC = ()=>{
  const [opticalTypes, setOpticalTypes] = useState<ApiEnum[] | null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);

  useEffect(()=>{
    const enums = [
      opticalTypes,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [opticalTypes]);
  useEffect(()=>{
    axios.get('/api/formats/optical/optical_types')
        .then((res)=> {
          setOpticalTypes((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (!opticalTypes) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Item</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="opticalTitleOfItem"
            placeholder="item name per finding aid or catalog record"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Label</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="opticalLabel"
            placeholder="transcription of information recorded on the label"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Item (M/D/YYYY)</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="opticalDateOfItem"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Optical Type</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="opticalTypeId"
            id="opticalType"
            aria-label='type'
            defaultValue={''}>
            <option value=""></option>
            {opticalTypes.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Duration (HH:MM:SS)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="opticalDuration"
            placeholder="how long the content runs"
          />
        </Col>
      </Form.Group>
    </>
  );
};


export const VideoOnlyData: FC = ()=>{
  const [videoTypes, setVideoTypes] = useState<ApiEnum[] | null>(null);
  const [generations, setGenerations] = useState<ApiEnum[] | null>(null);
  const [percentEnumsLoaded, setPercentEnumsLoaded] = useState(0);

  useEffect(()=>{
    const enums = [
      generations,
      videoTypes,
    ];
    let completed = 0;
    for (const enumList of enums) {
      if (enumList) {
        completed += 1;
      }
    }
    setPercentEnumsLoaded(Math.round((completed / enums.length) * 100));
  },
  [generations, videoTypes]);
  useEffect(()=>{
    axios.get('/api/formats/video_cassette/cassette_types')
        .then((res)=> {
          setVideoTypes((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
    axios.get('/api/formats/video_cassette/generations')
        .then((res)=> {
          setGenerations((res.data as ApiEnum[]).sort(sortNameAlpha));
        }).catch(console.error);
  }, []);

  if (!generations || ! videoTypes) {
    return (
      <div>
        <LoadingPercent percentLoaded={percentEnumsLoaded}/>
      </div>
    );
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Title of Cassette</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="titleOfCassette"
            placeholder="Item name per finding aid or catalog record"
            required
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Label</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="label"
            placeholder=
              "Transcription of information recorded on the side A label"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Date of Cassette (M/D/YYYY)</Form.Label>
        </Col>
        <Col>
          <SelectDate
            name="dateOfCassette"
            dateFormat='m/d/yyyy'
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Cassette Type</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="cassetteTypeId"
            id="videoCassetteCassetteType"
            aria-label="type"
            defaultValue={''}>
            <option value=""></option>
            {videoTypes.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Duration (HH:MM:SS)</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="duration"
            placeholder="How long the content runs"
          />
        </Col>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Col sm={2}>
          <Form.Label>Generation</Form.Label>
        </Col>
        <Col>
          <Form.Select
            name="generationId"
            aria-label="generation"
            id="videoCassetteGeneration"
            defaultValue={''}>
            <option value=""></option>
            {generations.map(mapEnumToOption)}
          </Form.Select>
        </Col>
      </Form.Group>
    </>
  );
};

export const FormatSpecificFields:FC<{type: ApiEnum| null}> = ({type}) =>{
  if (!type) {
    return (<></>);
  }
  const options: {[key: string]: FC} = {
    'audio cassette': CassetteOnlyData,
    'film': FilmOnlyData,
    'open reel': OpenReelOnlyData,
    'grooved disc': GrooveDiscOnlyData,
    'optical': OpticalOnlyData,
    'video cassette': VideoOnlyData,
  };
  const Format = type.name in options ? options[type.name] : null;
  if (!Format) {
    return <div></div>;
  }
  return (<div>
    {<Format/>}
    <Form.Group className="mb-3 row">
      <Col sm={2}>
        <Form.Label>Inspection Date (M/D/YYYY)</Form.Label>
      </Col>
      <Col>
        <SelectDate
          name="inspectionDate"
          dateFormat='m/d/yyyy'
        />
      </Col>
    </Form.Group>
    <Form.Group className="mb-3 row">
      <Col sm={2}>
        <Form.Label>Transfer Date (M/D/YYYY)</Form.Label>
      </Col>
      <Col>
        <SelectDate
          name="transferDate"
          dateFormat='m/d/yyyy'
        />
      </Col>
    </Form.Group>
  </div>);
};


const FormFooter = () => {
  return (
    <Modal.Footer>
      <button className="btn btn-primary" type="submit">Create</button>
    </Modal.Footer>
  );
};
interface IFormBody {
  options: JSX.Element[]
  formats:ApiEnum[]
}
const FormBody:FC<IFormBody> = (
    {
      options,
      formats,
    } )=> {
  const getFormat = (id: number, allFormats:ApiEnum[]): ApiEnum | null => {
    for ( const format of allFormats) {
      if (format.id === id) {
        return format;
      }
    }
    return null;
  };
  const [
    selectedFormat,
    setSelectedFormat,
  ] = useState<ApiEnum|null>(null);
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) =>{
    if (event.target.value) {
      setSelectedFormat(
          getFormat(parseInt(event.target.value), formats));
    } else {
      setSelectedFormat(null);
    }
  };
  return (
    <Modal.Body>
      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">Name</Form.Label>
        <Form.Group className="col-sm-10">
          <input
            type="text" id="itemNameInput"
            className="form-control"
            name="name" required></input>
        </Form.Group>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Form.Label htmlFor='itemFormatSelection'
          className="col-sm-2 col-form-label">Format</Form.Label>
        <Form.Group className="col-sm-10">
          <Form.Select
            name="format_id"
            id="itemFormatSelection"
            onChange={handleChange}
            required defaultValue={''}>
            <option value="" disabled>Select a Format</option>
            {options}
          </Form.Select>
        </Form.Group>
      </Form.Group>
      <FormatSpecificFields type={selectedFormat}/>
      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label" htmlFor='itemBarcode'>
          Barcode
        </Form.Label>
        <Form.Group className="col-sm-10">
          <Form.Control id="itemBarcode" name="itemBarcode"/>
        </Form.Group>
      </Form.Group>
    </Modal.Body>
  );
};

interface NewItemModalProps{
  show: boolean,
  onAccepted?: (event: React.SyntheticEvent)=>void
  onClosed?: ()=>void
}

export const NewItemModal: FC<NewItemModalProps> = (
    {show, onAccepted, onClosed},
)=>{
  const [isOpen, setIsOpen] = useState(false);
  const [formats, setFormats] = useState<ApiEnum[]| null>(null);
  const newItemDialog = useRef(null);
  useEffect(()=>{
    setIsOpen(show);
  },
  [show],
  );


  useEffect(()=>{
    axios.get('/api/format').then((resp) => {
      setFormats((resp.data as ApiEnum[]).sort(sortNameAlpha));
    }).catch((error) => console.error(error));
  }, []);

  const options = (formats == null)? null: formats.map(
      (apiResponse: ApiEnum) => (
        <option key={apiResponse.id} value={apiResponse.id}>
          {apiResponse.name}
        </option>
      ),
  );
  if (!options) {
    return <LoadingIndeterminate/>;
  }
  const handleClose = () => {
    setIsOpen(false);
    if (onClosed) {
      onClosed();
    }
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    if (onAccepted) {
      onAccepted(event);
    }
  };

  const form = (
    <form id="formId" title='newItem' onSubmit={handleSubmit}>
      <FormBody options={options} formats={formats ? formats : []}/>
      <FormFooter/>
    </form>
  );

  return (
    <Modal
      data-testid='newItemModal'
      show={isOpen}
      onHide={handleClose}
      size="lg"
      ref={newItemDialog}>
      <Modal.Header>
        <h5 className="modal-title" id="titleId">New Item</h5>
        <CloseButton
          aria-label="Close"
          onClick={handleClose}
        />
      </Modal.Header>
      {form}
    </Modal>
  );
};
export const NewItemButton: FC<{
  onAccepted?: (event: React.SyntheticEvent)=>void
  onShow?: ()=>void
}> = ({onAccepted, onShow})=> {
  const [dialogShown, setDialogShown] = useState<boolean>(false);

  const handleAccepted = (event: React.SyntheticEvent) => {
    if (onAccepted) {
      onAccepted(event);
      setDialogShown(false);
    }
  };
  const handleClosed = () => {
    setDialogShown(false);
  };
  const onClick = ()=>{
    setDialogShown(true);
    if (onShow) {
      onShow();
    }
  };
  return (
    <React.Fragment>
      <Button
        data-testid='addButton'
        className="btn btn-primary btn-sm"
        onClick={onClick}>
        Add
      </Button>
      <NewItemModal
        show={dialogShown}
        onAccepted={handleAccepted}
        onClosed={handleClosed}
      />
    </React.Fragment>
  );
};
interface ApiRoute{
  endpoint: string
  methods: string[]
  route: string
}

/**
 * ObjectItemsApp shows object items.
 * @param {string} apiUrl
 * @param {number} projectId
 * @param {number} objectId
 * @param {string} newItemSubmitUrl
 * @constructor
 */
export function ObjectItemsApp(
    {
      apiUrl,
      projectId,
      objectId,
      newItemSubmitUrl,
    }: {
      apiUrl: string,
      projectId: number,
      objectId: number,
      newItemSubmitUrl:string
    },
) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [dataIsValid, setDataIsValid] = useState<boolean>(false);
  const [objectResult, setObjectResult] = useState<Item[] | null>(null);


  useEffect(()=>{
    const fetchAPIData = async (url: string) => {
      const sortedData: {[key: string]: string} = {};
      const data = await axios.get(url);
      for (const i of data.data as ApiRoute[]) {
        sortedData[i.endpoint] = i.route;
      }
      return sortedData;
    };
    const fetchData = async (url: string) => {
      const object: IObject = (await axios.get(url)).data as IObject;
      return object.items;
    };
    if (!dataIsValid) {
      setLoaded(false);
      fetchAPIData(apiUrl)
          .then((data)=>{
            const objectApiUrl = data['api.project_object']
                .replace('<int:project_id>', projectId.toString())
                .replace('<int:object_id>', objectId.toString());
            fetchData(objectApiUrl)
                .then((objectTtems)=>{
                  setObjectResult(objectTtems);
                  setDataIsValid(true);
                })
                .catch(console.error);
          })
          .catch(console.error);
    }
  }, [apiUrl, projectId, objectId, dataIsValid]);

  useEffect(()=>{
    if (objectResult) {
      setLoaded(true);
    }
  }, [objectResult]);
  if (!loaded) {
    return (<div><LoadingIndeterminate/></div>);
  }

  const newItemSubmitted = (event: React.SyntheticEvent)=>{
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(newItemSubmitUrl, formProps, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }})
        .then(()=>{
          setDataIsValid(false);
        })
        .catch(console.error);
  };

  const onItemRemoval = (deleteUrl: string)=>{
    axios.delete(deleteUrl)
        .then(()=>{
          setDataIsValid(false);
        })
        .catch(console.log);
  };
  const items = objectResult ? objectResult : [];
  return (
    <div className="flex-column">
      <table className="table">
        <thead>
          <tr className="tr-class-1">
            <th scope="col" className="col-8">Name</th>
            <th scope="col" className="col-3">Format</th>
            <th scope="col" className="col-1"></th>
          </tr>
        </thead>
        <tbody>
          <Items
            items={items}
            onRemoval={onItemRemoval}
          />
          <tr>
            <td></td>
            <td></td>
            <td>
              <NewItemButton onAccepted={newItemSubmitted}/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
