function handleFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove the header row
        const dataRows = json.slice(1);

        const processedJson = dataRows
            .filter(row => getOrDefault(row[2], '') !== '') // Ensure 'application name' (column C) is not empty
            .map(row => generateJson(row));
        
        displayJson(processedJson);
    };
    reader.readAsArrayBuffer(file);
}

function getOrDefault(field, defaultValue) {
    if (typeof field === 'string') {
        return field.trim() !== '' ? field : defaultValue;
    }
    return field !== undefined && field !== null ? field : defaultValue;
}

function generateJson(row) {
    const targets = (getOrDefault(row[9], '').split('\n').map(target => ({
        id: target.trim(),
        port: getOrDefault(row[10], 443)
    }))).filter(target => target.id !== '');

    return {
        protocol: getOrDefault(row[5], 'HTTPS').toUpperCase(),
        domain: getOrDefault(row[4], ''),
        listen_port: getOrDefault(row[10], 443),
        target_type: 'instance',
        deregistration_delay: 30,
        stickiness: {
            type: getOrDefault(row[8], 'lb_cookie').toLowerCase(),
            enabled: true,
            cookie_name: null,
            cookie_duration: 86400
        },
        health_check: {
            path: getOrDefault(row[13], '/isAlive.html'),
            port: getOrDefault(row[12], 'traffic-port').replace(' ', '-').toLowerCase(),
            protocol: getOrDefault(row[11], 'HTTPS').toUpperCase(),
            unhealthy_threshold: 3,
            healthy_threshold: 5,
            interval: 10,
            timeout: 5
        },
        dns_record: {
            name: getOrDefault(row[6], ''),
            type: 'A',
            ttl: 300
        },
        targets: targets,
        tags: {
            NAME: getOrDefault(row[2], '')
        }
    };
}

function displayJson(jsonArray) {
    const output = document.getElementById('output');
    output.innerHTML = ''; // Clear previous content

    jsonArray.forEach((json, index) => {
        const applicationName = json.tags.NAME;
        const sanitizedAppName = applicationName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const container = document.createElement('div');
        container.className = 'json-container';
        
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(json, null, 2);
        
        const button = document.createElement('button');
        button.textContent = `Save JSON for ${applicationName}`;
        button.onclick = () => saveJson(json, `${sanitizedAppName}.json`);
        
        container.appendChild(pre);
        container.appendChild(button);
        output.appendChild(container);
    });

    if (jsonArray.length > 0) {
        const saveAllContainer = document.createElement('div');
        saveAllContainer.className = 'save-all-button';

        const saveAllButton = document.createElement('button');
        saveAllButton.textContent = 'Save All JSON';
        saveAllButton.onclick = () => saveAllJson(jsonArray);

        saveAllContainer.appendChild(saveAllButton);
        output.appendChild(saveAllContainer);
    }
}

function saveJson(json, filename) {
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveAllJson(jsonArray) {
    jsonArray.forEach(json => {
        const applicationName = json.tags.NAME;
        const sanitizedAppName = applicationName.replace(/[^a-zA-Z0-9-_]/g, '_');
        saveJson(json, `${sanitizedAppName}.json`);
    });
}
