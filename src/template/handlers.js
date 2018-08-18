export default (schemaObj) => {
  schemaObj.name = schemaObj.name[0].toUpperCase() + schemaObj.name.slice(1).toLowerCase()
  return `module.exports = {
    async find(ctx, req) {
      try {
        return await ctx.services.db.find(ctx, req, '${schemaObj.name}')
      } catch (err) {
        return err
      }
    },
  
    async findOne(ctx, req) {
      try {
        return await ctx.services.db.findOne(ctx, req, '${schemaObj.name}')
      } catch (err) {
        return err
      }
    },
  
    async insert(ctx, req) {
      try {
        return await ctx.services.db.insert(ctx, req, '${schemaObj.name}')
      } catch (err) {
        return err
      }
    },
  
    async update(ctx, req) {
      try {
        return await ctx.services.db.update(ctx, req, '${schemaObj.name}')
      } catch (err) {
        return err
      }
    },
  
    async delete(ctx, req) {
      try {
        return await ctx.services.db.delete(ctx, req, '${schemaObj.name}')
      } catch (err) {
        return err
      }
    }
  }`
}