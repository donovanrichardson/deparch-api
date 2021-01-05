const {Client} = require('pg')
const urls = require('../connections')
const {DateTime} = require('luxon')
// console.log(urls);
const dFormat = 'yyyyLLdd'

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

function getWeekday(datestring){
    const dt = DateTime.fromFormat(datestring,dFormat)
    return dt.weekdayLong.toLowerCase()
}

async function getRoutes(dict){
    const weekday = getWeekday(dict.date)
    const query = `select routes.route_short_name, routes.route_long_name, routes.route_color, routes.route_text_color from routes;`
    const routes = await execute(dict.agency, query)
    console.log(routes);
    return routes
}

getRoutes({agency:'boston',date:'20201205'})

// getTZ({agency:'boston'})

// if (prepareArray){
//     preparedQuery = {
//         text:query,
//         values:prepareArray
//     }
// }else{
//     preparedQuery = query 
// }
