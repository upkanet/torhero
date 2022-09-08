console.log("Webtorrent JS")

function download(e) {
    const input = document.querySelector('[name="magnet"]')
    const magnet = input.value
    const folder = document.getElementById('folder').value
    console.log('Download', folder, magnet)
    fetch(`/magnet`,{
        method:'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            folder:folder,
            magnet:magnet
        })
    })
}

function clear() {
    console.log("clear")
    const input = document.querySelector('[name="magnet"]')
    input.value = ""
}

function del(e) {
    const id = e.target.dataset['id']
    console.log('delete torrent', id)
    fetch(`/del/` + id)
}

function currentStatus() {
    fetch('/current')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            const torlist = document.getElementById('torlist')
            torlist.innerHTML = ""
            data.forEach(torrent => {
                torlist.append(strToDom(toritem(torrent)))
            })
            document.querySelectorAll('.btn-del').forEach(i => i.addEventListener('click', del))
        })
}

function toritem(torrent) {
    return `<div class="border-bottom">
        <div class="torname">${torrent.name}</div>
        <div class="subinfo">
            <div class="col"><i class="bi bi-file-earmark"></i> ${parseInt(torrent.size / 1024 / 1024)} Mo <i class="bi bi-folder"></i> ${torrent.path}</div>
        </div>
        <div class="row-progress">
            <div class="col-x me-2">
                <i class="bi bi-x-circle btn-del" data-id="${torrent.id}"></i>
            </div>
            <div class="col-progress">
                <div class="progress mt-2" style="height:7px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" id="torrentprogress" style="width: ${parseInt(torrent.progress * 100)}%;"></div>
                </div>
            </div>
            <div class="col-speed ms-2 text-end">
                ${parseInt(torrent.speed / 1024 / 1024 * 10) / 10} Mo/s
            </div>
        </div>
    </div>`
}

function populateFolders() {
    const sel = document.getElementById('folder')
    sel.innerHTML = ""
    fetch('/folders')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            data.forEach((folder) => {
                sel.append(strToDom(`<option value="${folder.path}">${folder.name}</option>`))
            })
        })
}

const foldersDialog = document.querySelector('dialog')

function openFoldersDialog() {
    listFolders()
    foldersDialog.showModal()
}

function listFolders(){
    const folderslist = document.getElementById('folderslist')
    folderslist.innerHTML = ""

    fetch('/folders')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            data.forEach((folder) => {
                folderslist.append(strToDom(`
                <div class="row">
                    <div class="col">${folder.name}</div><div class="col">${folder.path}</div><div class="col text-end"><i class="bi bi-x-circle btn-del-folder" data-folder="${folder.name}"></i></div>
                </div>`))
            })
            folderslist.append(strToDom(`
                <div class="row" id="row-add-folder">
                    <div class="col"><input name="name" class="form-control" type="text" placeholder="Name"></div><div class="col"><input name="path" class="form-control" type="text" placeholder="/path/to/folder"></div><div class="col text-end"><button class="btn btn-primary" id="btn-add-folder"><i class="bi bi-plus"></i></i></button></div>
                </div>`))
            document.querySelectorAll('.btn-del-folder').forEach(i => i.addEventListener('click', delFolder))
            document.getElementById('btn-add-folder').addEventListener('click', addFolder)
        })
}

function addFolder() {
    const row = document.getElementById('row-add-folder')
    const iname = row.querySelector('[name="name"]')
    const ipath = row.querySelector('[name="path"]')
    console.log("add folder", iname.value, ipath.value)
    fetch('/folders', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name:iname.value, path:ipath.value})
    }).then((response) => response.json())
    .then((data)=>{
        listFolders()
    })
}

function delFolder(e){
    const folder = e.target.dataset['folder']
    console.log('delete',folder)
    fetch('/folders/'+folder,{
        method: 'DELETE'
    }).then((response) => response.json())
    .then((data)=>{
        console.log(data)
        listFolders()
    })
}

function strToDom(str) {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = str;
    return placeholder.firstElementChild;
}

document.getElementById('btn-dl').addEventListener('click', download)
document.querySelectorAll('.btn-clear').forEach(i => i.addEventListener('click', clear))
document.querySelector('.btn-dialog').addEventListener('click', openFoldersDialog)
document.getElementById('btn-close-folder-dialog').addEventListener('click',()=>{
    populateFolders()
    foldersDialog.close()
})
populateFolders()
currentStatus()
setInterval(currentStatus, 1500)