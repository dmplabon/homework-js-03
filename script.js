document.addEventListener("DOMContentLoaded", () => {
  // Calculator state
  let currentInput = "0";
  let firstOperand = null;
  let selectedOperator = null;
  let waitingForSecondOperand = false;

  const display = document.getElementById("display");
  const expression = document.getElementById("expression");
  const keys = document.getElementById("keys");

  // Stop early and show a useful message if the HTML IDs do not match.
  if (!display || !expression || !keys) {
    console.error("Calculator setup error: check that index.html contains #display, #expression and #keys.");
    return;
  }

  function updateDisplay() {
    display.textContent = currentInput;
  }

  function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";
    return String(Number(number.toPrecision(11)));
  }

  function calculate(a, operator, b) {
    switch (operator) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/":
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
      default: return b;
    }
  }

  function resetCalculator(clearExpression = true) {
    currentInput = "0";
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = false;
    if (clearExpression) expression.textContent = "";
    updateDisplay();
  }

  function inputDigit(digit) {
    if (waitingForSecondOperand || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      currentInput = digit;
      waitingForSecondOperand = false;
    } else {
      currentInput = currentInput === "0" ? digit : currentInput + digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (waitingForSecondOperand || currentInput === "Error" || currentInput === "Cannot divide by zero") {
      currentInput = "0.";
      waitingForSecondOperand = false;
    } else if (!currentInput.includes(".")) {
      currentInput += ".";
    }
    updateDisplay();
  }

  function chooseOperator(nextOperator) {
    if (!Number.isFinite(Number(currentInput))) return;
    const inputValue = Number(currentInput);

    if (selectedOperator && !waitingForSecondOperand) {
      try {
        const result = calculate(firstOperand, selectedOperator, inputValue);
        currentInput = formatNumber(result);
        firstOperand = result;
        updateDisplay();
      } catch (error) {
        currentInput = error.message;
        updateDisplay();
        selectedOperator = null;
        firstOperand = null;
        waitingForSecondOperand = true;
        return;
      }
    } else {
      firstOperand = inputValue;
    }

    selectedOperator = nextOperator;
    waitingForSecondOperand = true;
    expression.textContent = `${formatNumber(firstOperand)} ${nextOperator}`;
  }

  function performCalculation() {
    if (selectedOperator === null || waitingForSecondOperand) return;

    const secondOperand = Number(currentInput);
    const previous = `${formatNumber(firstOperand)} ${selectedOperator} ${formatNumber(secondOperand)} =`;

    try {
      currentInput = formatNumber(calculate(firstOperand, selectedOperator, secondOperand));
      expression.textContent = previous;
    } catch (error) {
      currentInput = error.message;
      expression.textContent = "";
    }

    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = true;
    updateDisplay();
  }

  function applyPercent() {
    if (!Number.isFinite(Number(currentInput))) return;
    currentInput = formatNumber(Number(currentInput) / 100);
    updateDisplay();
  }

  keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.value !== undefined) inputDigit(button.dataset.value);
    else if (button.dataset.op) chooseOperator(button.dataset.op);
    else if (button.dataset.action === "decimal") inputDecimal();
    else if (button.dataset.action === "equals") performCalculation();
    else if (button.dataset.action === "clear") resetCalculator();
    else if (button.dataset.action === "percent") applyPercent();
  });

  // Keyboard shortcuts work when the user is not typing into an input field.
  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select")) return;

    if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
    else if (event.key === ".") inputDecimal();
    else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
    else if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      performCalculation();
    } else if (event.key === "Escape") resetCalculator();
    else if (event.key === "Backspace" && !waitingForSecondOperand) {
      currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
      updateDisplay();
    }
  });

  // Quick Tool 1: Find even or odd.
  document.getElementById("even-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const rawValue = document.getElementById("even-input").value.trim();
    const number = Number(rawValue);
    const result = document.getElementById("even-result");

    if (rawValue === "" || !Number.isInteger(number)) {
      result.textContent = "Result: Please enter a whole number.";
      return;
    }
    result.textContent = `Result: ${number} is ${number % 2 === 0 ? "Even" : "Odd"}.`;
  });

  // Quick Tool 2: Find square.
  document.getElementById("square-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const rawValue = document.getElementById("square-input").value.trim();
    const number = Number(rawValue);
    const result = document.getElementById("square-result");

    if (rawValue === "" || !Number.isFinite(number)) {
      result.textContent = "Result: Please enter a valid number.";
      return;
    }
    result.textContent = `Result: ${number}² = ${formatNumber(number * number)}`;
  });

  // Quick Tool 3: Find the maximum of two numbers.
  document.getElementById("max-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const rawOne = document.getElementById("max-input-one").value.trim();
    const rawTwo = document.getElementById("max-input-two").value.trim();
    const result = document.getElementById("max-result");

    if (rawOne === "" || rawTwo === "") {
      result.textContent = "Result: Please enter both numbers.";
      return;
    }

    const one = Number(rawOne);
    const two = Number(rawTwo);
    result.textContent = `Result: Maximum is ${formatNumber(Math.max(one, two))}.`;
  });

  updateDisplay();
});
