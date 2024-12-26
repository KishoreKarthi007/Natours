export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el)  el.parentElement.removeChild(el)
};
export const showAlert = (type, message) => {
    hideAlert();
    const alertHTML = `<div class="alert alert--${type}">${message}</div>`;
    document.body.insertAdjacentHTML('afterbegin',alertHTML); 
    window.setInterval(hideAlert,5000);
};
