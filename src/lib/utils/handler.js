module.exports = {
	async find(ctx, params) {
		if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
			try {
				return await ctx.utils.db.find(ctx, params)
			} catch (err) {
				return err
			}
		}
		else{
			return {
				code: 400,
				responds: `not found`
			}
		}
	},

	async findOne(ctx, params) {
		if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
			try {
				return await ctx.utils.db.findOne(ctx, params)
			} catch (err) {
				return err
			}
		}
		else{
			return {
				code: 400,
				responds: `not found`
			}
		}
	},

	async insert(ctx, params) {
		if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
			try {
				return await ctx.utils.db.insert(ctx, params)
			} catch (err) {
				// console.log(err)
				throw new Error(JSON.stringify(err))
			}
		}
		else{
			return {
				code: 400,
				responds: `not found`
			}
		}
	},

	async update(ctx, params) {
		if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
			try {
				return await ctx.utils.db.update(ctx, params)
			} catch (err) {
				return err
			}
		}
		else{
			return {
				code: 400,
				responds: `not found`
			}
		}
	},

	async delete(ctx, params) {
		if(ctx.dbs[params.projectId] && ctx.dbs[params.projectId].models[params.schemaId]){
			try {
				return await ctx.utils.db.delete(ctx, params)
			} catch (err) {
				return err
			}
		}
		else{
			return {
				code: 400,
				responds: `not found`
			}
		}
	}
}