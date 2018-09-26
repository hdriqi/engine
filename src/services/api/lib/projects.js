import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(null, 23)

module.exports = {
	async add(ctx, req) {
		try {
			const readApiKey = await uidgen.generate()
			const writeApiKey = await uidgen.generate()
			const result = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				body: {
					name: req.body.name,
					owner: req.current._id,
					readApiKey: readApiKey,
					writeApiKey: writeApiKey
				},
				query: req.query
			})

			Object.assign(ctx.dbsConnection, {[result.name]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result.name)})

			return result
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