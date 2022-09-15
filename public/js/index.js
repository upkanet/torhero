console.log("TorHero")

//RESTful magnets
//Index magnets
function indexMagnets() {
    fetch('/magnets')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            const torlist = document.getElementById('torlist')
            torlist.innerHTML = ""
            data.forEach(torrent => {
                torlist.append(strToDom(toritem(torrent)))
            })
            document.querySelectorAll('.btn-del').forEach(i => i.addEventListener('click', destroyMagnets))
        })
}

function toritem(torrent) {
    return `<div class="border-bottom">
        <div class="torname">${torrent.name}</div>
        <div class="subinfo">
            <div class="col"><i class="bi bi-file-earmark"></i> ${parseInt(torrent.size / 1024 / 1024)} Mo <i class="bi bi-arrow-right"></i> <i class="bi bi-folder"></i> ${torrent.path}</div>
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

//New magnets
document.getElementById('btn-dl').addEventListener('click', createMagnets)

//Create magnets
function createMagnets(e) {
    const input = document.querySelector('[name="magnet"]')
    const magnet = input.value
    const folder = document.getElementById('folder').value
    console.log('Download', folder, magnet)
    fetch(`/magnets`,{
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

//Destroy magnets
function destroyMagnets(e) {
    const id = e.target.dataset['id']
    console.log('delete torrent', id)
    fetch(`/magnets/${id}`,{method:'DELETE'})
}

//RESTful folders
//Index folders
function indexFolders() {
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

//New folders
function newFolders(){
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
            document.querySelectorAll('.btn-del-folder').forEach(i => i.addEventListener('click', destroyFolders))
            document.getElementById('btn-add-folder').addEventListener('click', createFolders)
        })
}

const foldersDialog = document.getElementById('foldersDialog')

function openFoldersDialog() {
    newFolders()
    foldersDialog.showModal()
}

document.getElementById('btn-open-folder-dialog').addEventListener('click', openFoldersDialog)
document.getElementById('btn-close-folder-dialog').addEventListener('click',()=>{
    indexFolders()
    foldersDialog.close()
})

//Create folders
function createFolders() {
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
        newFolders()
    })
}

//Destroy folders
function destroyFolders(e){
    const folder = e.target.dataset['folder']
    console.log('delete',folder)
    fetch('/folders/'+folder,{
        method: 'DELETE'
    }).then((response) => response.json())
    .then((data)=>{
        console.log(data)
        newFolders()
    })
}

//WebSocket
const socket = new WebSocket('ws://'+window.location.host);
socket.addEventListener('message', function (event) {
    console.log('WS Server:', event.data);
    toastMsg(event.data)
});
const toast = new bootstrap.Toast(document.getElementById('toast'))
function toastMsg(msg){
    msg = JSON.parse(msg)
    toast._element.querySelector('.toast-body').innerHTML = `<i class="bi bi-${controllerIcon[msg.controller]}"></i>  ${msg.name}`
    toastColor(controllerColor[msg.controller])
    toast.show()
}
const controllerIcon = {
    create:'plus-circle',
    done:'check-circle',
    destroy:'x-circle'
}
function toastColor(colorName){
    var el = document.getElementById('toast')
    el.classList.forEach((className)=>{
        if (className.startsWith('text-bg-')) {
            el.classList.remove(className);
        }
    })
    el.classList.add('text-bg-'+colorName)
}
const controllerColor = {
    create:'primary',
    destroy:'danger',
    done:'success'
}

//Config
const configDialog = document.getElementById('configDialog')
document.getElementById('btn-open-config-dialog').addEventListener('click',()=>{
    configDialog.showModal()
})
document.getElementById('btn-magnet-handler').addEventListener('click',()=>{
    navigator.registerProtocolHandler("magnet",window.location.origin+"/?open=%s","TorHero Magnet handler")
})
//Config magnet: handler
function checkOpenMagnet(){
    const urlParams = new URLSearchParams(window.location.search);
    const magnet = urlParams.get('open');
    document.querySelector('[name="magnet"]').value = magnet
}
document.getElementById('btn-close-config-dialog').addEventListener('click',()=>{
    configDialog.close()
})
//Check HTTPS
function checkHttps(){
    if(location.protocol=='https:') return 0
    document.querySelectorAll('.https-required').forEach((el)=>{
        el.setAttribute('disabled','')
    })
}

//Helpers
function strToDom(str) {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = str;
    return placeholder.firstElementChild;
}
function clear() {
    console.log("clear")
    const input = document.querySelector('[name="magnet"]')
    input.value = ""
}
document.querySelectorAll('.btn-clear').forEach(i => i.addEventListener('click', clear))

//Startup
checkOpenMagnet()
checkHttps()
indexFolders()
indexMagnets()
setInterval(indexMagnets, 1500)