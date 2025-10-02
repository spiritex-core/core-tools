'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

var COMAND_LINE = require( '../utility/CommandLine' );
var CLI_ARGS = COMAND_LINE.ParseCommandLine();

var CLI_NAME = 'CliClient';
if ( process.env.SPIRITEX_CORE_CLI_NAME ) { CLI_NAME = process.env.SPIRITEX_CORE_CLI_NAME; }

const CLIENT_LOADER = require( '../utility/ClientLoader' );
var ClientFilename = LIB_PATH.join( process.cwd(), `.${CLI_NAME}.http-client.js` );
var SchemaFilename = LIB_PATH.join( process.cwd(), `.${CLI_NAME}.server-schema.json` );
var SessionFilename = LIB_PATH.join( process.cwd(), `.${CLI_NAME}.session.json` );

var ServerUrl = 'http://localhost:4200';
if ( process.env.SPIRITEX_CORE_SERVER_URL ) { ServerUrl = process.env.SPIRITEX_CORE_SERVER_URL; }


//=====================================================================
//=====================================================================
//
//     ██████ ██      ██      █████  ██████   ██████  ███████ 
//    ██      ██      ██     ██   ██ ██   ██ ██       ██      
//    ██      ██      ██     ███████ ██████  ██   ███ ███████ 
//    ██      ██      ██     ██   ██ ██   ██ ██    ██      ██ 
//     ██████ ███████ ██     ██   ██ ██   ██  ██████  ███████ 
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function print_usage()
{
	console.log( `
=== ${CLI_NAME} ===

    Usage: ${CLI_NAME} <command> <command-parameters> [options]

---------------------------------------------------
Use one of the following commands:
---------------------------------------------------
	update                                         | Update the Http-Client.js source file.
    who                                            | Displays information on the logged in user and current session.
    login <UserEmail> <Password>                   | Logs in a user with the server and establishes a session.
    logout <UserEmail>                             | Logs out a user with the server and destroys the session.
    list                                           | Lists all services on the server.
    list <ServiceName>                             | Lists all methods in the service.
    list <ServiceName.OriginName>                  | Lists method definition.
    call <ServiceName.OriginName> <...Fields>      | Invokes an method.
---------------------------------------------------
Any command can be preceeded by any of the following options:
---------------------------------------------------
    --url <server-url>                | Url of the server. Defaults to 'http://localhost:4200'.
    --log                             | Send server log output to the console.
    --debug                           | Output debugging information to the console.
---------------------------------------------------
Examples:
---------------------------------------------------
    > ${CLI_NAME} update --url http://localhost:4200
    > ${CLI_NAME} list
    > ${CLI_NAME} list Diagnostics
    > ${CLI_NAME} list Diagnostics.ServerInfo
    > ${CLI_NAME} call Diagnostics.ServerInfo
    > ${CLI_NAME} login user@server "my password" --debug
	> ${CLI_NAME} who
    > ${CLI_NAME} call Member.CreateMyApiKey "My new Api Key" 86400000 --log
    > ${CLI_NAME} logout
` );
	return;
}


//---------------------------------------------------------------------
function print_debug()
{
	console.log( `
=== ${CLI_NAME} debug output ===================
=== ServerUrl         : [${ServerUrl}]
=== SessionFilename   : [${SessionFilename}]
=== Raw Command Line  :`);
	process.argv.forEach( ( val, index ) =>
	{
		console.log( `${index}: ${val}` );
	} );
	console.log( `=== ${CLI_NAME} debug output ===================` );
	return;
}


//=====================================================================
//=====================================================================
//
//    ███████ ███████ ███████ ███████ ██  ██████  ███    ██ 
//    ██      ██      ██      ██      ██ ██    ██ ████   ██ 
//    ███████ █████   ███████ ███████ ██ ██    ██ ██ ██  ██ 
//         ██ ██           ██      ██ ██ ██    ██ ██  ██ ██ 
//    ███████ ███████ ███████ ███████ ██  ██████  ██   ████ 
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function load_session()
{
	if ( !LIB_FS.existsSync( SessionFilename ) ) { return null; }
	let session = JSON.parse( LIB_FS.readFileSync( SessionFilename, 'utf8' ) );
	if ( !session.User ) { return null; }
	if ( !session.session_token ) { return null; }
	return session;
}


