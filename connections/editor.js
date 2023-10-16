const generateURL = (data, name) => {
    // Convert JSON to a string
    const jsonString = JSON.stringify(data);

    // Compress the JSON string using gzip
    const compressedData = new Zlib.Gzip(
        new TextEncoder().encode(jsonString)
    ).compress();

    // Encode the compressed data using Base64 and encodeURIComponent
    const encodedData = encodeURIComponent(
        btoa(String.fromCharCode.apply(null, compressedData))
    );

    // Create the URL with the encoded data
    const url = `./game?level=${encodedData}&name=${encodeURIComponent(name)}`;
    return url;
}

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

window.onload = () => {
    const cellGroups = document.getElementsByClassName('cells')
    for (let i = 0; i < cellGroups.length; i++) {
        const cells = cellGroups[i]
        for (let j = 0; j < cells.children.length; j++) {
            const cell = cells.children[j]
            cell.onmousedown = (e) => {
                e.preventDefault();
                cell.children[0].focus();
                e.stopPropagation();
            }
            const input = cell.children[0]
            input.onmousedown = (e) => {
                e.stopPropagation();
            }
        }
    }

    const containers = document.getElementsByClassName('container')
    for (let i = 0; i < containers.length; i++) {
        const container = containers[i]
        container.onmousedown = (e) => {
            e.preventDefault();
            container.children[0].focus()
            e.stopPropagation();
        }
        const descInput = container.children[0]
        descInput.onmousedown = (e) => {
            e.stopPropagation();
        }
    }

    document.getElementById('clear-button').onclick = () => {
        window.location.reload();
    }

    document.getElementById('create-button').onclick = () => {
        const cat1Desc = document.getElementById('cat-1-desc').value
        const cat2Desc = document.getElementById('cat-2-desc').value
        const cat3Desc = document.getElementById('cat-3-desc').value
        const cat4Desc = document.getElementById('cat-4-desc').value
        // Ensure all are non-empty and unique
        if (cat1Desc == '' || cat2Desc == '' || cat3Desc == '' || cat4Desc == '') {
            sendHint('Please fill in all category descriptions.')
            return
        }
        if (cat1Desc == cat2Desc || cat1Desc == cat3Desc || cat1Desc == cat4Desc || cat2Desc == cat3Desc || cat2Desc == cat4Desc || cat3Desc == cat4Desc) {
            sendHint('Please ensure all category descriptions are unique.')
            return
        }
        const cat1Word1 = document.getElementById('cat-1-word-1').value
        const cat1Word2 = document.getElementById('cat-1-word-2').value
        const cat1Word3 = document.getElementById('cat-1-word-3').value
        const cat1Word4 = document.getElementById('cat-1-word-4').value
        const cat2Word1 = document.getElementById('cat-2-word-1').value
        const cat2Word2 = document.getElementById('cat-2-word-2').value
        const cat2Word3 = document.getElementById('cat-2-word-3').value
        const cat2Word4 = document.getElementById('cat-2-word-4').value
        const cat3Word1 = document.getElementById('cat-3-word-1').value
        const cat3Word2 = document.getElementById('cat-3-word-2').value
        const cat3Word3 = document.getElementById('cat-3-word-3').value
        const cat3Word4 = document.getElementById('cat-3-word-4').value
        const cat4Word1 = document.getElementById('cat-4-word-1').value
        const cat4Word2 = document.getElementById('cat-4-word-2').value
        const cat4Word3 = document.getElementById('cat-4-word-3').value
        const cat4Word4 = document.getElementById('cat-4-word-4').value
        // Ensure all are non-empty and unique
        if (cat1Word1 == '' || cat1Word2 == '' || cat1Word3 == '' || cat1Word4 == '' || cat2Word1 == '' || cat2Word2 == '' || cat2Word3 == '' || cat2Word4 == '' || cat3Word1 == '' || cat3Word2 == '' || cat3Word3 == '' || cat3Word4 == '' || cat4Word1 == '' || cat4Word2 == '' || cat4Word3 == '' || cat4Word4 == '') {
            sendHint('Please fill in all words.')
            return
        }
        if (cat1Word1 == cat1Word2 || cat1Word1 == cat1Word3 || cat1Word1 == cat1Word4 || cat1Word2 == cat1Word3 || cat1Word2 == cat1Word4 || cat1Word3 == cat1Word4 || cat2Word1 == cat2Word2 || cat2Word1 == cat2Word3 || cat2Word1 == cat2Word4 || cat2Word2 == cat2Word3 || cat2Word2 == cat2Word4 || cat2Word3 == cat2Word4 || cat3Word1 == cat3Word2 || cat3Word1 == cat3Word3 || cat3Word1 == cat3Word4 || cat3Word2 == cat3Word3 || cat3Word2 == cat3Word4 || cat3Word3 == cat3Word4 || cat4Word1 == cat4Word2 || cat4Word1 == cat4Word3 || cat4Word1 == cat4Word4 || cat4Word2 == cat4Word3 || cat4Word2 == cat4Word4 || cat4Word3 == cat4Word4) {
            sendHint('Please ensure all words are unique.')
            return
        }

        let levelData = {}
        levelData[cat1Desc] = [cat1Word1, cat1Word2, cat1Word3, cat1Word4];
        levelData[cat2Desc] = [cat2Word1, cat2Word2, cat2Word3, cat2Word4];
        levelData[cat3Desc] = [cat3Word1, cat3Word2, cat3Word3, cat3Word4];
        levelData[cat4Desc] = [cat4Word1, cat4Word2, cat4Word3, cat4Word4];

        const gameName = document.getElementById('game-name').value || 'Connections'

        window.location.href = generateURL(levelData, gameName)
    }
}
