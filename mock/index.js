import Mock from 'mockjs'
 let data = Mock.mock({
            'list|1-10':[{
                name:"@name",
                address:"@province",
              }],
              id:"@id"
    })
export default [
    {
      methods:"post",
      url:"/api/users",
      response:({body})=>{
        return {
          msg:"success",
          data:data,
          status:200
        }
      }
    }
  ]
