import mongoose from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import mongooseHidden from 'mongoose-hidden'
import uniqueValidator from 'mongoose-unique-validator'

import nedb from 'nedb'

module.exports = {
	/**
	 * 
	 */
	coreConnection(ctx) {
		return mongoose.createConnection(`mongodb://127.0.0.1:27017/${ctx.CORE_DB}`, {
			useNewUrlParser: true,
			autoIndex: false
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
	async buildModel(ctx, projectId, rawSchema) {
		const options = { ...rawSchema.options }
		let schema = new mongoose.Schema(rawSchema.attributes, options)
		schema.set('autoIndex', false)
		schema.plugin(uniqueValidator)
		schema.plugin(autopopulate)
		if(projectId === ctx.CORE_DB){
			schema.plugin(mongooseHidden({ defaultHidden: { password: true } }))
		}

		const model = ctx.dbsConnection[projectId].model(rawSchema.name, schema)
		// await model.syncIndexes()
		try {
			await model.syncIndexes()
		} catch (err) {
			if(err.code !== 26) {
				return err
			}
		}

		return model
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId} params 
	 */
	find(ctx, params) {
		console.log('find -> ', Object.values(params).join(' | '))
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
				const filters = ctx.filters(params.query)
				ctx.dbs[params.projectId].cache[params.schemaId].query.findOne({key: filters.cacheKey})
					.sort(filters.config.sort)
					.skip(filters.config.skip)
					.limit(filters.config.limit)
					.exec((err, doc) => {
						if(!doc) {
							console.log('read from db')
							ctx.dbs[params.projectId].models[params.schemaId].find(filters.query)
								.sort(filters.config.sort)
								.skip(filters.config.skip)
								.limit(filters.config.limit)
								.then((result)=>{
									ctx.dbs[params.projectId].cache[params.schemaId].query.insert({
										key: filters.cacheKey,
										data: JSON.stringify(result)
									})
									return resolve(result)
								})
								.catch((err)=>{
									return reject(err.message)
								})
						}
						else{
							console.log('read from cache')
							return resolve(JSON.parse(doc.data))
						}
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

	findOneByQuery(ctx, params) {
		console.log('findOneByQuery -> ', JSON.stringify(params))
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
				const filters = ctx.filters(params.query)
				ctx.dbs[params.projectId].cache[params.schemaId].query.findOne({key: filters.cacheKey})
					.exec((err, doc) => {
						if(!doc) {
							console.log('read from db')
							filters.query['$and'].forEach((a) => (console.log(a)))
							ctx.dbs[params.projectId].models[params.schemaId].findOne(filters.query)
								.then((result)=>{
									if(result){
										ctx.dbs[params.projectId].cache[params.schemaId].query.insert({
											key: filters.cacheKey,
											data: JSON.stringify(result)
										})
										return resolve(result)
									}
									else{
										return resolve(null)
									}
								})
								.catch((err)=>{
									return reject(err.message)
								})
						}
						else{
							console.log('read from cache')
							return resolve(JSON.parse(doc.data))
						}
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
		console.log('findOne -> ', Object.values(params).join(' | '))
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey){
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].key
				ctx.dbs[params.projectId].cache[params.schemaId].single.findOne({[key]: params.objectKey})
					.exec((err, doc) => {
						if(!doc) {
							console.log('read from db')
							ctx.dbs[params.projectId].models[params.schemaId].findOne({[key]: params.objectKey})
								.then((result)=>{
									if(result){
										ctx.dbs[params.projectId].cache[params.schemaId].single.insert(JSON.parse(JSON.stringify(result)))
										return resolve(result)
									}
									else{
										return resolve(null)
									}
								})
								.catch((err)=>{
									return reject(err.message)
								})
						}
						else{
							console.log('read from cache')
							return resolve(doc)
						}
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, body} params 
	 */
	insert(ctx, params) {
		console.log(params)
		console.log('insert -> ', params.projectId, params.schemaId)
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.body){
				let attributes = {}
				Object.keys(ctx.dbs[params.projectId].schemas[params.schemaId].attributes).forEach((key)=>{
					Object.assign(attributes, {[key]: params.body[key]})
				})
				let newDoc = new ctx.dbs[params.projectId].models[params.schemaId](attributes)
				newDoc.save()
					.then((result)=>{
						if(result){
							ctx.dbs[params.projectId].cache[params.schemaId].query = new nedb()
							return resolve(result.toObject())
						}
						else{
							return reject('object_not_found')
						}
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectKey, body} params 
	 */
	modify(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey && params.body){
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].key
				ctx.dbs[params.projectId].models[params.schemaId].findOneAndUpdate({[key]: params.objectKey}, { $set: params.body }, { new: true, rawResult: true })
					.then((result)=>{
						if(result){
							ctx.dbs[params.projectId].cache[params.schemaId].query = new nedb()
							ctx.dbs[params.projectId].cache[params.schemaId].single.remove({[key]: params.objectKey})
							return resolve(result.value)
						}
						else{
							return reject('object_not_found')
						}
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

		/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, query, body} params 
	 */
	modifyByQuery(ctx, params) {
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey && params.body){
				const filters = ctx.filters(params.query)
				console.log(filters)
				ctx.dbs[params.projectId].models[params.schemaId].findOneAndUpdate(filters.query, { $set: params.body }, { new: true, rawResult: true })
					.then((result)=>{
						if(result){
							ctx.dbs[params.projectId].cache[params.schemaId].query = new nedb()
							ctx.dbs[params.projectId].cache[params.schemaId].single.remove({[key]: params.objectKey})
							return resolve(result.value)
						}
						else{
							return reject('object_not_found')
						}
					})
					.catch((err)=>{
						return reject(err.message)
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

	/**
	 * 
	 * @param {ctx} ctx 
	 * @param {projectId, schemaId, objectKey} params 
	 */
	delete(ctx, params) {
		console.log(params)
		// console.log('delete -> ', Object.values(params).join(' | '))
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId] && params.objectKey){
				const key = ctx.dbs[params.projectId].schemas[params.schemaId].key
				ctx.dbs[params.projectId].models[params.schemaId].deleteMany({[key]: params.objectKey})
					.then((result)=>{
						if(result.n > 0) {
							ctx.dbs[params.projectId].cache[params.schemaId].query = new nedb()
							ctx.dbs[params.projectId].cache[params.schemaId].single.remove({[key]: params.objectKey})
							return resolve(result)
						}
						return reject('object_not_found')
					})
					.catch((err)=>{
						console.log(err)
						return reject(err.message)
					})
			}
			else{
				return reject('bad_request')
			}
		})
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {projectId, schemaId} params 
	 */
	count(ctx, params) {
		console.log('count -> ', params)
		params.query['__COUNT__'] = true
		return new Promise((resolve, reject)=>{
			if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
				const filters = ctx.filters(params.query)
				ctx.dbs[params.projectId].cache[params.schemaId].query.findOne({key: filters.cacheKey})
					.exec((err, doc) => {
						if(!doc) {
							console.log('read from db')
							ctx.dbs[params.projectId].models[params.schemaId].countDocuments(filters.query)
								.then((result)=>{
									ctx.dbs[params.projectId].cache[params.schemaId].query.insert({
										key: filters.cacheKey,
										data: JSON.stringify(result)
									})
									return resolve(result)
								})
								.catch((err)=>{
									return reject(err.message)
								})
						}
						else{
							console.log('read from cache')
							return resolve(JSON.parse(doc.data))
						}
					})
			}
			else{
				return reject('Bad Request')
			}
		})
	},	
}