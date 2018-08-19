import express from 'express'
import controllers from './lib/controllers'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.post('/login', async (req, res) => {
			try {
				const response = await controllers.login(ctx, req, 'engine-core')
				res.json(response)
			} catch (err) {
				res.json(err)
			}
		})

		myRouter.post('/register', async (req, res) => {
			try {
				const response = await controllers.register(ctx, req, 'engine-core')
				res.json(response)
			} catch (err) {
				res.json(err)
			}
		})

		myRouter.post('/current', async (req, res) => {
			try {
				const response = await controllers.current(ctx, req)
				res.json(response)
			} catch (err) {
				res.json(err)
			}
		})

		return myRouter
	}
}