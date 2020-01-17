const express           = require('express');
const bodyParser        = require('body-parser');
const _                 = require('lodash');
const { ObjectID }      = require('mongodb');
const {mongoose}        = require('./db/mongoose');
const {Todo}            = require('./models/todo');
const {User}            = require('./models/User');
const { authenticate }  = require('./middleware/authenticate');

var app = express();

// middleware décodant le json inclu dans le body des requêtes
app.use(bodyParser.json());

/**
 *  TODO ROUTES ---------------------------------------------------------------
 */ 
// https://httpstatuses.com/

// POST /todos
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then(doc => {
    res.status(200).send(doc);
  }).catch(err => {
    res.status(400).send(err);
  })
})

// GET /todos
app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.status(200).send({todos});
  }).catch(err => {
    res.status(400).send(err);
  })
})

// GET /todos/id
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send();
  Todo.findById(id).then(todo => {
    if (!todo)
      return res.status(404).send();
    res.status(200).send({todo});
  }).catch(err => {
    res.status(400).send(err);
  })
})

// DELETE /todos/id
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send();
  Todo.findByIdAndDelete(id).then(todo => {
    // findByIdAndDelete return the deleted object
    if (!todo)
      return res.status(404).send();
    res.status(200).send({todo});
  }).catch(err => res.status(400).send());
})

// PATCH /todos/id
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id))
    return res.status(404).send();
  if (_.isBoolean(body.completed) && body.completed)
    body.completedAt = new Date().getTime();
  else
  {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
    if (!todo)
      return res.status(404).send();
    res.status(200).send({todo});
  }).catch(err => res.status(400).send());
})

/**
 *  FIN TODO ROUTES ---------------------------------------------------------------
 *  
 *  User Routes *******************************************************************
 */ 

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(doc => {
    res.status(200).send(doc);
  }).catch(err => {
    res.status(400).send(err);
  });
})

// POST /users/login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then(user => {
    user.generateAuthToken().then(token => {
      console.log(token)
      res.header('x-auth', token).status(200).send(user);
    })
  }).catch(err => {
    res.status(400).send("login failed");
  })
})

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
})

app.listen(3000, () => {
  console.log('Server écoutant le port 3000...');
})

module.exports = {app};
