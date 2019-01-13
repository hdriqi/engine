import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(null, 23)

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
		const self = this
		return new Promise(async (resolve, reject)=>{
			try {
				req.body.validEmail = false
				
				if(!req.body.password) {
					return reject('password is required')
				}
	
				let cred
				if(req.body.token) {
					cred = await self.verifyCredential(ctx, req)
				}
	
				bcrypt.hash(req.body.password, 10)
					.then(async (hash)=>{
						req.body.password = hash
						try {
							if(cred) {
								await ctx.utils.db.modify(ctx, {
									projectId: ctx.CORE_DB,
									schemaId: 'CORE_CREDENTIALS',
									objectKey: cred.id,
									body: {
										isValid: false
									}
								})
				
								const user = await ctx.utils.db.findOneByQuery(ctx, {
									projectId: ctx.CORE_DB,
									schemaId: 'users',
									query: {
										email: cred.params.email
									}
								})
				
								const project = await ctx.utils.db.findOne(ctx, {
									projectId: ctx.CORE_DB,
									schemaId: 'projects',
									objectKey: cred.params.projectId
								})
				
								if(project.userIds) {
									project.userIds.push(user.id)
								}
								else {
									project.userIds = [user.id]
								}
				
								await ctx.utils.db.modify(ctx, {
									projectId: ctx.CORE_DB,
									schemaId: 'projects',
									objectKey: cred.params.projectId,
									body: project
								})
								req.body.validEmail = true
							}
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
			} catch (err) {
				reject(err)
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	forgotPassword(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'users',
					query: {
						email: req.body.email
					}
				})

				if(user) {
					const newToken = await uidgen.generate()

					await ctx.utils.db.insert(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'CORE_CREDENTIALS',
						body: {
							token: newToken,
							params: {
								email:  user.email
							},
							isValid: true,
							state: 'FORGOT_PASSWORD'
						}
					})

					ctx.utils.mail.send({
						from: `Evius Industri ${process.env.EMAIL_USERNAME}`,
						to: req.body.email,
						subject: 'Forgot Password',
						html: `Forgot password ya? ${newToken}`
					})

					resolve('success')
				}
				else {
					reject('email is not registered')
				}
			} catch (err) {
				console.log(err)
				reject(err)
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	verifyCredential(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				const cred = await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					query: {
						token: req.params.token
					}
				})
				if(!cred) {
					return reject('token_not_found')
				}

				if(cred.isValid) {
					return resolve(cred)
				}
				else {
					reject('token_expired')
				}
			} catch (err) {
				reject(err)
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 */
	resetPassword(ctx, req) {
		const self = this
		return new Promise(async (resolve, reject) => {
			try {
				const cred = await self.verifyCredential(ctx, req)
				const newPassword = bcrypt.hashSync(req.body.password, 10)

				await ctx.utils.db.modifyByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'users',
					query: {
						email: cred.params.email
					},
					body: {
						password: newPassword,
						validEmail: true
					}
				})

				await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					objectKey: cred.id,
					body: {
						isValid: false
					}
				})

				resolve('success')
			} catch (err) {
				reject(err)
			}
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

			try {
				const doc = await ctx.dbs[ctx.CORE_DB].models['users'].findOne({
					[idKey]: idVal,
					validEmail: 'true'
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
					return reject('private beta only')
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