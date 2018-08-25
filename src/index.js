import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'
import subdomain from 'express-subdomain'
import morgan from 'morgan'

import nedb from 'nedb'

import auth from './services/auth'
import api from './services/api'

import utils from './lib/utils'
import schemas from './lib/models'
import filtersBuilder from './lib/filtersBuilder'

class Engine {
	constructor (opts) {
		this.PORT = opts.PORT
		this.CORE_DB = 'engine-core'
		this.app = express()
		this.RESERVED_WORDS = ['schemas', 'medias']
		this.USERS_PROJECTS = path.join(__dirname, '..', '..', 'users-projects')
		this.ENGINE_PATH = __dirname
		this.utils = utils
		this.filtersBuilder = filtersBuilder
		this.dbs = {}
		this.dbsConnection = {}
		this.cache = {
			users: new nedb()
		}
	}

	async start () {
		this.app.use(morgan('tiny'))
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: false }))

		// Create connection to engine-core
		Object.assign(this.dbsConnection, {[this.CORE_DB]: this.utils.db.coreConnection(this)})
		Object.assign(this.dbs, {[this.CORE_DB]: {}})
		// Cache core schemas (users and projects)
		await Promise.all(Object.keys(schemas).map(async (k) => {
			const rawSchema = schemas[k]
			const models = await this.utils.db.buildModel(this, this.CORE_DB, rawSchema)
			if(!this.dbs[this.CORE_DB].models){
				this.dbs[this.CORE_DB].models = {}
			}
			if(!this.dbs[this.CORE_DB].schemas){
				this.dbs[this.CORE_DB].schemas = {}
			}
			Object.assign(this.dbs[this.CORE_DB].models, {[rawSchema.info.name]: models})
			Object.assign(this.dbs[this.CORE_DB].schemas, {[rawSchema.info.name]: rawSchema})
		}))

		// Cache all users project
		// Read from engine-core -> projects
		const listOfProjects = await this.utils.db.find(this, {
			projectId: this.CORE_DB,
			schemaId: 'projects'
		})
		// Cache all users schemas
		// Read from schemas.json file
		await Promise.all(listOfProjects.map(async (project) => {
			Object.assign(this.dbsConnection, {[project.name]: this.utils.db.sideConnection(this.dbsConnection[this.CORE_DB], project.name)})
			await this.utils.schema.update(this, project.name)
		}))

		// Routes
		this.app.use(subdomain('auth', auth.router(this)))
		this.app.use(subdomain('api', api.router(this)))
		// this.app.use(media.router(this))

		this.app.use(function (req, res) {
			res.status(400).json({
				code: 400,
				responds: `Bad Request - Requested URL not found`
			})
		})

		return this.app.listen(this.PORT, () => console.log(`Engine start on port ${this.PORT}`))
	}
}

const engine = new Engine({
	CWD: __dirname,
	PORT: 8080
})

engine.start()