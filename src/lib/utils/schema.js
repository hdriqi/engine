import fs from 'fs'
import glob from 'glob'
import path from 'path'
import beautify from 'js-beautify'

// import Role from '../role'
import templateSchema from '../../template/schema'

const rmdir = function(dir) {
	var list = fs.readdirSync(dir)
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i])
		var stat = fs.statSync(filename)
		
		if(filename == '.' || filename == '..') {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename)
		} else {
			// rm fiilename
			fs.unlinkSync(filename)
		}
	}
	fs.rmdirSync(dir)
}

const schemaCheck = (ctx, projectId, schemaObj) => {
	const targetFolder = path.join(ctx.USERS_PROJECTS, projectId.toLowerCase(), 'api', schemaObj.name.toLowerCase())
	const targetFile = path.join(targetFolder, 'schema.json')
	return fs.existsSync(targetFile) ? {
		exist: true,
		targetFolder: targetFolder,
		targetFile: targetFile
	} : {
		exist: false,
		targetFolder: targetFolder,
		targetFile: targetFile
	}
}

module.exports = {
	// NEW SCHEMA
	/**
	 * @param  {Engine} ctx
	 * @param  {Object} schemaObj
	 */
	add(ctx, projectId, schemaObj) {
		const self = this
		return new Promise(async (resolve, reject)=>{
			const schemaResult = schemaCheck(ctx, projectId, schemaObj)
			if(!schemaResult.exist){
				// UPDATE CURRENT ROLE WITH NEW SCHEMA
				// await ctx.services.role.addSchema(ctx, schemaObj.name)

				// GENERATE FOLDER
				fs.mkdirSync(schemaResult.targetFolder)
				fs.writeFileSync(schemaResult.targetFile, beautify(templateSchema(schemaObj), { indent_size: 2, indent_with_tabs: true }))

				// UPDATE DBS
				try {
					await self.update(ctx, projectId)
				} catch (err) {
					return reject(err)
				}

				console.log(`${schemaObj.name} successfully created`)

				return resolve(`${schemaObj.name} successfully created`)
			}
			else{
				console.log('schema exist')
				return reject('schema already exist')
			}
		})
	},
	// MODIFY SCHEMA
	/**
	 * @param  {Engine} ctx
	 * @param  {Object} schemaObj
	 */
	modify(ctx, projectId, schemaObj) {
		const self = this
		return new Promise(async (resolve, reject) => {
			const schemaResult = schemaCheck(ctx, projectId, schemaObj)
			if(!schemaResult.exist){
				// REPLACE SCHEMA FILE
				fs.writeFileSync(schemaResult.targetFile, beautify(templateSchema(schemaObj), { indent_size: 2, indent_with_tabs: true }))

				// UPDATE DBS
				try {
					await self.update(ctx, projectId)	
				} catch (err) {
					return reject(err)
				}

				console.log(`${schemaObj.name} successfully updated`)

				return resolve(`${schemaObj.name} successfully updated`)
			}
			else{       
				console.log('schema not exist')
				return reject('schema not exist')
			}
		})
	},
	// REMOVE SCHEMA
	/**
	 * @param  {Engine} ctx
	 * @param  {Object} schemaObj
	 */
	delete(ctx, projectId, schemaObj) {
		const self = this
		return new Promise(async (resolve, reject)=>{
			const schemaResult = schemaCheck(ctx, projectId, schemaObj)
			if(schemaResult.exist){
				// UPDATE CURRENT ROLE WITH NEW SCHEMA
				// try {
				// 	await ctx.services.role.removeSchema(ctx, schemaObj.name)
				// } catch (err) {
				// 	return reject({
				// 		code: 400,
				// 		data: err
				// 	})
				// }
				
				// DROP SCHEMA
				try {
					await ctx.dbsConnection[projectId].dropCollection(schemaObj.name.toLowerCase())	
				} catch (err) {
					if(err.codeName !== 'NamespaceNotFound'){
						return reject(err)
					}
				}

				// REMOVE FOLDER
				try {
					await rmdir(schemaResult.targetFolder)	
				} catch (err) {
					return reject(err)
				}

				// UPDATE DBS
				try {
					await self.update(ctx, projectId)	
				} catch (err) {
					return reject(err)
				}

				console.log(`${schemaObj.name} successfully deleted`)

				return resolve(`${schemaObj.name} successfully deleted`)
			}
			else{       
				console.log('schema not exist')
				return reject('schema not exist')
			}
		})
	},
	/**
	 * 
	 * @param {string} projectId 
	 */
	get(ctx, projectId) {
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[projectId] && ctx.dbs[projectId].schemas){
				return resolve(ctx.dbs[projectId].schemas)
			}
			let schemas = glob.sync(path.join(ctx.USERS_PROJECTS, projectId, 'api', '*', 'schema.json')).map((schemaPath)=>{
				try{
					let data = JSON.parse(fs.readFileSync(schemaPath))
					return data
				} catch (err){
					return false
				}
			})
			if(schemas){
				resolve(schemas)
			}
			else{
				reject('no schema found')
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} projectId 
	 */
	update(ctx, projectId) {
		const self = this
		ctx.dbsConnection[projectId].models = {}
		return new Promise(async (resolve, reject) => {
			try {
				const rawSchemas = await self.get(ctx, projectId)
				Object.assign(ctx.dbs, {[projectId]: {}})
				if(rawSchemas.length > 0){
					await Promise.all(rawSchemas.map(async (rawSchema) => {
						try {
							const models = await ctx.utils.db.buildModel(ctx, projectId, rawSchema)
							if(!ctx.dbs[projectId].models){
								ctx.dbs[projectId].models = {}
							}
							if(!ctx.dbs[projectId].schemas){
								ctx.dbs[projectId].schemas = {}
							}
							Object.assign(ctx.dbs[projectId].models, {[rawSchema.info.name]: models})
							Object.assign(ctx.dbs[projectId].schemas, {[rawSchema.info.name]: rawSchema})
						} catch (err) {
							reject(err)
						}
					}))
				}
				return resolve(`${projectId} schemas successfully cached`)
			} catch (err) {
				return reject(err)
			}
		})
	}
}