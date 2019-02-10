(() => {
const columnNames = [
    'last_name',
    'first_name',
    'birth_day',
    'birth_month',
    'birth_year',
    'residence',
    'rating',
    'title',
    'id_fide'
];
const numberColumns = ['birth_day', 'birth_month', 'birth_year', 'rating', 'id_fide'];
const columnsCount = columnNames.length + 1;
const tableContent = document.querySelector('.players tbody');
const headerClickHandler = event => {
    const rows = Array.from(tableContent.querySelectorAll('tr:not(:first-child)'));
    const columnIndex = event.target.cellIndex;
    let sortFunction;
    if (columnIndex === 0) {
        sortFunction = (r1, r2) => {
            const r1marked = r1.classList.contains('marked');
            const r2marked = r2.classList.contains('marked');
            if (r1marked && !r2marked) {
                return 1;
            } else if (!r1marked && r2marked) {
                return -1;
            } else {
                return 0;
            }

        };
    } else {
        const columnName = columnNames[columnIndex - 1];
        const input = 'input[name="' + columnName + '[]' + '"]';
        const modifier = columnName === 'rating' ? -1 : 1;
        sortFunction = (r1, r2) => {
            let v1 = r1.querySelector(input).value;
            let v2 = r2.querySelector(input).value;
            if (v1 === v2) {
                return 0;
            } else if (v1 === '') {
                return 1;
            } else if (v2 === '') {
                return -1;
            } else if (numberColumns.includes(columnName)) {
                v1 = Number(v1);
                v2 = Number(v2);
            }
            return (v1 < v2 ? -1 : 1) * modifier;
        };
    }
    rows.sort(sortFunction);
    rows.forEach((row, index) => {
        row.querySelector('td').innerText = index + 1;
        tableContent.appendChild(row);
    });
};
tableContent.querySelectorAll('tr:first-child > td')
    .forEach(headerElement => headerElement.addEventListener('click', headerClickHandler));
const keyboardHandler = event => {
    const code = event.code;
    const target = event.target;
    const targetName = target.name;
    const cell = target.parentNode;
    const row = cell.parentNode;
    const nextRow = row.nextSibling;
    if (['ArrowUp', 'ArrowDown'].includes(code) || code.includes('Enter')) {
        event.preventDefault();
        if (document.getElementById('autocomplete')) {
            return autocompleteSelect(code);
        }
    }
    if (code === 'ArrowUp' && row.previousSibling.childNodes.length) {
        row.previousSibling.querySelector('input[name="' + targetName + '"').focus();
    } else if (code === 'ArrowDown' && nextRow) {
        nextRow.querySelector('input[name="' + targetName + '"]').focus();
    } else if (code === 'Space' && targetName !== 'residence[]') {
        event.preventDefault();
        if (cell.nextSibling) {
            cell.nextSibling.firstChild.focus();
        } else if (nextRow) {
            nextRow.firstChild.nextSibling.firstChild.focus();
        }
    } else if (code === 'Insert') {
        addRow();
    } else if (code === 'Delete' && Array.from(row.querySelectorAll('input')).filter(input => input.value !== '').length === 0) {
        event.preventDefault();
        if (nextRow) {
            nextRow.firstChild.nextSibling.firstChild.focus();
        } else if (row.previousSibling.childNodes.length) {
            row.previousSibling.firstChild.nextSibling.firstChild.focus();
        } else {
            return;
        }
        tableContent.removeChild(row);
        Array.from(tableContent.querySelectorAll('tr:not(:first-of-type) > td:first-of-type'))
            .forEach((cell, index) => cell.textContent = index + 1);
    } else if (code === 'Escape') {
        removeAutocomplete();
    }
};
const autocompleteSelect = code => {
    const autocomplete = document.getElementById('autocomplete');
    if (!autocomplete) {
        return;
    }
    const selected = autocomplete.querySelector('.selected');
    if (selected) {
        if (code.includes('Enter')) {
            return selected.firstChild.click();
        }
        selected.classList.remove('selected');
        if (code === 'ArrowDown') {
            if (selected.nextSibling) {
                selected.nextSibling.classList.add('selected');
            } else {
                autocomplete.firstChild.classList.add('selected');
            }
        } else if (code === 'ArrowUp') {
            if (selected.previousSibling) {
                selected.previousSibling.classList.add('selected');
            } else {
                autocomplete.lastChild.classList.add('selected');
            }
        }
    } else {
        if (code === 'ArrowDown') {
            autocomplete.firstChild.classList.add('selected');
        } else if (code === 'ArrowUp') {
            autocomplete.lastChild.classList.add('selected');
        }
    }
    autocomplete.querySelector('.selected').scrollIntoViewIfNeeded();
};
let currentRow;
const removeAutocomplete = () => {
    const autocomplete = document.getElementById('autocomplete');
    if (autocomplete) {
        autocomplete.remove();
    }
};
const messageBoard = document.querySelector('.message-board');
const displayMessage = (message, type = '') => {
    const messageBox = document.createElement('div');
    messageBox.innerText = message;
    messageBox.classList.add('message');
    if (type !== '') {
        messageBox.classList.add(type);
    }
    messageBox.addEventListener('click', event => event.target.remove());
    messageBoard.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 5000);
};
const englishLetters = new RegExp('^[a-z]+', 'i');
const autocompleteClickHandler = event => {
    const selectedRow = event.target.parentNode;
    let selectedValues = Array.from(selectedRow.querySelectorAll('td')).map(td => td.innerText);
    const ids = Array.from(document.querySelectorAll('.players td:last-child input')).map(input => input.value);
    ids.splice(currentRow.firstChild.innerText - 1);
    const id = selectedValues[8];
    const index = ids.lastIndexOf(id) + 1;
    if (index) {
        return displayMessage('Этот игрок уже есть в списке под номером ' + index + '.');
    }
    if (englishLetters.test(selectedValues[0])) {
        const localPlayer = localRating.find(player => player[8] === Number(id));
        if (localPlayer) {
            selectedValues = localPlayer;
        }
    }
    currentRow.querySelectorAll('input').forEach((input, index) => input.value = selectedValues[index]);
    removeAutocomplete();
    if (!currentRow.nextSibling) {
        addRow();
    }
    currentRow.nextSibling.querySelector('input').focus();
};
const autocompleteHandler = event => {
    removeAutocomplete();
    const target = event.target;
    if (target.value.length === 0) {
        return;
    }
    const value = target.value[0].toUpperCase() + target.value.slice(1).toLowerCase();
    const ratingList = englishLetters.test(value) ? rating : localRating;
    const players = ratingList.filter(player => player[0].startsWith(value)).slice(0, 20 + value.length ** 4);
    if (players.length === 0) {
        return;
    }
    const autocomplete = document.createElement('table');
    autocomplete.id = 'autocomplete';
    players.forEach(player => {
        const tr = document.createElement('tr');
        player.forEach(field => {
            const td = document.createElement('td');
            td.innerText = field;
            tr.appendChild(td);
        });
        tr.addEventListener('click', autocompleteClickHandler);
        autocomplete.appendChild(tr);
    });
    currentRow = target.parentNode.parentNode;
    autocomplete.style.top = currentRow.parentNode.parentNode.offsetTop + currentRow.offsetTop + currentRow.offsetHeight + 'px';
    autocomplete.style.marginLeft = target.parentNode.offsetLeft + 'px';
    autocomplete.style.width = currentRow.offsetWidth - target.parentNode.offsetLeft + 'px';
    document.querySelector('body').appendChild(autocomplete);
};
const rowTagClickHandler = event => {
    const classList = event.target.parentNode.classList;
    if (classList.contains('marked')) {
        classList.remove('marked');
    } else {
        classList.add('marked');
    }
};
const defaultPlayersCount = 10;
const maxPlayersCount = 300;
const currentYear = new Date().getFullYear();
const addRow = () => {
    const rowIndex = tableContent.querySelectorAll('tr').length;
    if (rowIndex > maxPlayersCount) {
        return;
    }
    const row = document.createElement('tr');
    if (markedRows.includes(rowIndex)) {
        row.classList.add('marked');
    }
    for (let columnIndex = 1; columnIndex <= columnsCount; ++columnIndex) {
        const cell = document.createElement('td');
        if (columnIndex === 1) {
            cell.textContent = rowIndex;
            cell.addEventListener('click', rowTagClickHandler);
        }
        if (columnIndex > 1) {
            const input = document.createElement('input');
            const name = columnNames[columnIndex - 2];
            input.name = name + '[]';
            if (numberColumns.includes(name)) {
                input.type = 'number';
                input.autocomplete = 'off';
                input.min = 0;
                if (name === 'birth_day') {
                    input.max = 31;
                } else if (name === 'birth_month') {
                    input.max = 12;
                } else if (name === 'birth_year') {
                    input.max = currentYear;
                    input.min = currentYear - 200;
                } else if (name === 'rating') {
                    input.max = 4000;
                } else if (name === 'id_fide') {
                    input.max = 99999999;
                }
            } else {
                input.type = 'text';
                input.maxLength = 26;
            }
            input.addEventListener('keydown', keyboardHandler);
            if (name === 'last_name') {
                input.autocomplete = 'off';
                input.addEventListener('input', autocompleteHandler);
            }
            cell.appendChild(input);
        }
        row.appendChild(cell);
    }
    tableContent.appendChild(row);
};

let markedRows = [];
fetch('http://localhost/saved.json')
    .then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .then(saved => {
        if (!saved) {
            for (let i = 1; i <= defaultPlayersCount; ++i) {
                addRow();
            }
            return;
        }
        if (saved.hasOwnProperty('marked')) {
            markedRows = saved.marked.split(',').map(Number);
        }
        const savedColumnNames = columnNames.filter(name => saved.hasOwnProperty(name));
        const savedLinesCount = saved[savedColumnNames[0]].length;
        for (let i = 1; i <= savedLinesCount; ++i) {
            addRow();
        }
        savedColumnNames
            .forEach(name => tableContent.querySelectorAll('input[name="' + name + '[]"]')
                .forEach((input, index) => input.value = saved[name][index]));
        document.querySelectorAll('.tournament-info input').forEach(field => {
            if (saved.hasOwnProperty(field.name)) {
                field.value = saved[field.name];
            }
        });

    })
    .catch(() => {
        displayMessage('Не удалось загрузить сохранённые данные с сервера.', 'error');
        for (let i = 1; i <= defaultPlayersCount; ++i) {
            addRow();
        }
    });

let localRating = [];
fetch('http://localhost/local_rating.json')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            displayMessage('Областной рейтинг-лист не найден.', 'error');
        }
    })
    .then(ratingList => {
        if (ratingList) {
            localRating = ratingList;
            displayMessage('Загружен областной рейтинг-лист.', 'success');
        }
    })
    .catch(() => displayMessage('Не удалось загрузить областной рейтинг-лист с сервера.', 'error'));
