// Ultra minimal JS - 200 bytes
document.addEventListener('DOMContentLoaded', function() {
    // Highlight active nav item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
    
    // Add click animation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => this.style.transform = '', 100);
        });
    });
});
