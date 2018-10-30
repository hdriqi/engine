import express from 'express'

import content from './lib/content'
import medias from './lib/medias'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use('/api', content(ctx))
		myRouter.use('/media', medias(ctx))

		return myRouter
	}
}