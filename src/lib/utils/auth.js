import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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
	verify(req) {
		return new Promise((resolve, reject)=>{
			let token = req.headers.authorization.split(' ')[1]
			try {
				var decoded = jwt.verify(token, process.env.JWT_SECRET)
				resolve(decoded)
			} catch(err) {
				reject({
					code: 400,
					respond: err
				})
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	register(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			let attributes = {}
			bcrypt.hash(req.body.password, 10)
				.then((hash)=>{
					req.body.password = hash
					Object.keys(ctx.models.Users.attributes).forEach(async (key)=>{
						Object.assign(attributes, {[key]: req.body[key]})
					})
					let newUsers = new ctx.models.Users.model(attributes)
					newUsers.save()
						.then((result)=>{
							resolve({
								code: 201,
								respond: result._id
							})
						})
						.catch((err)=>{
							reject({
								code: 400,
								respond: err
							})
						})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	login(ctx, req) {
		return new Promise((resolve, reject)=>{
			let [idKey, idVal] = req.body.username ? ['username', req.body.username] : ['email', req.body.email]

			ctx.models.Users.model.findOne({
				[idKey]: idVal
			})
				.then((result)=>{
					if(result){
						bcrypt.compare(req.body.password, result.password)
							.then((res)=>{
								if(res){
									let token = jwt.sign({
										_id: result._id,
										_role: result.role
									}, process.env.JWT_SECRET, {expiresIn: '14d'})
									resolve({
										code: 200,
										respond: token
									})
								}
								else reject({
									code: 400,
									respond: 'invalid username/password'
								})
							})
					}
					else{
						reject({
							code: 400,
							respond: 'invalid username/password'
						})
					}
				})
				.catch((err)=>{
					reject({
						code: 400,
						respond: err
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	current(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				const decoded = await this.verify(req)
				req.params.id = decoded._id
				let result = await ctx.services.db.findOne(ctx, req, 'Users')
				resolve(result)
			} catch (err) {
				reject(err)
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
					await checkAccess(ctx, currentUser.respond, targetEndpoint, targetMethod)
					next()
				} catch (err) {
					res.json({
						code: 401,
						respond: `No Access`
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
						respond: `No Access`
					})
				}
			}
		}
	}
}