import path from 'path'
import fs from 'fs'
import glob from 'glob'
import mongoose from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import mongooseHidden from 'mongoose-hidden'
import uniqueValidator from 'mongoose-unique-validator'

module.exports = {
	models(ctx, dbName) {
		mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`, {
			useNewUrlParser: true
		})

		let moduleSchemas = glob.sync(path.join(ctx.ENGINE_PATH, '/module/*/schema.json'))
		let publicSchemas = glob.sync(path.join(ctx.CWD, '/api/*/schema.json'))
		const schemas = moduleSchemas.concat(publicSchemas).map((schemaPath)=>{
			try{
				let data = JSON.parse(fs.readFileSync(schemaPath))
				let schema = new mongoose.Schema(data.attributes, data.options)
				
				schema.plugin(uniqueValidator)
				schema.plugin(autopopulate)
				schema.plugin(mongooseHidden({ defaultHidden: { password: true } }))
				return {
					[data.info.name]: {
						model: mongoose.model(data.info.name, schema),
						info: data.info,
						attributes: data.attributes
					}
				}
			} catch (err){
				console.log(err)
				return false
			}
		})

		return Object.assign({}, ...schemas)
	},

	handlers(ctx) {
		let handlers = glob.sync(path.join(ctx.CWD, '/api/*/handlers.js')).map((f)=>{
			let pathSplit = f.split(path.sep)
			let handlerName = pathSplit[pathSplit.length - 2]

			return {
				[handlerName]: require(path.resolve(f))
			}
		})
		return Object.assign({}, ...handlers)
	}
}