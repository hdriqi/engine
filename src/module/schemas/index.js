export default (ctx) => {
  return async (req, res)=>{
    if(req.method === 'GET'){
      try {
        const result = await ctx.services.schema.get(ctx)
        res.json(result)
      } catch (err) {
        res.json(err)
      }
    }
    else if(req.method === 'POST'){
      try {
        const result = await ctx.services.schema.add(ctx, {
          name: req.body.schemaName,
          desc: req.body.schemaDesc
        })
        res.json(result)
      } catch (err) {
        res.json(err)
      }
    }
    else if(req.method === 'PUT'){
      try {
        const result = await ctx.services.schema.modify(ctx, {
          name: req.body.schemaName,
          desc: req.body.schemaDesc,
          attributes: req.body.attributes
        })
        res.json(result)
      } catch (err) {
        res.json(err)
      }
    }
    else if(req.method === 'DELETE'){
      try {
        const result = await ctx.services.schema.remove(ctx, {
          name: req.body.schemaName
        })
        res.json(result)
      } catch (err) {
        res.json(err)
      }
    }
  }
}