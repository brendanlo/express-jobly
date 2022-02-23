const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate formats data inputs from JS to be used in a SQL UPDATE
 * statement.
 * 
 * The function takes two arguments, the first is a data object of the
 * format
 *  {name: "Coca-cola", 
 *   description: "beverage company", 
 *   numEmployees: 50000, 
 *   logoUrl: "http://coca-cola.img"}
 * 
 * The second arg is an object where the keys are the js name of a variable 
 * (camelCase) and the values are the sql names of the values (snake_case). 
 *  {numEmployees: "num_employees",
 *   logoUrl: "logo_url"}
 * 
 * The function returns an object with key of "setCols" which is a string of
 * column names followed by =$<num> (where num increments from 1)
 *  and a key of "values" which is an array of values
 *  { setCols: ["name=$1", "description=$2", "num_employees=$3", "logo_url=$4"]
 *    values: ["Coca-cola", "beverage company", 50000, "http://coca-cola.img"]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);

  // check that dataToUpdate has values; if not, throw error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
