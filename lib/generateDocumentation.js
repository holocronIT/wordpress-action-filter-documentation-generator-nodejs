var fs 		=	require('fs-extra');
var path 	= 	require('path');

/**
 * Discovered Action List Array
 * @type {Array}
 */
var action_list = [];

/**
 * Discovered Filter List Array
 * @type {Array}
 */
var filter_list = [];

console.log( 'Generating Docs for filters and action in '+process.cwd() );


fromDir( './' ,/\.php$/,function(filename){ // Discover all .php file inc urrent dir

	/**
	 * File content
	 * @type {[type]}
	 */
	var str = fs.readFileSync('./'+filename);

	/**
	 * Regex for wordpress filters
	 * @type {RegExp}
	 */
	const regex_filter = /(apply_filters\((.*)\))/g;

	/**
	 * Regex for wordpress actions
	 * @type {RegExp}
	 */
	const regex_action = /(do_action\((.*)\))/g;

	let m;

	while ((m = regex_filter.exec(str)) !== null) {  // Discover Filters
	    if (m.index === regex_filter.lastIndex) { regex.lastIndex++; }
	    
	    m.forEach((match, groupIndex) => {
	    	if( groupIndex == 2 ){

	    		filter_func = match.replace(/[ '\\""]*/g,'').split(',');   // Clean the result
	    		filter_name = filter_func.shift();
	    		if( filter_func.length >= 1 ){
	    			filter_list.push( { name : filter_name, param_count : filter_func.length , params : filter_func } );  // Push filter in result array
	    		}
	    		
	    	}
	        
	    });
	}

	while ((m = regex_action.exec(str)) !== null) {  // Discover Actions
	    if (m.index === regex_action.lastIndex) { regex.lastIndex++; }
	    
	    m.forEach((match, groupIndex) => {
	    	if( groupIndex == 2 ){

	    		action_func = match.replace(/[ '\\""]*/g,'').split(',');  // Clean the result
	    		action_name = action_func.shift();
	    		if( action_func.length >= 1 ){
	    			action_list.push( { name : action_name, param_count : action_func.length , params : action_func } ); // Push action in result array
	    		}
	    		
	    	}
	        
	    });
	}


});



/**
 * Variable for file content
 * @type {String}
 */
var md_buffer = '';

/**
 *
 * Filter list table head
 *
 */
md_buffer = '# Filters list\r\n';
md_buffer += '| Filter Name | Params Count | Passed Values | Comments | \r\n';
md_buffer += '| -------- | -------- | -------- | -------- | \r\n';
filter_list.forEach(function(e,i) {
	md_buffer += '| '+e.name+' | '+e.param_count+' | '+e.params.join(', ')+' | - | \r\n';
});


/**
 *
 * Action list table head
 *
 */
md_buffer += '# Action list\r\n';
md_buffer += '| Action Name | Params Count | Passed Values | Comments | \r\n';
md_buffer += '| -------- | -------- | -------- | -------- | \r\n';

action_list.forEach(function(e,i) {
	md_buffer += '| '+e.name+' | '+e.param_count+' | '+e.params.join(', ')+' | - | \r\n';
});


/**
 *
 * Going to generate the file
 *
 */
fs.writeFile("./hooks.md", md_buffer, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log( 'File hooks.md generated with '+action_list.length+' Actions and  '+filter_list.length+' Filters' ); // file generated
}); 




/**
 *
 * HELPER FUNCTIONS
 *
 */
function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};