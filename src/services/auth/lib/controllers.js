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
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	register(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			if(!req.body.password) {
				return reject('password is required')
			}
			bcrypt.hash(req.body.password, 10)
				.then(async (hash)=>{
					req.body.password = hash
					console.log(req.body)
					try {
						const response = await ctx.utils.db.insert(ctx, {
							projectId: ctx.CORE_DB,
							schemaId: 'users',
							body: req.body
						})
						return resolve(response)
					} catch (err) {
						console.log(err)
						return reject(err)
					}
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	login(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			let idKey, idVal
			if(req.body.username) {
				idKey = 'username'
				idVal = req.body.username
			}
			else if(req.body.email){
				idKey = 'email'
				idVal = req.body.email
			}
			else{
				return reject('Bad Request - parameter username/email is required')
			}

			console.log(idKey)

			try {
				const doc = await ctx.dbs[ctx.CORE_DB].models['users'].findOne({
					[idKey]: idVal
				})
				if(doc){
					bcrypt.compare(req.body.password, doc.password)
						.then((res)=>{
							if(res){
								let token = jwt.sign({
									_id: doc._id,
									_role: doc.role
								}, process.env.JWT_SECRET, {expiresIn: '14d'})
								return resolve(token)
							}
							return reject('invalid username/password')
						})
					ctx.dbs[ctx.CORE_DB].cache.users.single.insert(JSON.parse(JSON.stringify(doc)))
				}
				else{
					return reject('invalid username/password')
				}
			} catch (err) {
				return err
			}
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
				const decoded = await ctx.utils.auth.verify(ctx, req)
				ctx.dbs[ctx.CORE_DB].cache.users.single.findOne({ _id: decoded._id }, async (err, doc) => {
					if(!doc) {
						try {
							doc = await ctx.utils.db.findOne(ctx, {
								projectId: ctx.CORE_DB,
								schemaId: 'users',
								objectKey: decoded._id
							})
							ctx.dbs[ctx.CORE_DB].cache.users.single.insert(JSON.parse(JSON.stringify(doc)))
						} catch (err) {
							return reject(err)	
						}
					}
					return resolve(doc)
				})
			} catch (err) {
				return reject(err)
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