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
  waitForElementToBeRemoved,
} from '@testing-library/react';
import {Route, Routes, MemoryRouter} from 'react-router-dom';


import ProjectDetails from '../tyko/static/js/pages/ProjectDetails';
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
    expect(screen.getByDisplayValue('dummy')).toBeInTheDocument();
  });
});
