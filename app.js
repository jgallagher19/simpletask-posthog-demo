// --- PostHog Configuration ---
// Replace '<YOUR_API_KEY>' and '<YOUR_INSTANCE_ADDRESS>' later
const POSTHOG_API_KEY = 'phc_jxuHtJUyzGqAahMNsFUa0JfXNE3KRnfaioJgOEWPM4S';
const POSTHOG_HOST = 'https://us.i.posthog.com'; // e.g., 'https://app.posthog.com' or 'https://us.i.posthog.com'

// --- DOM Elements ---
const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userIdInput = document.getElementById('user-id');
const userEmailInput = document.getElementById('user-email');
const welcomeUser = document.getElementById('welcome-user');
const addTaskBtn = document.getElementById('add-task-btn');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const priorityFeature = document.getElementById('priority-feature');

// --- App State ---
let isLoggedIn = false;
let currentUserId = null;
let currentUserEmail = null;

// --- Functions ---

function initializePostHog() {
    if (window.posthog) {
        console.log('Initializing PostHog...');
        window.posthog.init(POSTHOG_API_KEY, {
            api_host: POSTHOG_HOST,
            // Enable session recording - make sure it's also enabled in Project Settings
            session_recording: {
                maskAllInputs: true, // Example privacy setting
                maskTextSelector: '.sensitive-data', // Example privacy setting
            },
            // This flag helps debug identify/alias calls
            _capture_metrics: true,
            // Callback function after flags load
            loaded: function (posthog) {
                console.log("PostHog flags loaded!");
                updateUIBasedOnLogin(); // Re-check flags after they load
            }
        });
        console.log('PostHog Initialized.');
    } else {
        console.error('PostHog snippet not loaded correctly.');
    }
}

function handleLogin() {
    currentUserId = userIdInput.value.trim();
    currentUserEmail = userEmailInput.value.trim();

    if (!currentUserId || !currentUserEmail) {
        alert('Please enter User ID and Email');
        return;
    }

    isLoggedIn = true;
    console.log(`User logged in: ${currentUserId}`);

    // *** IMPORTANT: Identify the user to PostHog ***
    if (window.posthog) {
        console.log('Calling posthog.identify...');
        window.posthog.identify(
            currentUserId,
            { email: currentUserEmail }
        );
        console.log('posthog.identify called.');
    }

    updateUIBasedOnLogin();
}

function handleLogout() {
    console.log(`User logged out: ${currentUserId}`);
    isLoggedIn = false;
    currentUserId = null;
    currentUserEmail = null;

    // *** IMPORTANT: Reset PostHog identity ***
    if (window.posthog) {
        console.log('Calling posthog.reset...');
        window.posthog.reset(); // Resets distinct_id to anonymous
        console.log('posthog.reset called.');
    }

    updateUIBasedOnLogin();
    taskList.innerHTML = ''; // Clear task list
    taskInput.value = '';
}

function handleAddTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const li = document.createElement('li');
    li.textContent = taskText;
    taskList.appendChild(li);
    taskInput.value = '';

    console.log(`Task added: ${taskText}`);

    // *** IMPORTANT: Capture custom event ***
    if (window.posthog) {
        console.log('Calling posthog.capture("Task Added")...');
        window.posthog.capture('Task Added', { task_length: taskText.length });
        console.log('posthog.capture called.');
    }
}

function updateUIBasedOnLogin() {
    if (isLoggedIn) {
        loginSection.classList.add('hidden');
        dashboard.classList.remove('hidden');
        welcomeUser.textContent = currentUserEmail || currentUserId;

        // Check feature flag *after* identify might have happened and flags potentially loaded
        if (window.posthog && window.posthog.isFeatureEnabled('priority-tasks')) {
            console.log('Feature flag "priority-tasks" is ENABLED');
            priorityFeature.classList.remove('hidden');
        } else {
            console.log('Feature flag "priority-tasks" is DISABLED or not loaded yet');
            priorityFeature.classList.add('hidden');
        }

    } else {
        loginSection.classList.remove('hidden');
        dashboard.classList.add('hidden');
        priorityFeature.classList.add('hidden'); // Hide feature when logged out
    }
}


// --- Event Listeners ---
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
addTaskBtn.addEventListener('click', handleAddTask);

// --- Initial Setup ---
// Try initializing PostHog right away
initializePostHog();
// Initial UI state (logged out)
updateUIBasedOnLogin();