'use strict';

/**
 * Parses command line arguments according to the specified format
 *
 * USAGE:
 * ------
 *
 * Positional Arguments:
 *   Command lines can start with a series of positional arguments.
 *   Arguments are separated by spaces unless they are quoted.
 *   Example: `a b c -f:3 --xyz` has positional arguments of a, b, and c.
 *   The function return object will contain a `_` field containing an array of all positional arguments found.
 *   If no positional arguments are found, then the '_' field will not be included in the return object.
 *
 * Named Arguments:
 *   Named arguments can be preceded by one or two dash `-` characters (they are treated the same).
 *   The dash(es) is followed by a word (delimited by space or EOL) which is the argument name.
 *   An argument value can follow the name.
 *   Argument values can be any valid JSON value (e.g. true, 123, 'text', [..], {..})
 *   Argument values can also be relaxed JavaScript objects with unquoted identifiers and single quotes
 *   Argument values must not contain a space ' ' character unless they are also enclosed in double quotes.
 *   If multiple argument values are supplied, then the return field will be an array of these values.
 *
 * Data Value:
 *   A command line can end with a triple dash `---` followed by a raw data value.
 *   The return value will include everything after the `---` in the `__` field of the return object.
 *   This data value is not validated in any way.
 *
 * EXAMPLES:
 * ---------
 *
 * Positional Arguments:
 *   - `` returns `{}`
 *   - 'a' returns `{ _: ['a'] }`
 *   - 'a b' returns `{ _: ['a','b'] }`
 *
 * Named Arguments:
 *   - `-flag` returns `{ flag: true }`
 *   - `-flag:1` returns `{ flag: 1 }`
 *   - `-flag:on` returns `{ flag: 'on' }`
 *   - `-flag on` returns `{ flag: 'on' }`
 *   - `-flag "always on"` returns `{ flag: 'always on' }`
 *   - `-flag on off` returns `{ flag: ['on','off'] }`
 *   - `-flag:{"xyz":"123"}` returns `{ flag: { xyz: '123' } }`
 *   - `-flag:{xyz:"123"}` returns `{ flag: { xyz: '123' } }`
 *   - `-flag:{xyz:'123'}` returns `{ flag: { xyz: '123' } }`
 *   - `-flag:"{xyz:'123'}"` returns `{ flag: { xyz: '123' } }`
 *
 * Triple Dash Data:
 *   - `a b --- raw data here` returns `{ _: ['a','b'], __: ' raw data here' }`
 *
 * @param {string} CommandLine - The command line string to parse
 * @returns {object} Parsed arguments object
 */
function ParseCommandLine( CommandLine )
{
    if ( typeof CommandLine !== 'string' )
    {
		CommandLine = process.argv.slice( 2 ).join( ' ' );
        // throw new Error( 'Command line must be a string' );
    }

    const result = {};
    const positional = [];

    // Handle empty input
    if ( !CommandLine.trim() )
    {
        return {};
    }

    // Check for triple dash data value at the end
    let dataValue = null;
    let workingLine = CommandLine;
    const tripleIndex = CommandLine.indexOf( '---' );
    if ( tripleIndex !== -1 )
    {
        dataValue = CommandLine.substring( tripleIndex + 3 );
        workingLine = CommandLine.substring( 0, tripleIndex ).trim();
        result.__ = dataValue;
    }

    // Tokenize the command line
    const tokens = _tokenize( workingLine );

    let i = 0;
    let in_positional_phase = true;

    //---------------------------------------------------------------------

    while ( i < tokens.length )
    {
        const token = tokens[ i ];

        // Check if this is a named argument (starts with - or --)
        if ( token.startsWith( '-' ) )
        {
            in_positional_phase = false;

            const argName = token.replace( /^-+/, '' );

            // Check if value is attached with colon
            if ( argName.includes( ':' ) )
            {
                const [ name, ...valueParts ] = argName.split( ':' );
                const valueStr = valueParts.join( ':' );
                const value = _parse_value( valueStr );
                _add_argument( result, name, value );
            }
            else
            {
                // Look for space-separated values
                const values = [];
                let j = i + 1;

                // Collect values until we hit another argument or end
                while ( j < tokens.length && !tokens[ j ].startsWith( '-' ) )
                {
                    values.push( _parse_value( tokens[ j ] ) );
                    j++;
                }

                if ( values.length === 0 )
                {
                    // No values found, treat as boolean flag
                    _add_argument( result, argName, true );
                }
                else if ( values.length === 1 )
                {
                    // Single value
                    _add_argument( result, argName, values[ 0 ] );
                }
                else
                {
                    // Multiple values - store as array
                    _add_argument( result, argName, values );
                }

                i = j - 1; // Adjust index since we consumed extra tokens
            }
        } else
        {
            // Positional argument
            if ( in_positional_phase )
            {
                positional.push( token );
            }
        }

        i++;
    }

    //---------------------------------------------------------------------

    // Add positional arguments if any were found
    if ( positional.length > 0 )
    {
        result._ = positional;
    }

    return result;
}

//---------------------------------------------------------------------

/**
 * Tokenizes command line string, handling quoted strings and JSON objects
 * @param {string} line - Command line to tokenize
 * @returns {string[]} Array of tokens
 */
