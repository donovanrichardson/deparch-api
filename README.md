# Deparch

An API that provides departure timetables for transit systems.

<!-- ## Agencies ??? -->

## /routes

returns a list of routes in an agency.

- agency: key for the agency (e.g. `mbta`)

## /origins

returns origins on a route.

- agency: key for the agency (e.g. `mbta`)
- route: route id for an origin

## /dests

returns destinations on a route from an origin

- agency: key for the agency (e.g. `mbta`)
- route: route id for an origin
- origin: stop id for an origin

## /timetables

returns a set of departure times for an origin-destination pair on a transit route

- agency: key for the agency (e.g. `mbta`)
- route: route id for a timetable
- origin: stop id for an origin
- dest: stop id for a destination

