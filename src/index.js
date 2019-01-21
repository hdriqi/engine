import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'
import subdomain from 'express-subdomain'
import morgan from 'morgan'

import nedb from 'nedb'

import auth from './services/auth'
import api from './services/api'
import deploy from './services/deploy'

import utils from './lib/utils'
import schemas from './lib/models'
import filters from './lib/filters'

class Engine {
	constructor (opts) {
		this.PORT = opts.PORT
		this.CORE_DB = 'engine-core'
		this.app = express()
		this.RESERVED_WORDS = ['schemas', 'medias']
		this.SERPH_IP = ['http://128.199.64.13', 'http://128.199.117.43']
		this.USERS_PROJECTS = path.join(__dirname, '..', '..', 'users-projects')
		this.ENGINE_PATH = __dirname
		this.utils = utils
		this.filters = filters
		this.dbs = {}
		this.dbsConnection = {}
	}

	async start () {
		this.app.enable('trust proxy')
		this.app.use(morgan('tiny'))
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: false }))

		// Create connection to engine-core
		Object.assign(this.dbsConnection, {[this.CORE_DB]: this.utils.db.coreConnection(this)})
		Object.assign(this.dbs, {[this.CORE_DB]: {}})
		
		// Cache core schemas (users, projects and medias)
		await Promise.all(Object.keys(schemas).map(async (k) => {
			const rawSchema = schemas[k]
			const models = await this.utils.db.buildModel(this, this.CORE_DB, rawSchema)
			if(!this.dbs[this.CORE_DB].models){
				this.dbs[this.CORE_DB].models = {}
			}
			if(!this.dbs[this.CORE_DB].schemas){
				this.dbs[this.CORE_DB].schemas = {}
			}
			if(!this.dbs[this.CORE_DB].cache){
				this.dbs[this.CORE_DB].cache = {}
			}
			Object.assign(this.dbs[this.CORE_DB].models, {[rawSchema.name]: models})
			Object.assign(this.dbs[this.CORE_DB].schemas, {[rawSchema.name]: rawSchema})
			Object.assign(this.dbs[this.CORE_DB].cache, {[rawSchema.name]: {single: new nedb(), query: new nedb()}})
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
			Object.assign(this.dbsConnection, {[project._id.toString()]: this.utils.db.sideConnection(this.dbsConnection[this.CORE_DB], project._id.toString())})
			try {
				await this.utils.schema.update(this, project._id.toString())	
			} catch (err) {
				console.log(err)
			}
		}))

		this.app.use((req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*')
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
			res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
			next()
		})

		// Routes
		this.app.use(subdomain('auth', auth.router(this)))
		this.app.use(subdomain('api', api.router(this)))
		this.app.use(subdomain('*', deploy.router(this)))

		this.app.use(function (req, res) {
			res.status(400).json({
				code: 400,
				responds: `Bad Request - Requested URL not found`
			})
		})

		return this.app.listen(this.PORT, '0.0.0.0', () => console.log(`Engine start on port ${this.PORT}`))
	}
}

const engine = new Engine({
	CWD: __dirname,
	PORT: process.env.PORT
})

engine.start()