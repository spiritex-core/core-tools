'use strict';

module.exports = function ( Server )
{
	//---------------------------------------------------------------------
	var Schema = require( './EchoSchema' )( Server );
	var Service = Server.Utilities.NewService( Server, 'Echo', Schema );


	//---------------------------------------------------------------------
	Service.EchoText =
		async function ( Text, ApiContext )
		{
			Service._.Logger.debug( `Echoing the text: [${Text}].` );
			return Text;
		};


	//---------------------------------------------------------------------
	Service.ReverseText =
		async function ( Text, ApiContext )
		{
			Service._.Logger.debug( `Reversing the text: [${Text}].` );
			var text = Text.split( '' ).reverse().join( '' );
			return text;
		};


	//---------------------------------------------------------------------
	return Service;
}

