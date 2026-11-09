
// ======================================
// SMART EV CHARGING MANAGEMENT SYSTEM
// ======================================

// Initial charging stations

let stations = [
    { id: "Station 1", vehicle: null },
    { id: "Station 2", vehicle: null },
    { id: "Station 3", vehicle: null }
];

// Store registered vehicles

let vehicles = [];

// Waiting queue

let waitingQueue = [];

// Billing history

let billingHistory = [];

// Charging cost per unit

const COST_PER_UNIT = 8;


// ======================================
// VEHICLE REGISTRATION
// ======================================

document.getElementById("vehicleForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    let id = document.getElementById("vehicleId")
        .value.trim().toUpperCase();

    let owner = document.getElementById("ownerName")
        .value.trim();

    let battery = Number(
        document.getElementById("battery").value
    );

    let capacity = Number(
        document.getElementById("capacity").value
    );

    let message = document.getElementById("message");

    // Check duplicate vehicle ID

    if (vehicles.some(v => v.id === id)) {
        message.textContent = "Vehicle ID already exists!";
        message.style.color = "red";
        return;
    }

    // Create vehicle object

    let vehicle = {
        id: id,
        owner: owner,
        battery: battery,
        capacity: capacity,
        status: "Registered",
        station: "Not Assigned"
    };

    vehicles.push(vehicle);

    // Request charging

    assignStation(vehicle);

    message.textContent =
        "Vehicle registered successfully!";

    message.style.color = "green";

    document.getElementById("vehicleForm").reset();

    document.getElementById("capacity").value = 40;

    renderAll();

});


// ======================================
// CHARGING STATION ALLOCATION
// ======================================

function assignStation(vehicle) {

    // Find an available station

    let station = stations.find(
        s => s.vehicle === null
    );

    if (station) {

        station.vehicle = vehicle;

        vehicle.status = "Charging";

        vehicle.station = station.id;

    } else {

        vehicle.status = "Waiting";

        vehicle.station = "Queue";

        waitingQueue.push(vehicle);

        // Lower battery = higher priority

        waitingQueue.sort(
            (a, b) => a.battery - b.battery
        );

    }

}


// ======================================
// COMPLETE CHARGING
// ======================================

function completeCharging(stationId) {

    let station = stations.find(
        s => s.id === stationId
    );

    if (!station || !station.vehicle) {
        return;
    }

    let vehicle = station.vehicle;

    // Calculate required energy

    let energy =
        vehicle.capacity * (100 - vehicle.battery) / 100;

    // Calculate bill

    let bill = energy * COST_PER_UNIT;

    // Store billing details

    billingHistory.push({
        id: vehicle.id,
        station: station.id,
        energy: energy,
        bill: bill
    });

    // Update vehicle status

    vehicle.battery = 100;

    vehicle.status = "Completed";

    vehicle.station = "Not Assigned";

    // Release station

    station.vehicle = null;

    // Display bill

    alert(
        "Charging Completed!\n" +
        "Vehicle: " + vehicle.id + "\n" +
        "Energy: " + energy.toFixed(2) + " kWh\n" +
        "Total Bill: ₹" + bill.toFixed(2)
    );

    // Assign next waiting vehicle

    if (waitingQueue.length > 0) {

        let nextVehicle = waitingQueue.shift();

        assignStation(nextVehicle);

    }

    renderAll();

}


// ======================================
// DISPLAY STATIONS
// ======================================

function renderStations() {

    let container =
        document.getElementById("stationContainer");

    container.innerHTML = "";

    stations.forEach(station => {

        let occupied = station.vehicle !== null;

        let card = document.createElement("div");

        card.className = "station-card";

        card.innerHTML = `
            <h3>⚡ ${station.id}</h3>

            <p>Status:
                <span class="${occupied ? "occupied" : "available"}">
                    ${occupied ? "Occupied" : "Available"}
                </span>
            </p>

            <p>Vehicle:
                ${occupied ? station.vehicle.id : "None"}
            </p>

            <p>Owner:
                ${occupied ? station.vehicle.owner : "None"}
            </p>

            ${
                occupied
                ? `<button class="complete-btn"
                     data-station="${station.id}">
                     Complete Charging
                   </button>`
                : ""
            }
        `;

        container.appendChild(card);

    });

}


// ======================================
// DISPLAY VEHICLES
// ======================================

function renderVehicles() {

    let table =
        document.getElementById("vehicleTable");

    table.innerHTML = "";

    vehicles.forEach(vehicle => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${vehicle.id}</td>
            <td>${vehicle.owner}</td>
            <td>${vehicle.battery}%</td>
            <td>${vehicle.status}</td>
            <td>${vehicle.station}</td>
        `;

        table.appendChild(row);

    });

}


// ======================================
// DISPLAY WAITING QUEUE
// ======================================

function renderQueue() {

    let container =
        document.getElementById("queueContainer");

    container.innerHTML = "";

    if (waitingQueue.length === 0) {

        container.innerHTML = "<p>No vehicles waiting.</p>";

        return;

    }

    waitingQueue.forEach((vehicle, index) => {

        let item = document.createElement("div");

        item.className = "queue-item";

        item.innerHTML = `
            <strong>Priority ${index + 1}</strong>
            <br>
            Vehicle: ${vehicle.id}
            <br>
            Owner: ${vehicle.owner}
            <br>
            Battery: ${vehicle.battery}%
        `;

        container.appendChild(item);

    });

}


// ======================================
// DISPLAY BILLING HISTORY
// ======================================

function renderBilling() {

    let table =
        document.getElementById("billingTable");

    table.innerHTML = "";

    billingHistory.forEach(record => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.station}</td>
            <td>${record.energy.toFixed(2)}</td>
            <td>₹${record.bill.toFixed(2)}</td>
        `;

        table.appendChild(row);

    });

}


// ======================================
// UPDATE DASHBOARD
// ======================================

function renderDashboard() {

    let available = stations.filter(
        s => s.vehicle === null
    ).length;

    document.getElementById("totalStations")
        .textContent = stations.length;

    document.getElementById("availableSlots")
        .textContent = available;

    document.getElementById("totalVehicles")
        .textContent = vehicles.length;

    document.getElementById("waitingVehicles")
        .textContent = waitingQueue.length;

}


// ======================================
// RENDER EVERYTHING
// ======================================

function renderAll() {

    renderDashboard();

    renderStations();

    renderVehicles();

    renderQueue();

    renderBilling();

}


// Handle dynamically created buttons

document.getElementById("stationContainer")
.addEventListener("click", function(event) {

    if (event.target.classList.contains("complete-btn")) {

        let stationId =
            event.target.dataset.station;

        completeCharging(stationId);

    }

});


// Initial display

renderAll();
