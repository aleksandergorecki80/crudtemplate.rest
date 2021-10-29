const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/UserModel');
const connectDB = require('../config/db');
// Connect DB
connectDB();

beforeAll(async () => {
  await User.deleteMany({});
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const validUser = {
  name: 'Jan Kowalski',
  email: 'pierwszytest@muzykant.pl',
  password: 'P4sword',
}

describe('User registration:', () => {
  it('Has a module', () => {
    expect(User).toBeDefined();
  });

const postUser = (user = validUser) => {
  return request(app).post('/api/v1/users').send(user);
}

  it('Returns 200 OK when signup request is valid', async () => {
    const postRes = await postUser();
    expect(postRes.status).toBe(200);
  });

  it('Saves the user to the database', async () => {
    await postUser();
    const users = await User.find();
    expect(users.length).toBe(1);
  });

  it("Saves the user's name and email", async () => {
    await postUser();
    const user = await User.findOne(
      { email: 'pierwszytest@muzykant.pl' },
      { name: 1, email: 1 }
    );
    expect(user).toMatchObject({
      name: 'Jan Kowalski',
      email: 'pierwszytest@muzykant.pl',
    });
  });

  it('Returns validation errors when name is null', async () => {
    const response = await postUser({
      name: '',
      email: 'filemon@kot.com',
      password: 'P4sword',
    });
    expect(response.body).toMatchObject( { success: false, errors: ['Username can not be null'] } );
  });

  it('Returns validation errors when email is null', async ()=> {
    const response = await postUser({
      name: 'Kot Filemon',
      email: null,
      password: 'P4sword',
    });
    expect(response.body).toMatchObject({ success: false, errors: ['Email can not be null'] });
  });

  it('Returns errors for email and name', async () => {
    const response = await postUser({
      name: '',
      email: null,
      password: 'P4sword',
    });
    const body = response.body;
    expect(body.errors.length).toBe(2);
  }); 


  it("Hashes the password in database", async () => {
    await postUser();
    const user = await User.findOne(
      { email: 'pierwszytest@muzykant.pl' },
      { name: 1, email: 1, password: 1 }
    );
    expect(user.password).not.toBe('P4sword');
  });

  it('Returns success message when register user request is valid', async () => {
    const postRes = await postUser();
    expect(postRes.body.data).toMatchObject({
      name: 'Jan Kowalski',
      email: 'pierwszytest@muzykant.pl',
    });
  });
});
