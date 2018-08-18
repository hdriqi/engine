import assert from 'assert'
import util from 'util'

module.exports = {
	// Generate initial role for schema users and roles
	init(ctx) {
		return new Promise(async (resolve, reject)=>{
			try {
				let newRole = await ctx.models['Roles'].model.insertMany([
					{
						name: 'admin',
						endpoint: 'users',
						read: true,
						write: true  
					},
					{
						name: 'admin',
						endpoint: 'roles',
						read: true,
						write: true
					},
					{
						name: 'admin',
						endpoint: 'schemas',
						read: true,
						write: true
					},
					{
						name: 'authenticated',
						endpoint: 'users',
						read: true,
						write: true  
					},
					{
						name: 'authenticated',
						endpoint: 'roles',
						read: false,
						write: false
					},
					{
						name: 'authenticated',
						endpoint: 'schemas',
						read: false,
						write: false
					},
					{
						name: 'guest',
						endpoint: 'users',
						read: true,
						write: true  
					},
					{
						name: 'guest',
						endpoint: 'roles',
						read: false,
						write: false
					},
					{
						name: 'guest',
						endpoint: 'schemas',
						read: false,
						write: false
					},
				])
				resolve(newRole)
			} catch (err) {
				reject(err)
			}
		})
	},
	// Add new role
	add(ctx, newRole, newDoc) {
		return new Promise(async (resolve, reject)=>{
			if(!newDoc){
				let schemaList = Object.keys(ctx.models)

				try {
					let newRoles = await ctx.models['Roles'].model.insertMany(schemaList.map((schemaName)=>{
						return {
							name: newRole.toLowerCase(),
							endpoint: schemaName.toLowerCase(),
							write: false,
							read: true
						} 
					}))
					resolve(newRoles)
				} catch (err) {
					reject(err)
				}
			}
			else{
				assert(util.isArray(newDoc))
				try {
					let newRoles = await ctx.models['Roles'].model.insertMany(newDoc)
					resolve(newRoles)
				} catch (err) {
					reject(err)
				}
			}
		})
	},
	// Delete a role
	remove(ctx, roleName) {
		return new Promise((resolve, reject)=>{
			ctx.models['Roles'].model.deleteMany({'name': roleName})
				.then(()=>{
					resolve(`${roleName} successfully deleted`)
				})
				.catch((err)=>{
					reject(err)
				})
		})
	},
	// Update a role
	modify(ctx, roleName, newDoc) {
		let self = this
		return new Promise(async (resolve, reject)=>{
			try {
				await self.delete(ctx, roleName) 
				await self.add(ctx, roleName, newDoc)
				resolve(`${roleName} successfully updated`)
			} catch (err) {
				reject(err)
			}
		})
	},
	// Add role when generate schema
	addSchema(ctx, newSchema) {
		return new Promise((resolve, reject)=>{
			ctx.models['Roles'].model.find()
				.distinct('name')
				.then(async (roleList)=>{
					try {
						let newRoles = await ctx.models['Roles'].model.insertMany(roleList.map((roleName)=>{
							return {
								name: roleName.toLowerCase(),
								endpoint: newSchema.toLowerCase(),
								write: true,
								read: true
							}
						}))
						return resolve(newRoles)
					} catch (err) {
						return reject(err)
					}
				})
				.catch((err)=>{
					reject(err)
				})
		})
	},

	// Remove role when remove schema
	removeSchema(ctx, schemaName) {
		return new Promise((resolve, reject)=>{
			ctx.models['Roles'].model.deleteMany({'endpoint': schemaName})
				.then(()=>{
					resolve(`${schemaName} successfully deleted`)
				})
				.catch((err)=>{
					reject(err)
				})
		})
	}
}