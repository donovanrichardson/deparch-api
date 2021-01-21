const {Client} = require('pg')
// const agencies = require('../connections')
const {DateTime} = require('luxon')
const dFormat = 'yyyyLLdd'
const mongoose = require('mongoose');
require('dotenv').config()
const {Agency} = require('../agency')

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

async function getUriFromCity(city){
    const {uri} = await Agency.findOne({key:city})
    return uri
}

async function execute(city, query){ //refactor this so that individual methods do the preparedQuery
    const db = new Client(await getUriFromCity(city))
    await db.connect()
    
    const result = await db.query(query);
    await db.end()
    return result.rows
}

function getWeekday(datestring){
    const dt = DateTime.fromFormat(datestring,dFormat)
    return dt.weekdayLong.toLowerCase()
}

exports.getAgencies = async (req, res) => {//should get from mongo
    // let keys = Object.keys(agencies);
    // let newAgencies = {}
    // keys.forEach(agency =>{
    //     let notUrl = {}
    //     let agencyProps = Object.keys(agencies[agency])
    //     agencyProps.filter(l=>{
    //         return l !== 'url'
    //     }).forEach(prop=>{
    //         notUrl[prop] = agencies[agency][prop]
    //     })
    //     newAgencies[agency]= notUrl
    // })

    // res.send(newAgencies)

    const agencies = await Agency.find({},{uri:0, _id:0, "__v":0}).sort('name')
    res.send(agencies)

}

//agency
exports.getTZ = async (req, res) => {
    const tz = await execute(req.query.agency, "select agency_timezone from agency;")
    console.log(tz[0].agency_timezone)
    res.send(tz)
}

//agency date
exports.getRoutes = async (req, res) => {
    try{
        const weekday = getWeekday(req.query.date)
        const query = `select routes.route_id, routes.route_short_name, routes.route_long_name, routes.route_color, routes.route_text_color, coalesce(routes.route_short_name, routes.route_long_name) as name from routes order by name;`
        const routes = await execute(req.query.agency, query)
        console.log(routes);
        res.send(routes)
        res.status(200).send()
    }
    catch(err){
        res.status(500).send("error encontered")
    }
}

//agency date route
exports.getOrigins = async (req, res) => {
    try{
        const weekday = getWeekday(req.query.date)
    const query = `select distinct stops.*, calendar.* from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id  left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${req.query.route}' and ((calendar.${weekday}=1 and ${req.query.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2 and date = ${req.query.date})) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${req.query.date})) order by stops.stop_name;`
    console.log(query);
    const origins = await execute(req.query.agency, query)
    // console.log(origins);
    res.send(origins)}
    catch(err){
        res.status(500).send('error encountered')
    }
}
exports.getDests = async (req, res) => {
    try{
        const weekday = getWeekday(req.query.date)
    const query = `select distinct deststops.*, calendar.* from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id left join stop_times as desttimes on desttimes.trip_id = trips.trip_id and stop_times.stop_sequence < desttimes.stop_sequence left join stops as deststops on desttimes.stop_id = deststops.stop_id left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${req.query.route}' and stops.stop_id = '${req.query.origin}' and ((calendar.${weekday}=1 and ${req.query.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2 and date = ${req.query.date})) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${req.query.date})) order by deststops.stop_name;`
    const dests = await execute(req.query.agency, query)
    console.log(query);
    res.send(dests)}
    catch(err){
        res.status(500).send('error encountered')
    }
}

exports.getTT = async (req, res) => {
    try{
        const weekday = getWeekday(req.query.date)
    const query = `select distinct stop_times.departure_time,stop_times.departure_timestamp, stops.stop_id, stops.stop_code, stops.stop_name as oriname, stops.stop_desc, deststops.stop_id, deststops.stop_code, deststops.stop_name as destname, deststops.stop_desc, routes.route_short_name, routes.route_long_name, routes.route_color, routes.route_text_color, ${req.query.date} as date from stops left join stop_times on stops.stop_id = stop_times.stop_id left join trips on stop_times.trip_id = trips.trip_id left join stop_times as desttimes on desttimes.trip_id = trips.trip_id and stop_times.stop_sequence < desttimes.stop_sequence left join stops as deststops on desttimes.stop_id = deststops.stop_id left join calendar on calendar.service_id = trips.service_id left join routes on trips.route_id = routes.route_id where routes.route_id = '${req.query.route}' and stops.stop_id = '${req.query.origin}' and deststops.stop_id = '${req.query.dest}' and ((calendar.${weekday}=1 and ${req.query.date} between calendar.start_date and calendar.end_date and not exists(select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 2 and date = ${req.query.date})) or exists (select * from calendar_dates where calendar_dates.service_id = calendar.service_id and calendar_dates.exception_type = 1 and date = ${req.query.date})) order by stop_times.departure_time;`
    const timetable = await execute(req.query.agency, query)
    console.log(timetable);
    res.send(timetable)}
    catch(err){
        res.status(500).send('error encountered')
    }
}

// getTT({agency:'boston',date:'20201205', route:'83', origin:'2621', dest:'2463'})

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
