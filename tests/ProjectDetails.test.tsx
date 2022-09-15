/**
 * @jest-environment jsdom
 */
'use strict';
import '@testing-library/jest-dom';
import axios from 'axios';
jest.mock('axios');
import {
  render,
  waitFor,
  screen,
  waitForElementToBeRemoved, fireEvent,
} from '@testing-library/react';
import {Route, Routes, MemoryRouter} from 'react-router-dom';


import ProjectDetails from '../tyko/static/js/pages/ProjectDetails';
import {
  ProjectDetailDetails,
  ProjectObjects,
  NewObjectModal,
  ProjectObjectsRef,
} from '../tyko/static/js/reactComponents/ProjectDetails';
import {createRef} from 'react';
jest.mock('vanillajs-datepicker', ()=>{});
describe('ProjectDetails', () => {
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/project/1') {
        return Promise.resolve(
            {
              data: {
                project: {
                  title: 'dummy',
                  objects: [
                    {
                      barcode: null,
                      collection_id: 1,
                      contact: null,
                      items: [],
                      name: 'sample object',
                      notes: [],
                      object_id: 1,
                      originals_rec_date: null,
                      originals_return_date: null,
                      routes: {
                        api: '/api/project/1/object/1',
                        frontend: '/project/1/object/1',
                      },
                    },
                  ],
                },
              },
            },
        );
      }
      if (url === '/api/collection') {
        return Promise.resolve({
          data: {
            collections: [],
          },
        });
      }
      return Promise.resolve();
    });
  });
  test('Details exists', () => {
    render(<ProjectDetails/>);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  test('values', async () => {
    render(
        <MemoryRouter initialEntries={['/project/1']}>
          <Routes>
            <Route path='project'>
              <Route path=':projectId' element={<ProjectDetails/>}/>
            </Route>
          </Routes>
        </MemoryRouter>,
    );
    await waitFor(async ()=> {
      return await waitForElementToBeRemoved(screen.getByText('Loading...'));
    });
    expect(screen.getByText('dummy')).toBeInTheDocument();
  });
});

describe('ProjectDetailDetails', ()=>{
  test('onUpdated called', async () => {
    axios.put = jest.fn((url: string): Promise<any> => {
      return Promise.resolve();
    });
    const onUpdated = jest.fn();
    const dummyData = {
      project: {
        current_location: 'somewhere',
        notes: [],
        objects: [],
        project_code: 'project code',
        project_id: 1,
        status: 'Complete',
        title: 'foo',
      },
    };
    render(
        <ProjectDetailDetails
          apiData={dummyData}
          apiUrl={'/api/dummy'}
          onUpdated={onUpdated}/>,
    );
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(async ()=> {
      return await waitForElementToBeRemoved(screen.getByText('Loading...'));
    });
    await waitFor(()=>{
      expect(onUpdated).toHaveBeenCalled();
    });
  });
});

describe('ProjectObjects', ()=>{

  const sampleData = {
    project: {
      current_location: 'dummy',
      notes: [],
      objects: [],
      project_code: '1233',
      project_id: 123,
      status: 'working',
      title: 'foo',
    },
  };
  describe('update', ()=>{
    test('update', async ()=> {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.get.mockResolvedValue(
          {
            data: {
              collections: [
                {
                  'collection_id': 1,
                  'collection_name': 'sample collection',
                  'contact': null,
                  'contact_id': null,
                  'department': null,
                  'record_series': null,
                },
              ],
            },
          },
      );
      mockedAxios.post.mockResolvedValue({});
      render(<ProjectObjects submitUrl='/foo'/>);
      await waitFor(()=> {
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Add'));
        screen.getByLabelText('Name');
        return screen.getByText('sample collection');
      });
      fireEvent.change(
          screen.getByLabelText('Collection'),
          {target: {value: '1'}},
      );
      fireEvent.change(
          screen.getByLabelText('Name'),
          {target: {value: '123123'}},
      );
      fireEvent.click(screen.getByText('Create'));
      await waitForElementToBeRemoved(screen.getByText('New Object'));
      expect(mockedAxios.post).toBeCalledWith(
          '/foo',
          {
            'name': '123123',
            'originals_rec_date': '',
            'collection_id': '1',
          },
      );
    });
  });
  describe('Edit Button', ()=>{
    const collections = [
      {
        'collection_id': 1,
        'collection_name': 'sample collection',
        'contact': null,
        'contact_id': null,
        'department': null,
        'record_series': null,
      },
    ];
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    test('Edit', async ()=>{
      mockedAxios.get.mockResolvedValue(
          {data: {collections: collections}}
          );
      await waitFor(()=>{
        render(<ProjectObjects submitUrl='/foo'/>);
      });
      await waitFor(()=>expect(screen.getByText('Edit')).toBeVisible());
    });
    test('Clicked Edit removes edit button', async ()=>{
      mockedAxios.get.mockResolvedValue(
          {data: {collections: collections}}
          );
      render(<ProjectObjects submitUrl='/foo'/>);
      await waitFor(()=> {
        fireEvent.click(screen.getByText('Edit'));
      });
      expect(screen.getByText('Edit')).not.toBeVisible();
    });
    test('edit mode switches back', async ()=>{
      render(<ProjectObjects submitUrl='/foo'/>);
      await waitFor(()=>{
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Done'));
      })
      expect(screen.getByText('Edit')).toBeVisible();
    });
  });
  describe('ref', ()=>{
    test('editMode', async ()=>{
      const projectObjectRef = createRef<ProjectObjectsRef>();
      render(
          <ProjectObjects
            ref={projectObjectRef}
            submitUrl='/foo'
          />);
      expect(projectObjectRef.current?.editMode).toBe(false);
      await waitFor(()=>{
        fireEvent.click(screen.getByText('Edit'));
      })
      expect(projectObjectRef.current?.editMode).toBe(true);
    });
  });
});
describe('NewObjectModal', ()=>{
  test('collections added', ()=>{
    //     const mockedAxios = axios as jest.Mocked<typeof axios>;
    const collections = [
      {
        'collection_id': 1,
        'collection_name': 'sample collection',
        'contact': null,
        'contact_id': null,
        'department': null,
        'record_series': null,
      },
    ];
    render(<NewObjectModal show={true} collections={collections}/>);
    expect(screen.getByText('sample collection')).toBeInTheDocument();
  });
});
