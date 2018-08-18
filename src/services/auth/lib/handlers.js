module.exports = {
	async find(ctx, req) {
		try {
			return await ctx.utils.db.find(ctx, req, 'Users')
		} catch (err) {
			return err
		}
	},

	async findOne(ctx, req) {
		try {
			return await ctx.utils.db.findOne(ctx, req, 'Users')
		} catch (err) {
			return err
		}
	},

	async register(ctx, req) {
		try {
			return await ctx.utils.auth.register(ctx, req)
		} catch (err) {
			return err
		}
	},

	async login(ctx, req) {
		try {
			return await ctx.utils.auth.login(ctx, req)
		} catch (err) {
			return err
		}
	},

	async current(ctx, req) {
		try {
			return await ctx.utils.auth.current(ctx, req)
		} catch (err) {
			return err
		}
	},

	async update(ctx, req) {
		try {
			return await ctx.utils.db.update(ctx, req, 'Users')
		} catch (err) {
			return err
		}
	},

	async delete(ctx, req) {
		try {
			return await ctx.utils.db.delete(ctx, req, 'Users')
		} catch (err) {
			return err
		}
	}
}