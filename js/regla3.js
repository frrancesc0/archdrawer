document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('r3-type');
  const inputA = document.getElementById('r3-a');
  const inputB = document.getElementById('r3-b');
  const inputC = document.getElementById('r3-c');
  const inputX = document.getElementById('r3-x');

  function calculateRuleOfThree() {
    const a = parseFloat(inputA.value);
    const b = parseFloat(inputB.value);
    const c = parseFloat(inputC.value);

    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
      inputX.value = '';
      return;
    }

    let x = 0;
    const isDirect = typeSelect.value === 'directa';

    if (isDirect) {
      x = (b * c) / a;
    } else {
      if (c === 0) {
        inputX.value = '';
        return;
      }
      x = (a * b) / c;
    }

    inputX.value = Number.isInteger(x) ? x : parseFloat(x.toFixed(4));
  }

  [inputA, inputB, inputC].forEach(input => {
    input.addEventListener('input', calculateRuleOfThree);
  });

  typeSelect.addEventListener('change', calculateRuleOfThree);

  calculateRuleOfThree();
});