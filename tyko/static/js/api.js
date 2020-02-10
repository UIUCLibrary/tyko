// const functions = {
//   add_note: function (apiSource, notTypeeId, text) {
//     if(notTypeeId === undefined){
//       throw("notTypeeId is a required field")
//     }
//     if(text === undefined){
//       throw("text is a required field")
//     }
//     return new Promise(function (resolve, reject) {
//         let xhr = new XMLHttpRequest();
//         xhr.send();
//
//       resolve();
//     })
//     // return true;
//   }
//
// };
function addNote(apiRoute, noteTypeId, text) {
  if(apiRoute === undefined){
    throw("apiRoute is a required field")
  }
  if(noteTypeId === undefined){
    throw("noteTypeId is a required field")
  }
  if(text === undefined){
    throw("text is a required field")
  }

  const newNoteRoute = apiRoute + "/notes";

  const data = {
    "text": text,
    "note_type_id": noteTypeId
  };


  console.log("sending request to " + newNoteRoute);
  console.log("sending " + JSON.stringify(data));
  
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = false;


  return new Promise(((resolve, reject) => {
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300){
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        })
      }
    };

    xhr.open("POST", newNoteRoute, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }))

}

const getNotes = () => {
  let xhr = new XMLHttpRequest();
  const apiPath = `/api/notes`;
  xhr.withCredentials = false;

  return new Promise(((resolve, reject) => {

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300){
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        })
      }
    };
    xhr.open("get", apiPath, true);
    xhr.send();
  }))
};

function editNote(apiRoute, noteTypeId, text){
  console.log(`Editing note at ${apiRoute}, it's now a ${noteTypeId} with text ${text}`);

  if(apiRoute === undefined){
    throw("apiRoute is a required field")
  }
  if(noteTypeId === undefined){
    throw("noteTypeId is a required field")
  }
  if(text === undefined){
    throw("text is a required field")
  }


  const data = {
    "text": text,
    "note_type_id": noteTypeId
  };


  console.log("sending request to " + apiRoute);
  console.log("sending " + JSON.stringify(data));

  let xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  return new Promise(((resolve, reject) => {
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300){
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        })
      }
    };

    xhr.open("PUT", apiRoute, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }));
}

function removeNote(apiRoute) {
  console.log(`Removing note at ${apiRoute}`);

  let xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  return new Promise(((resolve, reject) => {
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300){
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        })
      }
    };
    xhr.open("DELETE", apiRoute, true);
    xhr.send();
  }));
}

export const notes = {
  "getNotes": getNotes,
  "addNote": addNote,
  "editNote": editNote,
  "removeNote": removeNote
};