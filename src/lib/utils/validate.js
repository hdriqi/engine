import validator from 'validator'

`validate = {
	name: isAlphanumeric,
	newName: isAlphanumeric
}`

export default (validate) => {
	return async (req, res, next) => {
		try {
			await Promise.all(Object.keys(validate).map((k) => {
				return new Promise((resolve, reject) => {
					if(validate[k][0] === 'isRequired' && !req.body[k]){
						return reject(`Bad Request - parameter ${k} is required`)
					}
					else if(validate[k][0] === 'isRequired' && validate[k][1] !== 'isAny' && req.body[k] && !validator[validate[k][1]](req.body[k])){
						return reject(`Bad Request - parameter ${k} must be ${validate[k][1].substring(2).toLowerCase()}`)
					}
					else if(validate[k][0] === 'isOptional' && validate[k][1] !== 'isAny' && req.body[k] && !validator[validate[k][1]](req.body[k])){
						return reject(`Bad Request - parameter ${k} must be ${validate[k][1].substring(2).toLowerCase()}`)
					}
					else{
						return resolve()
					}
				})
			}))
			next()
		} catch (err) {
			console.log(err)
			return res.status(400).json({
				status: 'error',
				message: err
			})
		}
	}
}