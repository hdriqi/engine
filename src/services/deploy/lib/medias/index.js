import fs from 'fs'

import express from 'express'
import mime from 'mime'
import tus from '@evius/tus-server'
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
			await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: mySchema,
				body: {
					name: result.file.id,
					originalName: originalName,
					extension: mime.getExtension(originalType),
					project: result.req.subdomains[0]
				}
			})
		} catch (err) {
			console.log(err)
		}
	})

	const myRouter = express.Router()

	myRouter.all('/upload', async (req, res, next) => {
		if(req.method !== 'OPTIONS'){
			try {
				const decoded = await ctx.utils.auth.verify(ctx, req)
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
	
	myRouter.all('/upload/*', async (req, res, next) => {
		if(req.method !== 'OPTIONS'){
			try {
				const decoded = await ctx.utils.auth.verify(ctx, req)
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

	myRouter.delete('/:mediaKey', async (req, res) => {
		try {
			const response = await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: mySchema,
				objectKey: req.params.mediaKey
			})
			
			if(response.n > 0) {
				const filePath = path.join(ctx.ENGINE_PATH, '..', 'upload', req.params.mediaKey)
				try {
					fs.unlinkSync(filePath)	
				} catch (err) {
					console.log(err)
				}
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

	myRouter.get('/:mediaKey/:mimeType', async (req, res) => {
		const filePath = path.join(ctx.ENGINE_PATH, '..', 'upload', req.params.mediaKey)
		res.type(req.params.mimeType)
		res.sendFile(filePath)
		res.on('finish', async () => {
			try {
				const data = await ctx.utils.db.findOne(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'medias',
					objectKey: req.params.mediaKey
				})
				if(!req.socket.prevBytesWritten) req.socket.prevBytesWritten = 0
				const bytes = req.socket.bytesWritten - req.socket.prevBytesWritten
				req.socket.prevBytesWritten = req.socket.bytesWritten
				try {
					await ctx.utils.db.insert(ctx, {
						projectId: ctx.CORE_DB,
						schemaId: 'bandwidths',
						body: {
							project: data.project._id,
							bytes: bytes
						}
					})	
				} catch (err) {
					console.log(err)
				}
			} catch (err) {
				console.log(err)
			}
		})
	})

	return myRouter
}