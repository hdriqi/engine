module.exports = {
	async find(ctx, req) {
		if(ctx.dbs[req.params.projectId] && ctx.dbs[req.params.projectId].models[req.params.schemaId]){
			try {
				return await ctx.utils.db.find(ctx, req)
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

	async findOne(ctx, req) {
		if(ctx.dbs[req.params.projectId] && ctx.dbs[req.params.projectId].models[req.params.schemaId]){
			try {
				return await ctx.utils.db.findOne(ctx, req)
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

	async insert(ctx, req) {
		if(ctx.dbs[req.params.projectId] && ctx.dbs[req.params.projectId].models[req.params.schemaId]){
			try {
				return await ctx.utils.db.insert(ctx, req)
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

	async update(ctx, req) {
		if(ctx.dbs[req.params.projectId] && ctx.dbs[req.params.projectId].models[req.params.schemaId]){
			try {
				return await ctx.utils.db.update(ctx, req)
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

	async delete(ctx, req) {
		if(ctx.dbs[req.params.projectId] && ctx.dbs[req.params.projectId].models[req.params.schemaId]){
			try {
				return await ctx.utils.db.delete(ctx, req)
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