const inputNames = [
    'last_name',
    'first_name',
    'middle_name',
    'birth_day',
    'birth_month',
    'birth_year',
    'residence',
    'rating'
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
    } else {
        console.log(event);
    }
};
const addRow = () => {
    const row = document.createElement('tr');
    for (let columnIndex = 1; columnIndex <= columnsCount; ++columnIndex) {
        const cell = document.createElement('td');
        if (columnIndex === 1) {
            const rowsCount = tableContent.querySelectorAll('tr').length;
            cell.textContent = rowsCount;
        }
        if (columnIndex > 1) {
            const input = document.createElement('input');
            input.name = inputNames[columnIndex - 2] + '[]';
            input.type = 'text';
            input.addEventListener('keydown', keyboardHandler);
            cell.appendChild(input);
        }
        row.appendChild(cell);
    }
    tableContent.appendChild(row);
};

for (let i = 1; i <= 10; ++i) {
    addRow();
}