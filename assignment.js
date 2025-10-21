// Assignment page JavaScript

// Initialize icons
document.getElementById('icon-1').innerHTML = icon('book-open', 'icon-lg');
document.getElementById('icon-2').innerHTML = icon('graduation-cap', 'icon-lg');
document.getElementById('icon-3').innerHTML = icon('lightbulb', 'icon-lg');
document.getElementById('icon-4').innerHTML = icon('file-text', 'icon-lg');
document.getElementById('upload-icon').innerHTML = icon('upload', 'icon-lg');
document.getElementById('search-icon').innerHTML = icon('search', 'icon');
document.getElementById('tip-icon').innerHTML = icon('lightbulb', 'icon');
document.getElementById('timer-icon').innerHTML = icon('play', 'icon');
document.getElementById('calendar-icon').innerHTML = icon('calendar', 'icon');
document.getElementById('notes-icon').innerHTML = icon('sticky-note', 'icon');

// Templates functionality
const templates = [
  { id: '1', name: 'Essay Template', description: 'Structured essay format with citation examples', category: 'Writing' },
  { id: '2', name: 'Lab Report', description: 'Scientific report structure with sections', category: 'Writing' },
  { id: '3', name: 'Presentation Slides', description: 'Professional slide deck template', category: 'Presentations' },
  { id: '4', name: 'Study Planner', description: 'Weekly study schedule organizer', category: 'Planning' },
  { id: '5', name: 'Revision Schedule', description: 'Exam prep timeline tracker', category: 'Planning' }
];

let selectedCategory = 'All';

function renderTemplateFilters() {
  const categories = ['All', 'Writing', 'Planning', 'Presentations'];
  const html = categories.map(cat => 
    `<span class="badge ${selectedCategory === cat ? '' : 'badge-outline'}" onclick="filterTemplates('${cat}')" style="cursor: pointer;">${cat}</span>`
  ).join('');
  document.getElementById('template-filters').innerHTML = html;
}

function filterTemplates(category) {
  selectedCategory = category;
  renderTemplateFilters();
  renderTemplates();
}

function renderTemplates() {
  const filtered = selectedCategory === 'All' ? templates : templates.filter(t => t.category === selectedCategory);
  const html = filtered.map(template => `
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg flex items-start gap-2">
          ${icon('file-text', 'icon')}
          ${template.name}
        </h3>
      </div>
      <div class="card-content">
        <p class="text-sm text-muted">${template.description}</p>
      </div>
      <div class="card-content" style="padding-top: 0; display: flex; gap: 0.5rem;">
        <a href="#download-${template.id}" class="btn btn-primary btn-sm" style="flex: 1; text-decoration: none;">
          ${icon('download', 'icon-sm')} Download
        </a>
        <a href="#gdocs-${template.id}" class="btn btn-outline btn-sm" style="flex: 1; text-decoration: none;">
          ${icon('external-link', 'icon-sm')} Google Docs
        </a>
      </div>
    </div>
  `).join('');
  document.getElementById('template-grid').innerHTML = html;
}

document.getElementById('template-upload').addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    Toast.show('Template uploaded and saved locally', 'success');
  }
});

// Grade Calculator
const STORAGE_KEY = 'campuslink-grades';
let assessments = [
  { id: '1', name: 'Assignment 1', weight: '20', achieved: '' },
  { id: '2', name: 'Midterm Exam', weight: '30', achieved: '' },
  { id: '3', name: 'Final Exam', weight: '50', achieved: '' }
];

function loadGrades() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      assessments = data.assessments;
      document.getElementById('target-grade').value = data.targetGrade || '75';
    } catch (e) {
      console.error('Failed to parse stored grades');
    }
  }
}

function saveGrades() {
  const targetGrade = document.getElementById('target-grade').value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ assessments, targetGrade }));
}

function addAssessment() {
  assessments.push({ id: Date.now().toString(), name: '', weight: '', achieved: '' });
  renderGradeTable();
  saveGrades();
}

