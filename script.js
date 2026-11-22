
// =====================================
// VOLTEX X1 - SMART SAFETY DASHBOARD
// =====================================

let battery = 85;
let charging = false;
let chargingTimer = null;
let energyUsed = 0;

// GET HTML ELEMENTS
const $ = id => document.getElementById(id);

// =====================================
// 1. BATTERY SYSTEM
// =====================================

function updateBattery() {
    $("batteryValue").textContent = battery + "%";
    $("batteryBar").style.width = battery + "%";

    $("rangeValue").textContent =
        Math.round(battery * 3.76) + " km";

    if (battery <= 20) {
        $("batteryBar").style.background = "#ff5367";
        $("batteryStatus").textContent = "LOW BATTERY";
        $("batteryStatus").className = "status-pill danger";
    } else {
        $("batteryBar").style.background = "#21d69a";
        $("batteryStatus").textContent = "NORMAL";
        $("batteryStatus").className = "status-pill safe";
    }

    $("energyValue").textContent = energyUsed.toFixed(1) + " kWh";
}

$("chargeBtn").addEventListener("click", function () {

    if (charging) {
        stopCharging();
        return;
    }

    if (battery >= 100) {
        $("chargingStatus").textContent = "Battery is already full";
        return;
    }

    const temperature = Number($("temperatureControl").value);

    if (temperature >= 50) {
        $("chargingStatus").textContent =
            "Charging paused: battery temperature too high";
        return;
    }

    charging = true;

    $("chargeBtn").textContent = "STOP CHARGING";
    $("chargingStatus").textContent = "Charging in progress...";

    chargingTimer = setInterval(function () {

        if (battery < 100) {
            battery = Math.min(100, battery + 1);
            updateBattery();
        }

        if (battery >= 100) {
            stopCharging();
            $("chargingStatus").textContent = "Charging complete!";
        }

    }, 1000);
});

function stopCharging() {
    charging = false;

    clearInterval(chargingTimer);
    chargingTimer = null;

    $("chargeBtn").textContent = "START CHARGING";
    $("chargingStatus").textContent = "Charging stopped";
}

// =====================================
// 2. BATTERY TEMPERATURE
// =====================================

$("temperatureControl").addEventListener("input", function () {
    const temp = Number(this.value);

    $("temperatureValue").textContent = temp + "°C";

    if (temp >= 55) {
        $("temperatureValue").style.color = "#ff5367";
    } else if (temp >= 45) {
        $("temperatureValue").style.color = "#ffbd4a";
    } else {
        $("temperatureValue").style.color = "#21d69a";
    }

    if (temp >= 50 && charging) {
        stopCharging();
        $("chargingStatus").textContent =
            "Charging paused: high temperature";
    }

    updateAlerts();
});

// =====================================
// 3. SPEEDOMETER AND DRIVING MODE
// =====================================

$("speedControl").addEventListener("input", function () {

    const speed = Number(this.value);

    $("speedValue").textContent = speed + " km/h";

    energyUsed = speed * 0.025;

    $("energyValue").textContent =
        energyUsed.toFixed(1) + " kWh";
});

$("modeControl").addEventListener("change", function () {
    $("modeValue").textContent = this.value;
});

// =====================================
// 4. SEAT BELT WARNING
// =====================================

$("seatToggle").addEventListener("change", function () {
    $("seatStatus").textContent =
        this.checked ? "Fastened" : "Seat belt unfastened";

    $("seatStatus").style.color =
        this.checked ? "#21d69a" : "#ff5367";

    updateAlerts();
});

// =====================================
// 5. DOOR STATUS
// =====================================

$("doorToggle").addEventListener("change", function () {
    $("doorStatus").textContent =
        this.checked ? "All doors closed" : "Door open";

    $("doorStatus").style.color =
        this.checked ? "#21d69a" : "#ff5367";

    updateAlerts();
});

// =====================================
// 6. BLIND SPOT DETECTION SIMULATION
// =====================================

$("blindToggle").addEventListener("change", function () {
    $("blindStatus").textContent =
        this.checked ? "Vehicle detected nearby!" : "No vehicle detected";

    $("blindStatus").style.color =
        this.checked ? "#ff5367" : "#21d69a";

    updateAlerts();
});

// =====================================
// 7. TYRE PRESSURE MONITORING
// =====================================

$("tyreControl").addEventListener("input", function () {

    const pressure = Number(this.value);

    $("tyreStatus").textContent = pressure + " PSI";

    if (pressure < 28 || pressure > 40) {
        $("tyreStatus").textContent =
            "Warning: " + pressure + " PSI";

        $("tyreStatus").style.color = "#ff5367";
    } else {
        $("tyreStatus").textContent =
            "Normal · " + pressure + " PSI";

        $("tyreStatus").style.color = "#21d69a";
    }

    updateAlerts();
});

