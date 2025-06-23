// Get references to DOM elements
const form = document.getElementById('contrib-form');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

// Helper: Format date to ISO string (YYYY-MM-DD)
function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

// Helper: Check if event is within date range
function isWithinRange(eventDate, start, end) {
    const d = new Date(eventDate);
    return d >= new Date(start) && d <= new Date(end);
}

// Main form handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    results.innerHTML = '';
    loading.style.display = 'block';

    const username = form.username.value.trim();
    const startDate = form['start-date'].value;
    const endDate = form['end-date'].value;

    // Strict date validation
    function isValidDateString(dateStr) {
        // Check format YYYY-MM-DD
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;
        const [year, month, day] = dateStr.split('-').map(Number);
        if (year < 1900 || year > 2100) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        // Check if valid date
        const d = new Date(dateStr);
        return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
    }
    if (!username || !startDate || !endDate) {
        results.innerHTML = '<span style="color:red">Please fill in all fields.</span>';
        loading.style.display = 'none';
        return;
    }
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
        results.innerHTML = '<span style="color:red">Please enter valid dates in YYYY-MM-DD format (year 1900-2100).</span>';
        loading.style.display = 'none';
        return;
    }
    // Check end date is not in the future
    const today = new Date();
    const endDateObj = new Date(endDate);
    if (endDateObj > today) {
        results.innerHTML = '<span style="color:red">End date cannot be in the future.</span>';
        loading.style.display = 'none';
        return;
    }

    // GitHub API: /users/:username/events (max 300 events, paginated)
    let page = 1;
    let events = [];
    let rateLimitHit = false;
    let errorMsg = '';

    try {
        while (page <= 10) { // 10 pages x 30 events = 300 max
            const resp = await fetch(`https://api.github.com/users/${username}/events?per_page=30&page=${page}`);
            if (resp.status === 404) {
                errorMsg = 'User not found.';
                break;
            }
            if (resp.status === 403) {
                // Rate limit hit
                rateLimitHit = true;
                break;
            }
            const data = await resp.json();
            if (!Array.isArray(data) || data.length === 0) break;
            events = events.concat(data);
            if (data.length < 30) break; // No more pages
            page++;
        }
    } catch (err) {
        errorMsg = 'Network error. Please try again.';
    }

    loading.style.display = 'none';

    if (rateLimitHit) {
        results.innerHTML = '<span style="color:orange">API rate limit reached. Please try again later or use an authenticated request.</span>';
        return;
    }
    if (errorMsg) {
        results.innerHTML = `<span style="color:red">${errorMsg}</span>`;
        return;
    }
    if (events.length === 0) {
        results.innerHTML = 'No public activity found for this user.';
        return;
    }

    // Filter events by date range
    const filtered = events.filter(ev => isWithinRange(ev.created_at, startDate, endDate));

    // Count contributions
    let commits = 0, prs = 0, issues = 0;
    filtered.forEach(ev => {
        if (ev.type === 'PushEvent') {
            commits += ev.payload.commits ? ev.payload.commits.length : 0;
        } else if (ev.type === 'PullRequestEvent' && ev.payload.action === 'opened') {
            prs++;
        } else if (ev.type === 'IssuesEvent' && ev.payload.action === 'opened') {
            issues++;
        }
    });

    // Display results
    results.innerHTML = `
        <strong>Results for <a href="https://github.com/${username}" target="_blank">${username}</a>:</strong><br>
        <ul>
            <li><strong>Commits:</strong> ${commits}</li>
            <li><strong>Pull Requests Opened:</strong> ${prs}</li>
            <li><strong>Issues Opened:</strong> ${issues}</li>
        </ul>
          `;
}); 