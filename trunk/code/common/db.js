var mysql = require('mysql');

var pool;
var dbConn;

var logger = require('logger').getLogger();

/*
var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

exports.createConnection = function createConnection(dbConfig)
{
	
};
*/

exports.createPool = function createPool(dbConfig)
{
	logger.debug('Creating pool');
	pool = mysql.createPool(dbConfig);
	pool.getConnection(	function(err, conn){
		if(!err)
		{
			dbConn = conn ;
		}
	});
};

exports.connect = function connect(command)
{
	pool.getConnection(	function(err, conn){
		if(!err)
		{
			command(conn);
		}
	});
};

function execute(connection, qryStr, arg2, arg3, arg4){
	console.log("%j %j %j %j", qryStr, arg2, typeof(arg3), typeof(arg4));
	var args;
	var cbSuccess, cbFailure;
	if(Array.isArray(arg2)) {
		args = arg2 ;
		if(typeof(arg3) == "function"){
		cbSuccess = arg3;
		cbFailure = arg4;
		}
	} 
	else {
		args = [];
		if(typeof(arg2) == "function"){
		cbSuccess = arg2;
		cbFailure = arg3;
		}
	}
	
	logger.debug("Executing {0} with {1}", qryStr, args);
	connection.query(qryStr, args, 
		function(err, results) {
			if(!err)
			{
				logger.debug("Results are : {0}", results);
				cbSuccess(results);
			}
			else
			{
				logger.error("Error : {0}", err);
				if(typeof(cbFailure) == "function"){
					cbFailure(err);
				}
			}
		}
	)
}

exports.query = function query( qryStr, arg2, arg3, arg4)
{
	//console.log("%j %j %j %j", qryStr, arg2, typeof(arg3), typeof(arg4));
	pool.getConnection(	function(err, conn){
		if(!err)
		{
			execute(conn, qryStr, arg2, arg3, arg4 );
			conn.release();
		}
	});
	
	/*
	
	var args;
	var cbSuccess, cbFailure;
	if(Array.isArray(arg2)) {
		args = arg2 ;
		if(typeof(arg3) == "function"){
		cbSuccess = arg3;
		cbFailure = arg4;
		}
	} 
	else {
		args = [];
		if(typeof(arg2) == "function"){
		cbSuccess = arg2;
		cbFailure = arg3;
		}
	}
	
	logger.debug("Executing {0} with {1}", qryStr, args);
	dbConn.query(qryStr, args, 
		function(err, results) {
			if(!err)
			{
				logger.debug("Results are : {0}", results);
				cbSuccess(results);
			}
			else
			{
				logger.error("Error : {0}", err);
				if(cbFailure!=undefined){
				cbFailure();
				}
			}
		}
	)
	*/
};

function Transaction(callback){

	var getConn = function(tran){
	
		pool.getConnection(	function(err, conn){
		if(!err)
		{
			console.log("Got connection");
			tran.conn = conn ;

			conn.beginTransaction(			
			function(err) {
				if (err) { throw err; };
				callback(tran);
			}
			);
		}
	});
	
	tran.commit = function(scb, fcb){		
		logger.debug("Commiting transaction");
		tran.conn.commit(function(err) {
        if (err) { 
          tran.conn.rollback(function() {
            fcb();
          });
        }
        console.log('Transaction committed successfully!');
		scb();
      });
	};
	
	tran.rollback = function(){
		tran.conn.rollback(function() {
            console.log('Transaction rolled back successfully!');
        });
	}
	
	};
	
	getConn(this);

	
	this.query = function(qryStr, arg2, arg3, arg4){
		
		execute(this.conn, qryStr, arg2, arg3, arg4 );
	};
	

	
};

exports.getTransaction = function(callback){

	return new Transaction(callback);	
	
};


