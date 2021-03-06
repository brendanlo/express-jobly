"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

/******************************************************** authenticateJWT */
describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/**************************************************** ensureLoggedIn */
describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});


/****************************************************** ensureAdmin */

describe("ensureAdmin", function () {
  test("works, is an admin", function () {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: {
        user: {
          username: "test",
          isAdmin: true
        }
      }
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);

  });

  test("fails, no admin token provided", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { username: "test" } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("fails, isAdmin token = false", function () {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: {
        username: "test",
        isAdmin: false
      }
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });

});



/****************************************************** ensureSelfOrAdmin */

describe("ensureSelfOrAdmin", function () {
  test("works, is an admin", function () {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: {
        user: {
          username: "test",
          isAdmin: true
        }
      }
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);

  });

  test("works: is self, but not admin", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = {
      locals: {
        user: {
          username: "test",
          isAdmin: false
        }
      }
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);

  });

  test("fails, not admin & not self", function () {
    expect.assertions(1);
    const req = {
      params: { username: "not test" }
    };
    const res = { locals: { username: "test" } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("fails, isAdmin token = false", function () {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: {
        username: "test",
        isAdmin: false
      }
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("fails, isAdmin token = false & not self", function () {
    expect.assertions(1);
    const req = { params: { username: "not test" } };
    const res = {
      locals: {
        username: "test",
        isAdmin: false
      }
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });

});
