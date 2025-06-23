# GitHub Contributions Tracker  

## Overview  
A web app that counts public GitHub contributions (commits, pull requests, and issues) for a given username within a specified date range.  
### Live Demo: 

    https://git-meter.vercel.app/
    
## Features  
- Fetches public activity via GitHub's REST API.  
- Filters contributions by user-selected date range.  
- Displays counts for commits, PRs, and issues.  

## Limitations  
1. **Private Contributions Not Included**  
   - GitHub's API does not expose private contribution counts for arbitrary users.  
   - The `/users/{username}/events` endpoint only returns public activity.  
   - Private contributions are only accessible for the authenticated user (requires OAuth).  

2. **Rate Limits**  
   - Unauthenticated requests are limited to 60/hour per IP.  
   - If the limit is reached, the app displays an error message.  

## How It Works  
1. **Input**  
   - User provides a GitHub username and date range.  
2. **Data Fetching**  
   - The app paginates through the user's public events (max 300 events).  
3. **Filtering & Counting**  
   - Events are filtered by the selected date range.  
   - Contributions are categorized into commits, PRs, and issues.  
4. **Output**  
   - Results are displayed with links to the user's GitHub profile.  

## Future Improvements  
- Add OAuth integration to fetch private contributions for logged-in users.  
- Implement caching to reduce API calls.  

## Setup  
1. Clone the repository.  
2. Open `index.html` in a browser.  
3. No backend required (pure HTML/CSS/JS).  

---  
*Note: This tool only counts public activity. For private contributions, users must authenticate via GitHub OAuth.*
