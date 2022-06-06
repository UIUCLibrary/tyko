import React, {useEffect, useState} from 'react';
import axios, {AxiosError} from 'axios';
export function NewItemForm() {
  return (
    <React.Fragment>
    </React.Fragment>
  );
}
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
  items: Item[]
}


const useItemsApi = (url: string) => {
  const [data, setData] = useState<ItemApiData | null>(null);
  const [error, setError] = useState<Error | AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(()=>{
    setLoading(true);
    const fetchData = async () => {
      setData((await axios.get(url)).data as ItemApiData);
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

interface ConfirmRemovalDialogProps {
  modalName: string
  onAccepted?: (event: React.SyntheticEvent) => void
}

class ConfirmRemovalDialog extends React.Component<ConfirmRemovalDialogProps> {
  modalName: string;
  onAccepted?: (event: React.SyntheticEvent)=>void;

  constructor(props: ConfirmRemovalDialogProps) {
    super(props);

    this.modalName = props.modalName;
    this.onAccepted = this.props.onAccepted;
  }

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
    {frontendUrl, apiUrl}: { frontendUrl: string, apiUrl: string },
) {
  const onAccepted = async (event: React.SyntheticEvent) =>{
    await(
      axios.delete(apiUrl).then(()=> {
        location.reload();
      })
    );
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
export default function Items({apiUrl}: { apiUrl: string }) {
  const [data, error, loading] = useItemsApi(apiUrl) as [
      data: ItemApiData,
      error: undefined,
      loading: boolean
  ];
  if (loading) {
    return (<div><p>Loading...</p></div>);
  }
  if (error) {
    return (<div><p>Failed to load items</p></div>);
  }
  if (data === null) {
    return null;
  }
  const itemsRendered = data.items.map((i: Item) => {
    return (
      <tr key={i.item_id}>
        <td colSpan={2}>
          <a href={i.routes.frontend}>{i.name} </a>
        </td>
        <td>{i.format.name}</td>
        <td>
          <ItemOptionsButton
            frontendUrl={i.routes.frontend}
            apiUrl={i.routes.api}
          />
        </td>
      </tr>
    );
  });
  return (
    <div className="flex-column">
      <table className="table">
        <thead>
          <tr className="tr-class-1">
            <th scope="col" colSpan={2}>Name</th>
            <th scope="col">Format</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {itemsRendered}
        </tbody>
      </table>
    </div>
  );
}