function _tokenize( line )
{
    const tokens = [];
    let current = '';
    let in_quotes = false;
    let brace_depth = 0;
    let bracket_depth = 0;
    let i = 0;

    while ( i < line.length )
    {
        const char = line[ i ];

        if ( char === '"' && brace_depth === 0 && bracket_depth === 0 )
        {
            in_quotes = !in_quotes;
            current += char;
        }
        else if ( char === '{' && !in_quotes )
        {
            brace_depth++;
            current += char;
        }
        else if ( char === '}' && !in_quotes )
        {
            brace_depth--;
            current += char;
        }
        else if ( char === '[' && !in_quotes )
        {
            bracket_depth++;
            current += char;
        }
        else if ( char === ']' && !in_quotes )
        {
            bracket_depth--;
            current += char;
        }
        else if ( char === ' ' && !in_quotes && brace_depth === 0 && bracket_depth === 0 )
        {
            if ( current.trim() )
            {
                tokens.push( current.trim() );
                current = '';
            }
        }
        else
        {
            current += char;
        }
        i++;
    }

    if ( current.trim() )
    {
        tokens.push( current.trim() );
    }

    return tokens;
}

//---------------------------------------------------------------------

/**
 * Parses a value string into appropriate JavaScript type
 * @param {string} valueStr - String to parse
 * @returns {*} Parsed value
 */
function _parse_value( valueStr )
{
    if ( !valueStr ) return '';

    // If it's wrapped in quotes, check if it contains a JavaScript object/array inside
    if ( valueStr.startsWith( '"' ) && valueStr.endsWith( '"' ) )
    {
        const inner = valueStr.slice( 1, -1 );

        // Check if the inner content is a JavaScript object or array
        if ( ( inner.startsWith( '{' ) && inner.endsWith( '}' ) ) ||
            ( inner.startsWith( '[' ) && inner.endsWith( ']' ) ) )
        {
            try
            {
                // First try standard JSON parsing
                return JSON.parse( inner );
            }
            catch ( e )
            {
                // If that fails, try parsing as relaxed JavaScript object
                try
                {
                    return _parse_relaxed_js( inner );
                }
                catch ( e2 )
                {
                    return inner;
                }
            }
        }

        // Otherwise, try parsing the whole thing as JSON
        try
        {
            return JSON.parse( valueStr );
        }
        catch ( e )
        {
            // If JSON parsing fails, return as string (remove outer quotes)
            return inner;
        }
    }

    // If it's an object or array, handle relaxed JavaScript syntax
    if ( ( valueStr.startsWith( '{' ) && valueStr.endsWith( '}' ) ) ||
        ( valueStr.startsWith( '[' ) && valueStr.endsWith( ']' ) ) )
    {
        try
        {
            // First try standard JSON parsing
            return JSON.parse( valueStr );
        }
        catch ( e )
        {
            // If that fails, try parsing as relaxed JavaScript object
            try
            {
                return _parse_relaxed_js( valueStr );
            }
            catch ( e2 )
            {
                return valueStr;
            }
        }
    }

    // Try to parse as JSON for simple values
    try
    {
        return JSON.parse( valueStr );
    }
    catch ( e )
    {
        // If JSON parsing fails, return as string
        return valueStr;
    }
}

//---------------------------------------------------------------------

/**
 * Parses a relaxed JavaScript object/array string
 * @param {string} str - String to parse
 * @returns {*} Parsed value
 */
function _parse_relaxed_js( str )
{
    // Convert relaxed JS syntax to valid JSON
    let normalized = str;

    // Replace single quotes with double quotes, but be careful not to replace quotes inside strings
    normalized = _normalize_quotes( normalized );

    // Add quotes around unquoted identifiers
    normalized = _quote_identifiers( normalized );

    // Now try to parse as JSON
    return JSON.parse( normalized );
}

//---------------------------------------------------------------------

/**
 * Normalizes quotes in a JavaScript object string
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function _normalize_quotes( str )
{
    let result = '';
    let in_single_quote = false;
    let in_double_quote = false;
    let escape_next = false;

    for ( let i = 0; i < str.length; i++ )
    {
        const char = str[ i ];

        if ( escape_next )
        {
            result += char;
            escape_next = false;
            continue;
        }

        if ( char === '\\' )
        {
            escape_next = true;
            result += char;
            continue;
        }

        if ( char === '\'' && !in_double_quote )
        {
            in_single_quote = !in_single_quote;
            result += '"'; // Convert single quote to double quote
        }
        else if ( char === '"' && !in_single_quote )
        {
            in_double_quote = !in_double_quote;
            result += char;
        }
        else
        {
            result += char;
        }
    }

    return result;
}

//---------------------------------------------------------------------

/**
 * Adds quotes around unquoted identifiers in a JavaScript object string
 * @param {string} str - String to process
 * @returns {string} String with quoted identifiers
 */
function _quote_identifiers( str )
{
    // Match unquoted identifiers that are object keys (followed by a colon)
    // This regex looks for word characters not already in quotes, followed by a colon
    return str.replace( /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":' );
}

//---------------------------------------------------------------------

/**
 * Adds an argument to the result object, handling multiple values
 * @param {object} result - Result object to modify
 * @param {string} name - Argument name
 * @param {*} value - Argument value
 */
function _add_argument( result, name, value )
{
    if ( result.hasOwnProperty( name ) )
    {
        // Argument already exists
        if ( Array.isArray( result[ name ] ) )
        {
            // Already an array, add to it
            if ( Array.isArray( value ) )
            {
                result[ name ] = result[ name ].concat( value );
            }
            else
            {
                result[ name ].push( value );
            }
        } else
        {
            // Convert to array
            if ( Array.isArray( value ) )
            {
                result[ name ] = [ result[ name ] ].concat( value );
            }
            else
            {
                result[ name ] = [ result[ name ], value ];
            }
        }
    } else
    {
        // New argument
        result[ name ] = value;
    }
}

//---------------------------------------------------------------------

module.exports = {
    ParseCommandLine: ParseCommandLine,
};

