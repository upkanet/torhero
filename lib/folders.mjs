import fs from 'fs'
import path from 'path'
import url from 'url'
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Folders{
    constructor(){
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
        fs.writeFileSync(path.join(__dirname, '../folders.json'), JSON.stringify(this.items))
    }

    load(){
        const data = fs.readFileSync(path.join(__dirname, '../folders.json'))
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
