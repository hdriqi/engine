export default (schemaObj) => {
  schemaObj.name = schemaObj.name.toLowerCase()
  return `{
    "endpoints": [
      {
        "method": "GET",
        "path": "/${schemaObj.name}",
        "handler": "find"
      },
      {
        "method": "GET",
        "path": "/${schemaObj.name}/:id",
        "handler": "findOne"
      },
      {
        "method": "POST",
        "path": "/${schemaObj.name}",
        "handler": "insert"
      },
      {
        "method": "PUT",
        "path": "/${schemaObj.name}/:id",
        "handler": "update"
      },
      {
        "method": "DELETE",
        "path": "/${schemaObj.name}/:id",
        "handler": "delete"
      }
    ]
  }`
}