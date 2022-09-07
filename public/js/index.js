console.log("Webtorrent JS")

function download(e) {
    const input = e.target.parentNode.getElementsByTagName('input')[0]
    const magnet = encodeURIComponent(input.value)
    const folder = document.getElementById('folder').value
    console.log('Download', folder, magnet)
    fetch(`/m/${folder}/${magnet}`)
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
            console.log(data)
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
                    <div class="col">${folder.name}</div><div class="col">${folder.path}</div><div class="col text-end"><i class="bi bi-x-circle"></i></div>
                </div>`))
            })
            folderslist.append(strToDom(`
                <div class="row" id="row-add-folder">
                    <div class="col"><input name="name" class="form-control" type="text" placeholder="Name"></div><div class="col"><input name="path" class="form-control" type="text" placeholder="/path/to/folder"></div><div class="col text-end"><button class="btn btn-primary" id="btn-add-folder"><i class="bi bi-plus"></i></i></button></div>
                </div>`))
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

function strToDom(str) {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = str;
    return placeholder.firstElementChild;
}

document.querySelectorAll('.btn-dl').forEach(i => i.addEventListener('click', download))
document.querySelectorAll('.btn-clear').forEach(i => i.addEventListener('click', clear))
document.querySelector('.btn-dialog').addEventListener('click', openFoldersDialog)
populateFolders()
currentStatus()
setInterval(currentStatus, 15000)