'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


module.exports = {


	//---------------------------------------------------------------------
	GetClientSource:
		async function GetClientSource( ServerUrl, Transport = 'http', Platform = 'js', UserType = 'network' )
		{
			// Get the client source from the server.
			try
			{
				var parameters = {
					Transport: Transport,
					Platform: Platform,
					UserType: UserType,
				};
				var fetch_result = await fetch(
					`${ServerUrl}/Sdk/Client`,
					{
						headers:
						{
							// 'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'POST',
						// body: parameters,
						body: JSON.stringify( parameters ),
						// data: JSON.stringify( parameters ),
					} );
				if ( !fetch_result.ok ) { throw new Error( `[${fetch_result.status}] ${fetch_result.statusText}` ); }
				var server_result = await fetch_result.json();
				if ( !server_result.ok ) { throw new Error( `Server Error [${server_result.error}]` ); }
				return server_result.result;
			}
			catch ( error )
			{
				throw new Error( `Failed getting client source from the server: ${error.message}` );
			}
			return;
		},


	//---------------------------------------------------------------------
	GetServerSchema:
		async function GetServerSchema( ServerUrl, UserType = 'network' )
		{
			// Get the server schema from the server.
			try
			{
				var parameters = {
					UserType: UserType,
				};
				var fetch_result = await fetch(
					`${ServerUrl}/Sdk/Schema`,
					{
						headers:
						{
							// 'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'POST',
						// body: parameters,
						body: JSON.stringify( parameters ),
					} );
				if ( !fetch_result.ok ) { throw new Error( `[${fetch_result.status}] ${fetch_result.statusText}` ); }
				var server_result = await fetch_result.json();
				if ( !server_result.ok ) { throw new Error( `Server Error [${server_result.error}]` ); }
				return server_result.result;
			}
			catch ( error )
			{
				throw new Error( `Failed getting server schema from the server: ${error.message}` );
			}
			return;
		},


};