//---------------------------------------------------------------------
function save_session( Session )
{
	LIB_FS.mkdirSync( LIB_PATH.dirname( SessionFilename ), { recursive: true } );
	LIB_FS.writeFileSync( SessionFilename, JSON.stringify( Session, null, '    ' ) );
	return;
}


//---------------------------------------------------------------------
function delete_session()
{
	if ( !LIB_FS.existsSync( SessionFilename ) ) { return; }
	LIB_FS.unlinkSync( SessionFilename );
	return;
}


//=====================================================================
//=====================================================================
//
//     ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
//    ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
//    ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
//    ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
//     ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
async function ProcessCommand()
{
	// Process cli command.
	if ( !CLI_ARGS._ ) { return print_usage(); }
	if ( CLI_ARGS._.length === 0 ) { return print_usage(); }
	var args = JSON.parse( JSON.stringify( CLI_ARGS._ ) );
	let command = args[ 0 ].trim().toLowerCase();
	args = args.slice( 1 );
	switch ( command )
	{
		case 'update': return await UpdateCommand( args );
		case 'who': return await WhoCommand( args );
		// case 'signup': return await SignupCommand( args );
		case 'login': return await LoginCommand( args );
		case 'logout': return await LogoutCommand( args );
		case 'list': return await ListCommand( args );
		case 'call': return await CallCommand( args );
		case 'run': return { keep_running: true };
	}
	print_usage();
	return;
}


//---------------------------------------------------------------------
async function get_client()
{

	if ( !LIB_FS.existsSync( ClientFilename ) )
	{
		// await update_client_source();
		await UpdateCommand();
	}
	var client_factory = require( ClientFilename );

	var client = client_factory();

	var session = load_session();
	if ( session ) 
	{
		try
		{
			session = await client.Member.NewSession( 'renew', null, session.session_token );
			if ( !session ) { throw new Error( 'Failed to renew session. Must reauthenticate with a login.' ); }
		}
		catch ( error )
		{
			console.error( error.message );
			delete_session();
			session = null;
		}
	}

	return client;

}


//=====================================================================
//=====================================================================
//
//	Update
//
//=====================================================================
//=====================================================================


// async function update_client_source()
// {
// 	// Get the client source from the server.
// 	try
// 	{
// 		var parameters = {
// 			Transport: 'http',
// 			Platform: 'js',
// 			UserType: 'network',
// 		};
// 		var fetch_result = await fetch(
// 			`${ServerUrl}/Sdk/Client`,
// 			{
// 				headers:
// 				{
// 					// 'Accept': 'application/json',
// 					'Content-Type': 'application/json'
// 				},
// 				method: 'POST',
// 				// body: parameters,
// 				body: JSON.stringify( parameters ),
// 			} );
// 		if ( !fetch_result.ok ) { throw new Error( `[${fetch_result.status}] ${fetch_result.statusText}` ); }
// 		var server_result = await fetch_result.json();
// 		if ( !server_result.ok ) { throw new Error( `Server Error [${server_result.error}]` ); }
// 		LIB_FS.writeFileSync( ClientFilename, server_result.result );
// 		console.log( `The http client source was updated from the server. [${ClientFilename}]` );
// 	}
// 	catch ( error )
// 	{
// 		throw new Error( `Failed getting client source from the server: ${error.message}` );
// 	}
// 	return;
// }


// async function update_server_schema()
// {
// 	// Get the server schema from the server.
// 	try
// 	{
// 		var parameters = {
// 			UserType: 'network',
// 		};
// 		var fetch_result = await fetch(
// 			`${ServerUrl}/Sdk/Schema`,
// 			{
// 				headers:
// 				{
// 					// 'Accept': 'application/json',
// 					'Content-Type': 'application/json'
// 				},
// 				method: 'POST',
// 				// body: parameters,
// 				body: JSON.stringify( parameters ),
// 			} );
// 		if ( !fetch_result.ok ) { throw new Error( `[${fetch_result.status}] ${fetch_result.statusText}` ); }
// 		var server_result = await fetch_result.json();
// 		if ( !server_result.ok ) { throw new Error( `Server Error [${server_result.error}]` ); }
// 		LIB_FS.writeFileSync( SchemaFilename, JSON.stringify( server_result.result ) );
// 		console.log( `The server schema was updated from the server. [${SchemaFilename}]` );
// 	}
// 	catch ( error )
// 	{
// 		throw new Error( `Failed getting server schema from the server: ${error.message}` );
// 	}
// 	return;
// }


