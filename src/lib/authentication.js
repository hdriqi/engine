import jwt from 'jsonwebtoken'

const checkAccess = (ctx, user, targetEndpoint, targetMethod)=> {
  const access = targetMethod === 'GET' ? 'read' : 'write'
  return new Promise((resolve, reject)=>{
    ctx.schemas['Roles'].model.findOne({
      name: user.role,
      endpoint: targetEndpoint,
      [access]: true
    })
    .then((result)=>{
      if(result){
        console.log(`Request Granted -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
        resolve(true)
      }
      else{
        console.log(`Request Denied -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
        reject(false)
      }
    })
    .catch((err)=>{
      console.log(`Request Denied -> User:${user._id} - Role:${user.role} - RequestEndpoint:${targetEndpoint} - RequestAccess:${access}`)
      console.log(err)
      reject(false)
    })
  })
}

module.exports = {
  middleware(ctx) {
    let self = this
    return async function(req, res, next){
      let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : false
      const targetEndpoint = req.originalUrl.split('?')[0].split('/')[2]
      const targetMethod = req.method
      // if token exist
      if(token) {
        try {
          const decoded = await self.verify(token)
          req.params.id = decoded._id
          const user = await ctx.services.findOne('Users', req, ctx)
          await checkAccess(ctx, user, targetEndpoint, targetMethod)
          next()
        } catch (err) {
          res.json({
            code: 401,
            message: `No Access`
          })
        }
      }
      // if no token
      else{
        try{
          await checkAccess(ctx, {_id: 'guest', role: 'guest'}, targetEndpoint, targetMethod)
          next()
        }
        catch(err){
          res.json({
            code: 401,
            message: `No Access`
          })
        }
      }
    }
  },
  verify(token) {
    return new Promise((resolve, reject)=>{
      try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
        resolve(decoded)
      } catch(err) {
        reject(err)
      }
    })
  },

}