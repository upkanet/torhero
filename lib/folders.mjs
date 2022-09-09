import fs from 'fs'
import path from 'path'
import url from 'url'
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Folders{
    constructor(fpath = path.join(__dirname,'../folders.json')){
        this.path = fpath
        console.log('Loading folders on',this.path)
        this.items = {}
    }

    add(name,path){
        this.items[name] = path
        this.save()
    }

    remove(name){
        delete this.items[name]
        this.save()
    }

    save(){
        fs.writeFileSync(this.path, JSON.stringify(this.items))
    }

    load(){
        if(!fs.existsSync(this.path)) return 0;
        const data = fs.readFileSync(this.path)
        this.items = JSON.parse(data)
    }

    get list(){
        let r = []
        for (const [key, value] of Object.entries(this.items)) {
            r.push({
                name:key,
                path:value
            })
        }
        return r
    }

}

export {Folders}
