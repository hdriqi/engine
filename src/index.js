import path from 'path'
import fs from 'fs'

import express from 'express'
import bodyParser from 'body-parser'

import auth from './services/auth'
import api from './services/api'
import dev from './services/dev'

import utils from './lib/utils'
import models from './lib/models'
import filtersBuilder from './lib/filtersBuilder'

class Engine {
	constructor (opts) {
		this.PORT = opts.PORT
		this.app = express()
		this.USERS_PROJECTS = path.join(__dirname, '..', '..', 'users-projects')
		this.utils = utils
		this.filtersBuilder = filtersBuilder
		this.dbs = {}
		this.dbsConnection = {}
		this.schemas = []
	}

	async start () {
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: false }))

		// Create connection to engine-core
		Object.assign(this.dbsConnection, {'engine-core': this.utils.db.coreConnection()})
		Object.assign(this.dbs, {'engine-core': {}})
		// Cache core schemas (users and projects)
		Object.keys(models).forEach((k) => {
			Object.assign(this.dbs['engine-core'], this.utils.db.buildModel(this, 'engine-core', models[k]))
		})

		// Cache all users project
		// Read from engine-core -> projects
		const listOfProjects = fs.readdirSync(this.USERS_PROJECTS)
		// Cache all users schemas
		// Read from schemas.json file
		await Promise.all(listOfProjects.map(async (projectId) => {
			Object.assign(this.dbsConnection, {[projectId]: this.utils.db.sideConnection(this.dbsConnection['engine-core'], projectId)})
			await this.utils.schema.update(this, projectId)
		}))

		// Routes
		this.app.use(auth.router(this))
		this.app.use(dev.router(this))
		this.app.use(api.router(this))

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