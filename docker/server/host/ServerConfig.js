'use strict';

const PATH = require( 'path' );

const SECOND_MS = ( 1 * 1000 );
const MINUTE_MS = ( 60 * SECOND_MS );
const HOUR_MS = ( 60 * MINUTE_MS );
const DAY_MS = ( 24 * HOUR_MS );
const WEEK_MS = ( 7 * DAY_MS );
const MONTH_MS = ( 30 * DAY_MS );
const YEAR_MS = ( 365 * DAY_MS );


module.exports = {

	//---------------------------------------------------------------------
	// General
	//---------------------------------------------------------------------

	server_name: 'SpiritEx-Core-0500',
	server_version: '0.5.0',
	server_address: 'localhost', // public address


	//---------------------------------------------------------------------
	// Folders
	//---------------------------------------------------------------------

	// host_folder: PATH.resolve( __dirname, 'host' ),
	logger_folder: PATH.resolve( __dirname, 'host', 'Logger' ),
	sdk_folder: PATH.resolve( __dirname, 'host', 'Sdk' ),
	// data_folder: PATH.resolve( __dirname, 'Data' ),
	services_folder: PATH.resolve( __dirname, 'host', 'Services' ),
	transports_folder: PATH.resolve( __dirname, 'host', 'Transports' ),


	//---------------------------------------------------------------------
	// Network
	//---------------------------------------------------------------------

	Network: {
		network_name: 'local',
		network_key: 'used-to-encrypt-network-secrets',
	},


	//---------------------------------------------------------------------
	// Client
	//---------------------------------------------------------------------

	Client: {
		//---------------------------------------------------------------------
		Options: {
			log_requests: false,			// Log all requests to the console.
			log_responses: false,			// Log all responses to the console.
			trace_authentication: false,	// Trace the authentication process.
			throw_handled_errors: false,	// Throw errors that are already handled by the client.
			Callbacks: {
				OnApiResult: null,				// async function ( ApiResult ) { },
				OnError: null,					// async function ( Message ) { },
				OnAuthorizationUpdated: null,	// async function ( AuthorizationToken ) { },
				Authenticate: null,				// async function ( ThisClient ) { },
			},
		},
		//---------------------------------------------------------------------
		Urls: {
			Diagnostic: 'http://localhost:4200',
			Sdk: 'http://localhost:4200',
			Member: 'http://localhost:4200',
			Echo: 'http://localhost:4200',
			Calc: 'http://localhost:4200',
		},
		//---------------------------------------------------------------------
		Credentials: {
			user_name: 'Admin User',
			user_email: 'admin@local',
			password: 'password',
			// apikey: 'apikey-abc123',
			// passkey: 'some-passkey',
		},
	},


	//---------------------------------------------------------------------
	// Logger
	//---------------------------------------------------------------------

	Logger: {
		// Log Levels: silly, trace, debug, info, warn, error, fatal, or OFF
		message_log_level: 'trace',
		data_log_level: '',
		service_name_width: 15,
		attach_to_express: false,
		log_direct_to_console: true,
		print_timestamp: true,
		print_log_level: true,
		//---------------------------------------------------------------------
		// Gelf
		// gelf_host: 'logs-infosolve.ddns.net',
		// gelf_port: 12201,
		//---------------------------------------------------------------------
		// Log file
		// LogFile: {
		// 	type: "file",
		// 	filename: "server.log",
		// 	numBackups: 7,
		// 	maxLogSize: 10485760, // 10MB
		// 	// compress: true // Compress rotated files with .gz
		// },
		LogFile: {
			type: "dateFile",
			filename: "server.log",
			pattern: ".yyyy-MM-dd",
			numBackups: 7,
			// compress: true // Compress rotated files with .gz
		},

	},


	//---------------------------------------------------------------------
	// Transports
	//---------------------------------------------------------------------

	Transports:
	{

		//---------------------------------------------------------------------
		InProcess: {
			enabled: true,
			implementation: '$/InProcess',
		},

		//---------------------------------------------------------------------
		Http: {
			enabled: true,
			implementation: '$/Http',
			server_protocol: 'http',
			listen_address: '0.0.0.0',
			listen_port: 4200,
			server_timeout: ( 60 * 1000 ),
			trust_proxy: true,
			// max_request_size: '100mb',
			// cors_origin: [
			// 	// '*',
			// 	// 'http://localhost:*',
			// 	// 'http://127.0.0.1:*',

			// 	'http://localhost',
			// 	'http://localhost:3000',
			// 	'http://localhost:5500',
			// 	'http://localhost:8080',

			// 	'http://127.0.0.1',
			// 	'http://127.0.0.1:3000',
			// 	'http://127.0.0.1:5500',
			// 	'http://127.0.0.1:8080',

			// 	'*.spiritex.dev',
			// ],

			Websocket: {
				endpoint_path: 'websocket',
			},

			McpPlugin: {
				endpoint_path: 'mcp',
			},
		},

		//---------------------------------------------------------------------
		// Amqp: {
		// 	enabled: true,
		// 	implementation: '$/Amqp',
		// 	server_address: 'amqp-server',
		// 	server_port: 5672,
		// 	credentials: {
		// 		username: 'username',
		// 		password: 'password',
		// 	},
		// 	connect_options:
		// 	{
		// 		connectRetries: 30,
		// 		connectRetryInterval: 1000,
		// 	},
		// 	command_queue_options:
		// 	{
		// 		exclusive: false,
		// 		durable: false,
		// 		autoDelete: true,
		// 	},
		// 	reply_queue_options:
		// 	{
		// 		exclusive: true,
		// 		durable: false,
		// 		autoDelete: true,
		// 	},
		// },

	},


	//---------------------------------------------------------------------
	// Services
	//---------------------------------------------------------------------

	Services: {


		//---------------------------------------------------------------------
		// Diagnostic Service
		//---------------------------------------------------------------------

		Diagnostic: {
			enabled: true,
			implementation: '$/Diagnostic',
		},


		//---------------------------------------------------------------------
		// Sdk Service
		//---------------------------------------------------------------------

		Sdk: {
			enabled: true,
			implementation: '$/Sdk',

			generate_server_schema: true,
			generate_client_sdks: true,
		},


		//---------------------------------------------------------------------
		// Member Service
		//---------------------------------------------------------------------

		Member: {
			enabled: true,
			implementation: '$/Member',

			use_mock_clerk_api: true,

			admin_user_groups: 'network|service|user|super|admin|hero',
			default_user_groups: 'user',

			//---------------------------------------------------------------------
			Session: {
				duration_ms: 7 * DAY_MS,
				// duration_ms: 5 * MINUTE_MS,
				abandon_ms: 1 * DAY_MS,
			},

			//---------------------------------------------------------------------
			Token: {
				// duration_ms: 1 * HOUR_MS,
				duration_ms: 10 * MINUTE_MS,
				// duration_ms: 1 * MINUTE_MS,
				// duration_ms: 3 * SECOND_MS,
				abandon_ms: 1 * DAY_MS,
			},

			//---------------------------------------------------------------------
			SqlManager: {
				Member: {
					SequelizeOptions: {
						logging: false,
						//---------------------------------------------------------------------
						dialect: 'sqlite',
						// storage: './data/Member.sqlite', // or ':memory:' for in-memory
						storage: ':memory:',
						// //---------------------------------------------------------------------
						// dialect: 'mysql',
						// dialectOptions: {
						// 	host: 'localhost',
						// 	port: 3306,
						// 	user: 'user',
						// 	password: 'password',
						// 	database: 'database',
						// },
					},
					SequelizeSyncOptions: {},
					// SequelizeSyncOptions: { alter: true },
					// SequelizeSyncOptions: { force: true },
					// SequelizeSyncOptions: { alter: true, force: true },
				},
			},

			// //---------------------------------------------------------------------
			// MemberSql: {
			// 	sequelize_options: {
			// 		logging: false,
			// 		//---------------------------------------------------------------------
			// 		dialect: 'sqlite',
			// 		// storage: './data/Member.sqlite', // or ':memory:' for in-memory
			// 		storage: ':memory:',
			// 		transactionType: 'IMMEDIATE',
			// 		// //---------------------------------------------------------------------
			// 		// dialect: 'mysql',
			// 		// dialectOptions: {
			// 		// 	host: 'localhost',
			// 		// 	port: 3306,
			// 		// 	user: 'user',
			// 		// 	password: 'password',
			// 		// 	database: 'database',
			// 		// },
			// 	},
			// 	// sequelize_sync_options: {},
			// 	// sequelize_sync_options: { alter: true },
			// 	sequelize_sync_options: { force: true },
			// 	// sequelize_sync_options: { alter: true, force: true },
			// },

			//---------------------------------------------------------------------
			Authenticator: {
				// Always: {},
				Json: {
					Users: [
						{
							user_id: 'admin@local',
							email_address: 'admin@local',
							first_name: 'Admin',
							last_name: 'User',
							secret: 'password',
						},
						{
							user_id: 'super@local',
							email_address: 'super@local',
							first_name: 'Super',
							last_name: 'User',
							secret: 'password',
						},
						{
							user_id: 'user@local',
							email_address: 'user@local',
							first_name: 'End',
							last_name: 'User',
							secret: 'password',
						},
					],
				},
				// Clerk: {
				// 	api_key: '', // ???
				// 	publishable_key: 'pk_...',
				// 	secret_key: 'sk_...',
				// 	frontend_url: 'http://localhost:5500/public',
				// 	clerk_domain: 'https://{domain}.clerk.accounts.dev',
				// 	clerk_api_path: '/v1/client',
				// 	// clerk_api_path: '/v1',
				// 	jwt_public_key: `-----BEGIN PUBLIC KEY-----
				// 	...
				// 	-----END PUBLIC KEY-----`,
				// },
			},

		},


		//---------------------------------------------------------------------
		// Echo Service
		//---------------------------------------------------------------------

		Echo: {
			enabled: true,
			implementation: 'Echo',
		},


		//---------------------------------------------------------------------
		// Calc Service
		//---------------------------------------------------------------------

		Calc: {
			enabled: true,
			implementation: 'Calc',
		},


	},


};
