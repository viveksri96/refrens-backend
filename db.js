const { MongoClient, ObjectID } = require("mongodb");

const client = new MongoClient("mongodb+srv://admin:admin@cluster0.9v7hr.mongodb.net/test-refrens?retryWrites=true&w=majority");


async function connectClient(){
    try {
        await client.connect({
          useUnifiedTopology: true
        });
        
        console.log('db connectd')
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    client,
    connectClient
}