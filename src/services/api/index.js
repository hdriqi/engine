import express from 'express'

import projects from './lib/projects'

module.exports = {
	router(ctx) {
		const myRouter = express.Router()

		myRouter.get('/projects', async (req, res) => {
			try {
				const response = await ctx.utils.handler.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
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
		myRouter.post('/projects', async (req, res) => {
			try {
				const response = await projects.add(ctx, req)
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
		myRouter.delete('/projects/:objectId', async (req, res) => {
			try {
				const response = await projects.delete(ctx, req)
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

		myRouter.get('/projects/:projectId/:schemaId', async (req, res) => {
			try {
				const response = await ctx.utils.handler.find(ctx, {
					projectId: req.params.projectId,
					schemaId: req.params.schemaId,
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

		myRouter.post('/projects/:projectId/:schemaId', async (req, res) => {
			try {
				const response = await ctx.utils.handler.insert(ctx, {
					body: req.body,
					projectId: req.params.projectId,
					schemaId: req.params.schemaId,
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

		myRouter.get('/projects/:projectId/:schemaId/:objectId', async (req, res) => {
			try {
				const response = await ctx.utils.handler.findOne(ctx, {
					projectId: req.params.projectId,
					schemaId: req.params.schemaId,
					objectId: req.params.objectId,
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

		myRouter.put('/projects/:projectId/:schemaId/:objectId', async (req, res) => {
			try {
				const response = await ctx.utils.handler.update(ctx, {
					projectId: req.params.projectId,
					schemaId: req.params.schemaId,
					body: req.body,
					objectId: req.params.objectId,
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

		myRouter.delete('/projects/:projectId/:schemaId/:objectId', async (req, res) => {
			try {
				const response = await ctx.utils.handler.delete(ctx, {
					projectId: req.params.projectId,
					schemaId: req.params.schemaId,
					objectId: req.params.objectId,
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
}