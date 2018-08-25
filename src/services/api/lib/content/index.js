import express from 'express'

export default (ctx) => {
	const myRouter = express.Router()

	myRouter.get('/projects/:projectId/schemas/:schemaId', async (req, res) => {
		try {
			const response = await ctx.utils.db.find(ctx, {
				projectId: req.params.projectId,
				schemaId: req.params.schemaId,
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

	myRouter.post('/projects/:projectId/schemas/:schemaId', async (req, res) => {
		try {
			const response = await ctx.utils.db.insert(ctx, {
				body: req.body,
				projectId: req.params.projectId,
				schemaId: req.params.schemaId,
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

	myRouter.get('/projects/:projectId/schemas/:schemaId/:objectKey', async (req, res) => {
		try {
			const response = await ctx.utils.db.findOne(ctx, {
				projectId: req.params.projectId,
				schemaId: req.params.schemaId,
				objectKey: req.params.objectKey,
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

	myRouter.put('/projects/:projectId/schemas/:schemaId/:objectKey', async (req, res) => {
		try {
			const response = await ctx.utils.db.modify(ctx, {
				projectId: req.params.projectId,
				schemaId: req.params.schemaId,
				body: req.body,
				objectKey: req.params.objectKey,
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

	myRouter.delete('/projects/:projectId/schemas/:schemaId/:objectKey', async (req, res) => {
		try {
			const response = await ctx.utils.db.delete(ctx, {
				projectId: req.params.projectId,
				schemaId: req.params.schemaId,
				objectKey: req.params.objectKey,
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

	return myRouter
}