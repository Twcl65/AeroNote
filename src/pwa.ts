if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
            })
            .catch((registrationError) => {
            });
    });
}

let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                    } else {
                    }
                    deferredPrompt = null;
                });
            }
        });
    }
});

window.addEventListener('sw-update-found', () => {
    const updateNotification = document.createElement('div');
    updateNotification.className = 'fixed top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    updateNotification.innerHTML = `
    <div class="flex items-center gap-2">
      <span>Update available</span>
      <button onclick="window.location.reload()" class="bg-white text-primary-600 px-2 py-1 rounded text-sm">
        Reload
      </button>
    </div>
  `;
    document.body.appendChild(updateNotification);

    setTimeout(() => {
        if (updateNotification.parentNode) {
            updateNotification.parentNode.removeChild(updateNotification);
        }
    }, 10000);
});

export { };
