function editData(apiRoot) {
    console.log("HERE");
    console.log("form = " + document.forms["new-content-form"]["title"].value);
    $('#success').modal('show');

    let changeLog =  "Changed title to " + document.forms["new-content-form"]["title"].value
    document.getElementById("changelog").innerText = changeLog


    return false;
}