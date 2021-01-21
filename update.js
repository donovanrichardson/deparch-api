require("dotenv").config('');
const inquirer = require("inquirer");
const { Agency } = require("./agency");
const mongoose = require('mongoose')

const local = {
  name: "locOrRem",
  type: "list",
  message: "Are you updating local or remote urls?",
  choices: ["local", "remote"],
};

const nameQ = {
    name:'name',
    type:'input',
    message:'what is the name of this agency?'
}

const keyQ = {
    name:'key',
    type:'input',
    message:'what is the key for this agency?'
}

const uriQ = {
    name:'uri',
    type:'input',
    message:'what is the uri for this database?'
}

let keepUpdating = true;

async function update() {
  const {locOrRem} = await inquirer.prompt(local)
    let uri = locOrRem == 'local' ? process.env.MONGO_URI : process.env.PRODUCTION_MONGO
    console.log(uri);

    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
    //   console.log("Mongo has connected")
    });

    const {newAgency} = await inquirer.prompt({
        name: 'newAgency',
        type: 'confirm',
        message: 'Would you like to create a new agency record?'
    })

    if (newAgency){
        const {name, key, uri} = await inquirer.prompt([nameQ,keyQ,uriQ])
        const theAgency = await Agency.create({key:key, name:name, uri:uri})
        console.log(theAgency);
    }else{
        let theAgencies = await Agency.find({}).sort('name')
        theAgencies = theAgencies.map(a=>a.name)
        const {chosenAgency} = await inquirer.prompt({
            name: "chosenAgency",
            type: "list",
            message: "Which agency would you like to update",
            choices: theAgencies,
          })
        const currentData = await Agency.findOne({name:chosenAgency})
        const fields = ["key",'name','uri']
        for(i = 0; i < fields.length; i++){
            const field = fields[i]
            const {newData} = await inquirer.prompt({
                name:'newData',
                type:"input",
                message:`Enter a new ${field}. Current data: ${currentData[field]}`
            })
            currentData[field] = newData || currentData[field]
        }
        
        await currentData.save()
        console.log(currentData)
    }
    const {doAnother} = await inquirer.prompt({
        type:'confirm',
        name:'doAnother',
        message:'Would you like to continue editing?'
    })
    keepUpdating = doAnother
    await db.close()
}

async function runUpdate(){
    while(keepUpdating){
        await update()
    }
}

runUpdate()