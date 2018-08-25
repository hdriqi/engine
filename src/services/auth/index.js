import express from 'express'
import controllers from './lib/controllers'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.post('/login', async (req, res) => {
			try {
				const response = await controllers.login(ctx, req)
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

		myRouter.post('/register', async (req, res) => {
			try {
				const response = await controllers.register(ctx, req)
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

		myRouter.get('/current', async (req, res) => {
			try {
				const response = await controllers.current(ctx, req)
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