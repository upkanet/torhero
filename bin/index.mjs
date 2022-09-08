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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import {Folders} from '../lib/folders.mjs'
import fs from 'fs'

const client = new WebTorrent()
const folders = new Folders()

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '../public/index.htm'))
})

//Add magnet
app.post('/magnet', (req, res) =>{
    if(!fs.existsSync(req.body.folder)) return 0
    client.add(req.body.magnet, {path: `${req.body.folder}`}, function (torrent) {
        console.log('Downloading:', torrent.name)
        torrent.on('done', function () {
            console.log('Finished:',torrent.name)
            torrent.destroy()
        })
      })
    res.send(req.body.magnet);
});

//List magnets
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
})

//Delete magnet
app.get('/del/:id',(req,res)=>{
    const id = req.params.id
    if(id>client.torrents-1) return 0
    const torrent = client.torrents[id]
    console.log('Deleting:',torrent.name)
    torrent.destroy()
})

//Folders
app.get('/folders',(req,res)=>{
    folders.load()
    res.json(folders.list)
})

app.post('/folders',(req,res)=>{
    folders.load()
    const b = req.body
    folders.add(b.name,b.path)
    res.json({"message":"ok"})
})

app.delete('/folders/:name',(req,res)=>{
    folders.remove(req.params.name)
    res.json({"message":"ok"})
})

const port = (process.argv[2]=="-p") ? process.argv[3] : 8000

app.listen(port,()=>{
    console.log("TorHero available on http://localhost:"+port)
});