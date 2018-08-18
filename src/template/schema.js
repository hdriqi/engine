export default (schemaObj) => {
  schemaObj.name = schemaObj.name[0].toUpperCase() + schemaObj.name.slice(1).toLowerCase()
  return `{
    "info": {
      "name": "${schemaObj.name}",
      "desc": "${schemaObj.desc}"
    },
    "attributes": ${schemaObj.attributes ? JSON.stringify(schemaObj.attributes) : "{}"},
    "options": {
      "timestamps": true
    }
  }`
}