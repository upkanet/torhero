#!/usr/bin/env node
import WebTorrent from 'webtorrent';
import express from 'express';
const app = express();
// app.use(express.static('public'));
import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, '../public')))

const client = new WebTorrent()

app.get('/',(req,res)=>{
    res.redirect('index.htm')
})

app.get('/m/:folder/:magnet', (req, res) =>{
    client.add(req.params.magnet, {path: `/home/pi/${req.params.folder}`}, function (torrent) {
        console.log('Client is downloading:', torrent.name)
        torrent.on('done', function () {
            console.log(torrent.name,'done')
            torrent.destroy()
        })
      })
    res.send(req.params.magnet);
});

app.get('/current',(req,res)=>{
    const torrents = client.torrents.map((torrent,i)=>{
        return {
            id: i,
            name: torrent.name,
            path: torrent.path,
            speed: torrent.downloadSpeed,
            progress: torrent.progress,
            size: torrent.length
        }
    })
    res.json(torrents)
    // res.send('[{"id":0,"name":"Rick.and.Morty.S06E01.1080p.WEBRip.x264-BAE[rarbg]","path":"/home/pi/series","speed":12118291.2,"progress":0.10576592330678518,"size":712267521},{"id":1,"name":"Rick.and.Morty.S06E02.1080p.WEBRip.x264-BAE[rarbg]","path":"/home/pi/series","speed":12118291.2,"progress":0.30576592330678518,"size":712267521}]')
})

app.get('/del/:id',(req,res)=>{
    const id = req.params.id
    if(id>client.torrents-1) return 0
    const torrent = client.torrents[id]
    console.log('Client is deleting',torrent.name)
    torrent.destroy()
})

app.listen(8000,()=>{
    console.log("TorHero available on http://localhost:8000")
});