'use strict';

module.exports = function ( Server )
{
	//---------------------------------------------------------------------
	var Schema = require( './CalcSchema' )( Server );
	var Service = Server.Utilities.NewService( Server, 'Calc', Schema );


	//---------------------------------------------------------------------
	Service.Sum =
		async function ( A, B, ApiContext )
		{
			Service._.Logger.debug( `Calculating sum of [${A}] and [${B}].` );
			var C = A + B;
			return C;
		};


	//---------------------------------------------------------------------
	Service.Difference =
		async function ( A, B, ApiContext )
		{
			Service._.Logger.debug( `Calculating difference of [${A}] and [${B}].` );
			var C = A - B;
			return C;
		};


	//---------------------------------------------------------------------
	Service.Product =
		async function ( A, B, ApiContext )
		{
			Service._.Logger.debug( `Calculating product of [${A}] and [${B}].` );
			var C = A * B;
			return C;
		};


	//---------------------------------------------------------------------
	Service.Quotient =
		async function ( A, B, ApiContext )
		{
			Service._.Logger.debug( `Calculating quotient of [${A}] and [${B}].` );
			var C = A / B;
			return C;
		};


	//---------------------------------------------------------------------
	Service.ArraySum =
		async function ( Numbers, ApiContext )
		{
			Service._.Logger.debug( `Calculating sum of [${Numbers.length}] array items.` );
			var x = 0;
			for ( var i = 0; i < Numbers.length; i++ )
			{
				x += Numbers[ i ];
			}
			return x;
		};


	//---------------------------------------------------------------------
	Service.ArrayAverage =
		async function ( Numbers, ApiContext )
		{
			Service._.Logger.debug( `Calculating sum of [${Numbers.length}] array items.` );
			var x = 0;
			for ( var i = 0; i < Numbers.length; i++ )
			{
				x += Numbers[ i ];
			}
			var y = ( x / Numbers.length );
			return y;
		};


	//---------------------------------------------------------------------
	return Service;
}

