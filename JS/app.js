// ==========================================
// STUDYFLOW GLOBAL INTERACTION & DATA ENGINE
// ==========================================

// --- DYNAMIC USER-TIED DATA STORAGE KEYS ---
function getCurrentUserEmail() {
  return localStorage.getItem('studyflow_user_email') || 'guest';
}

function getTasksKey() { return `studyflow_tasks_${getCurrentUserEmail()}`; }
function getSubjectsKey() { return `studyflow_timer_subjects_${getCurrentUserEmail()}`; }
function getSecondsKey() { return `studyflow_study_seconds_${getCurrentUserEmail()}`; }
function getAvatarStorageKey() { return `studyflow_custom_avatar_${getCurrentUserEmail()}`; }

// --- DYNAMIC ACCOUNT INITIALIZATION CONTROLLER ---
function initializeCurrentUserDatabase() {
  const tasksKey = getTasksKey();
  const subjectsKey = getSubjectsKey();
  const secondsKey = getSecondsKey();

  if (!localStorage.getItem(tasksKey)) {
    // UPDATED SCHEMA: Default structural tasks initialized with standard clean gray fallback colors
    const defaultTasks = [
      { id: 1, title: 'Mathematics', completed: true, tagColor: '#0047CC' },
      { id: 2, title: 'Social Studies', completed: false, tagColor: '#AF52DE' },
      { id: 3, title: 'English', completed: false, tagColor: '#34C759' },
      { id: 4, title: 'Urdu', completed: false, tagColor: '#FFCC00' }
    ];
    localStorage.setItem(tasksKey, JSON.stringify(defaultTasks));
  }

  if (!localStorage.getItem(subjectsKey)) {
    const defaultTimerSubjects = ['Mathematics', 'Science', 'Social Studies', 'English', 'Urdu'];
    localStorage.setItem(subjectsKey, JSON.stringify(defaultTimerSubjects));
  }

  if (!localStorage.getItem(secondsKey)) {
    localStorage.setItem(secondsKey, '0');
  }
}

// Ensure the profile has data initialized before running setup
initializeCurrentUserDatabase();

// --- MODERNIZED USER-TIED DATA ACQUISITION LAYERS ---
function getTasks() { 
  return JSON.parse(localStorage.getItem(getTasksKey()) || '[]'); 
}
function saveTasks(tasksArray) { 
  localStorage.setItem(getTasksKey(), JSON.stringify(tasksArray)); 
}
function getTodaySeconds() { 
  return parseInt(localStorage.getItem(getSecondsKey()) || '0'); 
}

