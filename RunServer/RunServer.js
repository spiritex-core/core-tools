'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

// var SERVER_CORE_PATH = LIB_PATH.resolve( __dirname, '..', 'src' );

const PACKAGE_FILENAME = LIB_PATH.resolve( __dirname, '..', 'package.json' );
const PACKAGE = require( PACKAGE_FILENAME );

var ServerName = PACKAGE.name;
var HostFolder = null;
var ConfigPath = null;
var ServerConfig = null;
var Server = null;

// var COMAND_LINE = require( LIB_PATH.join( SERVER_CORE_PATH, 'Server/CommandLine' ) );
var COMAND_LINE = require( '../Utility/CommandLine' );
var CLI_ARGS = COMAND_LINE.ParseCommandLine();


//---------------------------------------------------------------------
// Load any environment settings
if ( process.env.SPIRITEX_CORE_SERVER_NAME ) { ServerName = process.env.SPIRITEX_CORE_SERVER_NAME; }
if ( process.env.SPIRITEX_CORE_HOST_FOLDER ) { HostFolder = LIB_PATH.resolve( process.env.SPIRITEX_CORE_HOST_FOLDER ); }
if ( process.env.SPIRITEX_CORE_CONFIG_PATH ) { ConfigPath = LIB_PATH.resolve( process.env.SPIRITEX_CORE_CONFIG_PATH ); }


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
	let command_name = 'RunServer';
	console.log( `
=== ${command_name} ===

    Usage: nodejs ${command_name} [options]

---------------------------------------------------
Options:
---------------------------------------------------
    --name <server-name>              | Name of the server. Defaults to the server folder name.
    --folder <host-folder>            | Root folder for the server. Defaults to the current working directory.
    --config <config-filename>        | Filename of a server config file. Defaults to 'HostFolder/ServerConfig.js'.
    --log                             | Send server log output to the console.
    --debug                           | Output debugging information to the console.
    --version                         | Output the spiritex-core library version to the console and exit.
	--help                            | Output this help information and exit.
` );
	return;
}


//---------------------------------------------------------------------
function print_debug()
{
	let command_name = 'RunServer';
	console.log( `
=== ${command_name} debug output ===================
=== ServerName         : [${ServerName}]
=== HostFolder         : [${HostFolder}]
=== ConfigPath         : [${ConfigPath}]
=== Raw Command Line  :`);
	process.argv.forEach( ( val, index ) =>
	{
		console.log( `${index}: ${val}` );
	} );
	console.log( `=== ${command_name} debug output ===================` );
	return;
}


//=====================================================================
//=====================================================================
//
//    ███████ ███████ ██████  ██    ██ ███████ ██████  
//    ██      ██      ██   ██ ██    ██ ██      ██   ██ 
//    ███████ █████   ██████  ██    ██ █████   ██████  
//         ██ ██      ██   ██  ██  ██  ██      ██   ██ 
//    ███████ ███████ ██   ██   ████   ███████ ██   ██ 
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
// Graceful server shutdown.
//---------------------------------------------------------------------

async function graceful_shutdown()
{
	if ( Server == null ) { return; }

	console.log( `Shutdown signaled.` );
	setTimeout( () =>
	{
		console.log( 'Shutdown timeout exceeded (5s). Forcing process exit in 1.5s.' );
		setTimeout( () => 
		{
			console.log( `Process is forcing exit ...` );
			process.exit( 1 );
		}, 1500 );
	}, 5000 );

	await Server.ShutdownServer();

	console.log( 'Exiting process in 250ms.' );
	setTimeout( () => 
	{
		console.log( `Process is exiting normally ...` );
		process.exit( 0 );
	}, 250 );
	return;
}
process.on( 'SIGINT', async function () { await graceful_shutdown(); } );
process.on( 'SIGTERM', graceful_shutdown );


//---------------------------------------------------------------------
// Start server.
//---------------------------------------------------------------------

( async function ()
{
	try
	{
		//---------------------------------------------------------------------
		if ( CLI_ARGS.name ) { ServerName = CLI_ARGS.name; }
		if ( CLI_ARGS.host ) { HostFolder = LIB_PATH.resolve( CLI_ARGS.host ); }
		if ( CLI_ARGS.config ) { ConfigPath = LIB_PATH.resolve( CLI_ARGS.config ); }
		if ( CLI_ARGS.version ) { console.log( PACKAGE.version ); return; }


		//---------------------------------------------------------------------
		// Setup the host folder.
		if ( !HostFolder ) { HostFolder = process.cwd(); }
		console.log( `Using host folder [${HostFolder}].` );
		if ( !LIB_FS.existsSync( HostFolder ) ) { throw new Error( `Host folder not found [${HostFolder}].` ); }

		//---------------------------------------------------------------------
		// Setup the config path.
		if ( !ConfigPath ) { ConfigPath = LIB_PATH.join( HostFolder, `ServerConfig.js` ); }
		console.log( `Using config file [${ConfigPath}].` );
		if ( !LIB_FS.existsSync( ConfigPath ) ) { throw new Error( `Configuration file not found [${ConfigPath}].` ); }

		//---------------------------------------------------------------------
		// Setup the config.
		ServerConfig = require( ConfigPath );

		// Setup the logging.
		ServerConfig.Logger.message_log_level = 'OFF';
		ServerConfig.Logger.data_log_level = 'OFF';
		if ( CLI_ARGS.log ) 
		{
			ServerConfig.Logger.message_log_level = 'info';
			ServerConfig.Logger.data_log_level = 'info';
		}
		if ( CLI_ARGS.debug ) 
		{
			ServerConfig.Logger.message_log_level = 'trace';
			ServerConfig.Logger.data_log_level = 'trace';
		}

		Server = require( '@spiritex/spiritex-core' )( ServerConfig );
		if ( CLI_ARGS.debug ) { print_debug(); }
		Server.Logger.debug( `Running on network [${Server.Config.Network.network_name}].` );

		// Initialize the server.
		Server.Logger.debug( `Initializing the SpiritEx Core Server ...` );
		await Server.InitializeServer();

		// Start the server.
		Server.Logger.debug( `Starting the SpiritEx Core Server ...` );
		var http_server = await Server.StartupServer();

		// Report Success.
		Server.Logger.info( `SpiritEx Core Server is running.` );

	}
	catch ( error )
	{
		console.error( 'Error: ' + error.message );
		await graceful_shutdown();
	}
	finally
	{
	}

	return;
}() );

