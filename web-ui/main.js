import { Instruction } from "../core/Instruction.js";

const colors = [
    '--color-other-yellow',
    '--color-other-red',
    '--color-other-pink',
    '--color-other-cyan',
    '--color-other-blue',
]

const fieldColorMap = {
    'opcode': colors[0],
    'funct3': colors[0],
    'funct7': colors[0],
    'rs1': colors[2],
    'rs2': colors[4],
    'rd': colors[3]
}

const resultsContainerElm = document.getElementsByClassName('rows-container')[0];
const resultsLabelElm = document.getElementById('results-label');

let ResultState = {
    isErrorShown:false,
    resultInnerHtml: resultsContainerElm.innerHTML
}


window.onload = function () {
    const input = document.getElementById('search-input');
    if (!window.location.hash) {
        return; //no instruction
    }
    //set input value to data encoded in url
    input.value = decodeURIComponent(window.location.hash.replace('#', ''));

    //send input event to trigger on-input handler
    let event = new Event('keydown');
    event.key = 'Enter'
    input.dispatchEvent(event);
}

document.getElementById('search-input').onkeydown = function (event) {
    if (event.key != 'Enter') {
        return;
    }

    document.getElementById('results-container-box').style.display = 'initial';

    let value = event.currentTarget.value.trim();
    try {
        const instructionData = new Instruction(value);
        renderInstructionData(instructionData);
    } catch (error) { renderError({ name: error, details: error }); }
    window.location.hash = value;
}

/** @param {Instruction} instruction */
function renderInstructionData(instruction) {

    if(instruction && ResultState.isErrorShown){
        ResultState.isErrorShown = false;
        resultsContainerElm.innerHTML = ResultState.resultInnerHtml;
        resultsLabelElm.innerText = '[ Results ]'
    }
    document.getElementById('hex-data').innerText = instruction.hex;
    document.getElementById('format-data').innerText = instruction.format;
    document.getElementById('set-data').innerText = instruction.isa;
    document.getElementById('set-subtitle-data').innerText = instruction.setSubtitle;

    let asmElmString = instruction.assembly;

    let frags = instruction.fragments;
    frags.sort((a, b) => a.index - b.index); //sort by index

    let head = document.getElementsByClassName('binary-bit').length-1;
    let handledAsmInstructions = [];
    for (let frag of frags) {
        console.log(frag);

        //set binary bits
        for (let bit of Array.from(frag.bits).reverse()) {
            let bitElm = document.getElementsByClassName('binary-bit')[head];
            bitElm.innerText = bit;
            bitElm.style.color = `var(${fieldColorMap[frag.field]})`;
            head--;
        }

        //create assembly data element
        if (!handledAsmInstructions.includes(frag.assembly)) {
            handledAsmInstructions.push(frag.assembly)
            asmElmString = asmElmString.replace(frag.assembly, 
                `<span style='color:var(${fieldColorMap[frag.field]})'>${
                    frag.assembly
                }<span/>`)
        }
    }
    document.getElementById('asm-data').innerHTML = asmElmString;

    ResultState.resultInnerHtml = resultsContainerElm.innerHTML;
}

function renderError(error) {
    if (!ResultState.isErrorShown) {
        ResultState.resultInnerHtml = resultsContainerElm.innerHTML;
        resultsLabelElm.innerText = '[ Error ]'
        ResultState.isErrorShown = true;
    }

    resultsContainerElm.innerHTML = '';

    let errorNameTitle = document.createElement('div')
    errorNameTitle.classList.add('result-row', 'result-row-title');
    errorNameTitle.textContent = 'ERROR = '

    let errorNameData = document.createElement('div')
    errorNameData.classList.add('result-row');
    errorNameData.textContent = error.name

    let errorDetailsTitle = document.createElement('div')
    errorDetailsTitle.classList.add('result-row', 'result-row-title');
    errorDetailsTitle.textContent = 'DETAILS = '

    let errorDetailsData = document.createElement('div')
    errorDetailsData.classList.add('result-row');
    errorDetailsData.textContent = error.details

    resultsContainerElm.append(errorNameTitle)
    resultsContainerElm.append(errorNameData)
    resultsContainerElm.append(errorDetailsTitle)
    resultsContainerElm.append(errorDetailsData)
}
