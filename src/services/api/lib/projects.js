import path from 'path'
import fs, { mkdirSync } from 'fs'
import uuidv4 from 'uuid/v4'

const rmdir = function(dir) {
	var list = fs.readdirSync(dir)
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i])
		var stat = fs.statSync(filename)
		
		if(filename == '.' || filename == '..') {
			// pass these files
		} else if(stat.isDirectory()) {
			rmdir(filename)
		} else {
			fs.unlinkSync(filename)
		}
	}
	fs.rmdirSync(dir)
}

// const projectCheck = (ctx, projectId) => {
// 	const targetFolder = path.join(ctx.USERS_PROJECTS, projectId.toLowerCase())
// 	return fs.existsSync(targetFolder) ? {
// 		exist: true,
// 		targetFolder: targetFolder
// 	} : {
// 		exist: false,
// 		targetFolder: targetFolder
// 	}
// }

module.exports = {
	async add(ctx, req) {
		try {
			req.body.accessToken = uuidv4()
			const result = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				body: req.body,
				query: req.query
			})

			const targetFolder = path.join(ctx.USERS_PROJECTS, result._id.toString())
			
			mkdirSync(targetFolder)
			mkdirSync(path.join(targetFolder, 'api'))

			Object.assign(ctx.dbsConnection, {[result.name]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result.name)})

			return `${result.name} successfully created`
		} catch (err) {
			throw err
		}
	},

	async delete(ctx, req) {
		try {
			await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				objectKey: req.params.projectId,
				query: req.query
			})

			const targetFolder = path.join(ctx.USERS_PROJECTS, req.params.projectId)

			// DROP DATABASE
			try {
				ctx.dbsConnection[req.params.projectId].dropDatabase()
				delete ctx.dbsConnection[req.params.projectId]
				delete ctx.dbs[req.params.projectId]
			} catch (err) {
				return err
			}

			// REMOVE PROJECT FOLDER
			try {
				await rmdir(targetFolder)	
			} catch (err) {
				return err
			}

			return `${req.params.projectId} successfully deleted`
		} catch (err) {
			throw err
		}
	}
}