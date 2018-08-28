import jwt from 'jsonwebtoken'

const checkAccess = (ctx, user, targetEndpoint, targetMethod)=> {
	const access = targetMethod === 'GET' ? 'read' : 'write'
	return new Promise((resolve, reject)=>{
		ctx.models['Roles'].model.findOne({
			name: user.role,
			endpoint: targetEndpoint,
			[access]: true
		})
			.then((result)=>{
				if(result){
					console.log(`Request Granted -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
					resolve(true)
				}
				else{
					console.log(`Request Denied -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
					reject(false)
				}
			})
			.catch((err)=>{
				console.log(`Request Denied -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
				console.log(err)
				reject(false)
			})
	})
}

module.exports = {
	/**
	 * 
	 * @param {*} req 
	 */
	verify(ctx, req) {
		return new Promise(async (resolve, reject) => {
			if(req.headers.authorization) {
				const headerAuth = req.headers.authorization.split(',')
				let apiKey, authToken
				if(headerAuth[0].includes('Bearer')){
					// no access token present
					apiKey = null
					authToken = headerAuth[0].split(' ')[1]
				}
				else{
					apiKey = headerAuth[0]
					authToken = null
				}
				if(apiKey){
					try {
						await ctx.utils.db.findOneByQuery(ctx, {
							projectId: ctx.CORE_DB,
							schemaId: 'projects',
							query: {
								_id: req.subdomains[0],
								apiKey: apiKey
							}
						})
						return resolve(null)	
					} catch (err) {
						return reject(err)
					}
				}
				else{
					try {
						var decoded = jwt.verify(authToken, process.env.JWT_SECRET)
						return resolve(decoded)
					} catch(err) {
						return reject(err.message)
					}
				}
			}
			else{
				reject('unauthorize')
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 */
	can(ctx) {
		let self = this
		return async function(req, res, next){
			let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : false
			const targetEndpoint = req.originalUrl.split('?')[0].split('/')[2]
			const targetMethod = req.method
			// if token exist
			if(token) {
				try {
					const currentUser = await self.current(ctx, req)
					await checkAccess(ctx, currentUser.result, targetEndpoint, targetMethod)
					next()
				} catch (err) {
					res.json({
						code: 401,
						result: `No Access`
					})
				}
			}
			// if no token
			else{
				try{
					await checkAccess(ctx, {_id: 'guest', role: 'guest'}, targetEndpoint, targetMethod)
					next()
				}
				catch(err){
					res.json({
						code: 401,
						result: `No Access`
					})
				}
			}
		}
	}
}