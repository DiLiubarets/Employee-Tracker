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
  user: "root",
  password: "Ukrayina91",
  database: "employee_tracker_db",
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
        viewByManager()
      }
      if (answer.action == "Update roles") {
        updateEmpRole();
      }
      if (answer.action == "Update employee manager") {
        updateEmpManager();
      }
      if (answer.action == "Delete department") {
        start();
      }
      if (answer.action == "Delete role") {
        start();
      }
      if (answer.action == "Delete employee") {
        start();
      }
      if (answer.action == "Exit") {
        start();
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
          console.table(row);
          start();
        });
      }
    });
};

const addRole = () => {
  let departments = [];

  let sql = "SELECT * FROM department;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (dep of row) {
      departments.push(dep.name);
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
        choices: departments,
      })
      .then((input) => {
        let id = departments.indexOf(input.department) + 1;
        let sql = `INSERT INTO role (department_id, title, salary) VALUES ("${id}", "${title}", "${salary}");`;
        con.query(sql, (err, row) => {
          if (err) throw err;
          console.table(row)
          console.log("Role added");
          start();
        });
      });
  });
};

const addEmployee = () => {
  let roles = [];
  let sql = "SELECT * FROM role;";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (rol of row) {
      roles.push(rol.title);
    }
  });

  let employees = [];
  let sql2 = "SELECT * FROM employee";
  con.query(sql2, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employees.push(emp.first_name);
    }
    employees.push("None");
  });

  inquirer.prompt(employeeQuestions).then((answer) => {
    let firstName = answer.first_name;
    let lastName = answer.last_name;

    inquirer
      .prompt({
        name: "role",
        type: "list",
        message: "Select role",
        choices: roles,
      })
      .then((input) => {
        let role_id = roles.indexOf(input.role) + 1;
        inquirer
          .prompt({
            name: "manager",
            type: "list",
            message: "Select manager",
            choices: employees,
          })
          .then((input) => {
            let manager_id = employees.indexOf(input.manager) + 1;
            let sql = `INSERT INTO employee (role_id, first_name, last_name, manager_id) VALUES ("${role_id}", "${firstName}", "${lastName}", "${manager_id}");`;
            if (manager_id == employees.length) {
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
  let roles = [];
  let sql2 = "SELECT * FROM role;";
  con.query(sql2, (err, row) => {
    if (err) throw err;
    for (rol of row) {
      roles.push(rol.title);
    }
  });

  let employeeNames = [];
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employeeNames.push(emp.first_name + " " + emp.last_name);
    }

    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employeeNames,
      })
      .then((input) => {
        let id = employeeNames.indexOf(input.name) + 1;
        inquirer
          .prompt({
            name: "role",
            type: "list",
            message: "Select role",
            choices: roles,
          })
          .then((input) => {
            let role_id = roles.indexOf(input.role) + 1;
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
  let employee = [];
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employee.push(emp.first_name + " " + emp.last_name);
    }

    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select employee",
        choices: employee,
      })
      .then((input) => {
        let id = employee.indexOf(input.name) + 1;
        inquirer
          .prompt({
            name: "manager",
            type: "list",
            message: "Select manager",
            choices: employee,
          })
          .then((input) => {
            let emp_id = employee.indexOf(input.manager) + 1;
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
    let employee = [];
  let sql = "SELECT * FROM employee";
  con.query(sql, (err, row) => {
    if (err) throw err;
    for (emp of row) {
      employee.push(emp.first_name + " " + emp.last_name);
    }

    inquirer
    .prompt({
      name: "name",
      type: "list",
      message: "Select employee",
      choices: employee,
    }).then((input)=>{
        let man_id = employee.indexOf(input.name) +1
      let sql2 = `SELECT * FROM employee WHERE manager_id="${man_id}"`;
      con.query(sql2, (err, row) => {
        if (err) throw err;
        console.table(row)
        start();
      });
    })
})
}