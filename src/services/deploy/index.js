import express from 'express'

import content from './lib/content'
import medias from './lib/medias'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		// CHECK ACCESS TOKEN/JWT
		myRouter.use('/api', async(req, res, next) => {
			
			if(req.method !== 'OPTIONS'){
				try {
					const user = await ctx.utils.auth.verify(ctx, req)
					if(user){
						await ctx.utils.db.findOneByQuery(ctx, {
							projectId: ctx.CORE_DB,
							schemaId: 'projects',
							query: {
								_id: req.subdomains[0],
								owner: user._id
							}
						})
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

		myRouter.use('/api', content(ctx))
		myRouter.use('/media', medias(ctx))

		return myRouter
	}
}