import express from 'express'
import projects from './lib/projects'
import medias from './lib/medias'
import schemas from './lib/schemas'
import content from './lib/content'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

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
		myRouter.use(content(ctx))

		myRouter.all('/projects', async(req, res, next) => {
			console.log('projects middleware')
			next()
		})

		myRouter.get('/projects', async (req, res) => {
			try {
				const response = await ctx.utils.db.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					query: {
						owner: req.body.owner
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
		myRouter.post('/projects', async (req, res) => {
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
		// delete all
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