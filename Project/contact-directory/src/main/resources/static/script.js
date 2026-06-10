// ==================== DATA MODELS ====================
let contacts = [];
let activeContactId = null;
let activeCategoryName = null;

async function loadContacts() {
    try {
        const response = await fetch("http://localhost:8080/contacts");
        contacts = await response.json();

        renderContacts();
        renderCategories();
    } catch (error) {
        console.error("Failed to load contacts:", error);
    }
}

function saveData() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
  localStorage.setItem("categories", JSON.stringify(categories));
}

let categories = JSON.parse(localStorage.getItem("categories")) || [
  { name: "Friends", color: "#7c3aed" },
  { name: "Family", color: "#ec4899" },
  { name: "Work", color: "#3b82f6" }
];




// ==================== TABS & SWIPE ====================
const tabCategories = document.getElementById('tabCategories');
const tabContacts = document.getElementById('tabContacts');
const dirSwipeContainer = document.getElementById('dirSwipeContainer');

tabCategories.addEventListener('click', () => {
  tabCategories.classList.add('active');
  tabContacts.classList.remove('active');
  dirSwipeContainer.classList.remove('show-contacts');
});

tabContacts.addEventListener('click', () => {
  tabContacts.classList.add('active');
  tabCategories.classList.remove('active');
  dirSwipeContainer.classList.add('show-contacts');
});

// ==================== DIALER LOGIC ====================
let dialValue = '';
const dialDisplay = document.getElementById('dialNumber');
const suggestionList = document.getElementById('suggestionList');
const suggestionEmpty = document.getElementById('suggestionEmpty');
const searchInput = document.getElementById('searchInput');

document.querySelectorAll('.dial-key').forEach(key => {
  key.addEventListener('click', () => {
    if (dialValue.length < 15) {
      dialValue += key.dataset.digit;
      updateDialer();
    }
  });
});

document.getElementById('backspaceBtn').addEventListener('click', () => {
  dialValue = dialValue.slice(0, -1);
  updateDialer();
});

function updateDialer() {
  dialDisplay.textContent = dialValue || '-';
  filterSuggestions(dialValue);
}

// Dialer search/suggestions
searchInput.addEventListener('input', (e) => {
  const val = e.target.value.trim();
  document.getElementById('searchClear').classList.toggle('visible', val.length > 0);
  filterSuggestions(val);
});

document.getElementById('searchClear').addEventListener('click', () => {
  searchInput.value = '';
  document.getElementById('searchClear').classList.remove('visible');
  filterSuggestions('');
});

function filterSuggestions(query) {
  const suggestBox = document.getElementById('suggestionsBox');
  
  if (!query) {
    suggestionList.innerHTML = '';
    suggestionEmpty.style.display = 'none';
    suggestBox.style.display = 'none'; 
    return;
  }

  suggestBox.style.display = 'block'; 

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  );

  if (filtered.length === 0) {
    suggestionList.innerHTML = '';
    suggestionEmpty.style.display = 'flex';
    suggestionEmpty.innerHTML = '<span>No contacts found</span>';
  } else {
    suggestionEmpty.style.display = 'none';
    suggestionList.innerHTML = filtered.slice(0, 3).map(c => `
      <div class="suggestion-item" onclick="openContactDetail(${c.id})">
        <div class="suggestion-avatar" style="background: ${getCategoryColor(c.category)}">${getInitials(c.name)}</div>
        <div class="suggestion-info">
          <div class="suggestion-name">${c.name}</div>
          <div class="suggestion-phone">${c.phone}</div>
        </div>
      </div>
    `).join('');
  }
}

// ==================== RENDERING ====================
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  document.getElementById('catCount').textContent = categories.length;

  let html = categories.map(cat => {
    const count = contacts.filter(c => c.category === cat.name).length;
    return `
      <div class="cat-card" onclick="openCategoryView('${cat.name}')">
        <div class="cat-icon" style="background: ${cat.color}25; color: ${cat.color};">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="cat-name">${cat.name}</div>
          <div class="cat-sub">${count} Contacts</div>
        </div>
      </div>
    `;
  }).join('');

  html += `
    <div class="cat-card cat-card--add" onclick="document.getElementById('addCatModal').classList.add('open')">
      <div class="cat-add-icon">+</div>
      <div>
        <div class="cat-add-label">New Category</div>
        <div class="cat-add-sub">Create group</div>
      </div>
    </div>
  `;

  grid.innerHTML = html;
  updateCategoryDropdown();
}

function renderContacts(filterQuery = '') {
  const list = document.getElementById('contactsList');
  const emptyState = document.getElementById('contactsEmpty');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.phone.includes(filterQuery)
  );

  document.getElementById('contactCount').textContent = contacts.length;

  if (contacts.length === 0 || filtered.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = filtered.map(c => `
      <div class="contact-row" onclick="openContactDetail(${c.id})">
        <div class="contact-ava" style="background: ${getCategoryColor(c.category)}">${getInitials(c.name)}</div>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-phone">${c.phone}</div>
        </div>
      </div>
    `).join('');
  }
}

document.getElementById('contactsSearch').addEventListener('input', (e) => {
  renderContacts(e.target.value.trim());
});

