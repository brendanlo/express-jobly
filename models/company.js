"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }
  /** Find all companies, will filter the results based on the following
   * filters:
   * - minEmployees: min number of employees
   * - maxEmployees: max number of employees
   * - nameLike: string that will match via ilike "%nameLike%" in SQL
   * 
   * Takes in filters, which is an object of the following structure:
   * { minEmployees: int, maxEmployees: int, nameLike: str}
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters) {

    const { whereStr, whereVars } = Company.sqlForWhere(filters);

    let query = `SELECT handle,
                      name,
                      description,
                      num_employees AS "numEmployees",
                      logo_url AS "logoUrl"
                  FROM companies
                  ${whereStr}
                  ORDER BY name`;

    const companiesRes = await db.query(query, whereVars);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }

  /** This function converts filters from a route into syntax for a SQL WHERE 
  * clause. It asserts the following items to be true, throwing an error if not:
  * 1) minEmployees > maxEmployees
  * 2) the filter names are one of (minEmployees, maxEmployees, nameLike)
  * 
  * It takes an object whose keys are filter names and values are the filter 
  * value:
  *  {minEmployees: 10, maxEmployees: 20, nameLike: "cola"}
  * 
  * It returns an object with the first element 'whereStr' being a string 
  * formatted to look like a SQL WHERE clause:
  * 'WHERE num_employees > $1 AND num_employees < $2 and name ilike $3'
  * 
  * And the second element 'whereVars' being an array of values that map to each 
  * of the SQL placeholders in the WHERE string. nameLikes will have the word
  * wrapped in %'s for wildcard matching in ilike statement.
  *  [100, 200, '%cola%']
  * 
  * Returns { whereStr: "", whereVar: [] } if the filters object is empty or 
  * undefined
  */

  static sqlForWhere(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return { whereStr: "", whereVar: [] };
    }

    // check valid inputs before querying writing WHERE statement
    if (filters.minEmployees > filters.maxEmployees) {
      throw new BadRequestError("minEmployees cannot be greater than maxEmployees");
    }

    const validFilters = ["minEmployees", "maxEmployees", "nameLike"];

    for (let filterKey in filters) {
      if (!validFilters.includes(filterKey)) {
        throw new BadRequestError(`${filterKey} is not a valid filter name`);
      }
    }

    // Create the WHERE string & the same index in the 'whereVars' array for SQL 
    // using the filters
    const filterKeys = Object.keys(filters);

    let whereVars = [];
    let whereArr = [];

    // NOTE get rid of for loop. just use the if statements
    filterKeys.forEach((filterKey, index) => {
      if (filterKey === 'minEmployees') {
        whereArr.push(`num_employees >= $${index + 1}`);
        whereVars.push(filters[filterKey]);
      }
      else if (filterKey === 'maxEmployees') {
        whereArr.push(`num_employees <= $${index + 1}`);
        whereVars.push(filters[filterKey]);
      }
      else {
        whereArr.push(`name ilike $${index + 1}`);
        whereVars.push(`%${filters[filterKey]}%`);
      }
    });

    const whereStr = "WHERE " + whereArr.join(" AND ");

    return { whereStr, whereVars };
  }
}


module.exports = Company;
