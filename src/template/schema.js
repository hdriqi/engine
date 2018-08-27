export default (schemaObj) => {
	return `{
		"info": {
			"name": "${schemaObj.newName ? schemaObj.newName : schemaObj.name}",
			"key": "_id",
			"desc": "${schemaObj.desc}"
		},
		"attributes": ${schemaObj.attributes ? JSON.stringify(schemaObj.attributes) : '{}'},
		"options": {
			"timestamps": true
		}
	}`
}