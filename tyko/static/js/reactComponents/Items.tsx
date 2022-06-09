import React, {
  ChangeEvent,
  FC,
  useEffect, useRef,
  useState,
  Component,
} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import {Datepicker} from 'vanillajs-datepicker';
import axios, {AxiosError} from 'axios';
import {Button} from 'react-bootstrap';
interface Item{
  files: string[]
  format: {
    id: number,
    name: string
  }
  elements: Element[]
  format_details: { [key: string]: any }
  format_id: number
  item_id: number
  name: string
  routes: {
    api: string,
    frontend: string
  }
}
interface ItemApiData{
  loading: boolean
  items?: Item[]
  error?: string
}

interface IObject {
  items: Item[]
  routes: {
    api: string
    frontend: string
  }
}
const useObjectsApi = (url: string| null): [
    ItemApiData, (value: string)=>void, ()=>void
] => {
  const [apiUrl, setApiUrl] = useState<string | null>(url);
  const [data, setData] = useState<ItemApiData>(
      {
        loading: false,
      },
  );
  const update = ()=>{
    if (!apiUrl) {
      return [];
    }
    const fetchData = async () => {
      setData({
        loading: true,
      });
      const object: IObject = (await axios.get(apiUrl)).data as IObject;
      return object.items;
    };
    fetchData()
        .then((items: Item[])=>{
          setData({
            loading: false,
            items: items,
          });
        })
        .catch((e: AxiosError | Error)=> {
          setData({
            loading: false,
            error: e.toString(),
          });
        });
  };
  useEffect(()=>{
    update();
  }, [apiUrl]);
  return [
    data,
    (newUrl) => {
      setApiUrl(newUrl);
    },
    () => {
      if (apiUrl) {
        update();
      }
    },
  ];
};


