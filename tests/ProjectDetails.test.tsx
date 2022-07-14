/**
 * @jest-environment jsdom
 */
'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import {
  render,
  waitFor,
  screen,
  waitForElementToBeRemoved, fireEvent,
} from '@testing-library/react';
import {Route, Routes, MemoryRouter} from 'react-router-dom';


import ProjectDetails from '../tyko/static/js/pages/ProjectDetails';
import {ProjectDetailDetails} from '../tyko/static/js/reactComponents/ProjectDetails';
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
  jest.mock('axios');
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
