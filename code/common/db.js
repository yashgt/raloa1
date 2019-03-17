var mysql = require('mysql');

var pool;
var dbConn;

var logger = require('logger').getLogger();

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

function relconn(conn){
	logger.trace("Releasing connection {0}", conn);
	conn.release();
}

function execute(connection, qryStr, arg2, arg3, arg4){
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
	
	logger.trace("Executing {0} with {1}", qryStr, args);
	connection.query(qryStr, args, 
		function(err, results) {
			if(!err)
			{
				logger.trace("Results are : {0}", results);
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
	console.log("Invoking %j %j %j %j", qryStr, arg2, typeof(arg3), typeof(arg4));
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
	

	pool.getConnection(	function(err, conn){
		if(!err)
		{
			logger.trace("Got connection {0}", conn);
			execute(conn, qryStr, args
				, function(results){ 
					relconn(conn);
					cbSuccess(results); 
				}, function(err){
					relconn(conn);
					cbFailure(err);
				}
					);

		}
		else
		{
			logger.error("Error : {0}", err);
			if(typeof(cbFailure) == "function"){
				cbFailure(err);
			}
		}
	});
	
	
};

function Transaction(callback){

	var getConn = function(tran){
	
		pool.getConnection(	function(err, conn){
		if(!err)
		{
			logger.trace("Got connection {0}", conn);
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
			logger.error("Error during commit {0}", err);
          tran.conn.rollback(function() {
			relconn(tran.conn);
            fcb();
          });
        }
        console.log('Transaction committed successfully!');
		relconn(tran.conn);
		scb();
      });
	};
	
	tran.rollback = function(){
		tran.conn.rollback(function() {
            logger.debug('Transaction rolled back successfully!');
			relconn(tran.conn);
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


