import '@babel/polyfill';
import { login, logout } from './login';
import { updateUserSetting } from './updateSetting';
import {bookTour} from './stripe';
import { showAlert } from './alert';

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.querySelector('#book-tour');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form =new FormData();
        form.append('name',document.querySelector('#name').value)
        form.append('email',document.querySelector('#email').value)
        form.append('photo',document.querySelector('#photo').files[0])
        updateUserSetting(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        document.querySelector('.btn-save-password').innerHTML='Updating...'
        const passwordCurrent =
            document.querySelector('#password-current').value;
        const password = document.querySelector('#password').value;
        const passwordConfirm =
            document.querySelector('#password-confirm').value;
        await updateUserSetting(
            {
                passwordCurrent,
                password,
                passwordConfirm,
            },
            'password'
        );

        document.querySelector('.btn-save-password').innerHTML='Save Password'
        document.querySelector('#password-current').innerHTML = '';
        document.querySelector('#password').innerHTML = '';
        document.querySelector('#password-confirm').innerHTML = '';
    });
}

if(bookBtn){
    bookBtn.addEventListener('click', e =>{
        e.target.textContent = 'Processing...   '
        const {tourId} = e.target.dataset
        bookTour(tourId);
    })
}

const alertMessage = document.querySelector('body').dataset.alert ;
if(alertMessage) showAlert('success',alertMessage)