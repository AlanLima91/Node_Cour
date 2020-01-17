const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'Todo number 1'
  },
  {
    _id: new ObjectID(),
    text: 'Todo number 2'
  },
];

beforeEach((done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
})

// describe permet des tests unitaires
describe('POST /todos', () => {

  it('doit créer un nouveau todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end(done);

  })

  it('ne doit pas créer un todo avec un body non valide', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end(done)
      ;
  })

});

describe('GET /todos', () => {
  it('doit recevoir tous les todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
})

describe('GET /todos/id', () => {
  it('doit retourner un todo', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id}`)
    .expect(200)
    .expect(res => {
      expect(res.body.todo.text)
      .toBe(todos[0].text);
    }).end(done);
  })

  it('doit retourner 404 si todo non trouvé', (done) => {
    var id = new ObjectID();
    request(app)
    .get(`/todos/${id}`)
    .expect(404)
    .end(done);
    })

  it('doit retourner 404 si id non conforme', (done) => {
    request(app)
    .get(`/todos/123`)
    .expect(404)
    .end(done);
    })
  })

describe('DELETE /todos/id', () => {
  it('Doit supprimer un todo', (done) => {
    var id = todos[1]._id.toHexString();
    request(app)
    .delete(`/todos/${id}`)
    .expect(200)
    .expect(res => {
      expect(res.body.todo._id).toBe(id);
    }).end((err, res) => {
      if (err)
        return done(err);
      Todo.findById(id).then(todo =>{
        expect(todo).toBeFalsy();
        done();
      }).catch(err => done(err));
    });
  })

  it('doit retourner 404 si todo non trouvé', (done) => {
    var id = new ObjectID();
    request(app)
    .delete(`/todos/${id}`)
    .expect(404)
    .end(done);
  })

  it('doit retourner 404 si id non conforme', (done) => {
    request(app)
    .delete(`/todos/123`)
    .expect(404)
    .end(done);
    })
})

describe('PATCH /todos/id', () => {
  it('Doit mettre à jour le Tood', (done) => {
    var id = todos[0]._id.toHexString();
    var text = 'Nouveau texte';
    request(app)
    .patch(`/todos/${id}`)
    .send({text, completed: true})
    .expect(200)
    .expect(res => {
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeTruthy();
    }).end(done);
  })

  it('Doit effacer completedAt quand le todo pas achevé', (done => {
    var id = todos[0]._id.toHexString();
    var text = 'Nouveau texte';
    request(app)
    .patch(`/todos/${id}`)
    .send({text, completed: false})
    .expect(200)
    .expect(res => {
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
    }).end(done);
  }))
})
