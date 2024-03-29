const difficulty = ['#f4e172', '#a5c35f', '#b5c2ee', '#b382c4']
const emoji = ['🟨', '🟩', '🟦', '🟪']

let levelString = '';
let jsonData = {};
let wordToRule = {};
let consolidatedArray = [];
let selected = [];
let correctGuesses = 0;
let incorrectGuesses = 0;
let guessedRules = [];
let guessHistory = [];

const sendHint = (hintText) => {
    const hint = document.getElementById('hint');
    hint.innerText = hintText;
    hint.style.visibility = 'visible';
    setTimeout(() => {
        hint.classList.add('hide');
        setTimeout(() => {
            hint.style.visibility = 'hidden';
            hint.classList.remove('hide');
        }, 500);
    }, 1000);
}

const getEmoji = () => {
    let eStr = '';
    for (const guess of guessHistory) {
        for (const g of guess) {
            const rulePriority = Object.keys(jsonData).indexOf(wordToRule[g]);
            eStr += emoji[rulePriority];
        }
        eStr += '\n';
    }
    eStr = eStr.slice(0, -1);
    return eStr;
}

const saveData = () => {
    const data = {
        correctGuesses: correctGuesses,
        incorrectGuesses: incorrectGuesses,
        guessedRules: guessedRules,
        guessHistory: guessHistory
    }
    localStorage.setItem(levelString, JSON.stringify(data));
}

const loadLevelData = (data) => {
    // Decode the Base64-encoded data
    const compressedData = new Uint8Array(
        atob(decodeURIComponent(data))
            .split('')
            .map((char) => char.charCodeAt(0))
    );

    // Decompress the data using gunzip
    const decompressedData = new Zlib.Gunzip(compressedData).decompress();

    // Parse the JSON string to get the level data
    const jsonString = new TextDecoder().decode(decompressedData);
    const jsonData = JSON.parse(jsonString);
    
    const saved = localStorage.getItem(levelString);
    if (saved) {
        const savedData = JSON.parse(saved);
        correctGuesses = savedData.correctGuesses;
        incorrectGuesses = savedData.incorrectGuesses;
        guessedRules = savedData.guessedRules;
        guessHistory = savedData.guessHistory;
    }

    console.log(guessedRules);
    
    return jsonData;
}

