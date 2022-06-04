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
  GroovedDisc,
  Optical,
  VideoCassette,
  AudioCassette,
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
  describe('OpenReel', ()=>{
    const data ={
      files: [],
      format: {
        id: 4,
        name: 'open reel',
      },
      format_details: {
        base: null,
        date_of_reel: '6/16/2022',
        duration: '01:23:33',
        format_subtype: null,
        generation: null,
        reel_brand: 'some brand',
        reel_diameter: null,
        reel_size: 7,
        reel_speed: null,
        reel_thickness: null,
        reel_type: 'plastic',
        reel_width: null,
        title_of_reel: null,
        track_configuration: null,
        track_count: 2,
        wind: null,
      },
      format_id: 4,
      inspection_date: '6/24/2022',
      item_id: 4,
      name: 'Op reel name',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: '6/11/2022',
    };
    it('data is loaded into the document correct', async ()=> {
      axios.get.mockResolvedValueOnce(
          {data: {item: data}},
      );
      const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
      await waitForElementToBeRemoved(() => getByText('Loading...'));
      expect(getByText('Title of Reel')).toBeInTheDocument();
    });
  });
  describe('Film', ()=>{
    const data = {
      files: [],
      format: {
        id: 6,
        name: 'film',
      },
      format_details: {
        ad_strip_test: null,
        ad_test_date: '6/6/2001',
        ad_test_level: '2',
        can_label: 'Can label',
        color: null,
        date_of_film: '6/10/2022',
        duration: '01:16:52',
        edge_code_date: 2022,
        film_base: null,
        film_emulsion: null,
        film_gauge: null,
        film_image_type: null,
        film_length: 144,
        film_shrinkage: 32,
        film_speed: null,
        film_title: 'Title of film',
        leader_label: 'Leader Labe',
        soundtrack: null,
        wind: null,
      },
      format_id: 6,
      inspection_date: '5/25/2022',
      item_id: 6,
      name: 'Film Item',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: '7/2/2022',
    };
    it('data is loaded into the document correct', async ()=> {
      axios.get.mockResolvedValueOnce(
          {data: {item: data}},
      );
      const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
      await waitForElementToBeRemoved(() => getByText('Loading...'));
      expect(getByText('Film Shrinkage')).toBeInTheDocument();
    });
  });
  describe('GroovedDisc', ()=>{
    const data = {
      files: [],
      format: {
        id: 5,
        name: 'grooved disc',
      },
      format_details: {
        date_of_disc: '5/16/2022',
        disc_base: null,
        disc_diameter: null,
        disc_direction: null,
        disc_material: null,
        playback_speed: null,
        side_a_duration: '00:12:21',
        side_a_label: 'side 1',
        side_b_duration: '00:12:22',
        side_b_label: 'side b',
        title_of_album: 'title of album',
        title_of_disc: 'title of disc',
      },
      format_id: 5,
      inspection_date: '6/9/2022',
      item_id: 5,
      name: 'Grooved Disc Item',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: '6/29/2022',
    };

    it('data is loaded into the document correct', async ()=> {
      axios.get.mockResolvedValueOnce(
          {data: {item: data}},
      );
      const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
      await waitForElementToBeRemoved(() => getByText('Loading...'));
      expect(getByText('title of album')).toBeInTheDocument();
    });
  });
  describe('Optical', ()=>{
    const data = {
      files: [],
      format: {
        id: 8,
        name: 'optical',
      },
      format_details: {
        date_of_item: '1/2/2000',
        duration: '01:55:1',
        label: 'Label',
        title_of_item: 'Title of item',
        type: null,
      },
      format_id: 8,
      inspection_date: '1/2/2020',
      item_id: 7,
      name: 'My optical',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: '1/2/2030',
    };

    it('data is loaded into the document correct', async ()=> {
      axios.get.mockResolvedValueOnce(
          {data: {item: data}},
      );
      const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
      await waitForElementToBeRemoved(() => getByText('Loading...'));
      expect(getByText('Title of item')).toBeInTheDocument();
    });
  });
  describe('GroovedDisc', ()=> {
    const data = {
      files: [],
      format: {
        id: 5,
        name: 'grooved disc',
      },
      format_details: {
        date_of_disc: '5/16/2022',
        disc_base: {
          id: 1,
          name: 'Glass',
        },
        disc_diameter: {
          id: 1,
          name: '7',
        },
        disc_direction: {
          id: 1,
          name: 'In to Out',
        },
        disc_material: {
          id: 1,
          name: 'Shellac/78',
        },
        playback_speed: {
          id: 1,
          name: '33 1/3',
        },
        side_a_duration: '00:12:21',
        side_a_label: 'side 1',
        side_b_duration: '00:12:22',
        side_b_label: 'side b',
        title_of_album: 'title of album',
        title_of_disc: 'title of disc',
      },
      format_id: 5,
      inspection_date: '6/9/2022',
      item_id: 5,
      name: 'Grooved Disc Item',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: '6/29/2022',
    };
    it('data is loaded into the document correct', async ()=> {
      axios.get.mockResolvedValueOnce(
          {data: {item: data}},
      );
      const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
      await waitForElementToBeRemoved(() => getByText('Loading...'));
      expect(getByText('title of album')).toBeInTheDocument();
    });
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
    'title_of_album': {
      'key': 'title_of_album',
      'name': 'My title',
    },
    'title_of_disc': {
      'key': 'title_of_disc',
      'name': 'My title of disc',
    },
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

describe('Optical', ()=>{
  const data = {
    'title_of_item': {
      'key': 'title_of_item',
      'name': 'Title of item',
    },
    'date_of_item': {
      'key': 'date_of_item',
      'name': '12/10/2000',
    },
    'duration': {
      'key': 'duration',
      'value': '01:13:00',
    },
    'label': {
      'key': 'label',
      'value': 'my label',
    },
    'type': {
      'key': 'type',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
  };
  it('should Render', () => {
    render(<Optical data={data}/>);
  });
});

describe('VideoCassette', ()=>{
  const data = {
    'title_of_cassette': {
      'key': 'title_of_cassette',
      'name': 'Title of item',
    },
    'date_of_cassette': {
      'key': 'date_of_cassette',
      'name': '12/10/2000',
    },
    'duration': {
      'key': 'duration',
      'value': '01:13:00',
    },
    'label': {
      'key': 'label',
      'value': 'my label',
    },
    'generation': {
      'key': 'generation',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
    'cassette_type': {
      'key': 'cassette_type',
      'value': {
        'id': 1,
        'name': 'bar',
      },
    },
  };
  it('should Render', () => {
    render(<VideoCassette data={data}/>);
  });
});

describe('AudioCassette', ()=>{
  const data = {
    'cassette_title': {
      'key': 'cassette_title',
      'name': 'Title of item',
    },
    'cassette_type': {
      'key': 'cassette_type',
      'value': {
        'id': 1,
        'name': 'bar',
      },
    },
    'date_of_cassette': {
      'key': 'date_of_cassette',
      'name': '12/10/2000',
    },
    'generation': {
      'key': 'generation',
      'value': {
        'id': 1,
        'name': 'foo',
      },
    },
    'side_a_duration': {
      'key': 'side_a_duration',
      'value': '01:13:00',
    },
    'side_a_label': {
      'key': 'side_a_label',
      'value': 'my side a label',
    },
    'side_b_duration': {
      'key': 'side_b_duration',
      'value': '01:13:00',
    },
    'side_b_label': {
      'key': 'side_b_label',
      'value': 'my side b label',
    },
  };
  it('should Render', () => {
    render(<AudioCassette data={data}/>);
  });
});
