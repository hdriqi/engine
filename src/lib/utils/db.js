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
	 * @param {*} ctx 
	 * @param {*} params 
	 * @param {*} params.schemaId 
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
					resolve({
						code: 200,
						data: result
					})
				})
				.catch((err)=>{
					console.log(err)
					reject({
						code: 400,
						data: {
							name: err.name,
							message: err.message
						}
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} params 
	 * @param {*} params.schemaId 
	 */
	findOne(ctx, params) {
		return new Promise((resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			let filters = ctx.filtersBuilder(ctx, params)
			ctx.dbs[params.projectId].models[params.schemaId].findOne({[id]: params.objectId})
				.where(filters.where)
				.sort(filters.sort)
				.then((result)=>{
					resolve({
						code: 200,
						data: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						data: {
							name: err.name,
							message: err.message
						}
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} params 
	 * @param {*} params.schemaId 
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
					resolve({
						code: 201,
						data: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						data: {
							name: err.name,
							message: err.message
						}
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} params 
	 * @param {*} params.schemaId 
	 */
	update(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			ctx.dbs[params.projectId].models[params.schemaId].findOneAndUpdate({[id]: params.objectId}, { $set: params.body }, { rawResult: true })
				.then((result)=>{
					resolve({
						code: 200,
						data: result.value
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						data: {
							name: err.name,
							message: err.message
						}
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} params 
	 * @param {*} params.schemaId 
	 */
	delete(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			const id = ctx.dbs[params.projectId].schemas[params.schemaId].info.id
			ctx.dbs[params.projectId].models[params.schemaId].deleteOne({[id]: params.objectId})
				.then((result)=>{
					resolve({
						code: 200,
						data: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						data: {
							name: err.name,
							message: err.message
						}
					})
				})
		})
	}
}