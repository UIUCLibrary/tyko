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
  Film,
  GroovedDisc
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

describe('Film', ()=>{
  const data = {
    'ad_strip_test': {
      'key': 'ad_strip_test',
      'name': true,
    },
    'ad_test_date': {
      'key': 'ad_test_date',
      'name': '12/10/2000',
    },
    'ad_test_level': {
      'key': 'ad_test_level',
      'value': 1,
    },
    'can_label': {
      'key': 'can_label',
      'value': 'my can label',
    },
    'date_of_film': {
      'key': 'date_of_film',
      'name': '12/10/2000',
    },
    'duration': {
      'key': 'duration',
      'name': '01:12:00',
    },
    'film_title': {
      'key': 'film_title',
      'name': 'my film title',
    },
    'leader_label': {
      'key': 'leader_label',
      'name': 'leader label',
    },
    'edge_code_date': {
      'key': 'edge_code_date',
      'value': 1956,
    },
    'film_length': {
      'key': 'film_length',
      'value': 500,
    },
    'film_shrinkage': {
      'key': 'film_shrinkage',
      'value': 75,
    },
    'color': {
      'key': 'color',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
    'film_gauge': {
      'key': 'film_gauge',
      'value': {
        'id': 1,
        'name': 'bar',
      },
    },
    'film_base': {
      'key': 'film_base',
      'value': {
        'id': 1,
        'name': 'baz',
      },
    },
    'film_emulsion': {
      'key': 'film_emulsion',
      'value': {
        'id': 1,
        'name': 'qux',
      },
    },
    'film_image_type': {
      'key': 'film_image_type',
      'value': {
        'id': 1,
        'name': 'quux',
      },
    },
    'film_speed': {
      'key': 'film_speed',
      'value': {
        'id': 1,
        'name': 'quuz',
      },
    },
    'soundtrack': {
      'key': 'soundtrack',
      'value': 2,
    },
    'wind': {
      'key': 'wind',
      'value': {
        'id': 1,
        'name': 'corg',
      },
    },
  };
  it('should Render', () => {
    render(<Film data={data}/>);
  });
});

describe('GroovedDisc', ()=>{
  const data = {
    'date_of_disc': {
      'key': 'date_of_disc',
      'name': '12/10/2000',
    },
    'disc_base': {
      'key': 'disc_base',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
    'disc_diameter': {
      'key': 'disc_diameter',
      'value': {
        'id': 1,
        'name': 'bar',
      },
    },
    'disc_direction': {
      'key': 'disc_direction',
      'value': {
        'id': 1,
        'name': 'baz',
      },
    },
    'disc_material': {
      'key': 'disc_material',
      'value': {
        'id': 1,
        'name': 'qux',
      },
    },
    'playback_speed': {
      'key': 'playback_speed',
      'value': {
        'id': 1,
        'name': 'quux',
      },
    },
    'side_a_duration': {
      'key': 'side_a_duration',
      'value': '01:12:00',
    },
    'side_a_label': {
      'key': 'side_a_label',
      'value': 'Side a label',
    },
    'side_b_duration': {
      'key': 'side_b_duration',
      'value': '01:13:00',
    },
    'side_b_label': {
      'key': 'side_b_label',
      'value': 'Side b label',
    },
  };
  it('should Render', () => {
    render(<GroovedDisc data={data}/>);
  });
});
