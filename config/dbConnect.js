import mongoose from "mongoose";

const dbConnect = async() => {
    try{
        const connected = await mongoose.connect(process.env.MONGO_URL)
        console.log('Mongodb connected ')
    }catch(error){
        console.log(`Error : ${error.message}`)
        process.exit(1);
    }   
}

export default dbConnect;
//password
// NEPGQv5VHKBukUJO
// uabishek6
