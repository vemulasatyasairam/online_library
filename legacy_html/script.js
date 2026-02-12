document.addEventListener('DOMContentLoaded', function () {
    // Frontend authentication using backend API

    // --- Helpers ---
    const page = (location.pathname || '').split('/').pop();

    function isProtectedPage(p) {
        // pages that require authentication
        return ['personal.html','explorer.html'].includes(p);
    }

    function getNextFromQuery() {
        const params = new URLSearchParams(location.search || '');
        const next = params.get('next');
        return next && next.trim() ? next : 'explorer.html';
    }

    // Check if using auth-service (backend) or localStorage fallback
    const useBackendAuth = typeof AuthService !== 'undefined';

    // --- Library books metadata ---
    // Accessible globally for book.html to read
    window.libraryBooks = [
        { id: 'book1', title: 'IAS', author: 'A. Sharma', subject: 'General Studies', pdf: 'pdfs/ias.pdf', branch: 'Knowledge' },
        { id: 'book2', title: 'Indian Polity', author: 'L. Verma', subject: 'Polity', pdf: 'pdfs/polity.pdf', branch: 'Knowledge' },
        { id: 'book3', title: 'Indian Economy', author: 'R. Gupta', subject: 'Economy', pdf: 'pdfs/economy.pdf', branch: 'Knowledge' },
        { id: 'book4', title: 'Mahabharata', author: 'Vyasa', subject: 'Epic', pdf: 'pdfs/mahabharata.pdf', branch: 'Devotional' },
        { id: 'book5', title: 'Ramayanam', author: 'Valmiki', subject: 'Epic', pdf: 'pdfs/ramayanam.pdf', branch: 'Devotional' },
        { id: 'book6', title: 'Bhagavat Gita', author: 'Krishna', subject: 'Philosophy', pdf: 'pdfs/bhagavatgita.pdf', branch: 'Devotional' }
    ];

    function getBookById(id) {
        return window.libraryBooks.find(b => b.id === id) || null;
    }

    function getCurrentUserEmail(){
        if (useBackendAuth) {
            return AuthService.getCurrentUser();
        }
        return localStorage.getItem('currentUser') || null;
    }

    function saveBookForCurrentUser(book) {
        const email = getCurrentUserEmail();
        if (!email) return false;

        if (useBackendAuth) {
            // Use backend API
            AuthService.saveBook(book).then(result => {
                if (!result.ok) {
                    console.error('Failed to save book:', result.error);
                }
            }).catch(err => console.error('Save book error:', err));
            return true;
        } else {
            // Fallback to localStorage
            const key = `saved_${email}`;
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            if (!arr.find(b=>b.id===book.id)) arr.push(book);
            localStorage.setItem(key, JSON.stringify(arr));
            return true;
        }
    }

    function getUsers() {
           const raw = localStorage.getItem('users');
           return raw ? JSON.parse(raw) : [];
    }

    function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }

    // ensure a demo user exists
    if (getUsers().length === 0) {
        saveUsers([{ email: 'bramhanaidu@sasi.ac.in', password: '8074940006' }]);
    }

    function isLoggedIn() {
        if (useBackendAuth) {
            return AuthService.isLoggedIn();
        }
        return localStorage.getItem('loggedIn') === 'true';
    }

    function getCurrentUserEmail() {
        if (useBackendAuth) {
            return AuthService.getCurrentUser();
        }
        return localStorage.getItem('currentUser');
    }

    // If current page is protected and user not logged in, redirect to login
    if (isProtectedPage(page) && !isLoggedIn()) {
        const next = encodeURIComponent(location.pathname + location.search + location.hash);
        location.href = 'login.html?next=' + next;
        return;
    }

    // If user is already logged in and visits the login page, send to explorer
    if (page === 'login.html' && isLoggedIn()) {
        location.href = 'explorer.html';
        return;
    }

    // --- Explorer search logic (preserve existing behavior) ---
    const searchInput = document.querySelector('.logo input[type="text"]');
    if (searchInput) {
        const bookCards = document.querySelectorAll('.book-setup > div');
        const sidebarLinks = document.querySelectorAll('aside .year-list a, aside details summary');

        searchInput.addEventListener('input', function (e) {
            const q = e.target.value.trim().toLowerCase();
            bookCards.forEach(card => {
                const text = (card.innerText || '').toLowerCase();
                const match = q === '' || text.indexOf(q) !== -1;
                card.style.display = match ? '' : 'none';
            });
            sidebarLinks.forEach(el => {
                const text = (el.innerText || '').toLowerCase();
                el.style.backgroundColor = q !== '' && text.indexOf(q) !== -1 ? 'rgba(255,255,0,0.12)' : '';
            });
        });
    }

    // --- Login/OTP/Register logic moved to login.html ---
    // This script now only handles page protection and general UI logic

    // --- Simple UI behavior for pages that have 'My Books' button ---
    // wire header and hero My Books buttons
    const headerMyBooks = document.getElementById('my-books-btn');
    const heroMyBooks = document.getElementById('hero-my-books');
    function handleMyBooksClick() {
        if (!isLoggedIn()) { location.href = 'login.html'; return; }
        // user is logged in — go to personal page
        location.href = 'personal.html';
    }
    if (headerMyBooks) headerMyBooks.addEventListener('click', handleMyBooksClick);
    if (heroMyBooks) heroMyBooks.addEventListener('click', handleMyBooksClick);
    
    // Explorer: wire Save buttons
    const saveButtons = document.querySelectorAll('.save-btn');
    if (saveButtons && saveButtons.length) {
        saveButtons.forEach(btn=> btn.addEventListener('click', function(){
            const id = this.getAttribute('data-id');
            const book = getBookById(id);
            if (!book) { alert('Book not found'); return; }
            if (!isLoggedIn()) { location.href = 'login.html'; return; }
            const ok = saveBookForCurrentUser(book);
            if (ok) alert('Saved to My Books'); else alert('Could not save');
        }));
    }
});