async function UpdateCommand( Arguments )
{
	// await update_client_source();
	// await update_server_schema();
	var result = null;

	result = await CLIENT_LOADER.GetClientSource( ServerUrl );
	LIB_FS.writeFileSync( ClientFilename, result );
	console.log( `The http client source was updated from the server. [${ClientFilename}]` );

	result = await CLIENT_LOADER.GetServerSchema( ServerUrl );
	LIB_FS.writeFileSync( SchemaFilename, JSON.stringify( result ) );
	console.log( `The server schema was updated from the server. [${SchemaFilename}]` );

	return;
}


//=====================================================================
//=====================================================================
//
//	Who
//
//=====================================================================
//=====================================================================


async function WhoCommand( Arguments )
{
	let session = load_session();
	if ( !session )
	{
		console.log( 'Nobody is logged in.' );
		return;
	}
	console.log( `User is logged in as [${session.User.user_email}] with groups of [${session.User.groups}].` );
	return;
}


//=====================================================================
//=====================================================================
//
//	Login
//
//=====================================================================
//=====================================================================


async function LoginCommand( Arguments )
{
	// Get parameters.
	if ( Arguments.length < 2 ) { return `Login requires two parameters: UserEmail, and Password.`; }
	let user_email = Arguments[ 0 ];
	let password = Arguments[ 1 ];
	Arguments = Arguments.slice( 2 );
	// var user_name = user_email;
	// if ( Arguments.length ) { user_name = Arguments[ 0 ]; }

	// Do user login.
	var client = await get_client();
	var session = await client.Member.NewSession( 'email', user_email, password );
	if ( !session ) { return `Login failed.`; }

	// Establish a new session.
	save_session( session );

	// Return.
	return 'Login OK';
}


//=====================================================================
//=====================================================================
//
//	Logout
//
//=====================================================================
//=====================================================================


async function LogoutCommand( Arguments )
{
	// Destroy the session.
	delete_session();

	// Return.
	return 'Logout OK';
}


//=====================================================================
//=====================================================================
//
//	List
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function list_services( Schema, Server )
{

	let service_keys = Object.keys( Schema );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service = Schema[ service_keys[ service_index ] ];
		console.log( service_keys[ service_index ] );
	}
	return;
}


//---------------------------------------------------------------------
function list_service_methods( Schema, ServiceName )
{

	let service_keys = Object.keys( Schema );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service_name = service_keys[ service_index ];
		let service = Schema[ service_name ];
		if ( ServiceName && ( ServiceName !== service_name ) ) { continue; }
		let method_keys = Object.keys( service );
		for ( let method_index = 0; method_index < method_keys.length; method_index++ )
		{
			let method_name = method_keys[ method_index ];
			if ( method_name.startsWith( '$' ) ) { continue; }
			// let method = service.Origins[ method_name ];
			console.log( method_name );
		}
		return;
	}
	// if ( ServiceName ) { console.log( `Service [${ServiceName}] was not found.` ); }
	return;
}


