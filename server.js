var mysql = require("mysql");
const inquirer = require("inquirer");

let options = [
  "Add department",
  "Add role",
  "Add employee",
  "View departments",
  "View roles",
  "View employees",
  "View employees by manager",
  "View the total utilized budget of a department",
  "Update roles",
  "Update employee manager",
  "Delete department",
  "Delete role",
  "Delete employee",
  "Exit",
];

let roleQuestions = [
  {
    name: "role_title",
    type: "input",
    message: "Enter role title",
  },
  {
    name: "role_salary",
    type: "input",
    message: "Enter role salary",
  },
];
let employeeQuestions = [
  {
    name: "first_name",
    type: "input",
    message: "Enter employee first name",
  },
  {
    name: "last_name",
    type: "input",
    message: "Enter employee last name",
  },
];
var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "YOUR USER ID",
  password: "YOUR PASSWORD",
  database: "employee_tracker_db",
  multipleStatements: true
});
con.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected");
  start();
});

function start() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: options,
    })
    .then((answer) => {
      if (answer.action == "Add department") {
        addDepartment();
      }
      if (answer.action == "Add role") {
        addRole();
      }
      if (answer.action == "Add employee") {
        addEmployee();
      }
      if (answer.action == "View departments") {
        let sql = "SELECT * FROM department;";
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.table(row);
          start();
        });
      }
      if (answer.action == "View roles") {
        let sql = "SELECT * FROM role;";
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.table(row);
          start();
        });
      }
      if (answer.action == "View employees") {
        let sql = "SELECT * FROM employee;";
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.table(row);
          start();
        });
      }
      if (answer.action == "View employees by manager") {
        viewByManager();
      }
      if (answer.action == "View the total utilized budget of a department") {
        totalBudget();
      }
      if (answer.action == "Update roles") {
        updateEmpRole();
      }
      if (answer.action == "Update employee manager") {
        updateEmpManager();
      }
      if (answer.action == "Delete department") {
        deleteDepartments();
      }
      if (answer.action == "Delete role") {
        deleteRole();
      }
      if (answer.action == "Delete employee") {
        deletedEmployee();
      }
      if (answer.action == "Exit") {
        process.exit();
      }
    });
}

const addDepartment = () => {
  inquirer
    .prompt({
      name: "department_name",
      type: "input",
      message: "Enter department name",
    })
    .then((input) => {
      if (input) {
        console.log(input);
        let sql = `INSERT INTO department (name) VALUES ("${input.department_name}");`;

        con.query(sql, (err, row) => {
          if (err) throw err;
          start();
        });
      }
    });
};

const addRole = () => {
  let departments = {
    name: [],
    id: [],
  };

  let sql = "SELECT * FROM department;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (dep of row) {
      departments.name.push(dep.name);
      departments.id.push(dep.id);
    }
  });

  inquirer.prompt(roleQuestions).then((answer) => {
    let title = answer.role_title;
    let salary = answer.role_salary;

    inquirer
      .prompt({
        name: "department",
        type: "list",
        message: "Select department",
        choices: departments.name,
      })
      .then((input) => {
        let index = departments.name.indexOf(input.department);
        let id = departments.id[index];
        let sql = `INSERT INTO role (department_id, title, salary) VALUES ("${id}", "${title}", "${salary}");`;
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.log("Role added");
          start();
        });
      });
  });
};

const addEmployee = () => {
  let roles = {
    id: [],
    title: [],
  };
  let sql = "SELECT * FROM role;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (rol of row) {
      roles.id.push(rol.id);
      roles.title.push(rol.title);
    }
  });

  let employees = {
    id: [],
    name: [],
  };
  let sql2 = "SELECT * FROM employee";
  con.query(sql2, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employees.name.push(emp.first_name + " " + emp.last_name);
      employees.id.push(emp.id);
    }
    employees.name.push("None");
    employees.id.push(0);
  });

  inquirer.prompt(employeeQuestions).then((answer) => {
    let firstName = answer.first_name;
    let lastName = answer.last_name;

    inquirer
      .prompt({
        name: "role",
        type: "list",
        message: "Select role",
        choices: roles.title,
      })
      .then((input) => {
        let index = roles.title.indexOf(input.role);
        let role_id = roles.id[index];
        inquirer
          .prompt({
            name: "manager",
            type: "list",
            message: "Select manager",
            choices: employees.name,
          })
          .then((input) => {
            let index = employees.name.indexOf(input.manager);
            let manager_id = employees.id[index];
            let sql = `INSERT INTO employee (role_id, first_name, last_name, manager_id) VALUES ("${role_id}", "${firstName}", "${lastName}", "${manager_id}");`;
            if (index === employees.name.length - 1) {
              sql = `INSERT INTO employee (role_id, first_name, last_name) VALUES ("${role_id}", "${firstName}", "${lastName}");`;
            }
            con.query(sql, (err, row) => {
              if (err) throw err;
              console.log("Employee added");
              start();
            });
          });
      });
  });
};

