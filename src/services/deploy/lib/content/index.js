import express from 'express'
import cors from 'cors'

const corsOptionsDelegate = (ctx) => {
	return async (req, cb) => {
		const project = await ctx.utils.db.findOneByQuery(ctx, {
			projectId: ctx.CORE_DB,
			schemaId: 'projects',
			query: {
				_id: req.subdomains[0]
			}
		})

		const whiteListEvius = new RegExp(/evius\.id$/igm)

		const source = req.headers.origin || `http://${req.ip}`
		console.log(`${source} requesting access`)
		console.log(ctx.SERPH_IP.includes(source))
		req.project = project
		if(ctx.SERPH_IP.includes(source) || 
			(req.project && req.project.cors.length > 0 && req.project.cors.includes(source)) ||
			whiteListEvius.test(source) ||
			(req.project && req.project.cors.length === 0)
			) {
			cb(null, true)
		}
		else{
			cb(JSON.stringify({
				message: `origin ${source} not allowed`
			}))
		}
	}
}


const saveAnalytics = (ctx, projectId, req) => {
	if(req.users.grant_type !== 'jwt') {
		ctx.utils.analytics.save(ctx, {
			projectId: projectId,
			schemaId: req.params.schemaId,
			userAgent: req.get('User-Agent'),
			method: req.method
		})
	}
}

export default (ctx) => {
	const myRouter = express.Router()

	myRouter.use('/', cors(corsOptionsDelegate(ctx)))

	myRouter.use('/', async (req, res, next) => {
		if(req.method !== 'OPTIONS') {
			try {
				const user = await ctx.utils.auth.verify(ctx, req)
				req.users = user
				if(user.grant_type === 'jwt') {
					await ctx.utils.db.findOneByQuery(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'projects',
						query: {
							_id: req.subdomains[0],
							userIds: user._id
						}
					})
					next()
				}
				else if(user.grant_type === 'api_key') {
					next()
				}
			} catch (err) {
				res.status(400).json({
					status: 'error',
					message: `unauthorized`
				})
			}
		}
		else{
			next()
		}
	})

	myRouter.get('/', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.findOne(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				objectKey: projectId
			})
			res.status(200).json({
				status: 'success',
				data: {
					projectId: response._id,
					message: 'it works'
				}
			})
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	myRouter.get('/:schemaId', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.find(ctx, {
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
				query: req.query
			})
			saveAnalytics(ctx, projectId, req)
			res.status(200).json({
				status: 'success',
				data: response
			})
			console.log(req.connection.bytesWritten)
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	myRouter.post('/:schemaId', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.insert(ctx, {
				body: req.body,
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
				query: req.query
			})
			saveAnalytics(ctx, projectId, req)
			res.status(200).json({
				status: 'success',
				data: response
			})
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	myRouter.get('/:schemaId/:objectKey', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.findOne(ctx, {
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
				objectKey: req.params.objectKey,
				query: req.query
			})
			saveAnalytics(ctx, projectId, req)
			res.status(200).json({
				status: 'success',
				data: response
			})
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	myRouter.put('/:schemaId/:objectKey', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.modify(ctx, {
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
				body: req.body,
				objectKey: req.params.objectKey,
				query: req.query
			})
			saveAnalytics(ctx, projectId, req)
			res.status(200).json({
				status: 'success',
				data: response
			})
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	myRouter.delete('/:schemaId/:objectKey', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.delete(ctx, {
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
				objectKey: req.params.objectKey,
				query: req.query
			})
			saveAnalytics(ctx, projectId, req)
			res.status(200).json({
				status: 'success',
				data: response
			})
		} catch (err) {
			res.status(400).json({
				status: 'error',
				message: err
			})
		}
	})

	return myRouter
}