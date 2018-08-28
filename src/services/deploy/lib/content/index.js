import express from 'express'

export default (ctx) => {
	const myRouter = express.Router()

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

	myRouter.post('/:schemaId', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.insert(ctx, {
				body: req.body,
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
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

	myRouter.get('/:schemaId/:objectKey', async (req, res) => {
		const projectId = req.subdomains[0]
		try {
			const response = await ctx.utils.db.findOne(ctx, {
				projectId: projectId,
				schemaId: `${projectId}_${req.params.schemaId}`,
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