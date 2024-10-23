

let userEmail = 'jonh@doe.com';
let funnelStep = 1;
let currentPage;

const pages = [
    undefined, // Placeholder if there is no page 0
    'collectEmail', 
    'collectPassword',
    'offerPlans'
];

let currentButton = null;

function switchStep() {
    // Ensure the step index is valid
    if (funnelStep >= pages.length || funnelStep < 0) {
        return;
    }

    // Iterate through pages and toggle visibility
    pages.forEach((pageId, index) => {
        const page = document.getElementById(pageId);
        if (page == undefined) {
            return;
        }
        if (index === funnelStep) {
            currentPage = pages[funnelStep];
            page.style.display = 'flex'; // Show the current step
        } else {
            page.style.display = 'none'; // Hide all other steps
        }
    });

    // Handle button logic after switching page
    handleButton();
}



document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {  // Check if the Enter key is pressed
        if (currentPage === 'collectEmail') {

            const emailInput = document.getElementById('email');  // Get the email input field
            if (emailInput && emailInput.value.trim() !== "") {  // Ensure input is not empty or just spaces
                const currentButton = document.getElementById('collectEmail_button');
                if (currentButton) {
                    currentButton.click();  // Trigger email button click
                }
            }
               
        } else if (currentPage === 'collectPassword') {

            const passwordInput = document.getElementById('password');  // Get the password input field
            const passwordConfirm = document.getElementById('password_confirm');  // Get the password confirm input field
            const currentButton = document.getElementById('collectPassword_button');  // Get the password button

            // If passwordConfirm is in focus and not empty, trigger the button click
            if (document.activeElement === passwordConfirm) {
                if (passwordConfirm.value.trim() !== "") {  // Ensure passwordConfirm is not empty
                    if (currentButton) {
                        currentButton.click();  // Trigger password button click
                    }
                }
            } 
            // If passwordInput is in focus, move focus to passwordConfirm
            else if (document.activeElement === passwordInput) {
                if (passwordInput.value.trim() !== "") {  // Ensure passwordInput is not empty
                    passwordConfirm.focus();  // Move focus to passwordConfirm
                }
            }
        }
    }
});


function handleButton() {
    if (currentPage == 'collectEmail') {
        currentButton = document.getElementById('collectEmail_button');

        // Add event listener only if it hasn't been added yet
        if (currentButton && !currentButton.hasListenerAttached) {
            currentButton.addEventListener('click', ()=>{
                currentButton.style.backgroundColor = `#00107A` 
                setTimeout(() => {
                    currentButton.style.backgroundColor = `#0022FF` 
                }, 2000);
                goNextEmail()
            } );
            currentButton.hasListenerAttached = true; // Mark as having listener
        }



    } 


/*     PASSWORD PAGE */    

 else if (currentPage == 'collectPassword') {
        currentButton = document.getElementById('collectPassword_button');

        if (currentButton && !currentButton.hasListenerAttached) {
            currentButton.addEventListener('click', goNextPassword);
            currentButton.hasListenerAttached = true; // Mark as having listener
        }

        const previewEmail = document.getElementById('previewEmail');

        if(previewEmail){
            previewEmail.innerHTML = `<img src="./assets/backarrow.svg"> ${userEmail}`;
        }
        if (previewEmail && !previewEmail.hasListenerAttached) {
            previewEmail.addEventListener('click', function () {
                funnelStep = 1;
                switchStep();
            });
            previewEmail.hasListenerAttached = true; // Mark as having listener
        }
    }


/*     PLANS PAGE
 */
else if (currentPage == 'offerPlans') {


    const plans = {
        basic: {
            
            button: document.getElementById('basicPlan'),
            checkout: 'https://checkout.perfectpay.com.br/pay/PPU38CP4O1P'
        },
        gold: {
            
            button: document.getElementById('goldPlan'),
            checkout: 'https://checkout.perfectpay.com.br/pay/PPU38CP4O1Q'
        }
    }
    
    function redirectToCheckout(plan) {
        // Retrieve the selected plan's checkout URL
        const checkoutUrl = plans[plan].checkout;
    
        // Append the email as a URL parameter
        const urlWithParams = `${checkoutUrl}?email=${encodeURIComponent(userEmail)}`;
    
        // Redirect the user to the new URL
        window.location.href = urlWithParams;
    }
    
    // Example: Add event listeners to redirect to the respective checkout URLs
    plans.basic.button.addEventListener('click', function() {
        redirectToCheckout('basic');
    });
    
    plans.gold.button.addEventListener('click', function() {
        redirectToCheckout('gold');
    });

    }


}





// Email step next handler
function goNextEmail() {

    
    const emailInput = document.getElementById('email');
    const emailLabel = document.querySelector('label[for="email"]');
     userEmail = emailInput.value;

    // Check if the email input is valid
    if (!emailInput.checkValidity()) {
        emailInput.classList.add('error');
        emailLabel.classList.add('error');

        currentButton.style.backgroundColor = `#0022FF` 


        setTimeout(() => {
            emailInput.classList.remove('error');
            emailLabel.classList.remove('error');
        }, 2000);
        return;
    }

    // Make an HTTP GET request to check if the email exists
    fetch(`https://webhook.workez.online/webhook/checkEmailExist?userEmail=${encodeURIComponent(userEmail)}`)
        .then(response => response.json())
        .then(data => {
            if (data.result) {  // If the email exists, redirect to google.com
                window.location.href = `https://www.obizilla.xyz/login?email=${encodeURIComponent(userEmail)}`;
            } else {
                // If the email does not exist, continue with your script
                userEmail = emailInput.value
                funnelStep = 2;
                switchStep();
            }
        })
}



// Password step next handler
function goNextPassword() {
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirm');

    if (!passwordInput.value || !passwordConfirmInput.value) {
        passwordInput.classList.add('error');
        passwordConfirmInput.classList.add('error');

        setTimeout(() => {
            passwordInput.classList.remove('error');
            passwordConfirmInput.classList.remove('error');
        }, 2000);
        return;
    }

    if (passwordInput.value !== passwordConfirmInput.value) {
        passwordInput.classList.add('error');
        passwordConfirmInput.classList.add('error');

        setTimeout(() => {
            passwordInput.classList.remove('error');
            passwordConfirmInput.classList.remove('error');
        }, 2000);
        return;
    }


    // Send the password directly to your webhook without encryption
    const data = {
        email: userEmail,  
        password: passwordInput.value
    };

    fetch('https://webhook.workez.online/webhook/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        
        if(result.created){
            funnelStep++;
            switchStep();
        }
          // Proceed to the next step in the funnel
    })
    .catch(error => {
        console.error('Error sending data to webhook:', error);
    });
}




switchStep();
