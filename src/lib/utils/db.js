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
		return new Promise((resolve, reject)=>{
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
					return reject(err)
				})
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectId} params 
	 */
	findOne(ctx, params) {
		return new Promise((resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			let filters = ctx.filtersBuilder(ctx, params)
			ctx.dbs[params.projectId].models[params.schemaId].findOne({[id]: params.objectId})
				.where(filters.where)
				.sort(filters.sort)
				.then((result)=>{
					return resolve(result)
				})
				.catch((err)=>{
					return reject(err)
				})
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, body} params 
	 */
	insert(ctx, params) {
		return new Promise(async (resolve, reject)=>{
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
					return reject(err)
				})
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectId, body} params 
	 */
	update(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			ctx.dbs[params.projectId].models[params.schemaId].findOneAndUpdate({[id]: params.objectId}, { $set: params.body }, { rawResult: true })
				.then((result)=>{
					return resolve(result)
				})
				.catch((err)=>{
					return reject(err)
				})
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectId} params 
	 */
	delete(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			ctx.dbs[params.projectId].models[params.schemaId].deleteMany({[id]: params.objectId})
				.then((result)=>{
					return resolve(result)
				})
				.catch((err)=>{
					return reject(err)
				})
		})
	}
}