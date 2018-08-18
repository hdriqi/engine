import express from 'express'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use('/:projectId/:schemaId/:objectId', async (req, res) => {
			switch(req.method) {
				case 'GET': {
					const responds = await ctx.utils.handler.findOne(ctx, req)
					res.json(responds)
					break
				}
				case 'PUT': {
					const responds = await ctx.utils.handler.update(ctx, req)
					res.json(responds)
					break
				}
				case 'DELETE': {
					const responds = await ctx.utils.handler.delete(ctx, req)
					res.json(responds)
					break
				}
				default:
					res.json({
						code: 400,
						message: 'Endpoint not exist'
					})
			}
		})

		myRouter.use('/:projectId/:schemaId', async (req, res) => {
			switch(req.method) {
				case 'GET': {
					const responds = await ctx.utils.handler.find(ctx, req)
					res.json(responds)
					break
				}
				case 'POST': {
					const responds = await ctx.utils.handler.insert(ctx, req)
					res.json(responds)
					break
				}
				case 'PUT': 
					res.send(req.method)
					break
				case 'DELETE':
					res.send(req.method)
					break
				default:
					res.json({
						code: 400,
						message: 'Endpoint not exist'
					})
			}
		})

		return myRouter
	}
}