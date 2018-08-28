import express from 'express'

import content from './lib/content'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use('/api', content(ctx))

		return myRouter
	}
}