const updateEmpRole = () => {
  let roles = {
    id: [],
    title: [],
  };
  let sql2 = "SELECT * FROM role;";
  con.query(sql2, (err, row) => {
    if (err) throw err;
    for (rol of row) {
      roles.id.push(rol.id);
      roles.title.push(rol.title);
    }
  });

  let employeeNames = {
    id: [],
    name: [],
  };
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employeeNames.name.push(emp.first_name + " " + emp.last_name);
      employeeNames.id.push(emp.id);
    }

    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employeeNames.name,
      })
      .then((input) => {
        let index = employeeNames.name.indexOf(input.name);
        let id = employeeNames.id[index];
        inquirer
          .prompt({
            name: "role",
            type: "list",
            message: "Select role",
            choices: roles.title,
          })
          .then((input) => {
            let index = roles.title.indexOf(input.role);
            let role_id = roles.id[index];
            let sql = `UPDATE employee SET role_id=${role_id} WHERE id=${id};`;

            con.query(sql, (err, row) => {
              if (err) throw err;
              console.log("Role updated");
              start();
            });
          });
      });
  });
};

const updateEmpManager = () => {
  let employee = {
    id: [],
    name: [],
  };
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employee.name.push(emp.first_name + " " + emp.last_name);
      employee.id.push(emp.id);
    }

    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employee.name,
      })
      .then((input) => {
        let index = employee.indexOf(input.name);
        let id = employee.id[index];
        inquirer
          .prompt({
            name: "manager",
            type: "list",
            message: "Select manager",
            choices: employee.name,
          })
          .then((input) => {
            let index = employee.indexOf(input.name);
            let emp_id = employee.id[index];
            let sql = `UPDATE employee SET manager_id=${emp_id} WHERE id=${id};`;
            con.query(sql, (err, row) => {
              if (err) throw err;
              console.log("Employee manager updated");
              start();
            });
          });
      });
  });
};

const viewByManager = () => {
  let employee = {
    id: [],
    name: [],
  };
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employees.name.push(emp.first_name + " " + emp.last_name);
      employees.id.push(emp.id);
    }
    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employee.name,
      })
      .then((input) => {
        let index = employee.name.indexOf(input.name);
        let man_id = employee.id[index];
        let sql2 = `SELECT * FROM employee WHERE manager_id="${man_id}"`;
        con.query(sql2, (err, row) => {
          if (err) throw err;
          console.table(row);
          start();
        });
      });
  });
};

const deleteDepartments = () => {
  let departments = [];
  let sql = "SELECT * FROM department;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (dep of row) {
      departments.push(dep.name);
    }
    inquirer
      .prompt({
        name: "department",
        type: "list",
        message: "Select department to delete",
        choices: departments,
      })
      .then((input) => {
        let sql = `DELETE FROM department WHERE name="${input.department}"`;
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.log("Department deleted");
          start();
        });
      });
  });
};
const deleteRole = () => {
  let roles = {
    id: [],
    title: [],
  };
  let sql = "SELECT * FROM role;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (rol of row) {
      roles.id.push(rol.id);
      roles.title.push(rol.title);
    }
    inquirer
      .prompt({
        name: "role",
        type: "list",
        message: "Select role",
        choices: roles.title,
      })
      .then((input) => {
        let index = roles.title.indexOf(input.role);
        let role_id = roles.id[index];
        let sql = `DELETE FROM role WHERE id="${role_id}"`;
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.log("Role deleted");
          start();
        });
      });
  });
};

const deletedEmployee = () => {
  let employees = {
    id: [],
    name: [],
  };
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employees.name.push(emp.first_name + " " + emp.last_name);
      employees.id.push(emp.id);
    }
    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employees.name,
      })
      .then((input) => {
        let index = employees.name.indexOf(input.name);
        let id = employees.id[index];
        let sql = `DELETE FROM employee WHERE id=${id}`;
        con.query(sql, (err) => {
          if (err) throw err;
          console.log("Employee deleted");
          start();
        });
      });
  });
};

const totalBudget = () => {
  let departments = [];
  let sql = "SELECT * FROM department;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (dep of row) {
      departments.push(dep.name);
    }
    inquirer
      .prompt({
        name: "department",
        type: "list",
        message: "Select department to view budget",
        choices: departments,
      })
      .then((input) => {
        let sql = `CREATE TABLE sumSalary ( SELECT employee.first_name, role.salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON department.id = role.department_id AND department.name = "${input.department}"); SELECT SUM(salary) total FROM sumSalary; DROP TABLE sumSalary;`;
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.table(row[1])
          start();
        });
      });
  });
};