function formatSecondsToHoursMins(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

window.toggleTaskStatus = function(taskId) {
  let tasks = getTasks();
  tasks = tasks.map(task => {
    if (task.id === parseInt(taskId)) task.completed = !task.completed;
    return task;
  });
  saveTasks(tasks);
  renderHomeTaskList();
  renderFullTaskList();
};

document.addEventListener('DOMContentLoaded', () => {
  initializeCurrentUserDatabase();

  // ==========================================
  // PROFESSIONAL FORGOT PASSWORD ENGINE
  // ==========================================
  const forgotPasswordRequestForm = document.getElementById('forgotPasswordRequestForm');
  const forgotPasswordResetForm = document.getElementById('forgotPasswordResetForm');
  const recoveryRequestStep = document.getElementById('recoveryRequestStep');
  const recoveryResetStep = document.getElementById('recoveryResetStep');
  const tokenNotificationBanner = document.getElementById('tokenNotificationBanner');

  let activeRecoveryEmail = "";
  let activelyGeneratedToken = "";

  if (forgotPasswordRequestForm) {
    forgotPasswordRequestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputEmail = document.getElementById('recoveryEmailInput').value.trim();

      const targetedGlobalAccountKey = `studyflow_tasks_${inputEmail}`;
      const doesUserExist = localStorage.getItem(targetedGlobalAccountKey) || inputEmail === localStorage.getItem('studyflow_user_email');

      if (!doesUserExist && inputEmail !== "guest@studyflow.com") {
        alert("This email address is not registered in our database. Please double check or create an account.");
        return;
      }

      activeRecoveryEmail = inputEmail;
      activelyGeneratedToken = "SF-" + Math.floor(100000 + Math.random() * 900000);

      recoveryRequestStep.style.display = 'none';
      recoveryResetStep.style.display = 'block';
      if (tokenNotificationBanner) {
        tokenNotificationBanner.innerHTML = `🔑 Security Token Sent! For testing, use code: <strong style="font-size:1rem; color:#0047CC; background:#fff; padding:2px 6px; border-radius:4px; border:1px solid #0047CC;">${activelyGeneratedToken}</strong>`;
      }
    });
  }

  if (forgotPasswordResetForm) {
    forgotPasswordResetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userEnteredToken = document.getElementById('recoveryTokenInput').value.trim();
      const newPasswordValue = document.getElementById('recoveryNewPasswordInput').value;
      const confirmPasswordValue = document.getElementById('recoveryConfirmPasswordInput').value;

      if (userEnteredToken !== activelyGeneratedToken) {
        alert("Invalid security authentication token! Please inspect the token provided in the notice banner.");
        return;
      }

      if (newPasswordValue !== confirmPasswordValue) {
        alert("The confirmation entry does not match your new password choice.");
        return;
      }

      localStorage.setItem('studyflow_user_email', activeRecoveryEmail);
      let derivedName = activeRecoveryEmail.split('@')[0];
      derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      localStorage.setItem('studyflow_user_name', derivedName);
      
      initializeCurrentUserDatabase();

      alert("Credentials verified! Your account password has been updated securely. Redirecting to home space...");
      window.location.href = 'home.html';
    });
  }

  // ==========================================
  // IMAGE ADJUSTMENT & CROPPING MODAL ENGINE
  // ==========================================
  const avatarImageFileInput = document.getElementById('avatarImageFileInput');
  const avatarEditorModal = document.getElementById('avatarEditorModal');
  const modalPreviewImage = document.getElementById('modalPreviewImage');
  const zoomSliderRange = document.getElementById('zoomSliderRange');
  const rotateSliderRange = document.getElementById('rotateSliderRange');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  const saveCropBtn = document.getElementById('saveCropBtn');
  const draggablePreviewRegion = document.getElementById('draggablePreviewRegion');

  const profileAvatarDisplay = document.getElementById('profileAvatarDisplay');
  const avatarDefaultEmoji = document.getElementById('avatarDefaultEmoji');
  const homeAvatarDisplay = document.getElementById('homeAvatarDisplay');
  const homeAvatarDefaultEmoji = document.getElementById('homeAvatarDefaultEmoji');
  
  const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
  const deleteAvatarBtnHome = document.getElementById('deleteAvatarBtnHome');

  let transformCoordsState = { scale: 1, rotation: 0, xOffset: 0, yOffset: 0 };
  let isDraggingActive = false;
  let startDragPointerX = 0, startDragPointerY = 0;

  function loadAndApplySavedAvatar() {
    const userSpecificKey = getAvatarStorageKey();
    const savedAvatarDataStr = localStorage.getItem(userSpecificKey);
    
    if (savedAvatarDataStr) {
      if (profileAvatarDisplay) {
        profileAvatarDisplay.style.backgroundImage = `url('${savedAvatarDataStr}')`;
        if (avatarDefaultEmoji) avatarDefaultEmoji.style.display = 'none';
      }
      if (homeAvatarDisplay) {
        homeAvatarDisplay.style.backgroundImage = `url('${savedAvatarDataStr}')`;
        if (homeAvatarDefaultEmoji) homeAvatarDefaultEmoji.style.display = 'none';
      }
      if (deleteAvatarBtn) deleteAvatarBtn.style.display = 'inline-block';
      if (deleteAvatarBtnHome) deleteAvatarBtnHome.style.display = 'inline-block';
    } else {
      if (profileAvatarDisplay) {
        profileAvatarDisplay.style.backgroundImage = 'none';
        if (avatarDefaultEmoji) avatarDefaultEmoji.style.display = 'block';
      }
      if (homeAvatarDisplay) {
        homeAvatarDisplay.style.backgroundImage = 'none';
        if (homeAvatarDefaultEmoji) homeAvatarDefaultEmoji.style.display = 'block';
      }
      if (deleteAvatarBtn) deleteAvatarBtn.style.display = 'none';
      if (deleteAvatarBtnHome) deleteAvatarBtnHome.style.display = 'none';
    }
  }
  
  loadAndApplySavedAvatar();

  function executeAvatarRemoval() {
    if (confirm("Are you sure you want to remove your profile photo?")) {
      const userSpecificKey = getAvatarStorageKey();
      localStorage.removeItem(userSpecificKey);
      loadAndApplySavedAvatar();
    }
  }

  if (deleteAvatarBtn) {
    deleteAvatarBtn.addEventListener('click', executeAvatarRemoval);
  }
  if (deleteAvatarBtnHome) {
    deleteAvatarBtnHome.addEventListener('click', executeAvatarRemoval);
  }

  if (avatarImageFileInput) {
    avatarImageFileInput.addEventListener('change', function(e) {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        modalPreviewImage.src = event.target.result;
        transformCoordsState = { scale: 1, rotation: 0, xOffset: 0, yOffset: 0 };
        if(zoomSliderRange) zoomSliderRange.value = 100;
        if(rotateSliderRange) rotateSliderRange.value = 0;
        
        modalPreviewImage.onload = function() {
          const aspectWidth = modalPreviewImage.naturalWidth;
          const aspectHeight = modalPreviewImage.naturalHeight;
          if (aspectWidth > aspectHeight) {
            modalPreviewImage.style.height = "160px";
            modalPreviewImage.style.width = "auto";
          } else {
            modalPreviewImage.style.width = "160px";
            modalPreviewImage.style.height = "auto";
          }
          applyTransformMatrixStyles();
        };
        if(avatarEditorModal) avatarEditorModal.style.display = "flex";
      };
      reader.readAsDataURL(selectedFile);
    });
  }

  function applyTransformMatrixStyles() {
    if (!modalPreviewImage) return;
    modalPreviewImage.style.transform = `translate(${transformCoordsState.xOffset}px, ${transformCoordsState.yOffset}px) scale(${transformCoordsState.scale}) rotate(${transformCoordsState.rotation}deg)`;
  }

  if (zoomSliderRange) {
    zoomSliderRange.addEventListener('input', () => {
      transformCoordsState.scale = parseFloat(zoomSliderRange.value) / 100;
      applyTransformMatrixStyles();
    });
  }
  if (rotateSliderRange) {
    rotateSliderRange.addEventListener('input', () => {
      transformCoordsState.rotation = parseInt(rotateSliderRange.value);
      applyTransformMatrixStyles();
    });
  }

  if (draggablePreviewRegion) {
    draggablePreviewRegion.addEventListener('mousedown', (e) => {
      isDraggingActive = true;
      startDragPointerX = e.clientX - transformCoordsState.xOffset;
      startDragPointerY = e.clientY - transformCoordsState.yOffset;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingActive) return;
      transformCoordsState.xOffset = e.clientX - startDragPointerX;
      transformCoordsState.yOffset = e.clientY - startDragPointerY;
      applyTransformMatrixStyles();
    });
    window.addEventListener('mouseup', () => { isDraggingActive = false; });
  }

  if (cancelCropBtn) {
    cancelCropBtn.addEventListener('click', () => {
      if(avatarEditorModal) avatarEditorModal.style.display = "none";
      if(avatarImageFileInput) avatarImageFileInput.value = "";
    });
  }

  if (saveCropBtn) {
    saveCropBtn.addEventListener('click', () => {
      const processingCanvas = document.createElement('canvas');
      processingCanvas.width = 160;
      processingCanvas.height = 160;
      const context = processingCanvas.getContext('2d');
      context.clearRect(0, 0, 160, 160);
      context.save();
      context.translate(80, 80);
      context.rotate((transformCoordsState.rotation * Math.PI) / 180);
      context.scale(transformCoordsState.scale, transformCoordsState.scale);

      const renderW = modalPreviewImage.offsetWidth;
      const renderH = modalPreviewImage.offsetHeight;
      context.drawImage(modalPreviewImage, (-renderW / 2) + (transformCoordsState.xOffset / transformCoordsState.scale), (-renderH / 2) + (transformCoordsState.yOffset / transformCoordsState.scale), renderW, renderH);
      context.restore();

      const compiledCompressedBase64Str = processingCanvas.toDataURL('image/jpeg', 0.85);
      
      const userSpecificKey = getAvatarStorageKey();
      localStorage.setItem(userSpecificKey, compiledCompressedBase64Str);
      
      loadAndApplySavedAvatar();
      if(avatarEditorModal) avatarEditorModal.style.display = "none";
      if(avatarImageFileInput) avatarImageFileInput.value = "";
    });
  }

  // ==========================================
  // GLOBAL DARK MODE ENGINE
  // ==========================================
  const appContainer = document.querySelector('.app-container');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const isDarkModeEnabled = localStorage.getItem('studyflow_dark_mode') === 'enabled';

  if (isDarkModeEnabled && appContainer) appContainer.classList.add('dark-theme');
  if (darkModeToggle) {
    darkModeToggle.checked = isDarkModeEnabled;
    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        appContainer.classList.add('dark-theme');
        localStorage.setItem('studyflow_dark_mode', 'enabled');
      } else {
        appContainer.classList.remove('dark-theme');
        localStorage.setItem('studyflow_dark_mode', 'disabled');
      }
    });
  }

  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    setTimeout(() => { window.location.href = 'onboarding1.html'; }, 2500);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = document.getElementById('loginEmail').value.trim();
      let derivedName = emailValue.split('@')[0];
      derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      localStorage.setItem('studyflow_user_name', derivedName);
      localStorage.setItem('studyflow_user_email', emailValue);
      
      initializeCurrentUserDatabase();
      window.location.href = 'home.html';
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (document.getElementById('signupPassword').value !== document.getElementById('signupConfirmPassword').value) {
        alert("Passwords do not match!");
        return;
      }
      const fullName = document.getElementById('signupName').value.trim();
      const emailValue = document.getElementById('signupEmail').value.trim();
      localStorage.setItem('studyflow_user_name', fullName);
      localStorage.setItem('studyflow_user_email', emailValue);
      
      initializeCurrentUserDatabase();
      window.location.href = 'home.html';
    });
  }

  const currentSavedName = localStorage.getItem('studyflow_user_name') || 'Guest User';
  const currentSavedEmail = localStorage.getItem('studyflow_user_email') || 'guest@studyflow.com';

  const userGreetingHeading = document.getElementById('userGreetingHeading');
  if (userGreetingHeading) userGreetingHeading.textContent = `Hi, ${currentSavedName} 👋`;

  const profileMetaName = document.getElementById('profileMetaName');
  const profileMetaEmail = document.getElementById('profileMetaEmail');
  if (profileMetaName && profileMetaEmail) {
    profileMetaName.textContent = currentSavedName;
    profileMetaEmail.textContent = currentSavedEmail;
  }

  const todaySeconds = getTodaySeconds();
  const formattedTodayTime = formatSecondsToHoursMins(todaySeconds);

  const homeStudyTimeLabel = document.getElementById('homeStudyTimeLabel');
  const homeProgressFillBar = document.getElementById('homeProgressFillBar');
  if (homeStudyTimeLabel && homeProgressFillBar) {
    homeStudyTimeLabel.innerHTML = `${formattedTodayTime} <span class="target-stat">/ 4h</span>`;
    const dailyTargetSeconds = 4 * 3600;
    const progressPercent = Math.min((todaySeconds / dailyTargetSeconds) * 100, 100);
    homeProgressFillBar.style.width = `${progressPercent}%`;
  }

  const weeklyTotalHoursLabel = document.getElementById('weeklyTotalHoursLabel');
  const MondayBarFill = document.getElementById('MondayBarFill');
  if (weeklyTotalHoursLabel) {
    weeklyTotalHoursLabel.innerHTML = `${formatSecondsToHoursMins(todaySeconds)} <span class="target-stat">/ 24h</span>`;
  }
  if (MondayBarFill) {
    const dailyTargetSeconds = 4 * 3600; 
    let customHeightPercent = (todaySeconds / dailyTargetSeconds) * 100;
    if (customHeightPercent < 5 && todaySeconds > 0) customHeightPercent = 5;
    MondayBarFill.style.height = `${Math.min(customHeightPercent, 100)}%`;
  }

  renderHomeTaskList();
  renderFullTaskList();

  // ==========================================
  // UPDATED TASK FORM SUBMISSION (WITH TAG COLOR CAPTURE)
  // ==========================================
  const createTaskForm = document.getElementById('createTaskForm');
  if (createTaskForm) {
    createTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskTitle = document.getElementById('taskTitleInput').value.trim();
      if (!taskTitle) return;
      
      // Capture the color hex code from the chosen color dot element containing the class ".selected"
      let selectedColorHex = '#CCCCCC'; // default neutral gray fallback
      const activeColorNode = document.querySelector('.color-dot-node.selected');
      if (activeColorNode && activeColorNode.getAttribute('data-color')) {
        selectedColorHex = activeColorNode.getAttribute('data-color');
      }
      
      // Save item systematically into schema bundle array
      const newTask = { 
        id: Date.now(), 
        title: taskTitle, 
        completed: false, 
        tagColor: selectedColorHex 
      };

      const currentTasks = getTasks();
      currentTasks.push(newTask);
      saveTasks(currentTasks);
      window.location.href = 'tasks.html';
    });
  }

  // ==========================================
  // SUBJECT MANAGEMENT WITH USER-ISOLATED ARRAYS
  // ==========================================
  const dropdownTrigger = document.getElementById('dropdownTrigger');
  const dropdownOptionsList = document.getElementById('dropdownOptionsList');
  const dropdownArrow = document.getElementById('dropdownArrow');
  const subjectsDynamicContainer = document.getElementById('subjectsDynamicContainer');
  const newSubjectInputField = document.getElementById('newSubjectInputField');
  const addNewSubjectBtn = document.getElementById('addNewSubjectBtn');

  function renderDropdownSubjects() {
    if (!subjectsDynamicContainer) return;
    const subjects = JSON.parse(localStorage.getItem(getSubjectsKey()) || '[]');
    subjectsDynamicContainer.innerHTML = '';

    subjects.forEach((subjectName, listIndex) => {
      const optionRow = document.createElement('div');
      optionRow.className = "subject-item-row";

      const textLabel = document.createElement('span');
      textLabel.style.flex = "1";
      textLabel.textContent = subjectName;
      
      textLabel.addEventListener('click', () => {
        document.getElementById('selectedSubjectLabel').textContent = subjectName;
        dropdownOptionsList.style.display = 'none';
        if (dropdownArrow) dropdownArrow.classList.remove('open');
      });

      const deleteActionBtn = document.createElement('button');
      deleteActionBtn.type = "button";
      deleteActionBtn.className = "delete-subject-btn";
      deleteActionBtn.innerHTML = "❌";
      deleteActionBtn.title = `Delete ${subjectName}`;
      
      deleteActionBtn.addEventListener('click', (eventClickObj) => {
        eventClickObj.stopPropagation(); 
        
        const freshSubjects = JSON.parse(localStorage.getItem(getSubjectsKey()) || '[]');
        freshSubjects.splice(listIndex, 1); 
        localStorage.setItem(getSubjectsKey(), JSON.stringify(freshSubjects));
        
        if (document.getElementById('selectedSubjectLabel').textContent === subjectName) {
          document.getElementById('selectedSubjectLabel').textContent = "Choose Study Subject";
        }

        renderDropdownSubjects(); 
      });

      optionRow.appendChild(textLabel);
      optionRow.appendChild(deleteActionBtn);
      subjectsDynamicContainer.appendChild(optionRow);
    });
  }

  if (dropdownTrigger && dropdownOptionsList) {
    dropdownTrigger.addEventListener('click', () => {
      const isOpen = dropdownOptionsList.style.display === 'block';
      dropdownOptionsList.style.display = isOpen ? 'none' : 'block';
      if (dropdownArrow) dropdownArrow.classList.toggle('open', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!dropdownTrigger.contains(e.target) && !dropdownOptionsList.contains(e.target)) {
        dropdownOptionsList.style.display = 'none';
        if (dropdownArrow) dropdownArrow.classList.remove('open');
      }
    });
  }

  if (addNewSubjectBtn && newSubjectInputField) {
    addNewSubjectBtn.addEventListener('click', () => {
      const subjectText = newSubjectInputField.value.trim();
      if (!subjectText) return;

      const currentSubjects = JSON.parse(localStorage.getItem(getSubjectsKey()) || '[]');
      if (!currentSubjects.includes(subjectText)) {
        currentSubjects.push(subjectText);
        localStorage.setItem(getSubjectsKey(), JSON.stringify(currentSubjects));
      }

      newSubjectInputField.value = '';
      renderDropdownSubjects();
    });
  }

  renderDropdownSubjects();

  // TIMER CORE RUNTIME HANDLERS
  const timerControlActionBtn = document.getElementById('timerControlActionBtn');
  const timeTimerString = document.getElementById('timeTimerString');
  const movingRingFill = document.getElementById('movingRingFill');
  const customMinutesInput = document.getElementById('customMinutesInput');

  if (timerControlActionBtn) {
    let timerEngineInterval = null;
    let isClockRunning = false;
    let totalTargetSeconds = 1500; 
    let secondsLeftCount = 1500; 
    const maxCircumferenceValue = 596.9; 

    function syncTimerDisplayFromInput() {
      if (isClockRunning) return;
      let inputVal = parseInt(customMinutesInput.value) || 25;
      if (inputVal < 1) inputVal = 1;
      if (inputVal > 180) inputVal = 180;
      
      totalTargetSeconds = inputVal * 60;
      secondsLeftCount = totalTargetSeconds;
      
      const displayMins = inputVal.toString().padStart(2, '0');
      timeTimerString.textContent = `${displayMins}:00`;
      movingRingFill.style.strokeDashoffset = 0;
    }

    if (customMinutesInput) {
      customMinutesInput.addEventListener('input', syncTimerDisplayFromInput);
      syncTimerDisplayFromInput();
    }

    timerControlActionBtn.addEventListener('click', () => {
      if (isClockRunning) {
        clearInterval(timerEngineInterval);
        isClockRunning = false;
        timerControlActionBtn.textContent = "Start Study";
        if (customMinutesInput) customMinutesInput.removeAttribute('disabled');
      } else {
        isClockRunning = true;
        timerControlActionBtn.textContent = "Pause Study";
        if (customMinutesInput) customMinutesInput.setAttribute('disabled', 'true');

        timerEngineInterval = setInterval(() => {
          if (secondsLeftCount <= 0) {
            clearInterval(timerEngineInterval);
            alert("Great focus! Session completed. Grab a break!");
            if (customMinutesInput) customMinutesInput.removeAttribute('disabled');
            isClockRunning = false;
            timerControlActionBtn.textContent = "Start Study";
            syncTimerDisplayFromInput();
            return;
          }
          
          secondsLeftCount--;
          
          let currentTotalSecs = parseInt(localStorage.getItem(getSecondsKey()) || '0');
          currentTotalSecs++;
          localStorage.setItem(getSecondsKey(), currentTotalSecs.toString());

          const currentMinsStr = Math.floor(secondsLeftCount / 60).toString().padStart(2, '0');
          const currentSecsStr = (secondsLeftCount % 60).toString().padStart(2, '0');
          timeTimerString.textContent = `${currentMinsStr}:${currentSecsStr}`;
          
          const currentProgressRatio = secondsLeftCount / totalTargetSeconds;
          movingRingFill.style.strokeDashoffset = maxCircumferenceValue * (1 - currentProgressRatio);
        }, 1000);
      }
    });
  }
});

