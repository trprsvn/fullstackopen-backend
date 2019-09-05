require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
morgan.token('bodyData', request => JSON.stringify(request.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyData'))

app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(people => {
      response.json(people.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person.toJSON())
      } else {
        response.status(404).send({result: "none"})
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(persons => {
      response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`
        )
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(foundPerson => {
      const person = {
        name: foundPerson.name,
        number: request.body.number
      }
      console.log(person)

      Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true})
        .then(updatedPerson => {
          response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

const notFound = ( request, response) => {
  response.status(404).send({error: 'could find any route'})
}

app.use(notFound)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if(error.name === "CastError" && error.kind === "ObjectId") {
    response.status(400).send({'error': "Problem with id"})
  } else if (error.name === "ValidationError") {
    response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`app is running on port ${PORT}`))