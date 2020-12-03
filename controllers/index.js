const {Client} = require('pg')
const urls = require('../connections')
// console.log(urls);

async function test(){
    const db = await new Client(urls.boston)
    db.connect()
    console.log(db);
}

async function execute(city, query, prepareArray){ //refactor this so that individual methods do the preparedQuery
    const db = await new Client(urls[city])
    let preparedQuery;
    if (prepareArray){
        preparedQuery = {
            text:query,
            values:prepareArray
        }
    }else{
        preparedQuery = query 
    }

    const result = await db.query(query);
    await db.end()
    return result.rows
}