// ==========================================
// RENDERING ENGINES (WITH LIVE VISUAL TAG COLORS)
// ==========================================
function renderHomeTaskList() {
  const homeListContainer = document.getElementById('dynamicHomeTaskList');
  if (!homeListContainer) return;
  const tasks = getTasks();
  homeListContainer.innerHTML = '';
  
  tasks.forEach(task => {
    const assignedColor = task.tagColor || '#CCCCCC'; // custom structural fallback
    const taskRow = document.createElement('div');
    taskRow.className = `task-item-static ${task.completed ? 'completed' : ''}`;
    taskRow.setAttribute('onclick', `toggleTaskStatus(${task.id})`);
    taskRow.style.cursor = 'pointer';
    
    // Injects an elegant left border accent matching the tag color option chosen
    taskRow.style.borderLeft = `5px solid ${assignedColor}`;
    taskRow.style.paddingLeft = '10px';

    taskRow.innerHTML = `
      <span class="check-icon ${task.completed ? '' : 'empty'}" style="${!task.completed ? 'border-color:' + assignedColor : ''}">${task.completed ? '✓' : ''}</span>
      <span>${task.title}</span>
    `;
    homeListContainer.appendChild(taskRow);
  });
}

function renderFullTaskList() {
  const currentContainer = document.getElementById('dynamicCurrentTasks');
  const completedContainer = document.getElementById('dynamicCompletedTasks');
  if (!currentContainer || !completedContainer) return;
  const tasks = getTasks();
  currentContainer.innerHTML = '';
  completedContainer.innerHTML = '';
  let currentCount = 0, completedCount = 0;
  
  tasks.forEach(task => {
    const assignedColor = task.tagColor || '#CCCCCC';
    const card = document.createElement('div');
    card.className = `full-task-card ${task.completed ? 'completed-group' : ''}`;
    
    // Sets matching left tracking color border to identify the course or context grouping instantly
    card.style.borderLeft = `6px solid ${assignedColor}`;
    card.style.paddingLeft = '12px';
    card.style.borderRadius = '6px';
    card.style.background = 'var(--card-bg)';
    card.style.marginBottom = '10px';

    card.innerHTML = `
      <label class="task-checkbox-wrapper" style="display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
        <span class="checkmark-box" style="${task.completed ? 'background-color:' + assignedColor : 'border-color:' + assignedColor}"></span>
        <span class="task-label-text" style="${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.title}</span>
      </label>
    `;
    
    if (task.completed) { 
      completedContainer.appendChild(card); 
      completedCount++; 
    } else { 
      currentContainer.appendChild(card); 
      currentCount++; 
    }
  });
  
  if (currentCount === 0) currentContainer.innerHTML = '<p style="font-size:0.85rem; color:#666; padding:10px;">No current items left! 🎉</p>';
  if (completedCount === 0) completedContainer.innerHTML = '<p style="font-size:0.85rem; color:#666; padding:10px;">No finished assignments yet.</p>';
}

window.selectChip = function(selectedElement) {
  const parentContainer = selectedElement.parentElement;
  parentContainer.querySelectorAll('.chip-item').forEach(chip => { chip.classList.remove('selected'); });
  selectedElement.classList.add('selected');
};

window.selectColorDot = function(selectedDot) {
  const parentGrid = selectedDot.parentElement;
  parentGrid.querySelectorAll('.color-dot-node').forEach(dot => { dot.classList.remove('selected'); });
  selectedDot.classList.add('selected');
};