interface ConfirmRemovalDialogProps {
  modalName: string
  onAccepted?: (event: React.SyntheticEvent) => void
}

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
                data-bs-dismiss="modal">Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Item edit option butoon
 * @param {string} frontendUrl url for details
 * @param {string} apiUrl api for deleting
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
export function Items(
    {
      items,
      onRemoval,
    }: { items: Item[], onRemoval? :(url: string)=>void}) {
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

interface SelectDate{
  dateFormat: string,
  name: string
  placeholder?: string,
}

const SelectDate: FC<SelectDate> = ({dateFormat, name, placeholder}) =>{
  const inputText = useRef<HTMLInputElement>(null);
  return (
    <Form.Group className="input-group">
      <input type="text"
        className="form-control"
        name={name}
        placeholder={placeholder}
        ref={inputText}
      >
      </input>
      <Button
        type="button"
        variant="outline-secondary"
        onClick={() =>
          openDateSelect(
              inputText ? inputText.current : null,
              dateFormat,
          )
        }>
        <em className="bi bi-calendar-event"></em>
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


interface ApiEnum{
    id: number
    name: string
  }
const CassetteOnlyData: FC = ()=>{
  const [generations, setGenerations] = useState<ApiEnum[]|null>(null);
  const [subtypes, setSubTypes] = useState<ApiEnum[]|null>(null);
  const getGenerations =() => {
    axios.get('/api/formats/audio_cassette/generation')
        .then((res)=> {
          setGenerations(
              (
                  res.data as ApiEnum[]
              ).sort((a, b) => a.name < b.name ? -1: 1),
          );
        }).catch((console.error));
  };
  const getSubTypes =() => {
    axios.get('/api/formats/audio_cassette/subtype')
        .then((res)=> {
          setSubTypes(
              (
                  res.data as ApiEnum[]
              ).sort((a, b) => a.name < b.name ? -1: 1),
          );
        }).catch((console.error));
  };

  if (!generations) {
    getGenerations();
  }

  if (!subtypes) {
    getSubTypes();
  }
  return (
    <>
      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Title of Cassette
        </Form.Label>
        <Form.Group className="col-sm-10">
          <input type="text" id="cassetteTitle" className="form-control"
            name="cassetteTitle" required></input>
        </Form.Group>
      </Form.Group>

      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Date of Cassette
        </Form.Label>
        <Form.Group className="col-sm-10">
          <SelectDate
            name="dateOfCassette"
            dateFormat='m/d/yyyy'
          />
        </Form.Group>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Cassette Type
        </Form.Label>
        <div className="col-sm-10">
          <Form.Select
            name="cassetteTypeId"
            id="cassetteType"
            defaultValue={''}>
            <option value=""></option>
            {
              subtypes?.map((i)=>
                <option key={i.id} value={i.id}>{i.name}</option>,
              )
            }
          </Form.Select>
        </div>
      </Form.Group>
      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Generation
        </Form.Label>
        <div className="col-sm-10">
          <Form.Select name="generationId" id="generation" defaultValue={''}>
            <option value=""></option>
            {
              generations?.map((i)=>
                <option key={i.id} value={i.id}>{i.name}</option>,
              )
            }
          </Form.Select>
        </div>
      </Form.Group>
      <Form.Group className="row mb-3 g-3">
        <Form.Label className="col-sm-2 col-form-label">Side A</Form.Label>
        <Form.Group className="form-group col-sm">
          <Form.Label htmlFor="cassetteSideALabel"
            className="form-label">Label</Form.Label>
          <input type="text" id="cassetteSideALabel" className="form-control"
            name="cassetteSideALabel"></input>
        </Form.Group>
        <Form.Group className="col-sm">
          <Form.Label className=" form-label">Duration</Form.Label>
          <input type="text" id="cassetteSideADuration"
            className="form-control" name="cassetteSideADuration">
          </input>
        </Form.Group>
      </Form.Group>
      <Form.Group className="row mb-3 g-3">
        <Form.Label className="col-sm-2 col-form-label">Side B</Form.Label>
        <Form.Group className="form-group col-sm">
          <Form.Label className="form-label">Label</Form.Label>
          <input type="text" id="cassetteSideBLabel" className="form-control"
            name="cassetteSideBLabel"></input>
        </Form.Group>
        <Form.Group className="col-sm">
          <Form.Label className=" form-label">Duration</Form.Label>
          <input type="text" id="cassetteSideBDuration"
            className="form-control" name="cassetteSideBDuration"></input>
        </Form.Group>
      </Form.Group>

      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Inspection Date
        </Form.Label>
        <Form.Group className="col-sm-10">
          <SelectDate
            name="inspectionDate"
            dateFormat='m/d/yyyy'
            placeholder="Date of condition inspection"
          />
        </Form.Group>
      </Form.Group>

      <Form.Group className="mb-3 row">
        <Form.Label className="col-sm-2 col-form-label">
          Transfer Date
        </Form.Label>
        <Form.Group className="col-sm-10">
          <SelectDate
            name="transferDate"
            dateFormat='m/d/yyyy'
            placeholder="date of digitization"
          />
        </Form.Group>
      </Form.Group>
    </>
  );
};
const FormatSpecificFields:FC<{type: ApiEnum| null}> = ({type}) =>{
  if (!type) {
    return (<></>);
  }
  // const [Format, selectFormat] = useState<FC| null>(null);
  const options: {[key: string]: FC} = {
    'audio cassette': CassetteOnlyData,
    // 'film': 'filmOnlyData',
    // 'open reel': 'openReelOnlyData',
    // 'grooved disc': 'groovedDiscOnlyData',
    // 'optical': 'opticalOnlyData',
    // 'video cassette': 'videoCassetteOnlyData',
  };
  const Format = type.name in options ? options[type.name] : null;
  // selectFormat(type.name in options ? options[type.name] : null);
  if (!Format) {
    return <div>NN</div>;
  }
  return (<div>{<Format/>}</div>);
  // if (type.name in options) {
  //   return (
  //     <div>{options[type.name]}</div>
  //   );
  // }
  // return (
  //   <div>{type.name}</div>
  // );
};
interface NewItemModalProps{
  submitUrl: string,
  show: boolean,
  onAccepted?: ()=>void
}

const NewItemModal: FC<NewItemModalProps> = ({submitUrl, show, onAccepted})=>{
  const [
    selectedFormat,
    setSelectedFormat,
  ] = useState<ApiEnum|null>(null);

  const [isOpen, setIsOpen] = useState(show);
  const [formats, setFormats] = useState<ApiEnum[]| null>(null);
  const newItemDialog = useRef(null);

  useEffect(()=>{
    setIsOpen(show);
  },
  [show],
  );

  const options = (formats == null)? null: formats.map(
      (apiResponse: ApiEnum) => (
        <option key={apiResponse.id} value={apiResponse.id}>
          {apiResponse.name}
        </option>
      ),
  );
  const getFormat = (id: number): ApiEnum | null => {
    if (formats === null) {
      console.error('formats not loaded');
      return null;
    }
    for ( const f of formats) {
      if (f.id === id) {
        return f;
      }
    }
    return null;
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    axios.post(submitUrl, formProps, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }}).then((() =>{
      setIsOpen(false);
      if (onAccepted) {
        onAccepted();
      }
    })).catch(console.error);

    // x.submit();
    // event.target.submit()
    // window.location.href =
    setIsOpen(false);
    return false;
    // location.reload()
  };

  useEffect(()=>{
    if (!formats) {
      axios.get('/api/format').then((resp) => {
        setFormats(
            (
              resp.data as ApiEnum[]
            ).sort((a, b) => a.name < b.name ? -1: 1),
        );
      }).catch((error) => console.error(error));
    }
  });
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) =>{
    if (event.target.value) {
      setSelectedFormat(getFormat(parseInt(event.target.value)));
    } else {
      setSelectedFormat(null);
    }
  };
  return (
    <Modal show={isOpen} size="lg" ref={newItemDialog}>
      <Modal.Header>
        <h5 className="modal-title" id="titleId">New Item</h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close">
        </button>

      </Modal.Header>
      <form id="formId" onSubmit={handleSubmit}>
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
            <Form.Label className="col-sm-2 col-form-label">Format</Form.Label>
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
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" type="submit">Create</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

interface NewItemButtonProps{
  newItemSubmitUrl: string,
  onAccepted?: ()=>void
}
export const NewItemButton: FC<NewItemButtonProps> = (
    {newItemSubmitUrl, onAccepted},
)=> {
  const [dialogShown, setDialogShown] = useState<boolean>(false);
  const onClick = ()=>{
    setDialogShown(true);
  };
  return (
    <React.Fragment>
      <button className="btn btn-primary btn-sm"
        onClick={onClick}
      >Add</button>
      <NewItemModal
        submitUrl={newItemSubmitUrl}
        show={dialogShown}
        onAccepted={onAccepted}
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
  const [
    apiRoutes,
    setApiRoutes,
  ] = useState<{[key: string]: string} | null>(null);

  const [objectApiUrl, setObjectApiUrl] = useState<string | null>(null);
  const [objectResult, updateUrl, update] = useObjectsApi(null);

  const fetchAPIData = async () => {
    const sortedData: {[key: string]: string} = {};
    for (const i of (await axios.get(apiUrl)).data as ApiRoute[]) {
      sortedData[i.endpoint] = i.route;
    }
    return sortedData;
  };
  useEffect(()=>{
    if (!apiRoutes) {
      fetchAPIData()
          .then((data)=>{
            setApiRoutes(data);
            const projectUrl = data['api.project_object']
                .replace('<int:project_id>', projectId.toString())
                .replace('<int:object_id>', objectId.toString());
            updateUrl(projectUrl);
            update();
          })
          .catch(()=> {
            console.error('Failed');
          });
    } else {
      const projectUrl = apiRoutes['api.project_object']
          .replace('<int:project_id>', projectId.toString())
          .replace('<int:object_id>', objectId.toString());
      updateUrl(projectUrl);
      update();
    }
  }, [apiUrl]);
  if (apiRoutes == null || objectResult.loading) {
    return (<div>Loading ...</div>);
  }

  const newItemSubmitted = ()=>{
    setObjectApiUrl(objectApiUrl);
    update();
  };

  if (!objectApiUrl) {
    const url = apiRoutes['api.project_object']
        .replace('<int:project_id>', projectId.toString())
        .replace('<int:object_id>', objectId.toString());
    setObjectApiUrl(url);
  }
  const onItemRemoval = (deleteUrl: string)=>{
    axios.delete(deleteUrl).then(()=> {
      update();
    }).catch(console.log);
  };

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
            items={objectResult.items ? objectResult.items : []}
            onRemoval={onItemRemoval}
          />
          <tr>
            <td></td>
            <td></td>
            <td>
              <NewItemButton
                newItemSubmitUrl={newItemSubmitUrl}
                onAccepted={newItemSubmitted}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
