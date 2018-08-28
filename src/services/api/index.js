import express from 'express'
import projects from './lib/projects'
import medias from './lib/medias'
import schemas from './lib/schemas'

import uuidv4 from 'uuid/v4'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		// MUST HAVE JWT
		// CHECK IF USERID HAVE ACCESS TO CURRENT PROJECT
		myRouter.use('/projects', async(req, res, next) => {
			console.log('projects middleware')
			next()
		})

		myRouter.use(medias(ctx))
		
		myRouter.use(async (req, res, next) => {
			if(req.method !== 'OPTIONS'){
				try {
					const user = await ctx.utils.auth.verify(req)
					req.body.owner = user._id
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