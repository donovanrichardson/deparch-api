const {Client} = require('pg')
const urls = require('../connections')
// console.log(urls);

async function test(){
    const db = await new Client(urls.boston)
    db.connect()
    console.log(db);
}

async function execute(city, query){ //refactor this so that individual methods do the preparedQuery
    const db = new Client(urls[city])
    await db.connect()
    
    const result = await db.query(query);
    // console.log(query, urls[city]);
    await db.end()
    return result.rows
}

async function getRoutes(dict){
    const routes = await execute(dict.agency, "select * from routes;")
    console.log(routes);
    return routes
}

getRoutes({agency:'boston'})

// if (prepareArray){
//     preparedQuery = {
//         text:query,
//         values:prepareArray
//     }
// }else{
//     preparedQuery = query 
// }
