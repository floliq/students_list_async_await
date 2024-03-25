(function () {
  const table = document.querySelector('.students__elements');
  const addStudentButton = document.querySelector('.students__add');
  const surnameInput = document.getElementById('surname');
  const nameInput = document.getElementById('name');
  const fathernameInput = document.getElementById('fathername');
  const birthInput = document.getElementById('birth');
  const startInput = document.getElementById('start');
  const facultyInput = document.getElementById('faculty');
  const inputs = document.querySelectorAll('.students__input-add');
  const NOW = new Date();
  const NOW_YEAR = NOW.getFullYear();
  const NOW_MONTH = NOW.getMonth();
  const sortsBtns = document.querySelectorAll('.sort');
  const filterBtn = document.querySelector('.students__confirm');
  const filterResetBtn = document.querySelector('.students__reset');
  let result = [];
  let isFiltered = false;
  const filterInputs = document.querySelectorAll('.students__input-filter');
  let studentsList = [];

  function getFirstLetter(str) {
    if (str === '') return str;
    const strOne = str.toLowerCase().trim();
    const strTwo = strOne[0].toUpperCase() + strOne.slice(1);
    return strTwo;
  }

  function getAge(birthDate) {
    const date = new Date(birthDate);
    let age = Number(NOW_YEAR - date.getFullYear());
    const month = Number(NOW_MONTH - date.getMonth());
    let text = '';
    if (month < 0 || (month === 0 && NOW.getDate() - date.getDate() < 0)) {
      age--;
    }
    if (age < 5 && age > 20) text = 'лет';
    else {
      const count = age % 10;
      if (count === 1) {
        text = 'год';
      } else if (count >= 2 && count <= 4) {
        text = 'года';
      } else {
        text = 'лет';
      }
    }
    return { age, text };
  }

  function getEducationInfo(startYear) {
    const endYear = Number(startYear) + 4;
    let course = NOW_YEAR - startYear;
    if (course > 4 || (course === 4 && NOW_MONTH >= 9)) {
      course = 'закончил';
    } else {
      course += ' курс';
    }
    return { endYear, course };
  }

  function clearTable() {
    const rows = document.querySelectorAll('.student');
    rows.forEach((row) => {
      row.remove();
    });
  }

  function resetSort(clickedSort) {
    sortsBtns.forEach((sortBtn) => {
      const sortBtnClass = sortBtn.classList[1];
      if (sortBtnClass !== clickedSort) {
        sortBtn.classList.replace(sortBtnClass, sortBtnClass.replace('-up', ''));
        sortBtn.classList.replace(sortBtnClass, sortBtnClass.replace('-down', ''));
        sortBtn.style.color = '';
      }
    });
  }

  function renderStudentsTable(studentArray) {
    clearTable();
    for (const student of studentArray) {
      getStudentItem(student);
    }
  }

  async function getAllStudents() {
    const responce = await fetch('http://localhost:3000/api/students');
    studentsList = await responce.json();
    console.log(studentsList);
    renderStudentsTable(studentsList);
  }

  function getStudentItem(studentObj) {
    const row = document.createElement('tr');
    row.classList.add('student');
    const col1 = document.createElement('td');
    const col2 = document.createElement('td');
    const col3 = document.createElement('td');
    const col4 = document.createElement('td');
    const col5 = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('student__remove', 'btn', 'btn-danger', 'rounded');
    removeBtn.textContent = 'Удалить';
    const birthYear = new Date(studentObj.birthday).getFullYear();
    let birthMonth = new Date(studentObj.birthday).getMonth() + 1;
    let birthDay = new Date(studentObj.birthday).getDate();
    if (birthMonth < 10) {
      birthMonth = `0${birthMonth}`;
    }
    if (birthDay < 10) {
      birthDay = `0${birthDay}`;
    }
    const ageInfo = getAge(studentObj.birthday);
    const edInfo = getEducationInfo(studentObj.studyStart);
    const fullname = `${studentObj.surname} ${studentObj.name} ${studentObj.lastname}`;
    col1.textContent = fullname;
    col2.textContent = studentObj.faculty;
    col3.textContent = `${birthDay}.${birthMonth}.${birthYear} (${ageInfo.age} ${ageInfo.text})`;
    col4.textContent = `${studentObj.studyStart}-${edInfo.endYear} (${edInfo.course})`;
    col5.append(removeBtn);
    row.append(col1);
    row.append(col2);
    row.append(col3);
    row.append(col4);
    row.append(col5);
    table.append(row);

    removeBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const shouldDelete = window.confirm('Вы уверены, что хотете удалить студента?');
      if (shouldDelete) {
        await fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
          method: 'DELETE',
        });
        resetSort();
        getAllStudents();
      }
    });
  }

  function validation() {
    const birthYear = new Date(birthInput.value);
    let isValid = true;
    for (const input of inputs) {
      const IDInput = input.id;
      const element = document.querySelector(`.${IDInput}`);
      if (!input.value || input.value.trim() === '') {
        element.textContent = 'Неправильный ввод данных';
        input.value = '';
        isValid = false;
      } else element.textContent = '';
    }
    if (birthYear.getFullYear() < 1900 || birthYear.getFullYear() > NOW_YEAR) {
      document.querySelector('.birth').textContent = `Дата не в промежутке от 1900 до ${NOW_YEAR} год`;
      birthInput.value = '';
      isValid = false;
    }
    if (startInput.value < 2000 || startInput.value > NOW_YEAR) {
      document.querySelector('.start').textContent = `Год не в промежутке от 2000 до ${NOW_YEAR} год`;
      startInput.value = '';
      isValid = false;
    }
    return isValid;
  }

  function getDateFormat(date) {
    const birth = new Date(date);
    const year = birth.getFullYear();
    let month = birth.getMonth() + 1;
    let day = birth.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${month}` : day;
    return new Date(`${year}-${month}-${day}`);
  }

  addStudentButton.addEventListener('click', async (e) => {
    e.preventDefault();
    if (validation()) {
      const surname = getFirstLetter(surnameInput.value);
      const name = getFirstLetter(nameInput.value);
      const lastname = getFirstLetter(fathernameInput.value);
      const birthday = getDateFormat(birthInput.value);
      const start = startInput.value;
      const faculty = facultyInput.value.toUpperCase();
      await fetch('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify({
          surname: surname.trim(),
          name: name.trim(),
          lastname: lastname.trim(),
          birthday,
          studyStart: Number(start),
          faculty: faculty.trim(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      inputs.forEach((input) => {
        input.value = '';
      });
      getAllStudents();
    }
  });

  const sortStudent = (arr, prop, dir = false) => arr.sort((a, b) => ((!dir ? a[prop] < b[prop]
    : a[prop] > b[prop])) ? -1 : 0);

  function sort(event) {
    const target = event.target;
    const firstClass = target.classList[1];
    if (!firstClass.includes('up') && !firstClass.includes('down')) {
      target.classList.replace(firstClass, `${firstClass}-up`);
      target.style.color = 'green';
    } else if (firstClass.includes('up')) {
      target.classList.replace(firstClass, firstClass.replace('up', 'down'));
      target.style.color = 'red';
    } else {
      target.classList.replace(firstClass, firstClass.replace('down', 'up'));
      target.style.color = 'green';
    }
    const newClass = target.classList[1];
    let standartClass = newClass.replace('-down', '');
    standartClass = standartClass.replace('-up', '');
    if (newClass.includes('up') && !isFiltered) {
      sortStudent(studentsList, standartClass, false);
      renderStudentsTable(studentsList);
    } else if (newClass.includes('up') && isFiltered) {
      sortStudent(result, standartClass, false);
      renderStudentsTable(result);
    } else if (newClass.includes('down') && !isFiltered) {
      sortStudent(studentsList, standartClass, true);
      renderStudentsTable(studentsList);
    } else {
      sortStudent(result, standartClass, true);
      renderStudentsTable(result);
    }
    resetSort(newClass);
  }

  sortsBtns.forEach((sortBtn) => sortBtn.addEventListener('click', sort));

  function filter(arr, prop, value) {
    result = [];
    isFiltered = true;
    const copy = [...arr];
    for (const item of copy) {
      if (typeof prop === 'object') {
        for (const pr of prop) {
          if (String(item[pr]).toLowerCase().includes(value) === true) {
            result.push(item);
            break;
          }
        }
      }
      if (prop === 'end' && Number(item.studyStart) === value - 4) result.push(item);
      if (String(item[prop]).includes(value)) result.push(item);
    }
    return result;
  }

  function filterAll(event) {
    event.preventDefault();
    const fullnameFilter = document.getElementById('fullname-filter').value.toLowerCase();
    const facultyFilter = document.getElementById('faculty-filter').value.toUpperCase();
    const startFilter = document.getElementById('start-filter').value.toString();
    const endFilter = document.getElementById('end-filter').value.toString();
    let newArray = [...studentsList];
    if (fullnameFilter !== '') newArray = filter(newArray, ['surname', 'name', 'fathername'], fullnameFilter);
    if (facultyFilter !== '') newArray = filter(newArray, 'faculty', facultyFilter);
    if (startFilter !== '') newArray = filter(newArray, 'studyStart', startFilter);
    if (endFilter !== '') newArray = filter(newArray, 'end', endFilter);
    renderStudentsTable(newArray);
  }

  filterInputs.forEach((filterInput) => {
    filterInput.addEventListener('input', filterAll);
  });

  filterBtn.addEventListener('click', filterAll);

  filterResetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderStudentsTable(studentsList);
    filterInputs.forEach((filterInput) => {
      filterInput.value = '';
    });
    isFiltered = false;
  });

  getAllStudents();
}());
