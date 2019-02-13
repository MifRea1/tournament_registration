(() => {
const inputHandler = event => {
    const value = event.target.value;
    if (value.length) {
        const anchor = event.target.previousElementSibling;
        anchor.href = anchor.href.split('?')[0] + '?name=' + value;
    }
};
document.querySelector('input[name="filename"]').addEventListener('input', inputHandler);
})();