const outputEl = document.getElementById('output');

function log(message) {
    outputEl.textContent += message + "\n";
    console.log(message);
}

function fetchData() {
    return new Promise((resolve) => {
        setTimeout(() => resolve("Data received"), 1000);
    });
}

async function load() {
    log("Before await");
    const data = await fetchData();
    log("After await: " + data);
}

load();
log("This log runs first!");
