console.log('main.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners or dynamic functionality here
    console.log('Frontend JS loaded');
    console.log('event listener added');
    const addCardButton = document.getElementById('add-card-button');

    if(addCardButton){
        addCardButton.addEventListener('click', () => {
            window.location.href = '/cards/add';
        });
    }
});
