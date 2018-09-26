import nedb from 'nedb'
import analyticsSchema from '../models/analytics.json'
import bandwidthsSchema from '../models/bandwidths.json'

import validator from 'validator'

// import Role from '../role'

const mySchema = 'schemas'

module.exports = {
	// NEW SCHEMA
	/**
	 * @param  {Engine} ctx
	 * @param  {Object} schemaObj
	 */
	add(ctx, projectId, schemaObj) {
		const self = this
		const objectKey = `${projectId}_${schemaObj.name}`
		return new Promise(async (resolve, reject)=>{
			// UPDATE CURRENT ROLE WITH NEW SCHEMA
			// await ctx.services.role.addSchema(ctx, schemaObj.name)
			
			// GENERATE FOLDER
			try {
				await ctx.utils.db.insert(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: mySchema,
					body: {
						name: objectKey,
						displayName: schemaObj.name,
						desc: schemaObj.desc,
						project: projectId,
						options: JSON.stringify({
							timestamps: true
						})
					}
				})	
			} catch (err) {
				return reject(err)
			}

			// UPDATE DBS
			try {
				const response = await self.update(ctx, projectId)
				console.log(`${objectKey} successfully created`)
				return resolve(response)
			} catch (err) {
				return reject(err)
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
		const objectKey = `${projectId}_${schemaObj.name}`
		
		let myBody = {
			desc: schemaObj.desc,
			attributes: schemaObj.attributes
		}

		if(!schemaObj.attributes || validator.isEmpty(schemaObj.attributes + '')) {
			delete myBody.attributes
		}

		if(!schemaObj.desc || validator.isEmail(schemaObj.desc + '')) {
			delete myBody.desc
		}

		return new Promise(async (resolve, reject) => {
			try {
				await ctx.utils.db.modify(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'schemas',
					objectKey: objectKey,
					body: myBody
				})
			} catch (err) {
				return reject(err)
			}
			
			// UPDATE DBS
			try {
				const newSchema = Object.keys(JSON.parse(myBody.attributes))
				const oldSchema = Object.keys(ctx.dbs[projectId].schemas[objectKey].attributes)
				const difference = oldSchema.filter(x => !newSchema.includes(x))
				if(difference[0]) {
					ctx.dbs[projectId].models[objectKey].update({}, 
						{ $unset: { [difference[0]]: true } },
						{ multi: true, safe: true }
					)
						.then(()=>{
							console.log('success delete column')
						})
						.catch((err)=>{
							console.log('column delete error')
							console.log(err)
						})
				}
				const response = await self.update(ctx, projectId)
				console.log(`${objectKey} successfully modified`)
				return resolve(response)
			} catch (err) {
				console.log(err)
				return reject(err)
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
		const objectKey = `${projectId}_${schemaObj.name}`
		return new Promise(async (resolve, reject)=>{
			// UPDATE CURRENT ROLE WITH NEW SCHEMA
			// try {
			// 	await ctx.services.role.removeSchema(ctx, schemaObj.name)
			// } catch (err) {
			// 	return reject({
			// 		code: 400,
			// 		data: err
			// 	})
			// }
			
			try {
				await ctx.utils.db.delete(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'schemas',
					objectKey: objectKey
				})	
			} catch (err) {
				return reject(err)
			}

			// DROP SCHEMA
			try {
				await ctx.dbsConnection[projectId].dropCollection(objectKey)
			} catch (err) {
				if(err.codeName !== 'NamespaceNotFound'){
					return reject(err)
				}
			}

			// UPDATE DBS
			try {
				const response = await self.update(ctx, projectId)
				console.log(`${objectKey} successfully deleted`)
				return resolve(response)
			} catch (err) {
				return reject(err)
			}
		})
	},
	/**
	 * 
	 * @param {string} projectId 
	 */
	get(ctx, projectId) {
		return new Promise(async (resolve, reject)=>{
			if(ctx.dbs[projectId] && ctx.dbs[projectId].schemas){
				console.log(`read ${projectId} schemas from cache`)
				return resolve(ctx.dbs[projectId].schemas)
			}
			console.log(`read ${projectId} schemas from file`)
			try {
				const schemas = await ctx.utils.db.find(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'schemas',
					query: {
						project: projectId
					}
				})
				resolve(schemas)
			} catch (err) {
				reject(err)
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
		return new Promise(async (resolve, reject) => {
			try {
				ctx.dbsConnection[projectId].models = {}
				Object.assign(ctx.dbs, {[projectId]: {}})
				let rawSchemas
				try {
					rawSchemas = await self.get(ctx, projectId)
					if(!ctx.dbs[projectId].models) {
						Object.assign(ctx.dbs[projectId], {models : {}})
					}
					if(!ctx.dbs[projectId].schemas) {
						Object.assign(ctx.dbs[projectId], {schemas : {}})
					}
					if(!ctx.dbs[projectId].cache) {
						Object.assign(ctx.dbs[projectId], {cache : {}})
					}
				} catch (err) {
					return reject(err)
				}
				const analyticsModel = await ctx.utils.db.buildModel(ctx, projectId, analyticsSchema)
				Object.assign(ctx.dbs[projectId].models, {[analyticsSchema.name]: analyticsModel})
				Object.assign(ctx.dbs[projectId].schemas, {[analyticsSchema.name]: analyticsSchema})
				Object.assign(ctx.dbs[projectId].cache, {[analyticsSchema.name]: {single: new nedb(), query: new nedb()}})
				const bandwidthsModel = await ctx.utils.db.buildModel(ctx, projectId, bandwidthsSchema)
				Object.assign(ctx.dbs[projectId].models, {[bandwidthsSchema.name]: bandwidthsModel})
				Object.assign(ctx.dbs[projectId].schemas, {[bandwidthsSchema.name]: bandwidthsSchema})
				Object.assign(ctx.dbs[projectId].cache, {[bandwidthsSchema.name]: {single: new nedb(), query: new nedb()}})
				if(rawSchemas.length > 0){
					await Promise.all(rawSchemas.map((rawSchema) => {
						const parsedSchema = {
							_id: rawSchema._id,
							name: rawSchema.name,
							displayName: rawSchema.displayName,
							key: rawSchema.key, 
							desc: rawSchema.desc ,
							attributes: validator.isJSON(rawSchema.attributes + '') ? JSON.parse(rawSchema.attributes) : {},
							options: JSON.parse(rawSchema.options)
						}
						
						return new Promise(async (resolve, reject) => {
							try {
								const models = await ctx.utils.db.buildModel(ctx, projectId, parsedSchema)
								Object.assign(ctx.dbs[projectId].models, {[parsedSchema.name]: models})
								Object.assign(ctx.dbs[projectId].schemas, {[parsedSchema.name]: parsedSchema})
								Object.assign(ctx.dbs[projectId].cache, {[parsedSchema.name]: {single: new nedb(), query: new nedb()}})
								resolve()
							} catch (err) {
								reject(err)
							}
						})
					}))
					console.log(`${projectId} schemas successfully cached (n=${Object.keys(ctx.dbs[projectId].models).length})`)
					return resolve(ctx.dbs[projectId].schemas)
				}
				else{
					return resolve([])
				}
			} catch (err) {
				return reject(err)
			}
		})
	}
}