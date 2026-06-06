// ===== EDIT MODE TOGGLE =====
let isEditing = false;

function toggleEdit() {
  isEditing = !isEditing;
  const btn = document.getElementById('editToggle');
  const avatarEditBtn = document.getElementById('avatarEditBtn');
  const addRowBtn = document.getElementById('addRowBtn');
  const addAchievementBtn = document.getElementById('addAchievementBtn');

  // Toggle button style
  if (isEditing) {
    btn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
    btn.classList.add('active');
    document.body.classList.add('edit-mode');
    avatarEditBtn.style.display = 'flex';
    addRowBtn.style.display = 'flex';
    addAchievementBtn.style.display = 'flex';
  } else {
    btn.innerHTML = '<i class="fas fa-pen"></i> Edit Profile';
    btn.classList.remove('active');
    document.body.classList.remove('edit-mode');
    avatarEditBtn.style.display = 'none';
    addRowBtn.style.display = 'none';
    addAchievementBtn.style.display = 'none';
    saveToLocalStorage();
    showSaveToast();
  }

  // Fields that can be edited
  const editableIds = [
    'studentName', 'dob', 'phone', 'email', 'dept', 'sem', 'address',
    'attendancePercent', 'classesHeld', 'classesAttended', 'classesAbsent',
    'cgpa', 'placementNote', 'footerYear'
  ];

  editableIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.contentEditable = isEditing ? 'true' : 'false';
  });

  // Table cells
  document.querySelectorAll('#marksBody td').forEach(td => {
    td.contentEditable = isEditing ? 'true' : 'false';
  });

  // Achievement spans
  document.querySelectorAll('#achievementsList span').forEach(span => {
    span.contentEditable = isEditing ? 'true' : 'false';
  });

  // Delete buttons in achievements
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.style.display = isEditing ? 'inline-flex' : 'none';
  });

  // Update attendance ring if percent changed
  if (!isEditing) updateAttendanceRing();
}

// ===== ATTENDANCE RING =====
function updateAttendanceRing() {
  const percent = parseInt(document.getElementById('attendancePercent').innerText) || 0;
  const circumference = 2 * Math.PI * 50; // r=50
  const offset = circumference - (percent / 100) * circumference;
  const circle = document.getElementById('attendanceCircle');
  if (circle) {
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
    // Color based on percent
    if (percent >= 75) circle.style.stroke = '#1a6b3c';
    else if (percent >= 60) circle.style.stroke = '#c9a84c';
    else circle.style.stroke = '#dc2626';
  }
}

// ===== ADD MARKS ROW =====
function addMarksRow() {
  const tbody = document.getElementById('marksBody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td contenteditable="true">New Subject</td>
    <td contenteditable="true">0</td>
    <td contenteditable="true">0</td>
    <td contenteditable="true">0</td>
  `;
  tbody.appendChild(tr);
}

// ===== ADD ACHIEVEMENT =====
function addAchievement() {
  const list = document.getElementById('achievementsList');
  const li = document.createElement('li');
  li.innerHTML = `
    <i class="fas fa-star"></i>
    <span contenteditable="true">New Achievement / Certification</span>
    <button class="delete-btn" onclick="deleteItem(this)" style="display:inline-flex;">
      <i class="fas fa-times"></i>
    </button>
  `;
  list.appendChild(li);
}

// ===== DELETE ITEM =====
function deleteItem(btn) {
  const li = btn.closest('li');
  if (li) li.remove();
}

// ===== CHANGE PHOTO =====
function changePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const avatar = document.getElementById('avatarDisplay');
    avatar.innerHTML = `<img src="${e.target.result}" alt="Student Photo"/>`;
    localStorage.setItem('studentPhoto', e.target.result);
  };
  reader.readAsDataURL(file);
}

// ===== SAVE TOAST =====
function showSaveToast() {
  const toast = document.createElement('div');
  toast.textContent = '✅ Profile saved successfully!';
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #1a6b3c; color: white; padding: 14px 28px;
    border-radius: 50px; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 500; z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: fadeInUp 0.4s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== SAVE TO LOCAL STORAGE =====
function saveToLocalStorage() {
  const data = {
    studentName: document.getElementById('studentName')?.innerText,
    dob: document.getElementById('dob')?.innerText,
    phone: document.getElementById('phone')?.innerText,
    email: document.getElementById('email')?.innerText,
    dept: document.getElementById('dept')?.innerText,
    sem: document.getElementById('sem')?.innerText,
    address: document.getElementById('address')?.innerText,
    attendancePercent: document.getElementById('attendancePercent')?.innerText,
    classesHeld: document.getElementById('classesHeld')?.innerText,
    classesAttended: document.getElementById('classesAttended')?.innerText,
    classesAbsent: document.getElementById('classesAbsent')?.innerText,
    cgpa: document.getElementById('cgpa')?.innerText,
    placementNote: document.getElementById('placementNote')?.innerText,
    marks: [],
    achievements: []
  };

  // Save marks rows
  document.querySelectorAll('#marksBody tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    data.marks.push([...cells].map(c => c.innerText));
  });

  // Save achievements
  document.querySelectorAll('#achievementsList span').forEach(span => {
    data.achievements.push(span.innerText);
  });

  localStorage.setItem('studentProfile', JSON.stringify(data));
}

// ===== LOAD FROM LOCAL STORAGE =====
function loadFromLocalStorage() {
  const saved = localStorage.getItem('studentProfile');
  if (!saved) return;
  const data = JSON.parse(saved);

  const fields = ['studentName','dob','phone','email','dept','sem','address',
                  'attendancePercent','classesHeld','classesAttended','classesAbsent',
                  'cgpa','placementNote'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id]) el.innerText = data[id];
  });

  // Load marks
  if (data.marks && data.marks.length) {
    const tbody = document.getElementById('marksBody');
    tbody.innerHTML = '';
    data.marks.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = row.map(c => `<td contenteditable="false">${c}</td>`).join('');
      tbody.appendChild(tr);
    });
  }

  // Load achievements
  if (data.achievements && data.achievements.length) {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    data.achievements.forEach(text => {
      const li = document.createElement('li');
      li.innerHTML = `
        <i class="fas fa-medal"></i>
        <span contenteditable="false">${text}</span>
        <button class="delete-btn" onclick="deleteItem(this)" style="display:none;">
          <i class="fas fa-times"></i>
        </button>
      `;
      list.appendChild(li);
    });
  }

  // Load photo
  const photo = localStorage.getItem('studentPhoto');
  if (photo) {
    document.getElementById('avatarDisplay').innerHTML = `<img src="${photo}" alt="Student Photo"/>`;
  }
}

// ===== FADE IN ANIMATION =====
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  updateAttendanceRing();
});