"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("testing sqlForPartialUpdate", function () {
  test("Success case", function () {
    const dataToUpdate = {
      name: "Pear Incorpearated",
      description: "creators of pear programming",
      numEmployees: 1000
    };
    const jsToSql = {
      numEmployees: "num_employees"
    };
    const output = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(output).toEqual({
      setCols: '"name"=$1, "description"=$2, "num_employees"=$3',
      values: ["Pear Incorpearated", "creators of pear programming", 1000]
    });
  });

  test("Success case: empty jsToSql", function () {
    const dataToUpdate = {
      name: "Pear Incorpearated",
      description: "creators of pear programming",
      numEmployees: 1000
    };
    const jsToSql = {}; // empty
    const output = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(output).toEqual({
      setCols: '"name"=$1, "description"=$2, "numEmployees"=$3',
      values: ["Pear Incorpearated", "creators of pear programming", 1000]
    });
  });

  test("Failure case: empty dataToUpdate", function () {
    const dataToUpdate = {}; // empty
    const jsToSql = {
      numEmployees: "num_employees"
    };

    expect(() => {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    }).toThrow(new BadRequestError("No data"));

  });

  test("Failure case: jsToSql doesn't match dataToUpdate", function () {
    const dataToUpdate = {
      name: "Pear Incorpearated",
      description: "creators of pear programming",
      numEmployees: 1000
    };
    const jsToSql = {
      numEmp: "num_employees"
    };
    const output = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(output).toEqual({
      setCols: '"name"=$1, "description"=$2, "numEmployees"=$3',
      values: ["Pear Incorpearated", "creators of pear programming", 1000]
    });
  });

});



