const map = L.map('map').setView([51.505, -0.09], 13); // Initialize map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


const pins = JSON.parse(localStorage.getItem('pins')) || [];
const pinListElement = document.getElementById('pinList');

function renderPinList() {
    pinListElement.innerHTML = ''; // Clear previous content
    pins.forEach((pin, index) => {
        const pinDiv = document.createElement('div');
        pinDiv.className = 'pin-item';
        pinDiv.innerHTML = `<strong>${pin.remark || 'No Remark'}</strong><br>${pin.address || 'No Address'}`;
        pinDiv.onclick = () => {
            map.setView([pin.lat, pin.lng], 15);
            L.popup()
                .setLatLng([pin.lat, pin.lng])
                .setContent(`<strong>${pin.remark}</strong><br>${pin.address || 'No Address'}`)
                .openOn(map);
        };
        pinListElement.appendChild(pinDiv);
    });
}

// Save pins to local storage
function savePins() {
    localStorage.setItem('pins', JSON.stringify(pins));
}

// Fetch address using OpenStreetMap's Nominatim API
function fetchAddress(lat, lng, callback) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => callback(data.display_name))
        .catch(() => callback(null));
}

// Event listener for map click to drop a pin
map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    // Create popup content dynamically
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
        <label>Remarks: <input type="text" id="remark" /></label>
        <button id="savePinBtn">Save Pin</button>
    `;
    
    // Creating popup and open it on the map
    const popup = L.popup()
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

    // Attaching event listener to the save button
    popupContent.querySelector('#savePinBtn').addEventListener('click', () => {
        submitPin(lat, lng);
        map.closePopup();
    });
});

// Function to save a pin with remarks and address
function submitPin(lat, lng) {
    const remark = document.getElementById('remark').value;
    let address = null;

    // Fetching address and then save the pin
    fetchAddress(lat, lng, fetchedAddress => {
        address = fetchedAddress;
        const pin = { lat, lng, remark, address };
        pins.push(pin);
        savePins();
        renderPinList();
        L.marker([lat, lng]).addTo(map)
            .bindPopup(`<strong>${remark}</strong><br>${address || 'Address not available'}`);
        map.closePopup();
    });
}

// Render markers for all saved pins on map load
pins.forEach(pin => {
    L.marker([pin.lat, pin.lng]).addTo(map)
        .bindPopup(`<strong>${pin.remark}</strong><br>${pin.address || 'Address not available'}`);
});


renderPinList();
