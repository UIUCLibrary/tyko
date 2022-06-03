/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import '@testing-library/jest-dom';


import {
  render,
  waitForElementToBeRemoved,
  cleanup,
} from '@testing-library/react';
import FormatDetails from '../tyko/static/js/reactComponents/FormatDetails';

const mockResponseAudioCassette = {
  files: [],
  format: {
    id: 7,
    name: 'audio cassette',
  },
  format_details: {
    cassette_title: 'my cassette title',
    cassette_type: {
      id: 5,
      name: 'DAT',
    },
    date_of_cassette: '5/16/2022',
    generation: null,
    side_a_duration: null,
    side_a_label: null,
    side_b_duration: null,
    side_b_label: null,
  },
  format_id: 7,
  inspection_date: null,
  item_id: 1,
  name: 'Audio Cassette object',
  notes: [],
  obj_sequence: null,
  parent_object_id: 1,
  transfer_date: null,
};

beforeEach(() => {
  axios.get = jest.fn(() => {
    Promise.resolve({data: {data: mockResponseAudioCassette}});
  });
});

afterEach(cleanup);

describe('FormatDetails', ()=>{
  it('displays text "loading" while fetching data', ()=>{
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    getByText('Loading...');
  });

  it('Removes text "Loading" after data has been fetched', async ()=>{
    axios.get.mockResolvedValueOnce({data: {item: mockResponseAudioCassette}});
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(()=>getByText('Loading...'));
  });

  it('data is loaded into the document', async ()=> {
    axios.get.mockResolvedValueOnce({data: {item: mockResponseAudioCassette}});
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => getByText('Loading...'));
    expect(getByText('my cassette title')).toBeInTheDocument();
  });
});
