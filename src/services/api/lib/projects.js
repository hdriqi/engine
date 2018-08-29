import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator()

module.exports = {
	async add(ctx, req) {
		try {
			req.body.apiKey = await uidgen.generate()
			const result = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				body: req.body,
				query: req.query
			})

			Object.assign(ctx.dbsConnection, {[result.name]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result.name)})

			return `${result.name} successfully created`
		} catch (err) {
			throw err
		}
	},

	async delete(ctx, req) {
		try {
			await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				objectKey: req.params.projectId,
				query: req.query
			})

			// DROP DATABASE
			try {
				ctx.dbsConnection[req.params.projectId].dropDatabase()
				delete ctx.dbsConnection[req.params.projectId]
				delete ctx.dbs[req.params.projectId]
			} catch (err) {
				return err
			}

			return `${req.params.projectId} successfully deleted`
		} catch (err) {
			throw err
		}
	}
}