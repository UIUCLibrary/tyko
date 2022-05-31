const mockResponseAudioCassette = {
  data: {
    files: [],
    format: {
      id: 7,
      name: 'audio cassette',
    },
    format_details: {
      cassette_title: 'dhdhdh',
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
    name: 'dfghdfgh',
    notes: [],
    obj_sequence: null,
    parent_object_id: 1,
    transfer_date: null,
  },
};


export default {
  get: jest.fn().mockResolvedValue(mockResponseAudioCassette),
};
