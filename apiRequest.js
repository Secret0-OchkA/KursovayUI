var MyApiV1 = require("my_api_v1");
var $ = require("jquery");
const { Chart } = require("chart.js");

var companyId = 1;

let ApiClient = new MyApiV1.ApiClient("http://localhost:49151/");
ApiClient.defaultHeaders = {
}

let companyApi = new MyApiV1.CompanyApi(ApiClient);
let departmentApi = new MyApiV1.DepartmentApi(ApiClient);
let employeeApi = new MyApiV1.EmployeeApi(ApiClient);
let empDepartmentApi = new MyApiV1.EmployeeFromDepartmentApi(ApiClient);
let expEmployeeApi = new MyApiV1.ExpenseFromEmployeeApi(ApiClient);
let expenseTypeApi = new MyApiV1.ExpenseTypeApi(ApiClient);
let expDepartmentApi = new MyApiV1.ExpenseFromDepartmentApi(ApiClient);
let bugetPlanApi = new MyApiV1.BugetPlanApi(ApiClient);

let departmentBudgetChart = new Chart(document.getElementById('chartDepartmentBudget'), {
  type: 'pie',
  data: {}
});
let departmentPeopleChart = new Chart(document.getElementById('chartDepartmentPeople'), {
  type: 'bar',
  data: {},
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  },
});


