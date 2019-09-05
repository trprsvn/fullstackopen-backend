const mongoose = require('mongoose')
const url = process.env.MONGO_URI
const uniqueValidator = require('mongoose-unique-validator')
mongoose.set('useFindAndModify', false)
console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true} )
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDb: ', error.message)
  })

const personSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    unique: true,
    required: true,
    uniqueCaseInsensitive: true,
    minlength: 3
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject ) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

personSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Person', personSchema)