// ==================== MODALS & FORMS ====================
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

document.getElementById('openAddModal').addEventListener('click', () => {
  document.getElementById('addModal').classList.add('open');
});

document.getElementById('saveContact').addEventListener('click', () => {
  const name = document.getElementById('newName').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const category = document.getElementById('newCategory').value;

  if (name === "") return showToast("Name is required", "error");
  if (name.length < 2) return showToast("Name must contain at least 2 characters", "error");
  if (/\d/.test(name)) return showToast("Name cannot contain numbers", "error");
  if (phone === "") return showToast("Phone number is required", "error");
  if (!/^\d{10}$/.test(phone)) return showToast("Phone number must be exactly 10 digits", "error");
  if (contacts.some(contact => contact.phone === phone)) return showToast("Phone number already exists", "error");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Invalid email address", "error");

fetch("http://localhost:8080/contacts", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name,
        phone,
        email,
        category
    })
})
.then(response => response.json())
.then(newContact => {

    contacts.push(newContact);

    document.getElementById('newName').value = '';
    document.getElementById('newPhone').value = '';
    document.getElementById('newEmail').value = '';

    closeAllModals();
    renderAll();

    showToast("Contact saved successfully", "success");
})
.catch(error => {
    console.error(error);
    showToast("Failed to save contact", "error");
});
});

// Open Category View Modal
function openCategoryView(categoryName) {
  activeCategoryName = categoryName;

  const categoryContacts = contacts.filter(contact => contact.category === categoryName);
  document.getElementById('catViewTitle').textContent = categoryName;
  const body = document.getElementById('catViewBody');

  if (categoryContacts.length === 0) {
    // Fixed the typo here from ${catName} to ${categoryName}
    body.innerHTML = `<div class="cat-modal-empty">No contacts in ${categoryName}</div>`;
  } else {
    body.innerHTML = categoryContacts.map(c => `
      <div class="cat-modal-contact" onclick="openContactDetail(${c.id})">
        <div class="contact-ava" style="background: ${getCategoryColor(c.category)}">${getInitials(c.name)}</div>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-phone">${c.phone}</div>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('catViewModal').classList.add('open');
}

document.getElementById("deleteCategoryBtn").addEventListener("click", () => {
  if(!activeCategoryName) return;

  if(activeCategoryName === "Friends" || activeCategoryName === "Family" || activeCategoryName === "Work"){
    showToast("Default categories cannot be deleted", "error");
    return;
  }

  categories = categories.filter(category => category.name !== activeCategoryName);

  contacts.forEach(contact => {
    if(contact.category === activeCategoryName){
      contact.category = "Uncategorized";
    }
  });

  saveData();
  closeAllModals();
  renderAll();
  showToast("Category deleted successfully", "success");
});

function openContactDetail(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact) return;
  
  activeContactId = id;
  document.getElementById('detailName').textContent = contact.name;
  document.getElementById('detailPhone').textContent = contact.phone;
  document.getElementById('detailEmail').textContent = contact.email || 'No email provided';
  document.getElementById('detailCategory').textContent = contact.category || 'Uncategorized';
  
  const avatar = document.getElementById('detailAvatar');
  avatar.textContent = getInitials(contact.name);
  avatar.style.background = getCategoryColor(contact.category);

  closeAllModals();
  document.getElementById('detailModal').classList.add('open');
}

document.getElementById('deleteContact').addEventListener('click', () => {

    if (!activeContactId) return;

    fetch(`http://localhost:8080/contacts/${activeContactId}`, {
        method: "DELETE"
    })
    .then(response => response.text())
    .then(message => {

        contacts = contacts.filter(
            c => c.id !== activeContactId
        );

        closeAllModals();
        renderAll();

        showToast(message, "success");
    })
    .catch(error => {
        console.error(error);
        showToast("Failed to delete contact", "error");
    });

});

let selectedColor = '#7c3aed';
document.querySelectorAll('.color-opt').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    selectedColor = e.target.dataset.color;
  });
});

document.getElementById('saveCat').addEventListener('click', () => {
  const name = document.getElementById('newCatName').value.trim();

  if (name === "") return showToast("Category name is required", "error");
  if (name.length < 3) return showToast("Category name too short", "error");
  if (categories.some(category => category.name.toLowerCase() === name.toLowerCase())) {
    return showToast("Category already exists", "error");
  }

  categories.push({ name, color: selectedColor });
  
  document.getElementById('newCatName').value = '';
  saveData();
  closeAllModals();
  renderAll();
  showToast('Category created', 'success');
});

// ==================== UTILS ====================
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getCategoryColor(catName) {
  const cat = categories.find(c => c.name === catName);
  return cat ? cat.color : '#7c3aed'; 
}

function updateCategoryDropdown() {
  const select = document.getElementById('newCategory');
  select.innerHTML = '<option value="">- Select Category -</option>' + 
    categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

function renderAll() {
  renderCategories();
  renderContacts();
  filterSuggestions(dialValue); 
}

if(!categories.some(category => category.name === "Uncategorized")){
  categories.push({
    name:"Uncategorized",
    color:"#6b7280"
  });
}

// Init
loadContacts();