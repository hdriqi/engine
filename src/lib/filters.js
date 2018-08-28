import hash from 'object-hash'

function parseQuery(o) {
	var filter = {
		query : { $and: [] },
		config : {
			sort : null,
			skip: null,
			limit: null
		},
		cacheKey: null
	}

	for ( var i in o ) {
		switch (i) {
			case '_limit':
			case '_skip':
				filter.config[i.substring(1)] = parseInt(o[i])
				break
			case '_sort':
				if ( ! filter.config.sort ) filter.config.sort = {}
				var p = o[i].split(',')
				p.forEach((s)=>{
					const key = s[0] === '-' ? s.substring(1) : s
					Object.assign(filter.config.sort, {[key]: s[0] !== '-' ? 1 : -1})
				})
				break
			// case '_populate':
			// 	filter.config.populate = o[i].split(',')
			// 	break
			case '_$text':
				var args = parsedSplit(',', o[i]),
					text_search = { $text: { $search : args[0] } }
				if ( args.length > 1 )
					text_search.$text.$language = args[1]
				filter.query.$and.push( text_search )
				break
			default:
				var parsedConditions = parseValue( o[i] )
				for ( var j = 0, jj = parsedConditions.length; j < jj ; j++ ) {
					var condition = {}
					condition[i] = parsedConditions[j]
					filter.query.$and.push( condition )
				}
		}
	}

	if ( ! filter.query.$and.length )
		filter.query = {}

	// const buf = Buffer.from(JSON.stringify({...filter.query, ...filter.config}), 'utf8')
	// filter.cacheKey = XXhash.hash(buf, 0xCAFEBABE)
	filter.cacheKey = hash(JSON.stringify({...filter.query, ...filter.config}))
	return filter
}

/* primary operators that delimit criterias */
var p_operators = [
	'gt',
	'gte',
	'lt',
	'lte',
	'ne',
	'nin',
	'in',
	'eq',
	'mod',
	'near',
	'size',
	'text',
	'all'
]

/* avaiable secondary operators that modify
 * how the arguments are handled */
var s_operators = [
	'regex',
	'iregex',
	'null'
]

/* operators that take an array as argument ( this is not the mongo arity, but the http interface one ) */
var array_operators = [
	'in',
	'nin',
	'mod',
	'near',
	'all'
]

/**
 * Expects a value of a http get parameter and returns a list of criterias in the form { operators : [...], args : [...] }.
 */
var parseValue = function (str) {
	//if (typeof str != "string")
	//    throw new Error("The value of the expression must be a string!\ngot: `" + str + "`");

	var conditions = [], c_condition,
		i = 0, ii = str.length,
		buffer = '',
		in_operator = false, escaped = false // state machine flags

	function newCondition() {
		genCondition()
		c_condition = { operators: [], args: [] }
	}

	function genCondition() {
		if ( ! c_condition ) return
		var c = {},
			op = c_condition.operators.length ? c_condition.operators[0] : 'in',
			regex = ~c_condition.operators.indexOf('regex'),
			args = c_condition.args,
			caseInsensitive

		op = ( op === null ) ? 'in' : op

		if ( !args.length )
			args.push( ~c_condition.operators.indexOf('null') ? null : '' )

		if ( ~c_condition.operators.indexOf('iregex') ) {
			regex = true
			caseInsensitive = true
		}

		args = regex ? args.map(function(str) { return new RegExp(str, caseInsensitive ? 'i' : undefined) }) : args
		args = ~array_operators.indexOf(op) ? args : args[0]

		if ( op == 'near' ) {
			args = args.map(function(str) { return parseFloat(str) })
			c.$near = args.slice(0,2)
			if ( args.length > 2 )
				c.$maxDistance = args[2]
		}
		else  {
			c['$'+op] = args
		}

		conditions.push(c)
	}

	function pushOperator(name) {
		if ( ! c_condition ) newCondition()
		if ( ! ~p_operators.indexOf(name) && ! c_condition.operators.length )
			c_condition.operators.push( null )
		if ( c_condition.operators.length && ! ~s_operators.indexOf(name) )
			throw new Error('Invalid secondary operator "'+ name + '"!')
		c_condition.operators.push( name )
	}

	function pushArg(val) {
		if ( ! c_condition ) newCondition()
		c_condition.args.push( val )
	}

	while ( i < ii ) {
		if ( in_operator ) {
			if ( str[i] === '}' ) {
				if( ~p_operators.indexOf(buffer) ||              // is primary operator
					( c_condition && c_condition.args.length ) ) // following argument
					newCondition()
				pushOperator( buffer )
				in_operator = false
				buffer = ''
			} else {
				buffer += str[i]
			}
		}
		else {
			if ( escaped ) {
				if ( ! ~['{','\\',','].indexOf(str[i]) )
					throw new Error('Invalid escape sequence "' + str[i] + '"')
				buffer += str[i]
				escaped = false
			}
			else {
				switch ( str[i] ) {
					case '{':
						if ( buffer.length ) {
							pushArg( buffer )
							buffer = ''
						}
						in_operator = true
						break
					case ',':
						if ( buffer.length ) {
							pushArg( buffer )
							buffer = ''
						}
						else
							throw new Error('Argument list starting with comma!')
						break
					case '}':
						throw new Error('Invalid character "}"')
					case '\\':
						escaped = true
						break
					default:
						buffer += str[i]
				}
			}
		}
		i++
	}
	if ( in_operator )
		throw new Error('Reached end of string inside operator!')
	if ( escaped )
		throw new Error('Escaped end of string!')

	if ( buffer.length )
		pushArg( buffer )

	genCondition()

	return conditions
}

/**
 * Splits a string by delimiter allowing the use of
 * backslash for escaping it.
 * e.g. parsedSplit(",","fir\\,st,second") => ["fir,st","second"]
 */
function parsedSplit(delimiter, text) {
	var parts = [], i, ii, c, buff = '', escaped = false
	for (i = 0, ii = text.length; i < ii ; i++) {
		c = text[i]
		if ( escaped ) {
			if ( c != delimiter && c != '\\' )
				throw new Error('Invalid escape character!')
			buff += c
			escaped = false
		}
		else if ( c == '\\' )
			escaped = true
		else if ( c == delimiter ) {
			parts.push(buff)
			buff = ''
		}
		else
			buff += c
	}
	if ( escaped ) throw Error('End of string after backslash!')
	parts.push(buff)
	return parts
}

export default parseQuery