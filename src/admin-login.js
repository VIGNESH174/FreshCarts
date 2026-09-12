import { supabase } from './services/supabase.js';


const loginForm =
    document.getElementById('adminLoginForm');

const loginButton =
    document.getElementById('adminLoginButton');

const loginMessage =
    document.getElementById('adminLoginMessage');


loginForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email =
        document.getElementById('adminEmail').value.trim();

    const password =
        document.getElementById('adminPassword').value;


    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    loginMessage.textContent = '';


    try {

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {
            throw error;
        }


        console.log(
            'FreshCart: Admin login successful',
            data.user
        );


        loginMessage.textContent =
            'Login successful. Redirecting...';


        window.location.href = '/admin.html';


    } catch (error) {

        console.error(
            'FreshCart: Admin login failed',
            error
        );

        loginMessage.textContent =
            error.message || 'Login failed.';

        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }

});