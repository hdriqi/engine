import express from 'express'

export default (ctx) => {
	const myRouter = express.Router()

	myRouter.get('/projects/:projectId/schemas', async (req, res) => {
		try {
			const response = Object.assign({}, await ctx.utils.schema.get(ctx, req.params.projectId))
			delete response['CORE_ANALYTICS']
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
	myRouter.post('/projects/:projectId/schemas', ctx.utils.validate({
		name: ['isRequired', 'isAlphanumeric'],
		desc: ['isOptional', 'isAny']
	}),	async (req, res) => {
		try {
			const response = Object.assign({}, await ctx.utils.schema.add(ctx, req.params.projectId, {
				name: req.body.name,
				desc: req.body.desc
			}))
			delete response['CORE_ANALYTICS']
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
	myRouter.put('/projects/:projectId/schemas/:schemaId', ctx.utils.validate({
		desc: ['isOptional', 'isAny'],
		attributes: ['isOptional', 'isJSON']
	}), async (req, res) => {
		try {
			const params = Object.assign(req.body, {name: req.params.schemaId})
			const response = Object.assign({}, await ctx.utils.schema.modify(ctx, req.params.projectId, params))
			delete response['CORE_ANALYTICS']
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
	myRouter.delete('/projects/:projectId/schemas/:schemaId', async (req, res) => {
		console.log(req.params.schemaId)
		try {
			const response = Object.assign({}, await ctx.utils.schema.delete(ctx, req.params.projectId, {
				name: req.params.schemaId
			}))
			delete response['CORE_ANALYTICS']
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