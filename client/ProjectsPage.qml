import QtQuick 2.9
import QtQuick.Controls 2.5
import QtQuick.Layouts 1.3
//import Api 1.0

Page{
    id: root
    property url sourceURL
    //ProjectAdder{
    //        id: myAdder
    //        property url sourceURL: root.sourceURL
    //        url: sourceURL
    //        route: "/api/project/"
    //}
    onSourceURLChanged: {
        console.log(" SourceURL Changed to " + sourceURL)
        projectsModel.update()
    }
    Dialog{
        id: confirmDeleteDialog
        title: "Are you sure?"
        standardButtons: Dialog.Yes | Dialog.Cancel
        onAccepted: {
            console.log("deleting")
        }
    }

    Dialog{
        id: createNewRecordDialog
        title: "New Record"
    }

    Dialog{
        id: editRecordDialog
        title: "Edit Record"
    }
    Dialog{
        property alias details: text.text
        property int returnCode

        id: resultDialog
        title: "Result"
        width: 600
        height: 400
        x: (parent.width - width) / 2
        y: (parent.height - height) / 2
        padding: 20
        Rectangle{
            color: appPalette.alternateBase
            anchors.fill: parent
            border.color: appPalette.shadow

            ColumnLayout{
                spacing: 2
                clip: true
                anchors.fill: parent
                Rectangle{
                    Layout.preferredHeight: statusLabel.height
                    Layout.fillWidth: true
                    Label {
                        id: statusLabel
                        text: qsTr("Return Code: " + resultDialog.returnCode )
                    }
                }
                Rectangle{
                    Layout.fillHeight: true
                    Layout.fillWidth: true
                    ScrollView{
                        anchors.fill: parent
                        TextArea {
                            id: text
                            color: appPalette.text
                            padding: 10
                        }

                    }

                }
            }

        }
        standardButtons: Dialog.Ok
    }
    Action{
        id: newItemAction
        text: "New"
        icon.name: "document-new"
        onTriggered:{
            newProjectFormDialog.projectTitle = ""
            newProjectFormDialog.projectCode = ""
            newProjectFormDialog.status = ""
            newProjectFormDialog.currentLocation = ""
            newProjectFormDialog.open()
         }
        shortcut: StandardKey.New
    }

    Action{
        id: openItemAction
        text: "Edit"
        icon.name: "document-open"
        onTriggered: openEditor(projectsView.currentRow)
        shortcut: StandardKey.Open
        enabled: projectsView.validSelection

    }

    Action{
        id: deleteItemAction
        text: "Delete"
        icon.name: "edit-delete"
        onTriggered: {
            var row = projectsView.currentRow
            statusMessage.text = "deleting row " + row
            var item = projectsModel.get(row)
            confirmDeleteDialog.title = "Delete Project: " + item.title
            confirmDeleteDialog.open()

            // TODO: on accept confirmDeleteDialog delete project from given id
//            deleteByRow(projectsView.currentRow)
        }
        shortcut: StandardKey.Delete
        enabled: projectsView.validSelection
    }

    Component {
        id: component_contextMenu
        Menu{
            id: myContextMenu

            MenuItem{
                action: openItemAction
            }
            MenuItem{
                action: deleteItemAction
            }
        }
    }
    ApiModel {
        id: projectsModel
        sourceURL: root.sourceURL
        apiRoute: "api/project"

    }
    header: ToolBar{
        id: toolbar
        RowLayout{
            id: editToolsRow
            ToolButton{
                action: newItemAction
            }
            ToolButton{
                action: openItemAction
            }

            ToolButton{
                action: deleteItemAction
            }
            Layout.fillWidth: true

        }

    }
    ColumnLayout{
        anchors.fill: parent
        ProjectsViewTable {
                id: projectsView
                clip: true
                contextMenu: component_contextMenu
                onActivated: {
                    openEditor(row)
                }
                Layout.fillWidth: parent
                Layout.fillHeight: parent
            }
    }
    EditingDialog {
        id: projectFormDialog
        standardButtons: Dialog.Save | Dialog.Cancel
    }
    EditingDialog {
        id: newProjectFormDialog
        title: "New Project"
        standardButtons: Dialog.Save | Dialog.Cancel
        onAccepted: {
            myAdder.title = newProjectFormDialog.projectTitle
            myAdder.currentLocation = newProjectFormDialog.currentLocation
            myAdder.projectCode = newProjectFormDialog.projectCode
            myAdder.projectStatus = newProjectFormDialog.status
//            myAdder.specs = newProjectFormDialog.specs
//            myAdder.onSuccess = console.log("success")
//            myAdder.onFailure = console.log("Failed")
            myAdder.send()
            projectsModel.update()
           createNewProject(this)

        }
    }
    Timer{
         interval: dataRefreshRate
         repeat: true
         running: true
         onTriggered: {
             projectsModel.updateData()
         }
    }
   Component.onCompleted: {
        console.log(projectsModel.model)
        projectsView.model = projectsModel.model
   }
   function createNewProject(dialog){
        var projectTitle = dialog.projectTitle
        var projectCode = dialog.projectCode
        var status = dialog.status
        var currentLocation = dialog.currentLocation
        console.log("new project")
        console.log("projectTitle: " + projectTitle)
        console.log("projectCode: " + projectCode)
        var params = "title=dummy"
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5000/api/project/", true)
        xhr.setRequestHeader("Content-type", "application/json")

        xhr.onreadystatechange = function(){
            console.log(xhr.responseText)
            console.log(xhr.status)
            resultDialog.details = " "+ xhr.responseText
            resultDialog.returnCode = xhr.status
            resultDialog.open()
        }
        var parmas = JSON.stringify({"title": "asdfadsf"})
        console.log(parmas)
        xhr.send(params)
   }
   function openEditor(row){
        var row = row || 0


        var item = projectsModel.get(row)
        console.log("id = " + item.id)

        projectFormDialog.projectTitle = item.title
        projectFormDialog.projectCode = item.project_code
        projectFormDialog.status = item.status ? item.status: ""
        projectFormDialog.currentLocation = item.current_location ? item.current_location:
        console.log("Opening")
        projectFormDialog.open()

   }
   function deleteByRow(row){
        confirmDeleteDialog.open()
        statusMessage.text = "deleting row " + row
        var item = projectsModel.get(row)
        console.log("deleting row = " + item.id)

   }
}