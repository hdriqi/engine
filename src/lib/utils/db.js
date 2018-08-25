import mongoose from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import mongooseHidden from 'mongoose-hidden'
import uniqueValidator from 'mongoose-unique-validator'

module.exports = {
	/**
	 * 
	 */
	coreConnection(ctx) {
		return mongoose.createConnection(`mongodb://127.0.0.1:27017/${ctx.CORE_DB}`, {
			useNewUrlParser: true
		})
	},

	/**
	 * 
	 * @param {mongoose connection} coreDb 
	 * @param {string} userprojectId 
	 */
	sideConnection(coreDb, userprojectId) {
		return coreDb.useDb(userprojectId)
	},
	
	/**
	 * 
	 * @param {*} ctx 
	 * @param {string} projectId
	 * @param {object} rawSchema 
	 */
	buildModel(ctx, projectId, rawSchema) {
		let schema = new mongoose.Schema(rawSchema.attributes, rawSchema.options)
		schema.plugin(uniqueValidator)
		schema.plugin(autopopulate)
		schema.plugin(mongooseHidden({ defaultHidden: { password: true } }))

		return ctx.dbsConnection[projectId].model(rawSchema.info.name, schema)
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId} params 
	 */
	find(ctx, params) {
		console.log('find', params)
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
				const filters = ctx.filtersBuilder(ctx, params)
				ctx.dbs[params.projectId].models[params.schemaId].find()
					.where(filters.where)
					.sort(filters.sort)
					.skip(filters.skip)
					.limit(filters.limit)
					.then((result)=>{
						return resolve(result)
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectKey} params 
	 */
	findOne(ctx, params) {
		console.log('findOne', params)
		return new Promise((resolve, reject)=>{
			console.log(ctx.dbs)
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey){
				console.log(`findOne -> ${params.projectId} ${params.schemaId} ${params.objectKey}`)
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].info.key
				let filters = ctx.filtersBuilder(ctx, params)
				ctx.dbs[params.projectId].models[params.schemaId].findOne({[key]: params.objectKey})
					.where(filters.where)
					.sort(filters.sort)
					.then((result)=>{
						return resolve(result)
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, body} params 
	 */
	insert(ctx, params) {
		console.log('insert', params)
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.body){
				let attributes = {}
				Object.keys(ctx.dbs[params.projectId].schemas[params.schemaId].attributes).forEach((key)=>{
					Object.assign(attributes, {[key]: params.body[key]})
				})
				let newDoc = new ctx.dbs[params.projectId].models[params.schemaId](attributes)
				newDoc.save()
					.then((result)=>{
						return resolve(result)
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectKey, body} params 
	 */
	modify(ctx, params) {
		console.log('update', params)
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey && params.body){
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].info.key
				ctx.dbs[params.projectId].models[params.schemaId].findOneAndUpdate({[key]: params.objectKey}, { $set: params.body }, { rawResult: true })
					.then((result)=>{
						return resolve(result)
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectKey} params 
	 */
	delete(ctx, params) {
		console.log('delete', params)
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey){
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].info.key
				ctx.dbs[params.projectId].models[params.schemaId].deleteMany({[key]: params.objectKey})
					.then((result)=>{
						if(result.n > 0) return resolve(result)
						return reject('Bad Request - object not found')
					})
					.catch((err)=>{
						console.log(err)
						return reject(err.message)
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	}
}