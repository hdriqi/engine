import fs from 'fs'

import express from 'express'
import mime from 'mime'
import tus from 'tus-node-server'
import path from 'path'
import uuidv1 from 'uuid/v1'

const mySchema = 'medias'

export default (ctx) => {
	// TUS server
	const tusServer = new tus.Server()
	const EVENTS = tus.EVENTS
	tusServer.datastore = new tus.FileStore({
		path: '/upload',
		namingFunction: uuidv1
	})

	tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (result) => {
		const originalMetadata = result.file.upload_metadata.split(',')
		const originalName = Buffer.from(originalMetadata[0].split(' ')[1], 'base64').toString('ascii')
		const originalType = Buffer.from(originalMetadata[1].split(' ')[1], 'base64').toString('ascii')
		// SAVE TO CORE_DB -> MEDIA SCHEMA
		try {
			const response = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: mySchema,
				body: {
					name: result.file.id,
					originalName: originalName,
					extension: mime.getExtension(originalType),
					project: result.req.params.projectId,
					owner: result.req.current._id
				}
			})
			ctx.cache[mySchema].insert(response)
		} catch (err) {
			console.log(err)
		}
	})

	const myRouter = express.Router()

	myRouter.get('/projects/:projectId/medias', async (req, res) => {
		try {
			const response = await ctx.utils.db.find(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: mySchema,
				query: {
					project: req.params.projectId
				}
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

	myRouter.all('/projects/:projectId/medias/upload', async (req, res, next) => {
		if(req.method === 'POST' || req.method === 'PATCH'){
			try {
				const decoded = await ctx.utils.auth.verify(req)
				req.current = decoded
				next()
			} catch (err) {
				res.status(400).json({
					status: 'error',
					message: err
				})
			}
		}
		else{
			next()
		}
	}, tusServer.handle.bind(tusServer))
	
	myRouter.all('/projects/:projectId/medias/upload/*', async (req, res, next) => {
		if(req.method === 'POST' || req.method === 'PATCH'){
			try {
				const decoded = await ctx.utils.auth.verify(req)
				req.current = decoded
				// check if project exist
				next()
			} catch (err) {
				res.status(400).json({
					status: 'error',
					message: err
				})
			}
		}
		else{
			next()
		}
	}, tusServer.handle.bind(tusServer))

	myRouter.delete('/projects/:projectId/medias/:mediaKey', async (req, res) => {
		try {
			const response = await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: mySchema,
				objectKey: req.params.mediaKey,
				query: req.query
			})
			
			if(response.n > 0) {
				const filePath = path.join(ctx.ENGINE_PATH, '..', 'upload', req.params.mediaKey)
				fs.unlinkSync(filePath)
			}

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

	myRouter.get('/projects/:projectId/medias/:mediaKey/:mimeType', async (req, res) => {
		const filePath = path.join(ctx.ENGINE_PATH, '..', 'upload', req.params.mediaKey)
		res.type(req.params.mimeType)
		res.sendFile(filePath)
	})

	return myRouter
}