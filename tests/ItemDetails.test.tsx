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


import ItemDetails from '../tyko/static/js/pages/ItemDetails';
jest.mock('vanillajs-datepicker', ()=>{});

describe('ItemDetails', () => {
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/project/1/object/1/item?item_id=1' ) {
        return Promise.resolve(
            {
              data: {
                files: [],
                format: {
                  id: 4,
                  name: 'open reel',
                },
                format_details: {
                  base: null,
                  date_of_reel: null,
                  duration: null,
                  format_subtype: null,
                  generation: null,
                  reel_brand: null,
                  reel_diameter: null,
                  reel_size: null,
                  reel_speed: null,
                  reel_thickness: null,
                  reel_type: null,
                  reel_width: null,
                  title_of_reel: 'title',
                  track_configuration: null,
                  track_count: null,
                  wind: null,
                },
                format_id: 4,
                inspection_date: null,
                item_id: 1,
                name: 'dummy',
                notes: [],
                obj_sequence: null,
                parent_object_id: 1,
                transfer_date: null,
              },
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('details exists', ()=>{
    render(<ItemDetails/>);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  test('values', async () => {
    render(
        <MemoryRouter initialEntries={['/project/1/object/1/item/1']}>
          <Routes>
            <Route path='project'>
              <Route
                path=':projectId/object/:objectId/item/:itemId'
                element={<ItemDetails/>}/>
            </Route>
          </Routes>
        </MemoryRouter>,
    );
    const item = await waitFor(async () => {
      return screen.getByDisplayValue('dummy');
    });
    expect(item).toBeInTheDocument();
  });
});
