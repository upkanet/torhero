#!/usr/bin/env node
import WebTorrent from 'webtorrent';
import express from 'express';
import https from 'https';
const app = express();
import expressWs from 'express-ws';
const wsInstance = expressWs(app)
// app.use(express.static('public'));
import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
import fs from 'fs'
import {Folders} from '../lib/folders.mjs'
import { pass, checkAuthenticated } from '../lib/auth.mjs';

let port = 8000
if(process.argv.includes('-p')) port = process.argv[process.argv.indexOf('-p') + 1]

//Auth
if(process.argv.includes('-auth')){
    const userpassword = process.argv[process.argv.indexOf('-auth') + 1]
    pass.active = true
    pass.password = userpassword
}

const client = new WebTorrent()

let folders
if(process.argv.includes('-folders')){
    folders = new Folders(process.argv[process.argv.indexOf('-folders') + 1])
}
else{
    folders = new Folders()
}

app.get('/', checkAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, '../public/index.htm'))
})

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, '../public/login.htm'))
})

//RESTful magnets webservice
//Index
app.get('/magnets',(req,res)=>{
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

//Create
app.post('/magnets', (req, res) =>{
    if(!fs.existsSync(req.body.folder)) return 0
    client.add(req.body.magnet, {path: `${req.body.folder}`}, function (torrent) {
        console.log('Downloading:', torrent.name)
        broadcastRestMagnets('create',torrent.name)
        torrent.on('done', function () {
            console.log('Finished:',torrent.name)
            broadcastRestMagnets('done',torrent.name)
            torrent.destroy()
        })
      })
    res.send(req.body.magnet);
});

//Destroy
app.delete('/magnets/:id',(req,res)=>{
    const id = req.params.id
    if(id>client.torrents-1) return 0
    const torrent = client.torrents[id]
    console.log('Deleting:',torrent.name)
    broadcastRestMagnets('destroy',torrent.name)
    torrent.destroy()
})

//RESTful folders webservice
//Index
app.get('/folders',(req,res)=>{
    folders.load()
    res.json(folders.list)
})

//Create
app.post('/folders',(req,res)=>{
    folders.load()
    const b = req.body
    folders.add(b.name,b.path)
    res.json({"message":"ok"})
})

//Destroy
app.delete('/folders/:name',(req,res)=>{
    folders.remove(req.params.name)
    res.json({"message":"ok"})
})

//WebSocket
app.ws('/', function(ws, req) {
    console.log('ws client')
    ws.on('message', function(msg) {
      console.log(msg);
    });
});

function broadcast(msg){
    wsInstance.getWss().clients.forEach((ws)=>{
        ws.send(msg)
    })
}

function broadcastRestMagnets(controller,name){
    broadcast(JSON.stringify({
        controller:controller,
        name:name
    }))
}


if(process.argv.includes('-s')){
    const httpskey = process.argv[process.argv.indexOf('-k') + 1]
    const httpscert = process.argv[process.argv.indexOf('-c') + 1]
    https
        .createServer(
            {
                key:fs.readFileSync(httpskey),
                cert:fs.readFileSync(httpscert)
            },
            app
            )
        .listen(port,()=>{
            console.log("TorHero available on https://localhost:"+port)
        })
}
else{
    app.listen(port,()=>{
        console.log("TorHero available on http://localhost:"+port)
    });
}