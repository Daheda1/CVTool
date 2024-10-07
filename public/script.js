// script.js

const dropZone = document.getElementById('drop-zone');
const pdfFrame = document.getElementById('pdf-frame');
const cvForm = document.getElementById('cv-form');

// Drag and Drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            uploadPDF(file);
        } else {
            alert('Venligst træk en PDF-fil.');
        }
    }
});

function uploadPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const fileURL = data.filePath;
            pdfFrame.src = fileURL;
            pdfFrame.style.display = 'block';
            dropZone.classList.add('hidden'); // Fjern overlayet

            // Auto-udfyld formularfelterne med data fra serveren
            autoFillForm(data.data);
        } else {
            alert('Fejl under upload: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('En fejl opstod under upload.');
    });
}

function autoFillForm(data) {
    // Udfyld de grundlæggende felter
    document.getElementById('fullname').value = data.fullname || '';
    document.getElementById('dob').value = data.dob || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('zipcode').value = data.zipcode || '';
    document.getElementById('city').value = data.city || '';

    // Udfyld "Tidligere Jobs"
    const jobsTable = document.getElementById('jobs-table').querySelector('tbody');
    // Fjern alle eksisterende rækker
    jobsTable.innerHTML = '';
    // Udfyld rækkerne
    data.jobs.forEach(job => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="date" name="jobs[from][]" value="${job.from}" required></td>
            <td><input type="date" name="jobs[to][]" value="${job.to}" required></td>
            <td><input type="text" name="jobs[place][]" value="${job.place}" ></td>
            <td><button type="button" class="remove-row">Fjern</button></td>
        `;
        jobsTable.appendChild(newRow);
    });

    // Udfyld "Uddannelse"
    const educationTable = document.getElementById('education-table').querySelector('tbody');
    // Fjern alle eksisterende rækker
    educationTable.innerHTML = '';
    // Udfyld rækkerne
    data.education.forEach(edu => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="date" name="education[from][]" value="${edu.from}" required></td>
            <td><input type="date" name="education[to][]" value="${edu.to}" required></td>
            <td><input type="text" name="education[place][]" value="${edu.place}" ></td>
            <td><button type="button" class="remove-row">Fjern</button></td>
        `;
        educationTable.appendChild(newRow);
    });

    // Udfyld "Færdigheder"
    const skillsList = document.getElementById('skills-list');
    // Fjern alle eksisterende elementer
    skillsList.innerHTML = '';
    // Udfyld færdighederne
    data.skills.forEach(skill => {
        const newItem = document.createElement('div');
        newItem.classList.add('list-item');
        newItem.innerHTML = `
            <input type="text" name="skills[]" placeholder="Skriv en færdighed" value="${skill}" required>
            <button type="button" class="remove-item">Fjern</button>
        `;
        skillsList.appendChild(newItem);
    });

    // Udfyld "Egenskaber"
    const attributesList = document.getElementById('attributes-list');
    // Fjern alle eksisterende elementer
    attributesList.innerHTML = '';
    // Udfyld egenskaberne
    data.attributes.forEach(attribute => {
        const newItem = document.createElement('div');
        newItem.classList.add('list-item');
        newItem.innerHTML = `
            <input type="text" name="attributes[]" placeholder="Skriv en egenskab" value="${attribute}" required>
            <button type="button" class="remove-item">Fjern</button>
        `;
        attributesList.appendChild(newItem);
    });
}

// Håndter formularindsendelse
cvForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(cvForm);

    fetch('/submit-cv-form', { // Du skal oprette denne route på serveren
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Formular indsendt succesfuldt!');
            cvForm.reset();
            // Fjern alle ekstra rækker og behold kun den første
            resetDynamicTables();
            resetDynamicLists();
        } else {
            alert('Fejl under indsendelse: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('En fejl opstod under indsendelse: ' + error.message);
    });
});

// Funktion til at tilføje nye rækker i tabeller
document.querySelectorAll('button.add-row').forEach(button => {
    button.addEventListener('click', () => {
        const tableId = button.getAttribute('data-table');
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="date" name="${tableId === 'jobs-table' ? 'jobs[from][]' : 'education[from][]'}" required></td>
            <td><input type="date" name="${tableId === 'jobs-table' ? 'jobs[to][]' : 'education[to][]'}" ></td>
            <td><input type="text" name="${tableId === 'jobs-table' ? 'jobs[place][]' : 'education[place][]'}" ></td>
            <td><button type="button" class="remove-row">Fjern</button></td>
        `;
        tbody.appendChild(newRow);
    });
});

// Funktion til at fjerne rækker i tabeller
document.querySelectorAll('.dynamic-table').forEach(table => {
    table.addEventListener('click', (e) => {
        if (e.target && e.target.matches('button.remove-row')) {
            const tbody = table.querySelector('tbody');
            if (tbody.rows.length > 1) { // Sørg for, at mindst én række forbliver
                e.target.closest('tr').remove();
            } else {
                alert('Du skal mindst have én linje.');
            }
        }
    });
});

// Funktion til at tilføje nye elementer i lister (Færdigheder og Egenskaber)
document.querySelectorAll('button.add-item').forEach(button => {
    button.addEventListener('click', () => {
        const listId = button.getAttribute('data-list');
        const list = document.getElementById(listId);
        const newItem = document.createElement('div');
        newItem.classList.add('list-item');
        newItem.innerHTML = `
            <input type="text" name="${listId === 'skills-list' ? 'skills' : 'attributes'}[]" placeholder="${listId === 'skills-list' ? 'Skriv en færdighed' : 'Skriv en egenskab'}" required>
            <button type="button" class="remove-item">Fjern</button>
        `;
        list.appendChild(newItem);
    });
});

// Funktion til at fjerne elementer i lister (Færdigheder og Egenskaber)
document.querySelectorAll('.dynamic-list').forEach(list => {
    list.addEventListener('click', (e) => {
        if (e.target && e.target.matches('button.remove-item')) {
            const listItem = e.target.closest('.list-item');
            listItem.remove();
        }
    });
});

// Funktion til at nulstille dynamiske tabeller efter indsendelse
function resetDynamicTables() {
    document.querySelectorAll('.dynamic-table').forEach(table => {
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = ''; // Fjern alle rækker
        // Tilføj en tom række
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="date" name="${table.id === 'jobs-table' ? 'jobs[from][]' : 'education[from][]'}" required></td>
            <td><input type="date" name="${table.id === 'jobs-table' ? 'jobs[to][]' : 'education[to][]'}" ></td>
            <td><input type="text" name="${table.id === 'jobs-table' ? 'jobs[place][]' : 'education[place][]'}" required></td>
            <td><button type="button" class="remove-row">Fjern</button></td>
        `;
        tbody.appendChild(newRow);
    });
}

// Funktion til at nulstille dynamiske lister efter indsendelse
function resetDynamicLists() {
    document.querySelectorAll('.dynamic-list').forEach(list => {
        list.innerHTML = `
            <div class="list-item">
                <input type="text" name="${list.id === 'skills-list' ? 'skills' : 'attributes'}[]" placeholder="${list.id === 'skills-list' ? 'Skriv en færdighed' : 'Skriv en egenskab'}" required>
                <button type="button" class="remove-item">Fjern</button>
            </div>
        `;
    });
}
