export default (schemaObj) => {
	schemaObj.name = schemaObj.name.toLowerCase()
	return `{
		"info": {
			"name": "${schemaObj.name}",
			"id": "_id",
			"desc": "${schemaObj.desc}"
		},
		"attributes": ${schemaObj.attributes ? JSON.stringify(schemaObj.attributes) : '{}'},
		"options": {
			"timestamps": true
		}
	}`
}