function removeAssessment(id) {
  if (assessments.length <= 1) {
    Toast.show('Must have at least one assessment', 'error');
    return;
  }
  assessments = assessments.filter(a => a.id !== id);
  renderGradeTable();
  saveGrades();
}

function updateAssessment(id, field, value) {
  const assessment = assessments.find(a => a.id === id);
  if (assessment) {
    assessment[field] = value;
    calculateGrades();
    saveGrades();
  }
}

function renderGradeTable() {
  const html = `
    <div style="overflow-x: auto;">
      <div style="min-width: 600px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.75rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
          <strong class="text-sm">Assessment Name</strong>
          <strong class="text-sm">Weight (%)</strong>
          <strong class="text-sm">Achieved (%)</strong>
          <div style="width: 2rem;"></div>
        </div>
        ${assessments.map(a => `
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.75rem; margin-bottom: 0.5rem;">
            <input type="text" class="input" placeholder="e.g., Assignment 1" value="${a.name}" 
              onchange="updateAssessment('${a.id}', 'name', this.value)">
            <input type="number" class="input" min="0" max="100" placeholder="0" value="${a.weight}"
              onchange="updateAssessment('${a.id}', 'weight', this.value)">
            <input type="number" class="input" min="0" max="100" placeholder="0" value="${a.achieved}"
              onchange="updateAssessment('${a.id}', 'achieved', this.value)">
            <button class="btn btn-ghost btn-icon" onclick="removeAssessment('${a.id}')" aria-label="Remove">
              ${icon('trash', 'icon-sm')}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('grade-table').innerHTML = html;
  calculateGrades();
}

function calculateGrades() {
  const totalWeight = assessments.reduce((sum, a) => sum + (parseFloat(a.weight) || 0), 0);
  const currentWeighted = assessments.reduce((sum, a) => {
    const weight = parseFloat(a.weight) || 0;
    const achieved = parseFloat(a.achieved) || 0;
    return sum + (weight * achieved / 100);
  }, 0);
  const completedWeight = assessments.reduce((sum, a) => 
    a.achieved ? sum + (parseFloat(a.weight) || 0) : sum, 0
  );
  const remainingWeight = totalWeight - completedWeight;
  const target = parseFloat(document.getElementById('target-grade').value) || 0;
  const requiredScore = remainingWeight > 0 ? ((target - currentWeighted) / remainingWeight) * 100 : 0;

  document.getElementById('total-weight').textContent = totalWeight.toFixed(1) + '%';
  document.getElementById('total-weight').style.color = totalWeight === 100 ? 'var(--text)' : 'var(--error)';
  document.getElementById('weight-progress').style.width = Math.min(totalWeight, 100) + '%';
  
  const warning = totalWeight > 100 ? '⚠️ Total weight exceeds 100%' : 
                  totalWeight < 100 ? '⚠️ Total weight should equal 100%' : '';
  document.getElementById('weight-warning').textContent = warning;
  
  document.getElementById('current-grade').textContent = currentWeighted.toFixed(2) + '%';
  document.getElementById('required-score').textContent = requiredScore.toFixed(2) + '%';
  document.getElementById('required-score').style.color = 
    requiredScore > 100 ? 'var(--error)' : requiredScore < 0 ? 'var(--success)' : 'var(--text)';
}

function exportGrades() {
  const data = { assessments, targetGrade: document.getElementById('target-grade').value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grades-export.json';
  a.click();
  Toast.show('Grades exported successfully', 'success');
}

document.getElementById('import-grades').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      assessments = data.assessments;
      document.getElementById('target-grade').value = data.targetGrade;
      renderGradeTable();
      saveGrades();
      Toast.show('Grades imported successfully', 'success');
    } catch {
      Toast.show('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
});

document.getElementById('target-grade').addEventListener('input', calculateGrades);

// Resource list
const resources = [
  { name: 'Peer-reviewed databases', url: '#databases' },
  { name: 'How to read a paper', url: '#reading-guide' },
  { name: 'Literature review guide', url: '#lit-review' },
  { name: 'Avoiding plagiarism', url: '#plagiarism' }
];

