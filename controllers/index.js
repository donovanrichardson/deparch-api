const {Client} = require('pg')
const agencies = require('../connections')
const {DateTime} = require('luxon')
const dFormat = 'yyyyLLdd'

async function execute(city, query){ //refactor this so that individual methods do the preparedQuery
    const db = new Client(agencies[city].url)
    await db.connect()
    
    const result = await db.query(query);
    await db.end()
    return result.rows
}



async function getAgencies(){
    console.log(agencies) //should get from mongo
    return agencies
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
    const query = `select routes.route_id, routes.route_short_name, routes.route_long_name, routes.route_color, routes.route_text_color from routes;`
    const routes = await execute(dict.agency, query)
    console.log(routes);
    return routes
}

async function getOrigins(dict){
    const weekday = getWeekday(dict.date)
    const query = `select distinct stops.*, calendar.* from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id  left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${dict.route}' and ((calendar.${weekday}=1 and ${dict.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2)) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${dict.date}));`
    const origins = await execute(dict.agency, query)
    console.log(origins);
}
async function getDests(dict){
    const weekday = getWeekday(dict.date)
    const query = `select distinct deststops.*, calendar.* from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id left join stop_times as desttimes on desttimes.trip_id = trips.trip_id and stop_times.stop_sequence < desttimes.stop_sequence left join stops as deststops on desttimes.stop_id = deststops.stop_id left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${dict.route}' and stops.stop_id = '${dict.origin}' and ((calendar.${weekday}=1 and ${dict.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2)) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${dict.date}));`
    const dests = await execute(dict.agency, query)
    console.log(dests);
}

async function getTT(dict){
    const weekday = getWeekday(dict.date)
    const query = `select distinct stop_times.departure_time,stop_times.departure_timestamp, stops.stop_id, stops.stop_code, stops.stop_name, stops.stop_desc, deststops.stop_id, deststops.stop_code, deststops.stop_name, deststops.stop_desc, routes.route_short_name, routes.route_long_name, routes.route_color, routes.route_text_color, ${dict.date} as date from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id left join stop_times as desttimes on desttimes.trip_id = trips.trip_id and stop_times.stop_sequence < desttimes.stop_sequence left join stops as deststops on desttimes.stop_id = deststops.stop_id left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${dict.route}' and stops.stop_id = '${dict.origin}' and deststops.stop_id = '${dict.dest}' and ((calendar.${weekday}=1 and ${dict.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2)) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${dict.date}));`
    const timetable = await execute(dict.agency, query)
    console.log(timetable);
}

getTT({agency:'boston',date:'20201205', route:'83', origin:'2621', dest:'2463'})

// getDests({agency:'boston',date:'20201205', route:'83', origin:'2621'})

// getOrigins({agency:'boston',date:'20201205', route:'83'})

// getRoutes({agency:'boston',date:'20201205'})

// getTZ({agency:'boston'})

// getAgencies()

// if (prepareArray){
//     preparedQuery = {
//         text:query,
//         values:prepareArray
//     }
// }else{
//     preparedQuery = query 
// }
