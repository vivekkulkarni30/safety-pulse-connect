// Global variables
let contacts = [];
let currentLocation = null;
let recentAlert = null;
let isEmergencyActive = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();
    getCurrentLocation();
    setupEventListeners();
});

// Load contacts from localStorage
function loadContacts() {
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
        contacts = JSON.parse(savedContacts);
        updateContactsDisplay();
        updateReadyContactsDisplay();
    }
}

// Save contacts to localStorage
function saveContacts() {
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
}

// Get current location
function getCurrentLocation() {
    const statusEl = document.getElementById('location-status');
    const coordsEl = document.getElementById('location-coords');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Update display
                statusEl.classList.add('hidden');
                coordsEl.classList.remove('hidden');
                
                document.getElementById('lat-value').textContent = currentLocation.lat.toFixed(6);
                document.getElementById('lng-value').textContent = currentLocation.lng.toFixed(6);
                
                const mapsLink = document.getElementById('maps-link');
                mapsLink.href = `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
            },
            function(error) {
                console.error('Error getting location:', error);
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Location unavailable</span>';
                currentLocation = { lat: 0, lng: 0 };
            }
        );
    } else {
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Geolocation not supported</span>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add contact form
    document.getElementById('add-contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addContact();
    });
    
    // Emergency button long press
    let pressTimer;
    const emergencyBtn = document.getElementById('emergency-button');
    
    emergencyBtn.addEventListener('mousedown', function() {
        pressTimer = setTimeout(function() {
            handleEmergencyPress();
        }, 3000);
    });
    
    emergencyBtn.addEventListener('mouseup', function() {
        clearTimeout(pressTimer);
    });
    
    emergencyBtn.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer);
    });
    
    // Touch events for mobile
    emergencyBtn.addEventListener('touchstart', function() {
        pressTimer = setTimeout(function() {
            handleEmergencyPress();
        }, 3000);
    });
    
    emergencyBtn.addEventListener('touchend', function() {
        clearTimeout(pressTimer);
    });
}

// Switch tabs
function switchTab(tabName) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and button
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Handle emergency button press
function handleEmergencyPress() {
    if (contacts.length === 0) {
        showToast('Please add emergency contacts first!', 'error');
        return;
    }
    
    if (!currentLocation) {
        getCurrentLocation();
        showToast('Getting location...', 'info');
        setTimeout(handleEmergencyPress, 2000);
        return;
    }
    
    const now = new Date();
    recentAlert = {
        id: Date.now().toString(),
        timestamp: now,
        location: currentLocation,
        contactsNotified: [...contacts],
        status: 'sent'
    };
    
    isEmergencyActive = true;
    
    // Update emergency button
    const emergencyBtn = document.getElementById('emergency-button');
    emergencyBtn.classList.add('activated');
    emergencyBtn.querySelector('.button-text').textContent = 'ALERT SENT';
    emergencyBtn.querySelector('.button-icon').className = 'fas fa-check button-icon';
    
    // Show emergency alert
    showEmergencyAlert();
    
    // Simulate message delivery
    setTimeout(() => {
        if (recentAlert) {
            recentAlert.status = 'delivered';
            updateEmergencyAlert();
        }
    }, 2000);
    
    // Auto-clear emergency state after 5 minutes
    setTimeout(() => {
        clearEmergencyState();
    }, 300000);
    
    showToast('Emergency alert sent to all contacts!', 'success');
}

// Show emergency alert
function showEmergencyAlert() {
    const alertEl = document.getElementById('emergency-alert');
    const timestampEl = document.getElementById('alert-timestamp');
    const locationEl = document.getElementById('alert-location-text');
    const contactsListEl = document.getElementById('alert-contacts-list');
    
    alertEl.classList.remove('hidden');
    timestampEl.textContent = recentAlert.timestamp.toLocaleString();
    
    if (recentAlert.location) {
        locationEl.innerHTML = `
            <a href="https://maps.google.com/?q=${recentAlert.location.lat},${recentAlert.location.lng}" target="_blank">
                ${recentAlert.location.lat.toFixed(6)}, ${recentAlert.location.lng.toFixed(6)}
            </a>
        `;
    }
    
    contactsListEl.innerHTML = recentAlert.contactsNotified.map(contact => 
        `<div class="contact-item">
            <span><strong>${contact.name}</strong> - ${contact.phone}</span>
            <i class="fas fa-check" style="color: #22c55e;"></i>
        </div>`
    ).join('');
}

// Update emergency alert status
function updateEmergencyAlert() {
    // This would update the status display if needed
}

// Clear emergency alert
function clearAlert() {
    document.getElementById('emergency-alert').classList.add('hidden');
    clearEmergencyState();
}

// Clear emergency state
function clearEmergencyState() {
    isEmergencyActive = false;
    recentAlert = null;
    
    const emergencyBtn = document.getElementById('emergency-button');
    emergencyBtn.classList.remove('activated');
    emergencyBtn.querySelector('.button-text').textContent = 'SOS';
    emergencyBtn.querySelector('.button-icon').className = 'fas fa-exclamation-triangle button-icon';
}

// Open add contact modal
function openAddContactModal() {
    document.getElementById('add-contact-modal').classList.remove('hidden');
}

// Close add contact modal
function closeAddContactModal() {
    document.getElementById('add-contact-modal').classList.add('hidden');
    document.getElementById('add-contact-form').reset();
}

// Add contact
function addContact() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const relationship = document.getElementById('contact-relationship').value;
    
    if (!name || !phone || !relationship) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const newContact = {
        id: Date.now().toString(),
        name: name,
        phone: phone,
        relationship: relationship
    };
    
    contacts.push(newContact);
    saveContacts();
    updateContactsDisplay();
    updateReadyContactsDisplay();
    closeAddContactModal();
    
    showToast(`${name} added as emergency contact`, 'success');
}

// Remove contact
function removeContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact && confirm(`Remove ${contact.name} from emergency contacts?`)) {
        contacts = contacts.filter(c => c.id !== id);
        saveContacts();
        updateContactsDisplay();
        updateReadyContactsDisplay();
        showToast(`${contact.name} removed from contacts`, 'success');
    }
}

// Update contacts display
function updateContactsDisplay() {
    const contactsList = document.getElementById('contacts-list');
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="no-contacts">No emergency contacts added yet.</p>';
        return;
    }
    
    contactsList.innerHTML = contacts.map(contact => 
        `<div class="contact-item">
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.phone} • ${contact.relationship}</p>
            </div>
            <div class="contact-actions">
                <button class="btn-icon danger" onclick="removeContact('${contact.id}')" title="Remove contact">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`
    ).join('');
}

// Update ready contacts display
function updateReadyContactsDisplay() {
    const countEl = document.getElementById('contacts-count');
    const listEl = document.getElementById('ready-contacts-list');
    
    countEl.textContent = `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} will be notified`;
    
    if (contacts.length === 0) {
        listEl.innerHTML = '<p class="no-contacts">No emergency contacts added. Go to Contacts tab to add them.</p>';
        return;
    }
    
    const displayContacts = contacts.slice(0, 3);
    const remainingCount = contacts.length - 3;
    
    listEl.innerHTML = displayContacts.map(contact => 
        `<div style="margin-bottom: 0.5rem; font-size: 0.875rem;">
            <span style="font-weight: 500;">${contact.name}</span>
            <span style="color: #64748b; margin-left: 0.5rem;">${contact.phone}</span>
        </div>`
    ).join('') + 
    (remainingCount > 0 ? `<p style="font-size: 0.75rem; color: #64748b;">+${remainingCount} more contacts</p>` : '');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set icon based on type
    if (type === 'success') {
        icon.className = 'toast-icon fas fa-check-circle';
        icon.style.color = '#22c55e';
    } else if (type === 'error') {
        icon.className = 'toast-icon fas fa-exclamation-circle';
        icon.style.color = '#dc2626';
    } else {
        icon.className = 'toast-icon fas fa-info-circle';
        icon.style.color = '#3b82f6';
    }
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('add-contact-modal');
    if (e.target === modal) {
        closeAddContactModal();
    }
});

// Handle escape key for modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAddContactModal();
    }
});