function renderResources() {
  const html = resources.map(r => `
    <a href="${r.url}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: calc(var(--radius) - 0.5rem); text-decoration: none; transition: all 0.2s;" 
      onmouseover="this.style.background='rgba(159, 195, 214, 0.2)'" 
      onmouseout="this.style.background='transparent'">
      <span class="text-sm font-semibold" style="color: var(--text);">${r.name}</span>
      ${icon('external-link', 'icon-sm')}
    </a>
  `).join('');
  document.getElementById('resource-list').innerHTML = html;
}

// Pomodoro Timer
let timerSeconds = 25 * 60;
let timerInterval = null;
let isRunning = false;
let isBreak = false;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  isRunning = !isRunning;
  if (isRunning) {
    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        isRunning = false;
        clearInterval(timerInterval);
        if (!isBreak) {
          timerSeconds = 5 * 60;
          isBreak = true;
          document.getElementById('timer-mode').textContent = 'Break Time';
        } else {
          timerSeconds = 25 * 60;
          isBreak = false;
          document.getElementById('timer-mode').textContent = 'Focus Time';
        }
      }
      document.getElementById('timer-display').textContent = formatTime(timerSeconds);
    }, 1000);
    document.getElementById('timer-toggle').innerHTML = icon('pause', 'icon-sm') + ' Pause';
    document.getElementById('timer-toggle').className = 'btn btn-secondary w-full';
  } else {
    clearInterval(timerInterval);
    document.getElementById('timer-toggle').innerHTML = icon('play', 'icon-sm') + ' Start';
    document.getElementById('timer-toggle').className = 'btn btn-primary w-full';
  }
}

function resetTimer() {
  isRunning = false;
  isBreak = false;
  timerSeconds = 25 * 60;
  clearInterval(timerInterval);
  document.getElementById('timer-display').textContent = formatTime(timerSeconds);
  document.getElementById('timer-mode').textContent = 'Focus Time';
  document.getElementById('timer-toggle').innerHTML = icon('play', 'icon-sm') + ' Start';
  document.getElementById('timer-toggle').className = 'btn btn-primary w-full';
}

// Deadline countdown
document.getElementById('deadline-input').addEventListener('change', (e) => {
  const deadline = new Date(e.target.value);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  document.getElementById('countdown-display').classList.remove('hidden');
  document.getElementById('days-left').textContent = days;
  document.getElementById('days-left').style.color = days < 7 ? 'var(--error)' : 'var(--brand-primary)';
});

// Notes scratchpad
const notesTextarea = document.getElementById('notes-textarea');
const notesStored = localStorage.getItem('campuslink-notes');
if (notesStored) notesTextarea.value = notesStored;

let notesTimeout;
notesTextarea.addEventListener('input', () => {
  clearTimeout(notesTimeout);
  notesTimeout = setTimeout(() => {
    localStorage.setItem('campuslink-notes', notesTextarea.value);
  }, 500);
});

// Initialize buttons with icons
document.getElementById('export-btn').innerHTML = icon('download', 'icon-sm') + ' Export';
document.getElementById('import-btn').innerHTML = icon('upload', 'icon-sm') + ' Import';
document.getElementById('add-assessment-btn').innerHTML = icon('plus', 'icon-sm') + ' Add Assessment';
document.getElementById('scholar-btn').innerHTML = icon('external-link', 'icon-sm') + ' Open Google Scholar';
document.getElementById('library-btn').innerHTML = icon('external-link', 'icon-sm') + ' ANU SuperSearch';
document.getElementById('timer-toggle').innerHTML = icon('play', 'icon-sm') + ' Start';
document.getElementById('timer-reset').innerHTML = icon('rotate-ccw', 'icon-sm');

// Initial render
renderTemplateFilters();
renderTemplates();
loadGrades();
renderGradeTable();
renderResources();
