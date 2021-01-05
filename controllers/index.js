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

async function getTZ(dict){
    const tz = await execute(dict.agency, "select agency_timezone from agency;")
    console.log(tz[0].agency_timezone)
    return tz[0]
}

async function getRoutes(dict){
    const routes = await execute(dict.agency, "select * from routes;")
    console.log(routes);
    return routes
}

// getRoutes({agency:'boston'})

getTZ({agency:'boston'})

// if (prepareArray){
//     preparedQuery = {
//         text:query,
//         values:prepareArray
//     }
// }else{
//     preparedQuery = query 
// }