let rating = [];
fetch('http://localhost/rating.csv')
    .then(response => {
        if (response.ok) {
            return response.text();
        } else if (response.status === 404) {
            displayMessage('Российский рейтинг-лист не найден.', 'error')
        }
    })
    .then(csv => {
        if (csv) {
            rating = csv.split('\r\n').map(line => {
                const values = line.split(';'); // id name title rating year flags
                const title = values[2] !== '' ? values[2].toUpperCase().replace('M', 'I') + 'M' : '';
                return values[1].split(', ').concat('', '', values[4], '', values[3], title, values[0]);
            });
            displayMessage('Загружен российский рейтинг-лист.', 'success');
        }
    })
    .catch(() => displayMessage('Не удалось загрузить российский рейтинг-лист с сервера.', 'error'));

const submitHandler = event => {
    event.preventDefault();
    const data = new FormData(event.target);
    data.append('marked', Array.from(tableContent.querySelectorAll('tr.marked > td:first-child')).map(td => td.innerText).join(','));
    fetch('http://localhost', {
        body: data,
        method: 'POST'
    })
    .then(response => response.text())
    .then(text => displayMessage(text, 'success'))
    .catch(() => displayMessage('Сохранение невозможно, сервер недоступен.', 'error'));
};
document.querySelector('form').addEventListener('submit', submitHandler);
const cleanHandler = event => {
    event.preventDefault();
    removeAutocomplete();
    markedRows = [];
    while (tableContent.childElementCount > 1) {
        tableContent.lastElementChild.remove();
    }
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    document.getElementById('tournament-rounds-count').value = 9;
    for (let i = 1; i <= defaultPlayersCount; ++i) {
        addRow();
    }
};
document.querySelector('.clean').addEventListener('click', cleanHandler);
})();