// =====================================
// 8. PARKING SENSOR
// =====================================

$("distanceControl").addEventListener("input", function () {

    const distance = Number(this.value);

    $("distanceValue").textContent = distance + " cm";

    const object = $("parkingObject");

    object.style.top = (20 + distance * 0.3) + "px";

    if (distance <= 30) {
        $("parkingStatus").textContent = "STOP!";
        $("parkingStatus").className = "status-pill danger";
        object.style.color = "#ff5367";
    } else if (distance <= 70) {
        $("parkingStatus").textContent = "CAUTION";
        $("parkingStatus").className = "status-pill warning";
        object.style.color = "#ffbd4a";
    } else {
        $("parkingStatus").textContent = "CLEAR";
        $("parkingStatus").className = "status-pill safe";
        object.style.color = "#21d69a";
    }

    updateAlerts();
});

// =====================================
// 9. REVERSE CAMERA
// =====================================

let cameraOpen = false;

$("cameraBtn").addEventListener("click", function () {

    cameraOpen = !cameraOpen;

    $("cameraScreen").classList.toggle("active", cameraOpen);

    $("cameraStatus").textContent =
        cameraOpen ? "ACTIVE" : "OFF";

    $("cameraStatus").className =
        cameraOpen ? "status-pill safe" : "status-pill warning";

    $("cameraBtn").textContent =
        cameraOpen ? "CLOSE CAMERA" : "OPEN REVERSE CAMERA";

    $("cameraMessage").textContent =
        cameraOpen ? "Rear view active" : "Camera is turned off";

    updateAlerts();
});

// =====================================
// 10. SAFETY ALERT SYSTEM
// =====================================

function getWarnings() {

    const warnings = [];

    if (!$("seatToggle").checked) {
        warnings.push("Seat belt is not fastened");
    }

    if (!$("doorToggle").checked) {
        warnings.push("Vehicle door is open");
    }

    if ($("blindToggle").checked) {
        warnings.push("Vehicle detected in blind spot");
    }

    const pressure = Number($("tyreControl").value);

    if (pressure < 28 || pressure > 40) {
        warnings.push("Tyre pressure is outside demo range");
    }

    const distance = Number($("distanceControl").value);

    if (distance <= 30) {
        warnings.push("Parking object is very close");
    } else if (distance <= 70) {
        warnings.push("Parking object is getting close");
    }

    const temperature =
        Number($("temperatureControl").value);

    if (temperature >= 55) {
        warnings.push("Critical battery temperature simulation");
    } else if (temperature >= 45) {
        warnings.push("Battery temperature is high");
    }

    if (battery <= 20) {
        warnings.push("Battery level is low");
    }

    return warnings;
}

function updateAlerts() {

    const warnings = getWarnings();
    const list = $("alertList");

    list.innerHTML = "";

    if (warnings.length === 0) {
        list.innerHTML =
            '<p class="no-alert">✓ No active alerts</p>';

        $("overallStatus").textContent =
            "ALL SYSTEMS NORMAL";

        $("overallStatus").className =
            "status-pill safe";

        return;
    }

    warnings.forEach(function (warning) {

        const item = document.createElement("div");

        item.className = "alert-entry";
        item.textContent = "⚠ " + warning;

        list.appendChild(item);
    });

    $("overallStatus").textContent =
        warnings.length + " ACTIVE ALERT(S)";

    $("overallStatus").className =
        "status-pill danger";
}

// =====================================
// 11. EMERGENCY ALERT
// =====================================

$("emergencyBtn").addEventListener("click", function () {

    const confirmed = confirm(
        "Demo Emergency Alert activate karna hai?"
    );

    if (confirmed) {
        alert(
            "DEMO ALERT ACTIVATED!\n\n" +
            "This is only a website simulation. " +
            "No emergency service has been contacted."
        );
    }
});

// =====================================
// 12. AIR CONDITIONING
// =====================================

$("acControl").addEventListener("input", function () {

    $("acValue").textContent = this.value + "°C";
});

// =====================================
// 13. AMBIENT LIGHTING
// =====================================

$("lightControl").addEventListener("input", function () {

    document.documentElement.style.setProperty(
        "--cyan",
        this.value
    );
});

// =====================================
// 14. INITIAL DASHBOARD UPDATE
// =====================================

updateBattery();
updateAlerts();

console.log("VOLTEX X1 Dashboard Ready!");
