'use strict';


module.exports = function ( Server )
{
	return {


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   ██████  ██████       ██ ███████  ██████ ████████ ███████ 
		//  ██    ██ ██   ██      ██ ██      ██         ██    ██      
		//  ██    ██ ██████       ██ █████   ██         ██    ███████ 
		//  ██    ██ ██   ██ ██   ██ ██      ██         ██         ██ 
		//   ██████  ██████   █████  ███████  ██████    ██    ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		$Objects: {},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
		//  ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
		//  ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
		//  ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
		//   ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		Sum: {
			description: 'Calculates the sum of two numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					A: { type: 'number', description: 'The first number.' },
					B: { type: 'number', description: 'The second number.' },
				},
				required: [ 'A', 'B' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


		//---------------------------------------------------------------------
		Difference: {
			description: 'Calculates the difference of two numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					A: { type: 'number', description: 'The first number.' },
					B: { type: 'number', description: 'The second number.' },
				},
				required: [ 'A', 'B' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


		//---------------------------------------------------------------------
		Product: {
			description: 'Calculates the product of two numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					A: { type: 'number', description: 'The first number.' },
					B: { type: 'number', description: 'The second number.' },
				},
				required: [ 'A', 'B' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


		//---------------------------------------------------------------------
		Quotient: {
			description: 'Calculates the quotient of two numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					A: { type: 'number', description: 'The first number.' },
					B: { type: 'number', description: 'The second number.' },
				},
				required: [ 'A', 'B' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


		//---------------------------------------------------------------------
		ArraySum: {
			description: 'Calculates the sum of an array of numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					Numbers: { type: 'array', items: { type: 'number' }, description: 'The array of numbers.' },
				},
				required: [ 'Numbers' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


		//---------------------------------------------------------------------
		ArrayAverage: {
			description: 'Calculates the average of an array of numbers.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					Numbers: { type: 'array', items: { type: 'number' }, description: 'The array of numbers.' },
				},
				required: [ 'Numbers' ],
			},
			Returns: {
				type: 'number',
				description: 'The calculation result.',
			},
		},


	};
};
