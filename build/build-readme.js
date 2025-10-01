'use strict';

const PATH = require( 'path' );
const FS = require( 'fs' );
// const FS_EXTRA = require( 'fs-extra' );

const PACKAGE = require( '../package.json' );

const CONTENT_FOLDER = PATH.resolve( __dirname, '..', 'docs', 'readme' );
const OUTPUT_FILE = PATH.resolve( __dirname, '..', 'readme.md' );

const REPLACEMENTS = [
	{ from: '../../images/', to: './docs/images/' },
	{ from: '../images/', to: './docs/images/' },
	{ from: './images/', to: './docs/images/' },
];

const FOLDERS = {
	type: 'root',
	path: CONTENT_FOLDER,
	Items: {},
};


//---------------------------------------------------------------------
function ScanFolders( FolderPath = CONTENT_FOLDER, Items = FOLDERS ) 
{
	var files = FS.readdirSync( FolderPath );
	for ( var index = 0; index < files.length; index++ )
	{
		var filename = files[ index ];
		var filepath = PATH.join( FolderPath, filename );
		var filestat = FS.statSync( filepath );

		if ( filename.startsWith( '~' ) ) { continue; }
		if ( filename.startsWith( '_' ) ) { continue; }
		if ( filename.length < 5 ) { continue; }

		// Get the item slug.
		var item_slug = filename;
		if ( item_slug.endsWith( '.md' ) ) { item_slug = item_slug.substring( 0, item_slug.length - 3 ); }

		// Get the item name.
		var item_name = item_slug.substring( 4 ); // Remove the '000-' prefix.
		item_name = item_name.split( '-' ).join( ' ' );

		// Store the item.
		var item = {
			slug: item_slug,
			name: item_name,
			path: filepath,
		};
		Items.Items[ item.slug ] = item;

		if ( filestat.isDirectory() ) 
		{
			item.type = 'folder';
			item.Items = {};
			ScanFolders( filepath, item );
		}
		else if ( filestat.isFile() ) 
		{
			item.type = 'file';
			item.content = FS.readFileSync( filepath, 'utf8' );
			item.content = item.content.trim();
		}
	}
	return;
}


//---------------------------------------------------------------------
function BuildTOC( Root = FOLDERS, Depth = 0, TOC = '' ) 
{
	for ( var item_slug in Root.Items ) 
	{
		var item = Root.Items[ item_slug ];
		if ( Depth === 0 )
		{
			TOC += `- [**${item.name}**](#${item.slug})\n`;
		}
		else
		{
			TOC += '\t'.repeat( Depth ) + `- [${item.name}](#${item.slug})\n`;
		}
		if ( item.type === 'folder' ) 
		{
			TOC = BuildTOC( item, Depth + 1, TOC );
		}
	}
	return TOC;
}


//---------------------------------------------------------------------
function ProcessFolders( Root = FOLDERS, Depth = 1 ) 
{
	for ( var item_slug in Root.Items ) 
	{
		var item = Root.Items[ item_slug ];
		var content = '';
		content += `<a id="${item.slug}"></a>\n`;
		content += '#'.repeat( Depth ) + ` ${item.name}\n\n`;
		if ( item.type === 'folder' ) 
		{
			FS.appendFileSync( OUTPUT_FILE, content );
			ProcessFolders( item, Depth + 1 );
		}
		else if ( item.type === 'file' ) 
		{
			content += FS.readFileSync( item.path, 'utf8' );
			content += '\n\n';
			REPLACEMENTS.forEach( ( replacement ) =>
			{
				content = content.split( replacement.from ).join( replacement.to );
			} );
			FS.appendFileSync( OUTPUT_FILE, content );
		}
	}
	return;
}


//---------------------------------------------------------------------
if ( FS.existsSync( OUTPUT_FILE ) ) { FS.unlinkSync( OUTPUT_FILE ); }
ScanFolders();
// console.dir( FOLDERS );

{
	var content = '';
	content += `# ${PACKAGE.name}\n\n`;
	content += `* Version: ${PACKAGE.version}\n`;
	content += `* Dated: ${new Date().toISOString().substring( 0, 10 )}\n`;
	content += '\n\n';
	content += `# Table of Contents\n\n`;
	content += BuildTOC();
	content += '\n\n';
	FS.appendFileSync( OUTPUT_FILE, content );
}

ProcessFolders();

console.log( 'Readme file created: ' + OUTPUT_FILE );
process.exit( 0 );
