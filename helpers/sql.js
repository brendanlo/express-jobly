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
 *  { setCols: '"name=$1", "description=$2", "num_employees=$3", "logo_url=$4"',
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


/** This function converts filters from a route into syntax for a SQL WHERE 
 * clause. It will perform the following checks on the filters:
 * 1) minEmployees < maxEmployees
 * 2) the filter names are one of (minEmployees, maxEmployees, nameLike)
 * 
 * It takes an object whose keys are filter names and values are the filter value
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
 * Returns { whereStr: "", whereVar: [] } if the filters object is empty or undefined
 */
function sqlForWhere(filters) {
  if (!filters || Object.keys(filters).length === 0) return { whereStr: "", whereVar: [] };

  // check valid inputs before querying writing WHERE statement
  console.log("bool filter.min > filter.max: ", Boolean(filters.minEmployees > filters.maxEmployees));
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

module.exports = {
  sqlForPartialUpdate,
  sqlForWhere
};
