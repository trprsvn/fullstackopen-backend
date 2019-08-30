const express = require( 'express' )
const app = express()
const bodyParser = require( 'body-parser' )
const morgan = require( 'morgan' )

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
  }
]

app.use( bodyParser.json() )
morgan.token( 'bodydata', request => { return JSON.stringify(request.body) }  )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodydata'))

app.get( '/api/persons', ( request, response ) => {
  response.json(persons)
})

app.get( '/api/persons/:id', ( request, response ) => {
  const person = persons.find( p => p.id === Number( request.params.id ) )
  if( !person ){
    return response.status( 404 ).end()
  }
  response.json( person )
})

app.get( '/info', ( request, response ) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`
    )
})

app.delete( '/api/persons/:id', ( request, response ) => {
  persons = persons.filter( p => p.id !== Number( request.params.id ) ) 
  response.status( 204 ).end()
})

app.post( '/api/persons', ( request, response ) => {
  const body = request.body;
  if( !body.name || !body.number ) {
    return response.status( 400 ).end()
  }
  let isDuplicate = persons.find( p => p.name.toLowerCase() === body.name.toLowerCase() )
  if ( isDuplicate ) {
    return response.status( 400 ).json( {"error": "name must be unique"} )
  }

  let person = {...request.body}
  person.id = Math.floor( Math.random() * 1000000 )
  persons = persons.concat( person )
  response.json( person )
})

const PORT = 3001
app.listen( PORT, () => `app is running on port ${PORT}` )