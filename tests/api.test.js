import {notes} from "../tyko/static/js/api.js";

test("get notes", ()=> {
    notes.getNotes()
        .then(function (){
            console.log("d")
        })
        .catch(function () {
            console.log("f")
        });
});