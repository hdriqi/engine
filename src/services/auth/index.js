import express from 'express'
import controllers from './lib/controllers'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.post('/login', ctx.utils.validate({
			username: ['isOptional', 'isAlphanumeric'],
			email: ['isOptional', 'isEmail'],
			password: ['isRequired', 'isAny']
		}), async (req, res) => {
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

		myRouter.post('/register', ctx.utils.validate({
			username: ['isRequired', 'isAlphanumeric'],
			email: ['isRequired', 'isEmail'],
			password: ['isRequired', 'isAny']
		}), async (req, res) => {
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