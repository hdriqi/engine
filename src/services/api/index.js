import express from 'express'
import projects from './lib/projects'
import schemas from './lib/schemas'

import uuidv4 from 'uuid/v4'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use('/projects/:projectId', async(req, res, next) => {
			try {
				const user = await ctx.utils.auth.verify(ctx, req)
				console.log(user)
				await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					query: {
						_id: req.params.projectId,
						owner: user._id
					}
				})
				next()
			} catch (err) {
				res.status(400).json({
					status: 'error',
					message: `unauthorized`
				})
			}
		})

		myRouter.use(schemas(ctx))

		myRouter.get('/projects', async (req, res) => {
			try {
				const response = await ctx.utils.db.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					query: req.query
					// query: {
					// 	owner: req.body.owner
					// }
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
		myRouter.put('/projects/:projectId/token', async (req, res) => {
			try {
				req.body = {
					apiKey: uuidv4()
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