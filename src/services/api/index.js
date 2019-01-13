import express from 'express'
import projects from './lib/projects'
import schemas from './lib/schemas'
import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(null, 23)

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use((req, res, next) => {
			if(process.env.PRODUCTION == 'true') {
				const pattern = new RegExp(/evius.id$/igm)
				if(pattern.test(req.headers.origin) || req.ip === ctx.SERPH_IP) {
					next()
				}
				else{
					res.status(401).json({
						status: 'unauthorized',
						message: `${req.headers.origin || req.ip} not allowed to access`
					})
				}
			}
			else{
				next()
			}
		})

		myRouter.use('/projects', async (req, res, next) => {
			if(req.method !== 'OPTIONS'){
				try {
					const decoded = await ctx.utils.auth.verify(ctx, req)
					req.current = decoded
					next()
				} catch (err) {
					res.status(400).json({
						status: 'error',
						message: err
					})
				}
			}
			else{
				next()
			}
		})

		myRouter.use('/projects/:projectId', async (req, res, next) => {
			if(req.method !== 'OPTIONS'){
				try {
					await ctx.utils.db.findOneByQuery(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'projects',
						query: {
							_id: req.params.projectId,
							userIds: req.current._id
						}
					})
					next()
				} catch (err) {
					return res.status(403).json({
						status: 'error',
						message: 'unauthorized'
					})
				}
			}
			else{
				next()
			}
		})

		myRouter.use(schemas(ctx))

		myRouter.get('/projects', async (req, res) => {
			try {
				const response = await ctx.utils.db.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					query: {
						userIds: req.current._id
					}
				})
				
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
		myRouter.post('/projects', ctx.utils.validate({
			name: ['isRequired', 'isAlphanumeric']
		}), async (req, res) => {
			try {
				const response = await projects.add(ctx, req)
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
		myRouter.get('/projects/:projectId', async (req, res) => {
			try {
				const response = await ctx.utils.db.findOne(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId
				})
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
		myRouter.post('/projects/:projectId/invite', async (req, res) => {
			try {
				const response = await projects.invite(ctx, req)
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
		myRouter.get('/projects/:projectId/medias', async (req, res) => {
			try {
				const response = await ctx.utils.db.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'medias',
					query: {
						project: req.params.projectId
					}
				})
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
		myRouter.get('/projects/:projectId/analytics', async (req, res) => {
			try {
				const response = await ctx.utils.analytics.get(ctx, {
					projectId: req.params.projectId,
					query: req.query
				})
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
		myRouter.get('/projects/:projectId/analytics_full', async (req, res) => {
			try {
				const response = await ctx.utils.analytics.getFull(ctx, {
					projectId: req.params.projectId,
					query: req.query
				})
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
		myRouter.get('/projects/:projectId/bandwidths_full', async (req, res) => {
			try {
				const response = await ctx.utils.analytics.getBandwidth(ctx, {
					projectId: req.params.projectId,
					query: req.query
				})
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

		myRouter.put('/projects/:projectId/token_read', async (req, res) => {
			try {
				const newApiKey = await uidgen.generate()
				req.body = {
					readApiKey: newApiKey
				}
				const response = await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId,
					body: req.body
				})
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
		myRouter.put('/projects/:projectId/token_write', async (req, res) => {
			try {
				const newApiKey = await uidgen.generate()
				req.body = {
					writeApiKey: newApiKey
				}
				const response = await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId,
					body: req.body
				})
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
		myRouter.put('/projects/:projectId', ctx.utils.validate({
			name: ['isRequired', 'isAlphanumeric']
		}), async (req, res) => {
			try {
				if(req.body.cors && req.body.cors.length > 0) {
					const split = req.body.cors.split(',')
					req.body.cors = split
				}
				const response = await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId,
					body: req.body
				})
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
		myRouter.delete('/projects/:projectId', async (req, res) => {
			try {
				const response = await projects.delete(ctx, req)
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
}