$(document).ready(function () {
  UpdateDepartment();
  UpdateExpenseType();
  UpdateEmployee();
  UpdateExpense();

  departmentBudgetChart.update();
  departmentPeopleChart.update();

  //ExpenseType====================================
  //Get
  function UpdateExpenseType() {
    expenseTypeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));

        let selectors = $(".select-expenseType");
        let table = $("#tableExpenseType > tbody");
        table.empty();
        selectors.empty();
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <th>${i + 1}</th>
          <td>${data[i].name}</td>
          <td>${data[i].limit}</td>
          <td>${data[i].description}</td>
        </tr>`);
        }
      }
    });
  }
  //Create
  $("#btn-c-expenseType").click(function () {

    let expenseType = new MyApiV1.ExpenseTypeView();
    expenseType.id = 0;
    expenseType.name = $('#formCreateExpenseTypeName').val();
    expenseType.description = $('#formCreateExpenseTypeDescription').val();
    expenseType.limit = $('#formCreateExpenseTypeLimit').val();

    let opts = {
      'expenseTypeView': expenseType // DepartmentView | 
    };
    expenseTypeApi.createExpenseTypeInCompany(companyId, opts, (error, data, response) => {
      if (error) {
        console.error(JSON.stringify(response['body']));
      } else {
        console.log('Create ExpenseType');
        UpdateExpenseType();
      }
    });
  });
  //Delete
  $("#btn-d-expenseType").click(function () {

    let expenseTypeId = $("#formDeleteExpense").val() // Number | 
    expenseTypeApi.deleteExpenseTypeInCompany(companyId, expenseTypeId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Delet ExpenseType');
        UpdateExpenseType();
      }
    });
  });

  //TODO: Expense=================================
  //Get
  function UpdateExpense() {
    employeeApi.getEmployees((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        let employees = data;
        expenseTypeApi.getEpxensTypesInCompany(companyId, (error, data, response) => {
          if (error) {
            console.error(error);
          } else {
            let expenseTypes = data;
            expDepartmentApi.getExpesesInCompany(companyId, (error, data, response) => {
              if (error) {
                console.error(error);
              } else {
                console.log(JSON.stringify(data));
                $("#variableCountExpense").text(data.length);
                let table = $("#tableExpense > tbody");
                table.empty();
                let sumExpenseMoney = 0;
                for (let i = 0; i < data.length; i++) {
                  table.append(`<tr>
                    <td style="display:none;">${data[i].id}</td>
                    <td style="display:none;">${data[i].employeeId}</td>
                    <th>${i + 1}</th>
                    <td>${data[i].amount}</td>
                    <td>${data[i].date.getFullYear()}/${data[i].date.getMonth()}/${data[i].date.getDate()}</td>
                    <td>${expenseTypes.find(expType => expType.id == data[i].expenseTypeId).name}</td>
                    <td>${employees.find(emp => emp.id == data[i].employeeId).name}</td>
                  </tr>`);

                  sumExpenseMoney += data[i].amount;
                }
                $("#variableAllExpenseMoney").text(sumExpenseMoney);
              }
            });
          }
        });
      }
    });
  }
  //Create
  $("#btn-c-expense").click(function () {
    let employeeId = $("#formCreateExpenseEmployee").val(); // Number | 

    let expense = new MyApiV1.ExpenseView();
    expense.Amount = $("#formCreateExpenseAmount").val();
    expense.expenseTypeId = $("#formCreateExpenseExpenseType").val();

    let opts = {
      'expenseView': expense // ExpenseView | 
    };
    expEmployeeApi.createExpense(employeeId, opts, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Create Expense');
        UpdateExpense();
      }
    });
  });


  //Employee=================================
  //Get
  function UpdateEmployee() {

    let departments;
    departmentApi.getDepartments(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        departments = data;
      }
    });

    employeeApi.getEmployees((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));

        $("#variableCountEmployee").text(data.length);

        let selectors = $(".select-employee");
        let table = $("#tableEmployee > tbody");
        table.empty();
        selectors.empty();
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <th>${i + 1}</th>
          <td>${data[i].name}</td>
        </tr>`);
        }
      }
    });
  }
  //Create
  $("#btn-c-employee").click(function () {

    let employee = new MyApiV1.EmployeeView();
    employee.id = 0;
    employee.name = $('#inputEmployeeName').val();

    let opts = {
      'employeeView': employee // EmployeeView | 
    };
    employeeApi.createEmployee(opts, (error, data, response) => {
      if (error) {
        console.error(JSON.stringify(response['body']));
      } else {
        console.log('Create Employee');
        UpdateEmployee();
      }
    });

    UpdateEmployee();
  });
  //Delete
  $("#btn-d-employee").click(function () {

    let employeeId = $("#formDeleteEmployeeEmployee").val() // Number | 
    employeeApi.deleteEmployee(employeeId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Delet Employee');
        UpdateEmployee();
      }
    });
  });

  //Department================================
  //Get
  function UpdateDepartment() {
    departmentApi.getDepartments(companyId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));

        departments = data;
        DepartmentCharts(departments);

        let selectors = $(".select-department");
        let table = $("#tableDepartment > tbody");
        selectors.empty();
        table.empty();
        let sumDepartmentBudget = 0;
        for (let i = 0; i < data.length; i++) {
          selectors.append(`<option value="${data[i].id}">${data[i].name}</option>`);
          table.append(`<tr>
          <td style="display:none;">${data[i].id}</td>
          <th>${i + 1}</th>
          <td>${data[i].name}</td>
          <td>${data[i].budget}</td>
        </tr>`);

          sumDepartmentBudget += data[i].budget;
        }
        $("#variableCompanyBidget").text(sumDepartmentBudget);
      }
    });
  }
  //Create
  $("#btn-c-department").click(function () {

    let department = new MyApiV1.DepartmentView();
    department.id = 0;
    department.name = $('#formCreateDepartmentName').val();
    department.budget = $('#formCreateDepartmentBuget').val();;

    let opts = {
      'departmentView': department // DepartmentView | 
    };
    departmentApi.createDepartment(companyId, opts, (error, data, response) => {
      if (error) {
        console.error(JSON.stringify(response['body']));
      } else {
        console.log('Create Department');
        UpdateDepartment();
      }
    });
  });
  //Delete
  $("#btn-d-department").click(function () {
    let opts = {
      'departmnetId': $("#formDeleteDepartmentSelect").val() // Number | 
    };
    departmentApi.deleteDepartment(companyId, opts, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Delet Department');
        UpdateDepartment();
      }
    });
  });
  //Add employee to department
  $("#btn-u-addEmployee").click(function () {
    let departmnetId = $("#departmentForAddedEmployee").val();// Number | 
    let employeeId = $("#employeAddedToDepartment").val(); // Number | 
    empDepartmentApi.hireEmployee(companyId, departmnetId, employeeId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('add to depertment');
        UpdateDepartment();
      }
    });
  });

  //TODO: BugetPlan=================================
  //Get
  $("#selectUpdateBugetPlanDeperatment").change(function () {
    console.log("click");
    let departmnetId = $("#selectUpdateBugetPlanDeperatment").val();


    bugetPlanApi.getBugetPlan(companyId, departmnetId, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(data));
        let bugetPlanInst = data;

        $("#monthJanuary").val(bugetPlanInst.january);
        $("#monthFebruary").val(bugetPlanInst.february);
        $("#monthMarch").val(bugetPlanInst.march);
        $("#monthApril").val(bugetPlanInst.april);
        $("#monthMay").val(bugetPlanInst.may);
        $("#monthJune").val(bugetPlanInst.june);
        $("#monthJuly").val(bugetPlanInst.july);
        $("#monthAugust").val(bugetPlanInst.august);
        $("#monthSeptember").val(bugetPlanInst.september);
        $("#monthOctober").val(bugetPlanInst.october);
        $("#monthNovember").val(bugetPlanInst.november);
        $("#monthDecember").val(bugetPlanInst.december);
      }
    });
  });

  //UpdateBugetPlan
  $("#btn-u-bugetPlan").click(function () {

    let departmnetId = $("#selectUpdateBugetPlanDeperatment").val();

    bugetPlanApi.getBugetPlan(companyId, departmnetId, (error, bugetPlan, response) => {
      if (error) {
        console.error(error);
      } else {

        let bugetPlanInst = new MyApiV1.BugetPlanView();

        bugetPlanInst.january = $("#monthJanuary").val();
        bugetPlanInst.february = $("#monthFebruary").val();
        bugetPlanInst.march = $("#monthMarch").val();
        bugetPlanInst.april = $("#monthApril").val();
        bugetPlanInst.may = $("#monthMay").val();
        bugetPlanInst.june = $("#monthJune").val();
        bugetPlanInst.july = $("#monthJuly").val();
        bugetPlanInst.august = $("#monthAugust").val();
        bugetPlanInst.september = $("#monthSeptember").val();
        bugetPlanInst.october = $("#monthOctober").val();
        bugetPlanInst.november = $("#monthNovember").val();
        bugetPlanInst.december = $("#monthDecember").val();

        let opts = {
          'bugetPlanView': bugetPlanInst // BugetPlanView | 
        };
        bugetPlanApi.updateBugetPlan(companyId, departmnetId, bugetPlan.id, opts, (error, data, response) => {
          if (error) {
            console.error(error);
          } else {
            console.log(JSON.stringify(data));
          }
        });
      }
    });
  });



  function UpdateExpenseSelector() {
    let employeeId = $("#formFindEmployee").val(); // Number |
    if (employeeId != null) {
      expEmployeeApi.getExpenses(employeeId, (error, data, response) => {
        if (error) {
          console.error(error);
        } else {
          $("#findExpenseDelet").empty();
          for (let i = 0; i < data.length; i++) {
            $("#findExpenseDelet").append(`<option value="${data[i].id}">${data[i].amount} ${data[i].date}</option>`);
          }
        }
      });
    }
  }
  function UpdateEmployeeSelector() {
    let departmentId = $("#formFindDeparetment").val();
    if (departmentId != null) {
      empDepartmentApi.getEmployeesInDepartment(companyId, departmentId, (error, data, response) => {
        if (error) {
          console.error(error);
        }
        else {
          $("#formFindEmployee").empty();
          $("#findExpenseDelet").empty();
          for (let i = 0; i < data.length; i++) {
            $("#formFindEmployee").append(`<option value="${data[i].id}">${data[i].name}</option>`);
          }
          UpdateExpenseSelector();
        }
      });
    }
  }
  $("#formFindDeparetment").change(UpdateEmployeeSelector);
  $("#formFindEmployee").change(UpdateExpenseSelector);

  $("#btn-d-expense").click(function () {
    let deletExpenseId = $("#findExpenseDelet").val();
    let employeeId = $("#formFindEmployee").val();
    expEmployeeApi.deleteExpense(deletExpenseId, "null", (error, data, response) => {
      if (error) {
        console.error(error);
      }
      else {
        UpdateExpense();
        UpdateEmployeeSelector();
      }
    });
  });
});


function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function DepartmentCharts(departments) {
  let labels = [];
  let budgets = [];
  let people = [];
  let bg = [];
  for (let i = 0; i < departments.length; ++i) {
    labels.push(departments[i].name);
    budgets.push(departments[i].budget);

    empDepartmentApi.getEmployeesInDepartment(companyId, departments[i].id, (error, data, response) => {
      people.push(data.length);
    });

    bg.push(getRandomColor());
  }

  departmentPeopleChart.data = {
    labels: labels,
    datasets: [{
      label: 'departments people',
      data: people,
      backgroundColor: bg,
      hoverOffset: 4
    }]
  };
  departmentBudgetChart.data = {
    labels: labels,
    datasets: [{
      label: 'departments budget',
      data: budgets,
      backgroundColor: bg,
      hoverOffset: 4
    }]
  };

  departmentBudgetChart.update();
  departmentPeopleChart.update();
}

