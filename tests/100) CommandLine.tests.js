'use strict';

const ASSERT = require( 'assert' );

var COMAND_LINE = require( '../utility/CommandLine' );


//---------------------------------------------------------------------
describe( `100) CommandLine Tests`, function ()
{

	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			return;
		} );


	//---------------------------------------------------------------------
	after( 'Shutdown',
		async function ()
		{
			return;
		} );


	//---------------------------------------------------------------------
	// Basic empty cases
	//---------------------------------------------------------------------

	it( `Should handle empty string`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, {} );
		return;
	} );

	it( `Should handle whitespace only string`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '   ' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, {} );
		return;
	} );

	//---------------------------------------------------------------------
	// Named arguments only (no positional arguments - _ field should not exist)
	//---------------------------------------------------------------------

	it( `Should parse a single flag`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: true } );
		return;
	} );

	it( `Should parse multiple named arguments`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-verbose -count:5' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { verbose: true, count: 5 } );
		return;
	} );

	it( `Should parse mixed named arguments with double dash`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '--output:file.txt -debug' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { output: 'file.txt', debug: true } );
		return;
	} );

	//---------------------------------------------------------------------
	// Positional arguments
	//---------------------------------------------------------------------

	it( `Should parse a positional argument`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( 'a' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { _: [ 'a' ] } );
		return;
	} );

	it( `Should parse multiple positional arguments`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( 'a b' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { _: [ 'a', 'b' ] } );
		return;
	} );

	it( `Should parse positional and named arguments`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( 'a b c -f:3 --xyz' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { _: [ 'a', 'b', 'c' ], f: 3, xyz: true } );
		return;
	} );

	//---------------------------------------------------------------------
	// Named arguments - basic flags
	//---------------------------------------------------------------------

	it( `Should parse single dash flag`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: true } );
		return;
	} );

	it( `Should parse double dash flag`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '--flag' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: true } );
		return;
	} );

	//---------------------------------------------------------------------
	// Named arguments - colon syntax
	//---------------------------------------------------------------------

	it( `Should parse flag with numeric value using colon`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:1' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 1 } );
		return;
	} );

	it( `Should parse flag with string value using colon`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:on' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 'on' } );
		return;
	} );

	it( `Should parse flag with boolean value using colon`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:true' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: true } );
		return;
	} );

	it( `Should parse flag with larger numeric value using colon`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:123' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 123 } );
		return;
	} );

	//---------------------------------------------------------------------
	// Named arguments - space separated
	//---------------------------------------------------------------------

	it( `Should parse flag with space separated value`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag on' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 'on' } );
		return;
	} );

	it( `Should parse flag with quoted value containing spaces`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag "always on"' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 'always on' } );
		return;
	} );

	it( `Should parse flag with multiple space separated values`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag on off' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: [ 'on', 'off' ] } );
		return;
	} );

	//---------------------------------------------------------------------
	// JSON values
	//---------------------------------------------------------------------

	it( `Should parse JSON object with double quotes`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:{"xyz":"123"}' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: { xyz: '123' } } );
		return;
	} );

	it( `Should parse relaxed JS object with unquoted identifiers`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:{xyz:"123"}' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: { xyz: '123' } } );
		return;
	} );

	it( `Should parse relaxed JS object with single quotes`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:{xyz:\'123\'}' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: { xyz: '123' } } );
		return;
	} );

	it( `Should parse quoted relaxed JS object`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:"{xyz:\'123\'}"' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: { xyz: '123' } } );
		return;
	} );

	it( `Should parse JSON array`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:[1,2,3]' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: [ 1, 2, 3 ] } );
		return;
	} );

	//---------------------------------------------------------------------
	// Multiple values for same argument
	//---------------------------------------------------------------------

	it( `Should handle multiple values for same argument with spaces`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag on -flag off' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: [ 'on', 'off' ] } );
		return;
	} );

	it( `Should handle multiple values for same argument with colons`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:1 -flag:2' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: [ 1, 2 ] } );
		return;
	} );

	//---------------------------------------------------------------------
	// Triple dash data
	//---------------------------------------------------------------------

	it( `Should parse triple dash data with positional args`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( 'a b --- raw data here' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { _: [ 'a', 'b' ], __: ' raw data here' } );
		return;
	} );

	it( `Should parse triple dash data with named args`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-flag:test --- some raw content' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { flag: 'test', __: ' some raw content' } );
		return;
	} );

	it( `Should parse triple dash data only`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '--- just data' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { __: ' just data' } );
		return;
	} );

	//---------------------------------------------------------------------
	// Complex combinations
	//---------------------------------------------------------------------

	it( `Should parse complex combination of all argument types`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( 'pos1 pos2 -verbose -count:5 -files a.txt b.txt' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { _: [ 'pos1', 'pos2' ], verbose: true, count: 5, files: [ 'a.txt', 'b.txt' ] } );
		return;
	} );

	it( `Should parse JSON config with debug flag`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-config:{"host":"localhost","port":8080} -debug' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { config: { host: 'localhost', port: 8080 }, debug: true } );
		return;
	} );

	it( `Should parse relaxed JS config with debug flag`, function ()
	{
		var args = COMAND_LINE.ParseCommandLine( '-config:{host:"localhost",port:8080} -debug' );
		ASSERT.ok( args );
		ASSERT.deepEqual( args, { config: { host: 'localhost', port: 8080 }, debug: true } );
		return;
	} );

	//---------------------------------------------------------------------
	return;
} );
