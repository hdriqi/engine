import fs from 'fs'
import glob from 'glob'
import path from 'path'
import beautify from 'js-beautify'
import nedb from 'nedb'

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
	const targetFolder = path.join(ctx.USERS_PROJECTS, projectId, 'api', schemaObj.name)
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
					const response = await self.update(ctx, projectId)
					console.log(`${schemaObj.name} successfully created`)
					return resolve(response)
				} catch (err) {
					return reject(err)
				}
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
			if(schemaResult.exist){
				// REPLACE SCHEMA FILE
				fs.writeFileSync(schemaResult.targetFile, beautify(templateSchema(schemaObj), { indent_size: 2, indent_with_tabs: true }))
				if(schemaObj.newName && schemaObj.name !== schemaObj.newName) {
					fs.renameSync(schemaResult.targetFolder, path.join(ctx.USERS_PROJECTS, projectId, 'api', schemaObj.newName))
				}

				// UPDATE DBS
				try {
					const response = await self.update(ctx, projectId)
					console.log(`${schemaObj.name} successfully modified`)
					return resolve(response)
				} catch (err) {
					return reject(err)
				}
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
					await ctx.dbsConnection[projectId].dropCollection(schemaObj.name)	
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
					const response = await self.update(ctx, projectId)
					console.log(`${schemaObj.name} successfully deleted`)
					return resolve(response)
				} catch (err) {
					return reject(err)
				}
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
				console.log('read schemas from cache')
				return resolve(ctx.dbs[projectId].schemas)
			}
			console.log('read schemas from file')
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

	getOne(ctx, projectId, schemaId) {
		return JSON.parse(fs.readFileSync(path.join(ctx.USERS_PROJECTS, projectId, 'api', schemaId, 'schema.json')))
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} projectId 
	 */
	update(ctx, projectId) {
		const self = this
		return new Promise(async (resolve, reject) => {
			try {
				ctx.dbsConnection[projectId].models = {}
				Object.assign(ctx.dbs, {[projectId]: {}})
				const rawSchemas = await self.get(ctx, projectId)
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
							Object.assign(ctx.dbs[projectId].cache, {[rawSchema.info.name]: new nedb()})
						} catch (err) {
							reject(err)
						}
					}))
				}
				console.log(`${projectId} schemas successfully cached`)
				return resolve(ctx.dbs[projectId].schemas)
			} catch (err) {
				return reject(err)
			}
		})
	},
	
	async updateOne(ctx, projectId, schemaId) {
		try {
			const rawSchema = this.getOne(ctx, projectId, schemaId)
			const models = await ctx.utils.db.buildModel(ctx, projectId, rawSchema)
			if(!ctx.dbs[projectId].models){
				ctx.dbs[projectId].models = {}
			}
			if(!ctx.dbs[projectId].schemas){
				ctx.dbs[projectId].schemas = {}
			}
			Object.assign(ctx.dbs[projectId].models, {[rawSchema.info.name]: models})
			Object.assign(ctx.dbs[projectId].schemas, {[rawSchema.info.name]: rawSchema})
			return true
		} catch (err) {
			return err
		}
	}
}