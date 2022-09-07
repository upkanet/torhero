console.log("Webtorrent JS")

function download(e){
    const input = e.target.parentNode.getElementsByTagName('input')[0]
    const magnet = encodeURIComponent(input.value)
    const folder = document.getElementById('folder').value
    console.log('Download',folder,magnet)
    fetch(`/m/${folder}/${magnet}`)
}

function clear(e){
    console.log("clear")
    const input = e.target.parentNode.getElementsByTagName('input')[0]
    input.value = ""
}

function del(e){
    const id = e.target.dataset['id']
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
    return `<div class="tor">
        <div class="row">
            <div class="col">${torrent.name}</div>
        </div>
        <div class="row subinfo">
            <div class="col">${torrent.path}</div>
            <div class="col">${parseInt(torrent.size/1024/1024)} Mo</div>
        </div>
        <div class="row">
            <div class="col-1">
                <button type="button" class="btn-close btn-del" data-id="${torrent.id}"></button>
            </div>
            <div class="col-8">
                <div class="progress mt-2" style="height:7px;">
                    <div class="progress-bar" role="progressbar" id="torrentprogress" style="width: ${parseInt(torrent.progress*100)}%;"></div>
                </div>
            </div>
            <div class="col-3">
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
setInterval(currentStatus,1500)