var request = require('request');
var cheerio = require('cheerio');
const url = require('url');
var date = require('date-and-time');

var protobuf = require("protobufjs");

var FeedMessage ;

protobuf.load("gtfs-realtime.proto", function(err, root) {
    if (err)
        throw err;
 
    // Obtain a message type
    FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    //console.log(FeedMessage);

});

parseYB = function(cb){
    console.log("Parsing Yourbus")  ;
    var feedMessage = {
        header : {
            gtfsRealtimeVersion : '2.0',
            timestamp : Math.floor(Date.now()/1000),
            incrementality : 0
        },
        entity : []
    };   
    
    const tripMap = {
        'ABC': 123,
        'XYZ': 456
    }
    
    request('http://reports.yourbus.in/allbuslocations_dash.php?opid=4e3c8f26fcb903d33bf394ba64713dd71b3d8af0',function(error, response, html){
         if(!error){
             var $ = cheerio.load(html);

             var trs = $('#delayreport_nowidth tbody').children();   
             //console.log(trs.length);
             //console.log(trs);

            trs.each(function(i, elem) {
                var tds = $(this).children();
                var veh = {
                    vehicle : {
                        trip : {
                            tripId : "abc"
                        },
                        vehicle : {
                            id : "",
                            label : "",
                            licensePlate: ""
                        },
                        position : {
                            latitude : 0.0,
                            longitude : 0.0
                        },
                        timestamp : ""

                    }
                };
                tds.each(function(j,elt){
                    //console.log($(this).text());
                    switch (j) {
                        case 1:
                            var txt = $(this).text();
                            txt = txt.trim();
                            txt = txt.replace(/\u00a0/g, " ");
                            txt = txt.replace(/ +/g, " ");
                            var nameparts = txt.split(" ");
                            //console.log(txt);
                            //console.log(nameparts);
                            veh.id=nameparts[0];
                            if(nameparts.length>3){                                
                                veh.vehicle.vehicle.label = nameparts[1];
                            }
                            
                            veh.vehicle.vehicle.id = nameparts[0];
                            veh.vehicle.vehicle.licensePlate = nameparts[0];
                            break;
                        case 3:
                            var href = $(this).children('a').attr('href');
                            const myURL = new url.URL(href);
                            var loc = myURL.searchParams.get('q');
                            veh.vehicle.position.latitude = parseFloat(loc.split(", ")[0]);
                            veh.vehicle.position.longitude = parseFloat(loc.split(", ")[1]);
                            break;
                            //.data('href');
                            //console.log(href);
                        case 5:
                            var dttm = $(this).text().trim();
                            
                            dttm = dttm.replace(/AM/g, "a.m.");
                            dttm = dttm.replace(/PM/g, "p.m.");
                            //26-May-18 09:43 AM
                            //console.log(dttm);
                            var tm = date.parse(dttm, 'DD-MMM-YY hh:mm A');
                            var dt = new Date(tm);
                            
                            //console.log(tm);
                            veh.vehicle.timestamp = Math.floor(dt.getTime()/1000) ;
                            break;
                            //console.log(tm);
                        default:
                            break;
                    }
                });
                //console.log(veh);
                feedMessage.entity.push(veh);
                
                //console.log(tds.get(1).text());

            });

            var errMsg = FeedMessage.verify(feedMessage);
            console.log(feedMessage);
            if (errMsg)
                throw Error(errMsg);
 
            // Create a new message
            var message = FeedMessage.create(feedMessage); // or use .fromObject if conversion is necessary
 
            // Encode a message to an Uint8Array (browser) or Buffer (node)
            var buffer = FeedMessage.encode(feedMessage).finish();
            cb(feedMessage, buffer);             
             
         }

    })
}
exports.parseYourBus = function(cb){
    console.log("Watching Yourbus")  ;

    //setInterval(parseYB, 20000);
    parseYB(cb);


};