//---------------------------------------------------------------------
function list_method_detail( Schema, ServiceName, MethodName )
{

	let service_keys = Object.keys( Schema );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service_name = service_keys[ service_index ];
		let service = Schema[ service_name ];
		if ( ServiceName && ( ServiceName !== service_name ) ) { continue; }
		let method_keys = Object.keys( service );
		for ( let method_index = 0; method_index < method_keys.length; method_index++ )
		{
			let method_name = method_keys[ method_index ];
			if ( method_name.startsWith( '$' ) ) { continue; }
			let method = service[ method_name ];
			if ( MethodName && ( MethodName !== method_name ) ) { continue; }
			console.log( `=== ${service_name}.${method_name} ===` );
			// console.log( JSON.stringify( method, null, '    ' ) );
			console.log( `Description     : ${method.description}` );
			console.log( `Requires Group  : ${method.groups.join( ', ' ) || '<none>'}` );

			var returns_text = '<none>';
			if ( method.Returns )
			{
				if ( method.Returns[ '$Object' ] ) { returns_text = `object : ${method.Returns[ '$Object' ]}`; }
				else if ( method.Returns.type ) { returns_text = method.Returns.type; }
				if ( method.Returns.description ) { returns_text += ` (${method.Returns.description})`; }
			}
			console.log( `Returns         : ${returns_text}` );

			var fields = method.Arguments.properties;
			var field_names = Object.keys( fields );
			if ( field_names.length )
			{
				console.log( 'Arguments:' );
				console.table( fields );
			}
			else
			{
				console.log( 'No Arguments.' );
			}
			return;
		}
		if ( MethodName ) { console.log( `Method [${MethodName}] was not found in service [${ServiceName}].` ); }
		return;
	}
	if ( ServiceName ) { console.log( `Service [${ServiceName}] was not found.` ); }
	return;
}


//---------------------------------------------------------------------
async function ListCommand( Arguments )
{
	// Get the schema.
	if ( !LIB_FS.existsSync( SchemaFilename ) )
	{
		// await update_server_schema();
		await UpdateCommand();
	}
	var schema = require( SchemaFilename );

	// Get the parameters.
	let service_name = '';
	let method_name = '';
	if ( Arguments.length ) 
	{
		service_name = Arguments[ 0 ];
		Arguments = Arguments.slice( 1 );
	}
	if ( service_name )
	{
		var parts = service_name.split( '.' );
		if ( parts.length === 2 ) 
		{
			service_name = parts[ 0 ];
			method_name = parts[ 1 ];
		}
		else if ( parts.length > 2 ) { return `Invalid service and method name [${service_name}].`; }
	}

	// List
	if ( !service_name && !method_name )
	{
		list_services( schema );
	}
	else if ( service_name && !method_name )
	{
		list_service_methods( schema, service_name );
	}
	else if ( service_name && method_name )
	{
		list_method_detail( schema, service_name, method_name );
	}

	// Return.
	return;
}


//=====================================================================
//=====================================================================
//
//	Call
//
//=====================================================================
//=====================================================================


async function CallCommand( Arguments )
{
	if ( !Arguments.length ) { throw new Error( `Call requires a service and method name: <service.method>` ); }

	var command_name = Arguments[ 0 ];
	Arguments = Arguments.slice( 1 );

	// Get the parameters.
	var parts = command_name.split( '.' );
	if ( parts.length != 2 ) { throw new Error( `Invalid command [${command_name}]. Call requires a service and method name: <service.method>` ); }
	var service_name = parts[ 0 ];
	var method_name = parts[ 1 ];

	try
	{
		var client = await get_client();
		if ( !client[ service_name ] ) { throw new Error( `Service [${service_name}] was not found.` ); }
		if ( !client[ service_name ][ method_name ] ) { throw new Error( `Method [${method_name}] was not found in service [${service_name}].` ); }
		var server_info = await client[ service_name ][ method_name ]( ...Arguments );
		return server_info;
	}
	catch ( error )
	{
		console.error( error.message );
		return;
	}
}


//=====================================================================
( async function ()
{
	try
	{

		// Invoke Command.
		var result = await ProcessCommand();
		if ( result === undefined )
		{
			// console.log( 'OK' );
		}
		else if ( typeof result === 'object' )
		{
			if ( result.keep_running )
			{
				return;
			}
			// Server.Logger.debug( JSON.stringify( result, null, '    ' ) );
			console.log( JSON.stringify( result, null, '    ' ) );
		}
		else
		{
			// Server.Logger.debug( result );
			console.log( result );
		}

	}
	catch ( error )
	{
		console.error( 'Error: ' + error.message );
	}
	finally
	{
	}

	return;
}() );

