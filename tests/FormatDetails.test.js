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
import FormatDetails, {
  OpenReel,
} from '../tyko/static/js/reactComponents/FormatDetails';

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

describe('OpenReel', ()=>{
  const data = {
    'base': {
      'key': 'base',
      'value': {
        'id': 2,
        'name': 'foo',
      },
    },
    'date_of_reel': {
      'key': 'date_of_reel',
      'name': '12/10/2000',
    },
    'duration': {
      'key': 'duration',
      'name': '01:12:00',
    },
    'title_of_reel': {
      'key': 'title_of_reel',
      'name': 'my reel',
    },
    'format_subtype': {
      'key': 'format_subtype',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
    'generation': {
      'key': 'generation',
      'value': {
        'id': 1,
        'name': 'bar',
      },
    },
    'reel_brand': {
      'key': 'reel_brand',
      'value': 'some brand',
    },
    'reel_speed': {
      'key': 'reel_speed',
      'value': {
        'id': 1,
        'name': 'baz',
      },
    },
    'reel_thickness': {
      'key': 'reel_thickness',
      'value': {
        'id': 1,
        'name': 'qux',
      },
    },
    'reel_size': {
      'key': 'reel_size',
      'value': 16,
    },
    'reel_type': {
      'key': 'reel_type',
      'value': 'plastic',
    },
    'reel_width': {
      'key': 'reel_width',
      'value': {
        'id': 1,
        'name': 'quux',
      },
    },
    'track_configuration': {
      'key': 'track_configuration',
      'value': {
        'id': 1,
        'name': 'quuz',
      },
    },
    'track_count': {
      'key': 'track_count',
      'value': 2,
    },
    'wind': {
      'key': 'wind',
      'value': {
        'id': 1,
        'name': 'corge',
      },
    },
  };
  it('should Render', () => {
    render(<OpenReel data={data}/>);
  });
});
