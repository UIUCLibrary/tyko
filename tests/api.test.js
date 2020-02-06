const functions = require('../tyko/static/js/api');

test("dummy", ()=>{
    expect(functions.add_note("fake")).toBe(true);
});
