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
					writeApiKey: writeApiKey,
					environment: 'dev',
					cors: []
				},
				query: req.query
			})

			Object.assign(ctx.dbsConnection, {[result._id.toString()]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result._id.toString())})
			try {
				await ctx.utils.schema.update(ctx, result._id)
				return result
			} catch (err) {
				console.log(err)
			}
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