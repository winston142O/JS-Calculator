// Obtener elementos del DOM
const display = document.querySelector("#display");
const buttonsContainer = document.querySelector(".buttons");
const historyList = document.querySelector("#history-list");

// Variable para almacenar el último resultado
let lastAnswer = "";
let history = new Set(); // Set para evitar entradas duplicadas en el historial

// Definir los valores de los botones
const buttonValues = [
    "C", "(", ")", "/", 
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "DEL", "=", "ANS"
];

// Función para evaluar expresiones de manera segura
async function safeEvaluate(expression) {
    return new Promise((resolve) => {
        try {
            // Sanitizar la entrada para evitar caracteres inválidos
            let sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, "");
            if (!sanitizedExpression || /[+\-*/.]$/.test(sanitizedExpression)) {
                return reject("Error");
            }
            
            // Evaluar la expresión de manera segura
            const result = Function(`'use strict'; return (${sanitizedExpression})`)();
            lastAnswer = result; // Almacenar el último resultado
            
            // Agregar al historial sin duplicados
            history.add(`${expression} = ${result}`);
            updateHistory();
            
            resolve(result);
        } catch (error) {
            reject("Error");
        }
    });
}

// Función para manejar las acciones de los botones
async function appendNumber(value) {
    switch(value) {
        case "C":
            display.value = "";
            break;
            
        case "=":
            if (!display.value.trim()) return;
            const result = await safeEvaluate(display.value);
            display.value = result;
            break;
            
        case "DEL":
            if (display.value.length > 0) {
                display.value = display.value.substring(0, display.value.length - 1);
            }
            break;
            
        case "ANS":
            if (lastAnswer !== "" && !isNaN(lastAnswer)) {
                // Solo insertar la última respuesta si no es la misma que la actual
                if (display.value !== String(lastAnswer)) {
                    display.value += lastAnswer;
                }
            }
            break;
            
        default:
            display.value += value;
            break;
    }
}

// Función para actualizar el historial y evitar duplicados
function updateHistory() {
    historyList.innerHTML = "";
    Array.from(history).slice(-5).forEach(entry => { // Mostrar solo los últimos 5 cálculos únicos
        const li = document.createElement("li");
        li.textContent = entry;
        li.addEventListener("click", () => {
            display.value = entry.split(" = ")[0]; // Permitir reutilizar cálculos del historial
        });
        historyList.appendChild(li);
    });
}

// Crear los botones dinámicamente
const fragment = document.createDocumentFragment();

buttonValues.forEach(value => {
    const button = document.createElement("button");
    button.textContent = value;
    button.addEventListener("click", () => appendNumber(value));

    // Asignar clases para cada tipo de botón
    if (value === "DEL") button.classList.add("delete-btn");
    else if (value === "=") button.classList.add("equal-btn");
    else if (value === "C") button.classList.add("clear-btn");
    else if (["/", "*", "-", "+", "ANS"].includes(value)) button.classList.add("operation-btn");

    fragment.appendChild(button);
});

buttonsContainer.appendChild(fragment);
