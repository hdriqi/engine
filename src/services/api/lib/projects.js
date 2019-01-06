import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(null, 23)

module.exports = {
	async add(ctx, req) {
		try {
			const readApiKey = await uidgen.generate()
			const writeApiKey = await uidgen.generate()
			const result = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				body: {
					name: req.body.name,
					owner: req.current._id,
					readApiKey: readApiKey,
					writeApiKey: writeApiKey,
					collaborators: [req.current._id],
					cors: []
				},
				query: req.query
			})

			Object.assign(ctx.dbsConnection, {[result._id.toString()]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result._id.toString())})
			try {
				await ctx.utils.schema.update(ctx, result._id.toString())
				return result
			} catch (err) {
				console.log(err)
			}
		} catch (err) {
			throw err
		}
	},

	async delete(ctx, req) {
		try {
			await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				objectKey: req.params.projectId,
				query: req.query
			})

			// DROP DATABASE
			try {
				ctx.dbsConnection[req.params.projectId].dropDatabase()
				delete ctx.dbsConnection[req.params.projectId]
				delete ctx.dbs[req.params.projectId]
			} catch (err) {
				return err
			}

			return `${req.params.projectId} successfully deleted`
		} catch (err) {
			throw err
		}
	},

	async inviteConfirmation(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				const cred = await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					query: {
						token: req.body.token,
						isValid: true
					}
				})

				if(!cred) {
					return reject('token_not_found')
				}

				if(!cred.isValid) {
					return reject('token_expired')
				}

				await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					objectKey: cred.id,
					body: {
						isValid: false
					}
				})

				const project = await ctx.utils.db.findOne(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId
				})

				if(project.userIds) {
					project.userIds.push(cred.userId)
				}
				else {
					project.userIds = [cred.userId]
				}

				await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId,
					body: project
				})

				resolve('success')
			} catch (err) {
				console.log(err)
				reject(err)
			}
		})
	},

	async invite(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				// check user exist
				// if not exist then set password first
				// else sent invitation

				// email invitation
				// in url /invite/token
				// accept -> change in project collaborators and redirect to login

				// in url /invite/token-invitation/new/token-password
				// redirect to /change-password
				// save password -> change in project collaborators and redirect to login

				const project = await ctx.utils.db.findOne(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId
				})

				let user = await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'users',
					query: {
						email: req.body.email
					}
				})

				if(project.userIds && project.userIds.includes(user.id)) {
					return reject('already invited')
				}

				const newToken = await uidgen.generate()
				let generatedLink = newToken.toString()

				// if user not exist
				if(!user) {
					const resetPasswordToken = await uidgen.generate()

					user = await ctx.utils.db.insert(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'users',
						body: {
							username: req.body.email.split('@')[0],
							email: req.body.email,
							password: resetPasswordToken,
							validEmail: false,
							role: 'user'
						}
					})

					await ctx.utils.db.insert(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'CORE_CREDENTIALS',
						body: {
							token: resetPasswordToken,
							userId: user._id,
							isValid: true,
							state: 'FORGOT_PASSWORD'
						}
					})

					generatedLink += `?type=new&token=${resetPasswordToken}`
				}

				await ctx.utils.db.insert(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					body: {
						token: newToken,
						userId: user._id,
						isValid: true,
						state: 'INVITE'
					}
				})

				await ctx.utils.mail.send({
					from: `Evius Industri ${process.env.EMAIL_USERNAME}`,
					to: req.body.email,
					subject: `${project.name} Invitation`,
					html: `You are invited to be the collaborators in ${project.name}, click here ${generatedLink}`
				})
				resolve('success')
			} catch (err) {
				console.log(err)
				reject(err)
			}
		})
	}
}