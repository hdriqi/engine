export default (ctx) => {
  return async (req, res)=>{
    if(req.method === 'GET'){
      try {
        const result = await ctx.services.db.find(ctx, req, 'Roles')
        res.json(result)
      } catch (err) {
        console.log(err)
        res.json(err)
      }
    }
    else if(req.method === 'POST'){
      try {
        const result = await ctx.services.role.add(ctx, req.body.roleName)
        res.json(result)
      } catch (err) {
        console.log(err)
        res.json(err)
      }
    }
    else if(req.method === 'PUT'){
      try {
        const result = await ctx.services.role.modify(ctx, req.body.roleName, req.body.doc)
        res.json(result)
      } catch (err) {
        console.log(err)
        res.json(err)
      }
    }
    else if(req.method === 'DELETE'){
      try {
        const result = await ctx.services.role.remove(ctx, req.body.roleName)
        res.json(result)
      } catch (err) {
        console.log(err)
        res.json(err)
      }
    }
  }
}