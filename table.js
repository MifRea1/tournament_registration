(() => {
const inputNames = [
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
const columnsCount = inputNames.length + 1;
const tableContent = document.querySelector('.players tbody');
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
        selected.className = '';
        if (code === 'ArrowDown') {
            if (selected.nextSibling) {
                selected.nextSibling.className = 'selected';
            } else {
                autocomplete.firstChild.className = 'selected';
            }
        } else if (code === 'ArrowUp') {
            if (selected.previousSibling) {
                selected.previousSibling.className = 'selected';
            } else {
                autocomplete.lastChild.className = 'selected';
            }
        }
    } else {
        if (code === 'ArrowDown') {
            autocomplete.firstChild.className = 'selected';
        } else if (code === 'ArrowUp') {
            autocomplete.lastChild.className = 'selected';
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
const englishLetters = new RegExp('^[a-z]+', 'i');
const autocompleteClickHandler = event => {
    const selectedRow = event.target.parentNode;
    let selectedValues = Array.from(selectedRow.querySelectorAll('td')).map(td => td.innerText);
    if (englishLetters.test(selectedValues[0])) {
        const localPlayer = localRating.find(player => player[8] === Number(selectedValues[8]));
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
const defaultPlayersCount = 10;
const maxPlayersCount = 300;
const currentYear = new Date().getFullYear();
const addRow = () => {
    const rowsCount = tableContent.querySelectorAll('tr').length;
    if (rowsCount > maxPlayersCount) {
        return;
    }
    const row = document.createElement('tr');
    for (let columnIndex = 1; columnIndex <= columnsCount; ++columnIndex) {
        const cell = document.createElement('td');
        if (columnIndex === 1) {
            cell.textContent = rowsCount;
        }
        if (columnIndex > 1) {
            const input = document.createElement('input');
            const name = inputNames[columnIndex - 2];
            input.name = name + '[]';
            if (['birth_day', 'birth_month', 'birth_year', 'rating', 'id_fide'].includes(name)) {
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

fetch('http://localhost/saved.json')
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        for (let i = 1; i <= defaultPlayersCount; ++i) {
            addRow();
        }
    })
    .then(saved => {
        if (!saved) {
            return;
        }
        const names = inputNames.filter(name => saved.hasOwnProperty(name));
        const savedLinesCount = saved[names[0]].length;
        for (let i = 1; i <= savedLinesCount; ++i) {
            addRow();
        }
        names.forEach(
            name => tableContent.querySelectorAll('input[name="' + name + '[]"]').forEach(
                (node, index) => {
                    if (saved.hasOwnProperty(name)) {
                        node.value = saved[name][index];
                    }
                }
            )
        );
    })
    .catch(() => alert('Не удалось загрузить сохранённые данные с сервера.'));

let localRating = [];
fetch('http://localhost/local_rating.json')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            alert('Областной рейтинг-лист не найден.');
        }
    })
    .then(ratingList => {
        if (ratingList) {
            localRating = ratingList;
        }
    })
    .catch(() => alert('Не удалось загрузить рейтинг-лист с сервера.'));
let rating = [];
fetch('http://localhost/rating.csv')
    .then(response => {
        if (response.ok) {
            return response.text();
        } else if (response.status === 404) {
            alert('Российский рейтинг-лист не найден.')
        }
    })
    .then(csv => {
        if (csv) {
            rating = csv.split('\r\n').map(line => {
                const values = line.split(';'); // id name title rating year flags
                const title = values[2] !== '' ? values[2].toUpperCase().replace('M', 'I') + 'M' : '';
                return values[1].split(', ').concat('', '', values[4], '', values[3], title, values[0]);
            });
        }
    });

const submitHandler = event => {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch('http://localhost', {
        body: data,
        method: 'POST'
    })
    .then(response => response.text())
    .then(text => alert(text));
};
document.querySelector('form').addEventListener('submit', submitHandler);
const cleanHandler = event => {
    event.preventDefault();
    while (tableContent.childElementCount > 1) {
        tableContent.lastElementChild.remove();
    }
    for (let i = 1; i <= defaultPlayersCount; ++i) {
        addRow();
    }
};
document.querySelector('.clean').addEventListener('click', cleanHandler);
})();