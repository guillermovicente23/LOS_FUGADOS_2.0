// Función auxiliar para formatear el número complejo (sin cambios)
function formatComplex(real, imag) {
    const r = parseFloat(real.toFixed(4));
    const i = parseFloat(imag.toFixed(4));

    if (r === 0 && i === 0) return '0';
    if (i === 0) return r.toString();

    let str = r === 0 ? '' : r.toString();
    const absI = Math.abs(i);
    const sign = i > 0 ? (r === 0 ? '' : ' + ') : ' - ';
    
    let imagPart = (absI === 1) ? 'i' : absI.toString() + 'i';

    if (r === 0) {
        return (i < 0 ? '-' : '') + imagPart;
    } else {
        return str + sign + imagPart;
    }
}

// *** SOLUCIÓN DEFINITIVA PARA EL ERROR DE MATHJAX ***
// Esta función espera a que MathJax esté completamente configurado antes de renderizar.
function renderMathJax() {
    const stepsDisplay = document.getElementById('stepsDisplay');
    const errorBox = document.getElementById('errorBox');
    
    // Si window.MathJax no está definido, el script no se cargó
    if (!window.MathJax) {
         errorBox.textContent = "Error CRÍTICO: MathJax no se cargó. Verifica tu conexión a Internet o que la URL del script sea correcta.";
         errorBox.classList.remove('hidden');
         return; // Salir de la función si MathJax no existe
    }
    
    // MathJax 3 garantiza que typesetPromise existe después de startup.promise.
    // Usamos MathJax.typesetPromise para renderizar el contenido dinámico.
    MathJax.startup.promise.then(() => {
        if (typeof MathJax.typesetPromise === 'function') {
            // Re-renderizar solo el contenedor de los pasos.
            MathJax.typesetPromise([stepsDisplay]).catch((err) => {
                console.error("Error al procesar MathJax:", err);
                errorBox.textContent = "Error interno al procesar fórmulas. Consulta la consola para más detalles.";
                errorBox.classList.remove('hidden');
            });
        }
    });
}

// Función principal de cálculo
function calculateComplexWithSteps(operation) {
    const a = parseFloat(document.getElementById('a_real').value) || 0;
    const b = parseFloat(document.getElementById('b_imag').value) || 0;
    const c = parseFloat(document.getElementById('c_real').value) || 0;
    const d = parseFloat(document.getElementById('d_imag').value) || 0;

    const Z1_str = formatComplex(a, b);
    const Z2_str = formatComplex(c, d);

    const resultDisplay = document.getElementById('resultDisplay');
    const stepsDisplay = document.getElementById('stepsDisplay');
    const errorBox = document.getElementById('errorBox');
    
    errorBox.classList.add('hidden');
    let stepsHTML = '<ul>';
    let resultReal, resultImag;

    try {
        // Lógica de cálculo (sin cambios, es correcta)
        switch (operation) {
            case 'add':
                stepsHTML += '<li><span class="step-formula">Fórmula:</span> $$(a+bi)+(c+di)=(a+c)+(b+d)i$$</li>';
                stepsHTML += `<li><span class="step-formula">Reemplazando:</span> $$(${Z1_str}) + (${Z2_str}) = (${a} + ${c}) + (${b} + ${d})i$$</li>`;
                resultReal = a + c;
                resultImag = b + d;
                stepsHTML += `<li><span class="step-formula">Calculando:</span> Sumamos Reales: $${a} + ${c} = ${resultReal}$. Sumamos Imaginarios: $${b} + ${d} = ${resultImag}$.</li>`;
                break;
            case 'subtract':
                 stepsHTML += '<li><span class="step-formula">Fórmula:</span> $$(a+bi)-(c+di)=(a-c)+(b-d)i$$</li>';
                 stepsHTML += `<li><span class="step-formula">Reemplazando:</span> $$(${Z1_str}) - (${Z2_str}) = (${a} - ${c}) + (${b} - ${d})i$$</li>`;
                 resultReal = a - c;
                 resultImag = b - d;
                 stepsHTML += `<li><span class="step-formula">Calculando:</span> Restamos Reales: $${a} - ${c} = ${resultReal}$. Restamos Imaginarios: $${b} - ${d} = ${resultImag}$.</li>`;
                 break;
            case 'multiply':
                stepsHTML += '<li><span class="step-formula">Fórmula:</span> $$(a+bi)(c+di) = (ac-bd)+(ad+bc)i$$</li>';
                stepsHTML += `<li><span class="step-formula">Reemplazando:</span> $$(${a} \\times ${c} - ${b} \\times ${d}) + (${a} \\times ${d} + ${b} \\times ${c})i$$</li>`;
                resultReal = (a * c) - (b * d);
                resultImag = (a * d) + (b * c);
                stepsHTML += `<li><span class="step-formula">Cálculo Real:</span> $${a*c} - ${b*d} = ${resultReal}$</li>`;
                stepsHTML += `<li><span class="step-formula">Cálculo Imaginario:</span> $${a*d} + ${b*c} = ${resultImag}$</li>`;
                break;
            case 'divide':
                const denominator = (c * c) + (d * d);
                if (denominator === 0) { throw new Error("División por cero. El denominador (Z2) es 0."); }
                stepsHTML += '<li><span class="step-formula">Estrategia:</span> Multiplicar por el conjugado ($c-di$).</li>';
                stepsHTML += `<li><span class="step-formula">Denominador:</span> $$c^2 + d^2 = ${c}^2 + ${d}^2 = ${denominator}$$</li>`;
                const numReal = (a * c) + (b * d);
                const numImag = (b * c) - (a * d);
                resultReal = numReal / denominator;
                resultImag = numImag / denominator;
                stepsHTML += `<li><span class="step-formula">Expresión Fraccionaria:</span> $$\\frac{${numReal} + ${numImag}i}{${denominator}}$$</li>`;
                break;
            default:
                throw new Error("Operación no reconocida.");
        }

        // Mostrar el resultado final
        const finalResultString = formatComplex(resultReal, resultImag);
        resultDisplay.textContent = finalResultString;
        stepsHTML += `<li><span class="step-formula">Resultado Final:</span> $${finalResultString}$</li>`;
        stepsHTML += '</ul>';

        // 1. Insertar el código LaTeX
        stepsDisplay.innerHTML = stepsHTML;
        // 2. Llamar al renderizado seguro.
        renderMathJax(); 

    } catch (e) {
        errorBox.textContent = 'Error: ' + e.message;
        errorBox.classList.remove('hidden');
        resultDisplay.textContent = '¡Error en el cálculo!';
        stepsDisplay.innerHTML = `<p class="text-red-700 font-semibold">${e.message}</p>`;
    }
}

// Inicialización: Solo intentar el cálculo inicial DESPUÉS de que el DOM esté cargado.
document.addEventListener('DOMContentLoaded', () => {
    // MathJax se inicializa de forma asíncrona. Esperamos su promesa.
    if (window.MathJax) {
        // Usamos MathJax.startup.promise.then() para garantizar que MathJax está listo.
        MathJax.startup.promise.then(() => {
            calculateComplexWithSteps('add');
        });
    } else {
         // Si falla la carga del script, al menos calculamos el resultado de texto.
        calculateComplexWithSteps('add'); 
    }
});