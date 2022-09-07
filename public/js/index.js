console.log("Webtorrent JS")

function download(e){
    const input = e.target.parentNode.getElementsByTagName('input')[0]
    const magnet = encodeURIComponent(input.value)
    const folder = document.getElementById('folder').value
    console.log('Download',folder,magnet)
    fetch(`/m/${folder}/${magnet}`)
}

function clear(){
    console.log("clear")
    const input = document.querySelector('[name="magnet"]')
    input.value = ""
}

function del(e){
    const id = e.target.dataset['id']
    console.log('delete torrent',id)
    fetch(`/del/`+id)    
}

function currentStatus(){
    fetch('/current')
    .then((response)=>{
        return response.json()
    })
    .then((data)=>{
        console.log(data)
        const torlist = document.getElementById('torlist')
        torlist.innerHTML = ""
        data.forEach(torrent=>{
            torlist.append(strToDom(toritem(torrent)))
        })
        document.querySelectorAll('.btn-del').forEach(i => i.addEventListener('click',del))
    })
}

function toritem(torrent){
    return `<div class="border-bottom">
        <div class="torname">${torrent.name}</div>
        <div class="subinfo">
            <div class="col"><i class="bi bi-file-earmark"></i> ${parseInt(torrent.size/1024/1024)} Mo <i class="bi bi-folder"></i> ${torrent.path}</div>
        </div>
        <div class="row-progress">
            <div class="col-x me-2">
                <i class="bi bi-x-circle btn-del" data-id="${torrent.id}"></i>
            </div>
            <div class="col-progress">
                <div class="progress mt-2" style="height:7px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" id="torrentprogress" style="width: ${parseInt(torrent.progress*100)}%;"></div>
                </div>
            </div>
            <div class="col-speed ms-2 text-end">
                ${parseInt(torrent.speed/1024/1024*10)/10} Mo/s
            </div>
        </div>
    </div>`
}

function strToDom(str){
    const placeholder = document.createElement("div");
    placeholder.innerHTML = str;
    return placeholder.firstElementChild;
}

document.querySelectorAll('.btn-dl').forEach(i => i.addEventListener('click',download))
document.querySelectorAll('.btn-clear').forEach(i => i.addEventListener('click',clear))
currentStatus()
setInterval(currentStatus,15000)