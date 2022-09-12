import bcrypt from 'bcrypt'

class Pass{
    constructor(active = false,userpassword=""){
        this.active = active
        this.password = userpassword
    }
}

let pass = new Pass()

async function checkAuthenticated(req, res, next){
    if(!pass.active) return next()
    if(req.query.pwd !== undefined && (await bcrypt.compare(req.query.pwd, pass.password))) return next();
    return res.redirect('/login');
}

export {pass,checkAuthenticated}