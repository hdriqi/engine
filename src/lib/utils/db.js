import mongoose from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import mongooseHidden from 'mongoose-hidden'
import uniqueValidator from 'mongoose-unique-validator'

module.exports = {
	/**
	 * 
	 */
	coreConnection() {
		return mongoose.createConnection(`mongodb://127.0.0.1:27017/engine-core`, {
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
	 * @param {*} req 
	 * @param {*} req.params.schemaId 
	 */
	find(ctx, req) {
		return new Promise((resolve, reject)=>{
			const filters = ctx.filtersBuilder(req.query)
			ctx.dbs[req.params.projectId].models[req.params.schemaId].find()
				.where(filters.where)
				.sort(filters.sort)
				.skip(filters.skip)
				.limit(filters.limit)
				.then((result)=>{
					resolve({
						code: 200,
						respond: result
					})
				})
				.catch((err)=>{
					console.log(err)
					reject({
						code: 400,
						respond: err
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 * @param {*} req.params.schemaId 
	 */
	findOne(ctx, req) {
		return new Promise((resolve, reject)=>{
			let filters = ctx.filtersBuilder(req.query)
			ctx.dbs[req.params.projectId].models[req.params.schemaId].findOne({_id: req.params.objectId})
				.where(filters.where)
				.sort(filters.sort)
				.then((result)=>{
					resolve({
						code: 200,
						respond: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						respond: err
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 * @param {*} req.params.schemaId 
	 */
	insert(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			let attributes = {}
			Object.keys(ctx.dbs[req.params.projectId].schemas[req.params.schemaId].attributes).forEach((key)=>{
				Object.assign(attributes, {[key]: req.body[key]})
			})
			let newDoc = new ctx.dbs[req.params.projectId].models[req.params.schemaId](attributes)
			newDoc.save()
				.then((result)=>{
					resolve({
						code: 201,
						respond: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						respond: err
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 * @param {*} req.params.schemaId 
	 */
	update(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			ctx.dbs[req.params.projectId].models[req.params.schemaId].update({_id: req.params.objectId}, { $set: req.body })
				.then((result)=>{
					resolve({
						code: 200,
						respond: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						respond: err
					})
				})
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {*} req 
	 * @param {*} req.params.schemaId 
	 */
	delete(ctx, req) {
		return new Promise(async (resolve, reject)=>{
			ctx.dbs[req.params.projectId].models[req.params.schemaId].deleteOne({_id: req.params.objectId})
				.then((result)=>{
					resolve({
						code: 200,
						respond: result
					})
				})
				.catch((err)=>{
					reject({
						code: 400,
						respond: err
					})
				})
		})
	}
}