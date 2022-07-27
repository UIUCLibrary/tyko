/*
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


import ObjectDetails from '../tyko/static/js/pages/ObjectDetails';
jest.mock('vanillajs-datepicker', ()=>{});

describe('ObjectDetails', () => {
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/project/1/object/1') {
        return Promise.resolve(
            {
              data: {
                name: 'bar',
                items: [],
              },
            },
        );
      }
      if (url === '/api/format') {
        return Promise.resolve({
          data: [
            {
              name: 'foo',
              id: 1,
            },
          ],
        });
      }
      if (url === '/api/collection') {
        return Promise.resolve({
          data: {
            collections: [
              {
                collection_id: 1,
                collection_name: 'sample collection',
              },
            ],
          },
        });
      }
      if (url === '/api/dummy') {
        return Promise.resolve(
            {
              data: {
                item: {
                  name: 'dummy',
                  obj_sequence: 1,
                  format: {
                    name: 'foo',
                    id: 1,
                  },
                },
              },
            },
        );
      }
      if (url === '/api/bad') {
        return Promise.resolve(
            {
              data: {
                item: {
                  name: 'dummy',
                  obj_sequence: 1,
                },
              },
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('render', ()=>{
    render(<ObjectDetails/>);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  test('values', async () => {
    render(
        <MemoryRouter initialEntries={['/project/1/object/1']}>
          <Routes>
            <Route path='project'>
              <Route
                path=':projectId/object/:objectId'
                element={<ObjectDetails/>}/>
            </Route>
          </Routes>
        </MemoryRouter>,
    );
    await waitFor(async ()=> {
      await waitForElementToBeRemoved(screen.getByText('Loading...'));
      return await waitForElementToBeRemoved(
          screen.getByText('Loading collection data')
      );
    });
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});
