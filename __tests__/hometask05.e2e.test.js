const request = require("supertest");
const app = require("../api/index");

const API_PREFIX = "/hometask_05/api";
const ADMIN_AUTH = `Basic ${Buffer.from("admin:qwerty").toString("base64")}`;

describe("hometask_05 api", () => {
  beforeEach(async () => {
    await request(app).delete(`${API_PREFIX}/testing/all-data`).expect(204);
  });

  it("POST /users creates user and does not expose password hash", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "Dimych", password: "qwerty1", email: "dimych@gmail.com" })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      login: "Dimych",
      email: "dimych@gmail.com",
      createdAt: expect.any(String),
    });
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.password).toBeUndefined();
  });

  it("POST /users returns BLL uniqueness error for duplicate email", async () => {
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "UserOne", password: "qwerty1", email: "same@mail.com" })
      .expect(201);

    const response = await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "UserTwo", password: "qwerty1", email: "same@mail.com" })
      .expect(400);

    expect(response.body).toEqual({
      errorsMessages: [{ field: "email", message: "email should be unique" }],
    });
  });

  it("POST /users returns BLL uniqueness error for duplicate login", async () => {
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "SameLogin", password: "qwerty1", email: "one@mail.com" })
      .expect(201);

    const response = await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "SameLogin", password: "qwerty1", email: "two@mail.com" })
      .expect(400);

    expect(response.body).toEqual({
      errorsMessages: [{ field: "login", message: "login should be unique" }],
    });
  });

  it("GET /users supports OR search by login/email with pagination", async () => {
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "Dimych", password: "qwerty1", email: "dimych@gmail.com" })
      .expect(201);
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "Natalia", password: "qwerty1", email: "kuzyuberdina@gmail.com" })
      .expect(201);
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "Alex", password: "qwerty1", email: "alex@yahoo.com" })
      .expect(201);

    const response = await request(app)
      .get(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .query({
        searchLoginTerm: "D",
        searchEmailTerm: "K",
        sortBy: "login",
        sortDirection: "asc",
        pageNumber: 1,
        pageSize: 10,
      })
      .expect(200);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.items.map((x) => x.login)).toEqual(["Dimych", "Natalia"]);
  });

  it("POST /auth/login returns 204 for valid credentials and 401 for invalid ones", async () => {
    await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "LoginName", password: "pass123", email: "mail@example.com" })
      .expect(201);

    await request(app).post(`${API_PREFIX}/auth/login`).send({ loginOrEmail: "LoginName", password: "pass123" }).expect(204);
    await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ loginOrEmail: "mail@example.com", password: "pass123" })
      .expect(204);
    await request(app).post(`${API_PREFIX}/auth/login`).send({ loginOrEmail: "LoginName", password: "wrong" }).expect(401);
  });

  it("POST /auth/login returns 400 for invalid input model", async () => {
    const response = await request(app).post(`${API_PREFIX}/auth/login`).send({ loginOrEmail: "", password: "" }).expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "loginOrEmail" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("GET /users requires admin auth", async () => {
    await request(app).get(`${API_PREFIX}/users`).expect(401);
  });

  it("DELETE /users/:id deletes user and returns 404 for missing id", async () => {
    const createResponse = await request(app)
      .post(`${API_PREFIX}/users`)
      .set("authorization", ADMIN_AUTH)
      .send({ login: "DeleteMe", password: "qwerty1", email: "delete@mail.com" })
      .expect(201);

    await request(app).delete(`${API_PREFIX}/users/${createResponse.body.id}`).set("authorization", ADMIN_AUTH).expect(204);
    await request(app).delete(`${API_PREFIX}/users/${createResponse.body.id}`).set("authorization", ADMIN_AUTH).expect(404);
  });
});