const shuffleArray = (array) => {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get('name');
    if (gameName) document.getElementById('game-name').innerText = gameName;
    
    levelString = urlParams.get('level');
    if (levelString) {
        jsonData = loadLevelData(levelString);
    } else {
        // Redirect to the home page
        window.location.href = '..';
    }

    // Sanity check
    const keys = Object.keys(jsonData);
    if (keys.length === 4 && keys.every(key => typeof key === 'string' && jsonData[key] instanceof Array && jsonData[key].length === 4 && jsonData[key].every(value => typeof value === 'string'))) {
        consolidatedArray = keys.reduce((acc, key) => {
            jsonData[key].map(a => wordToRule[a] = key);
            return acc.concat(jsonData[key]);
        }, []);

        consolidatedArray = consolidatedArray.filter(value => !guessedRules.includes(wordToRule[value]));
        console.log(consolidatedArray);
        consolidatedArray = shuffleArray(consolidatedArray);

        document.getElementById('mistakes-text').innerText = `Mistakes: ${incorrectGuesses}`;

        const root = document.getElementById('board');
        for (let i = 0; i < 4; i++) {
            const row = document.createElement('div');
            row.id = `row-${i + 1}`;
            row.className = 'row';
            root.appendChild(row);

            if (i < correctGuesses) {
                const answer = document.createElement('div');
                answer.className = 'answer';
                answer.innerText = guessedRules[i];
                const rulePriority = Object.keys(jsonData).indexOf(guessedRules[i]);
                answer.style.backgroundColor = difficulty[rulePriority];
                row.appendChild(answer);
            } else {
                for (let j = 0; j < 4; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.innerText = consolidatedArray[(i - correctGuesses) * 4 + j];
                    cell.onmousedown = () => {
                        if (cell.classList.contains('selected')) {
                            selected.splice(selected.indexOf(cell.innerText), 1);
                            cell.classList.remove('selected');
                            document.getElementById('submit-button').disabled = true;
                        } else if (selected.length < 4) {
                            selected.push(cell.innerText);
                            cell.classList.add('selected');
                            if (selected.length === 4) {
                                document.getElementById('submit-button').disabled = false;
                            }
                        }
                    }
                    row.appendChild(cell);
                }
            }
        }

        if (correctGuesses === 4) {
            document.getElementById('copy-paste-box').innerText = getEmoji();
            document.getElementById('copy-paste').style.display = 'flex';
        }
    }

    document.getElementById('submit-button').onclick = () => {
        if (selected.length !== 4) return;

        if (guessHistory.some(history => history.length === selected.length && history.every(value => selected.includes(value)))) {
            sendHint('Already Guessed!')
            return;
        }

        guessHistory.push([...selected]);

        const ruleCounts = {};
        selected.forEach(value => {
            const rule = wordToRule[value];
            ruleCounts[rule] = (ruleCounts[rule] || 0) + 1;
        });
        const numCorrect = Math.max(...Object.values(ruleCounts));
        const rule = Object.keys(ruleCounts).find(key => ruleCounts[key] === numCorrect);
        if (numCorrect === 4) {
            correctGuesses++;
            guessedRules.push(rule);
            const row = document.getElementById(`row-${correctGuesses}`);
            row.innerHTML = '';
            const answer = document.createElement('div');
            answer.className = 'answer';
            answer.innerText = rule;
            const rulePriority = Object.keys(jsonData).indexOf(rule);
            answer.style.backgroundColor = difficulty[rulePriority];
            row.appendChild(answer);
            consolidatedArray = consolidatedArray.filter(value => !selected.includes(value));
            selected = [];
            for (let i = correctGuesses; i < 4; i++) {
                const row = document.getElementById(`row-${i + 1}`);
                const cells = row.getElementsByClassName('cell');
                for (let j = 0; j < cells.length; j++) {
                    cells[j].innerText = consolidatedArray[(i - correctGuesses) * 4 + j];
                    cells[j].classList.remove('selected');
                }
            }
            document.getElementById('submit-button').disabled = true;
            if (correctGuesses === 4) {
                document.getElementById('copy-paste-box').innerText = getEmoji();
                document.getElementById('copy-paste').style.display = 'flex';
            }
        } else {
            const cells = document.getElementsByClassName('cell');
            for (let i = 0; i < cells.length; i++) {
                if (selected.includes(cells[i].innerText)) {
                    cells[i].classList.add('shake');
                    setTimeout(() => cells[i].classList.remove('shake'), 500);
                }
            }
            incorrectGuesses++;
            document.getElementById('mistakes-text').innerText = `Mistakes: ${incorrectGuesses}`;
            if (numCorrect === 3) {
                sendHint('One Away...');
            }
        }

        saveData();
    }

    document.getElementById('shuffle-button').onclick = () => {
        consolidatedArray = shuffleArray(consolidatedArray);
        selected = [];
        for (let i = correctGuesses; i < 4; i++) {
            const row = document.getElementById(`row-${i + 1}`);
            const cells = row.getElementsByClassName('cell');
            for (let j = 0; j < cells.length; j++) {
                cells[j].innerText = consolidatedArray[(i - correctGuesses) * 4 + j];
                cells[j].classList.remove('selected');
            }
        }
        document.getElementById('submit-button').disabled = true;
    }

    // document.getElementById('reset-button').onclick = () => {
    //     correctGuesses = 0;
    //     incorrectGuesses = 0;
    //     guessedRules = [];
    //     guessHistory = [];
    //     saveData();
    //     window.location.reload();
    // }

    document.getElementById('copy-button').onclick = () => {
        const el = document.createElement('textarea');
        el.value = getEmoji();
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        sendHint('Results Copied!');
    }

    document.getElementById('share-button').onclick = () => {
        const el = document.createElement('textarea');
        // get current url
        el.value = window.location.href;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        sendHint('Level Link Copied!');
    }

    document.getElementById('blurb').onclick = () => {
        window.location.href = '..';
    }
}