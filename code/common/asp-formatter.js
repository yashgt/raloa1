// formats using the ASP.NET style found as answered in SO:
// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format

// Why ASP.NET (.NET) formatting?
// First, this is not the place for templating (handlebars, mustache, ejs, lodash, etc.)
// We're formatting log messages after all...
// Second, I like ASP.NET (.NET) formatting better than the alternatives,
// and it is the closest I could find to the SLF4J format
// JavaScript doesn't have strong types, per se, so requiring developers to match
// types with sprintf is too much friction

// Q: "Aren't regular expressions slow?" "Isn't there a DOS attack lying in this code?"
// A: Maybe.  If you can think of a test case where user input (not a string that developers write) 
// that will cause DOS, please send the test case our way.
module.exports.format = function(format, args){
	if( args && args.length > 0 )
	{
		if( (typeof format == 'string') )
		{
			return format.replace(/{(\d+)}/g, function(match, number) { 
				return typeof args[number] != 'undefined'
					? JSON.stringify(args[number] )
					: match
				;
			});
		}
		else
		{
			// preserve the javascript object
			// discard arguments
			return JSON.stringify(format, null, '\t');
		}
	}
	else
	{
		return JSON.stringify(format, null, '\t');
	}
};