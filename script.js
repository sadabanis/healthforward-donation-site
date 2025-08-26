// Global variables
let selectedAmount = 50;
let adminSettings = {
    paypal: { email: '' },
    bank: { name: '', account: '', routing: '' },
    upi: { id: '', qrCode: '' }
};

// Load admin settings from localStorage
function loadAdminSettings() {
    const saved = localStorage.getItem('healthforward-admin');
    if (saved) {
        adminSettings = JSON.parse(saved);
    }
}

// Save admin settings to localStorage
function saveAdminSettings() {
    localStorage.setItem('healthforward-admin', JSON.stringify(adminSettings));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminSettings();
    
    // Add event listeners
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processCardDonation();
    });
    
    // Format card number input
    const cardInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
    if (cardInput) {
        cardInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date input
    const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0,2) + '/' + value.substring(2,4);
            }
            e.target.value = value;
        });
    }
});

// Amount selection functions
function selectAmount(amount) {
    selectedAmount = amount;
    document.getElementById('customAmount').value = '';
    
    // Update button states
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateSelectedAmountDisplay();
}

function selectCustomAmount() {
    const customValue = document.getElementById('customAmount').value;
    if (customValue && customValue > 0) {
        selectedAmount = parseFloat(customValue);
        
        // Remove active state from preset buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        updateSelectedAmountDisplay();
    }
}

function updateSelectedAmountDisplay() {
    document.getElementById('selectedAmountDisplay').textContent = `$${selectedAmount}`;
}

// Modal functions
function openDonationModal() {
    updateSelectedAmountDisplay();
    document.getElementById('donationModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    document.getElementById('donationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// Payment processing functions
function processCardDonation() {
    // Show loading state
    const btn = document.querySelector('#cardForm .process-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // In a real implementation, you would integrate with Stripe, Square, etc.
        console.log('Card payment processed:', {
            amount: selectedAmount,
            bankDetails: adminSettings.bank
        });
        
        showSuccessMessage();
        closeDonationModal();
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
}

function processPayPalDonation() {
    // In a real implementation, redirect to PayPal
    if (adminSettings.paypal.email) {
        console.log('PayPal payment initiated:', {
            amount: selectedAmount,
            paypalEmail: adminSettings.paypal.email
        });
        
        // Simulate PayPal redirect
        setTimeout(() => {
            showSuccessMessage();
            closeDonationModal();
        }, 1500);
    } else {
        alert('PayPal not configured. Please contact administrator.');
    }
}

function processUPIDonation() {
    const upiId = document.getElementById('upiIdInput').value;
    
    if (upiId || adminSettings.upi.id) {
        console.log('UPI payment initiated:', {
            amount: selectedAmount,
            upiId: upiId || adminSettings.upi.id
        });
        
        setTimeout(() => {
            showSuccessMessage();
            closeDonationModal();
        }, 1500);
    } else {
        alert('Please enter UPI ID or scan QR code');
    }
}

// Success message
function showSuccessMessage() {
    document.getElementById('successMessage').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        closeSuccessMessage();
    }, 10000);
}

function closeSuccessMessage() {
    document.getElementById('successMessage').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Admin functions
function showAdminLogin() {
    const password = prompt('Enter admin password:');
    if (password === 'healthforward2024') { // Change this password!
        showAdminPanel();
    } else if (password !== null) {
        alert('Incorrect password');
    }
}

function showAdminPanel() {
    // Load current settings into form
    document.getElementById('paypalEmail').value = adminSettings.paypal.email || '';
    document.getElementById('bankName').value = adminSettings.bank.name || '';
    document.getElementById('accountNumber').value = adminSettings.bank.account || '';
    document.getElementById('routingNumber').value = adminSettings.bank.routing || '';
    document.getElementById('upiId').value = adminSettings.upi.id || '';
    
    document.getElementById('adminPanel').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function savePayPalSettings() {
    adminSettings.paypal.email = document.getElementById('paypalEmail').value;
    saveAdminSettings();
    alert('PayPal settings saved successfully!');
}

function saveBankSettings() {
    adminSettings.bank.name = document.getElementById('bankName').value;
    adminSettings.bank.account = document.getElementById('accountNumber').value;
    adminSettings.bank.routing = document.getElementById('routingNumber').value;
    saveAdminSettings();
    alert('Bank settings saved successfully!');
}

function saveUPISettings() {
    adminSettings.upi.id = document.getElementById('upiId').value;
    saveAdminSettings();
    alert('UPI settings saved successfully!');
    
    // Update QR code display
    updateUPIQRCode();
}

function updateUPIQRCode() {
    const qrContainer = document.getElementById('upiQrCode');
    if (adminSettings.upi.id) {
        // In a real implementation, generate actual QR code
        qrContainer.innerHTML = `<div style="font-size: 0.9rem; color: #333;">QR Code for<br><strong>${adminSettings.upi.id}</strong></div>`;
    }
}

function uploadUPIQR() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                adminSettings.upi.qrCode = e.target.result;
                saveAdminSettings();
                
                // Update display
                document.getElementById('upiQrCode').innerHTML = 
                    `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
                
                alert('QR code uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const donationModal = document.getElementById('donationModal');
    const adminPanel = document.getElementById('adminPanel');
    
    if (event.target === donationModal) {
        closeDonationModal();
    }
    if (event.target === adminPanel) {
        closeAdminPanel();
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
