export default (query) => {
  var filters = {
    where: '',
    limit: '',
    sort: '',
    populate: ''
  }
  Object.keys(query).forEach((q)=>{
    let val = query[q]
    // check if where clause
    if(q[0] !== '_'){
      let operatorQuery = q.split('_')
      // check if query contain operator
      if(operatorQuery.length > 1){
        if(filters.where === '') filters.where = {}
        let newKey = operatorQuery[0]
        let operator = `$${operatorQuery[1]}`
        val = operatorQuery[1] == 'regex' ? new RegExp(val) : ''
        Object.assign(filters.where, {[newKey]: {[operator]: val}})
      }
      // if not then put into where filter
      else{
        if(filters.where === '') filters.where = {}
        Object.assign(filters.where, {[q]: val})
      }
    }
    // put into proper filters
    else{
      filters[q.slice(1)] = isNaN(val) ? val : parseInt(val)
    }
  })
  return filters
}