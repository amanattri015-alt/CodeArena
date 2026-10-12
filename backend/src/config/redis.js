const redis=require("redis");
const redisClient=redis.createClient( 
    {
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'philanthropic-daffodil-direct-56471.db.redis.io',
        port: 18965
    }});



module.exports=redisClient;