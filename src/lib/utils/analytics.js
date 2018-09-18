module.exports = {
	/**
	 * 
	 * @param {*} ctx 
	 * @param {projectId, schemaId, userAgent, method} params 
	 */
	async save (ctx, params) {
		try {
			const response = await ctx.utils.db.insert(ctx, {
				projectId: params.projectId,
				schemaId: 'CORE_ANALYTICS',
				body: {
					endpoint: params.schemaId,
					userAgent: params.userAgent,
					reqMethod: params.method
				}
			})
			return response
		} catch (err) {
			console.log(err)
			return err
		}
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {projectId} params 
	 */
	async get (ctx, params) {
		try {
			const response = await ctx.utils.db.count(ctx, {
				projectId: params.projectId,
				schemaId: 'CORE_ANALYTICS',
				query: params.query || {}
			})
			return response
		} catch (err) {
			console.log(err)
			return err
		}
	},

	/**
	 * 
	 * @param {*} ctx 
	 * @param {projectId} params 
	 */
	async getFull (ctx, params) {
		try {
			const response = await ctx.utils.db.find(ctx, {
				projectId: params.projectId,
				schemaId: 'CORE_ANALYTICS',
				query: params.query || {}
			})
			return response
		} catch (err) {
			console.log(err)
			return err
		}
	},
}