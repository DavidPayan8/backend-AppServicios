const { Client } = require("basic-ftp") 
const config = require("../config/ftpcofig");

const example = async () =>{
    const client = new Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            secure: config.secure === "true"
        })
        console.log(await client.list())
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

module.exports = {
    example
}