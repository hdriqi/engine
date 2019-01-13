import express from 'express'
import controllers from './lib/controllers'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.use((req, res, next) => {
			if(process.env.PRODUCTION == 'true') {
				const pattern = new RegExp(/evius.id$/igm)
				if(pattern.test(req.headers.origin)) {
					next()
				}
				else{
					res.status(401).json({
						status: 'unauthorized',
						message: 'origin not allowed to access'
					})
				}
			}
			else{
				next()
			}
		})

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

		myRouter.post('/invite-confirm',ctx.utils.validate({
			token: ['isRequired', 'isAny']
		}), async (req, res) => {
			try {
				const response = await controllers.inviteConfirmation(ctx, req)
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

		myRouter.post('/forgot-password', ctx.utils.validate({
			email: ['isRequired', 'isEmail']
		}), async (req, res) => {
			try {
				const response = await controllers.forgotPassword(ctx, req)
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

		myRouter.post('/change-password', ctx.utils.validate({
			currentPassword: ['isRequired', 'isAny'],
			newPassword: ['isRequired', 'isAny']
		}), async (req, res) => {
			try {
				const response = await controllers.changePassword(ctx, req)
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

		myRouter.get('/verify-credential/:token', async (req, res) => {
			try {
				const response = await controllers.verifyCredential(ctx, req)
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

		myRouter.post('/reset-password', ctx.utils.validate({
			token: ['isRequired', 'isAny'],
			password: ['isRequired', 'isAny']
		}), async (req, res) => {
			try {
				const response = await controllers.resetPassword(ctx, req)
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