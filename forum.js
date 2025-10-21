// Forum page JavaScript

// Initialize icons
document.getElementById('search-icon-forum').innerHTML = icon('search', 'icon');
document.getElementById('browser-search-icon').innerHTML = icon('search', 'icon');
document.getElementById('new-post-btn').innerHTML = icon('plus', 'icon-sm') + ' New Post';
document.getElementById('new-group-btn').innerHTML = icon('users', 'icon-sm') + ' Create Group';
document.getElementById('close-drawer-btn').innerHTML = icon('x', 'icon');

// Data storage keys
const GROUPS_KEY = 'forum-groups';
const POSTS_KEY = 'forum-posts';
const COMMENTS_KEY = 'forum-comments';
const MEMBERSHIPS_KEY = 'forum-memberships';
const ALIAS_KEY = 'forum-user-alias';

// Default groups
const defaultGroups = [
  { id: 'general', name: 'General', memberCount: 1247 },
  { id: 'first-year', name: 'First-Year Help', memberCount: 823 },
  { id: 'cs-it', name: 'CS & IT', memberCount: 456 },
  { id: 'maths-stats', name: 'Maths & Stats', memberCount: 389 },
  { id: 'international', name: 'International Students', memberCount: 612 },
  { id: 'careers', name: 'Careers & Internships', memberCount: 534 },
  { id: 'buy-sell', name: 'Buy/Sell/Swap', memberCount: 291 }
];

// Seed posts
const seedPosts = [
  { id: '1', title: 'Best study spots on campus?', body: 'Looking for quiet places to study between classes. Chifley is always packed!', groupId: 'general', author: 'Koala-173', timestamp: Date.now() - 2*60*60*1000, upvotes: 12, commentCount: 8 },
  { id: '2', title: 'COMP1100 assignment help', body: 'Stuck on recursion in Haskell. Anyone free to explain the concept?', groupId: 'cs-it', author: 'Wombat-492', timestamp: Date.now() - 5*60*60*1000, upvotes: 24, commentCount: 15 },
  { id: '3', title: 'Internship resume tips?', body: 'Applying for summer internships. What should I include for tech roles?', groupId: 'careers', author: 'Echidna-871', timestamp: Date.now() - 24*60*60*1000, upvotes: 31, commentCount: 22 }
];

const seedComments = [
  { id: 'c1', postId: '1', author: 'Platypus-234', body: 'Try Hancock Library level 3. Usually quiet in the mornings!', timestamp: Date.now() - 1*60*60*1000, upvotes: 5 },
  { id: 'c2', postId: '2', author: 'Kangaroo-665', body: 'Think of recursion as a function calling itself with a smaller problem each time. Base case is key!', timestamp: Date.now() - 4*60*60*1000, upvotes: 18 }
];

// State
let currentSort = 'hot';
let selectedGroup = 'all';
let currentPost = null;

// Initialize data
function initData() {
  if (!localStorage.getItem(GROUPS_KEY)) localStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
  if (!localStorage.getItem(POSTS_KEY)) localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
  if (!localStorage.getItem(COMMENTS_KEY)) localStorage.setItem(COMMENTS_KEY, JSON.stringify(seedComments));
  if (!localStorage.getItem(MEMBERSHIPS_KEY)) localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(['general']));
}

function getGroups() {
  return JSON.parse(localStorage.getItem(GROUPS_KEY) || JSON.stringify(defaultGroups));
}

function getPosts(filters = {}) {
  let posts = JSON.parse(localStorage.getItem(POSTS_KEY) || JSON.stringify(seedPosts));
  
  if (filters.group && filters.group !== 'all') {
    posts = posts.filter(p => p.groupId === filters.group);
  }
  
  if (filters.q) {
    const query = filters.q.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query));
  }
  
  if (filters.sort === 'new') {
    posts.sort((a, b) => b.timestamp - a.timestamp);
  } else if (filters.sort === 'top') {
    posts.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    posts.sort((a, b) => {
      const scoreA = a.upvotes / (1 + (Date.now() - a.timestamp) / (1000*60*60));
      const scoreB = b.upvotes / (1 + (Date.now() - b.timestamp) / (1000*60*60));
      return scoreB - scoreA;
    });
  }
  
  return posts;
}

function getComments(postId) {
  const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  return all.filter(c => c.postId === postId);
}

function getUserAlias() {
  let alias = localStorage.getItem(ALIAS_KEY);
  if (!alias) {
    const animals = ['Koala', 'Kangaroo', 'Wombat', 'Platypus', 'Echidna', 'Kookaburra'];
    alias = animals[Math.floor(Math.random() * animals.length)] + '-' + Math.floor(Math.random() * 1000);
    localStorage.setItem(ALIAS_KEY, alias);
  }
  return alias;
}

function getMemberships() {
  return JSON.parse(localStorage.getItem(MEMBERSHIPS_KEY) || '["general"]');
}

function toggleMembership(groupId) {
  const memberships = getMemberships();
  const index = memberships.indexOf(groupId);
  if (index > -1) {
    memberships.splice(index, 1);
  } else {
    memberships.push(groupId);
  }
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
  renderGroups();
  renderGroupBrowser();
}

function addPost(post) {
  const posts = getPosts();
  const newPost = { ...post, id: Date.now().toString(), timestamp: Date.now(), upvotes: 0, commentCount: 0, saved: false };
  posts.unshift(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
}

function upvotePost(postId) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.upvotes++;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    renderPosts();
  }
}

function toggleSavePost(postId) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.saved = !post.saved;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
}

function addComment(comment) {
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const newComment = { ...comment, id: Date.now().toString(), timestamp: Date.now(), upvotes: 0 };
  comments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  
  // Increment post comment count
  const posts = getPosts();
  const post = posts.find(p => p.id === comment.postId);
  if (post) {
    post.commentCount++;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
  
  return newComment;
}

function addGroup(name) {
  const groups = getGroups();
  const newGroup = { id: name.toLowerCase().replace(/\s+/g, '-'), name, memberCount: 1 };
  groups.push(newGroup);
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  toggleMembership(newGroup.id);
  return newGroup;
}

// Render functions
function renderGroups() {
  const groups = getGroups();
  const memberships = getMemberships();
  const memberGroups = groups.filter(g => memberships.includes(g.id));
  
  const html = `
    <button class="group-item ${selectedGroup === 'all' ? 'active' : ''}" onclick="selectGroup('all')">
      <span class="text-sm font-semibold">All Posts</span>
    </button>
    ${memberGroups.map(g => `
      <button class="group-item ${selectedGroup === g.id ? 'active' : ''}" onclick="selectGroup('${g.id}')">
        <span class="text-sm font-semibold">${g.name}</span>
        <span class="badge badge-outline text-xs">${g.memberCount}</span>
      </button>
    `).join('')}
  `;
  
  document.getElementById('groups-list').innerHTML = html;
  
  // Update post group select
  const groupSelect = document.getElementById('post-group');
  groupSelect.innerHTML = groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

function renderPosts() {
  const posts = getPosts({ group: selectedGroup, sort: currentSort, q: document.getElementById('search-input').value });
  const groups = getGroups();
  
  if (posts.length === 0) {
    document.getElementById('posts-container').innerHTML = `
      <div class="card" style="border-style: dashed;">
        <div class="card-content" style="padding: 3rem; text-align: center;">
          <p class="text-muted mb-4">No posts yet in this group</p>
          <p class="text-sm text-muted">Be the first to post!</p>
        </div>
      </div>
    `;
    return;
  }
  
  const html = posts.map(post => {
    const group = groups.find(g => g.id === post.groupId);
    return `
      <div class="card mb-3">
        <div class="post-card">
          <div class="upvote-column">
            <button class="btn btn-ghost btn-icon" onclick="upvotePost('${post.id}')">
              ${icon('arrow-up', 'icon-sm')}
            </button>
            <span class="font-semibold">${post.upvotes}</span>
          </div>
          <div class="post-content">
            <div class="post-meta">
              <span class="badge text-xs">${group ? group.name : post.groupId}</span>
              <span class="text-xs text-muted">${post.author} · ${formatRelativeTime(post.timestamp)}</span>
            </div>
            <button onclick="viewPost('${post.id}')" style="all: unset; cursor: pointer; width: 100%; text-align: left;">
              <h3 class="mb-2" style="transition: color 0.2s;" onmouseover="this.style.color='var(--brand-primary)'" onmouseout="this.style.color='var(--text)'">${post.title}</h3>
              <p class="text-sm text-muted mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${post.body}</p>
            </button>
            <div class="post-actions">
              <button class="post-action" onclick="viewPost('${post.id}')">
                ${icon('message-circle', 'icon-sm')}
                ${post.commentCount} comments
              </button>
              <button class="post-action" onclick="toggleSavePost('${post.id}'); renderPosts();">
                ${post.saved ? icon('bookmark-filled', 'icon-sm') : icon('bookmark', 'icon-sm')}
                ${post.saved ? 'Saved' : 'Save'}
              </button>
              <button class="post-action">
                ${icon('more-vertical', 'icon-sm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('posts-container').innerHTML = html;
}

function renderGroupBrowser() {
  const groups = getGroups();
  const memberships = getMemberships();
  const query = document.getElementById('group-search').value.toLowerCase();
  const filtered = query ? groups.filter(g => g.name.toLowerCase().includes(query)) : groups;
  
  const html = filtered.map(g => {
    const isMember = memberships.includes(g.id);
    return `
      <div class="flex items-center justify-between mb-2" style="padding: 0.75rem; border-radius: calc(var(--radius) - 0.5rem); transition: background 0.2s;" 
        onmouseover="this.style.background='rgba(159, 195, 214, 0.2)'" 
        onmouseout="this.style.background='transparent'">
        <div style="flex: 1;">
          <p class="text-sm font-semibold">${g.name}</p>
          <p class="text-xs text-muted">${g.memberCount} members</p>
        </div>
        <button class="btn btn-sm ${isMember ? 'btn-secondary' : 'btn-primary'}" onclick="toggleMembership('${g.id}')">
          ${isMember ? 'Leave' : 'Join'}
        </button>
      </div>
    `;
  }).join('');
  
  document.getElementById('browser-groups').innerHTML = html;
}

function viewPost(postId) {
  const posts = getPosts();
  currentPost = posts.find(p => p.id === postId);
  if (!currentPost) return;
  
  const groups = getGroups();
  const group = groups.find(g => g.id === currentPost.groupId);
  const comments = getComments(postId);
  
  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);
  
  const html = `
    <div class="mb-6">
      <div class="flex gap-3 mb-4">
        <div class="upvote-column">
          <button class="btn btn-ghost btn-icon" onclick="upvotePost('${currentPost.id}'); viewPost('${currentPost.id}')">
            ${icon('arrow-up', 'icon')}
          </button>
          <span class="font-semibold">${currentPost.upvotes}</span>
        </div>
        <div style="flex: 1;">
          <div class="flex items-center gap-2 mb-3">
            <span class="badge">${group ? group.name : currentPost.groupId}</span>
            <span class="text-sm text-muted">${currentPost.author} · ${formatRelativeTime(currentPost.timestamp)}</span>
          </div>
          <h2 class="mb-3">${currentPost.title}</h2>
          <p class="text-muted comment-body">${currentPost.body}</p>
        </div>
      </div>
      <div class="flex items-center gap-4" style="padding-top: 0.75rem; border-top: 1px solid var(--border);">
        <button class="post-action" onclick="toggleSavePost('${currentPost.id}'); viewPost('${currentPost.id}')">
          ${currentPost.saved ? icon('bookmark-filled', 'icon-sm') : icon('bookmark', 'icon-sm')}
          ${currentPost.saved ? 'Saved' : 'Save'}
        </button>
        <button class="post-action">
          ${icon('flag', 'icon-sm')} Report
        </button>
      </div>
    </div>
    
    <div class="mb-6">
      <textarea id="comment-input" class="textarea mb-2" placeholder="Add a comment..."></textarea>
      <button class="btn btn-sm btn-primary" onclick="submitComment()">Comment</button>
    </div>
    
    <div>
      <h3 class="mb-4">Comments (${comments.length})</h3>
      <div>
        ${topLevel.map(comment => {
          const replies = getReplies(comment.id);
          return `
            <div class="comment-tree mb-4">
              <div class="mb-2">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold">${comment.author}</span>
                  <span class="text-xs text-muted">${formatRelativeTime(comment.timestamp)}</span>
                </div>
                <p class="text-sm comment-body mb-2">${comment.body}</p>
                <div class="flex items-center gap-3">
                  <button class="post-action">
                    ${icon('arrow-up', 'icon-sm')} ${comment.upvotes}
                  </button>
                  <button class="post-action" onclick="replyToComment('${comment.id}')">Reply</button>
                </div>
              </div>
              ${replies.length > 0 ? `
                <div style="margin-left: 1rem; margin-top: 0.75rem; border-left: 2px solid var(--border); padding-left: 1rem;">
                  ${replies.map(reply => `
                    <div class="mb-3">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-semibold">${reply.author}</span>
                        <span class="text-xs text-muted">${formatRelativeTime(reply.timestamp)}</span>
                      </div>
                      <p class="text-sm comment-body mb-2">${reply.body}</p>
                      <button class="post-action">
                        ${icon('arrow-up', 'icon-sm')} ${reply.upvotes}
                      </button>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  document.getElementById('drawer-content').innerHTML = html;
  document.getElementById('post-drawer').classList.remove('hidden');
}

function closePostView(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('post-drawer').classList.add('hidden');
  currentPost = null;
  renderPosts(); // Refresh to show updated counts
}

function submitComment() {
  const body = document.getElementById('comment-input').value.trim();
  if (!body) {
    Toast.show('Comment cannot be empty', 'error');
    return;
  }
  
  const author = getUserAlias();
  addComment({ postId: currentPost.id, author, body });
  viewPost(currentPost.id); // Refresh view
  Toast.show('Comment added', 'success');
}

let replyToId = null;
function replyToComment(commentId) {
  replyToId = commentId;
  const input = document.getElementById('comment-input');
  input.placeholder = 'Write a reply...';
  input.focus();
}

// Modal functions
function openPostComposer() {
  document.getElementById('composer-modal').classList.remove('hidden');
}

function closePostComposer() {
  document.getElementById('composer-modal').classList.add('hidden');
  document.getElementById('post-title').value = '';
  document.getElementById('post-body').value = '';
}

function openCreateGroup() {
  document.getElementById('group-modal').classList.remove('hidden');
}

function closeCreateGroup() {
  document.getElementById('group-modal').classList.add('hidden');
  document.getElementById('group-name').value = '';
}

function openGroupBrowser() {
  renderGroupBrowser();
  document.getElementById('browser-modal').classList.remove('hidden');
}

function closeGroupBrowser() {
  document.getElementById('browser-modal').classList.add('hidden');
}

function closeModalsOnBackdrop(e) {
  if (e.target === e.currentTarget) {
    closePostComposer();
    closeCreateGroup();
    closeGroupBrowser();
  }
}

function formatText(before, after) {
  const textarea = document.getElementById('post-body');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value.substring(start, end);
  const newText = textarea.value.substring(0, start) + before + text + after + textarea.value.substring(end);
  textarea.value = newText;
  textarea.focus();
}

function submitPost() {
  const title = document.getElementById('post-title').value.trim();
  const groupId = document.getElementById('post-group').value;
  const body = document.getElementById('post-body').value.trim();
  
  if (!title) {
    Toast.show('Title is required', 'error');
    return;
  }
  if (!body) {
    Toast.show('Post body is required', 'error');
    return;
  }
  
  const author = getUserAlias();
  addPost({ title, groupId, body, author });
  closePostComposer();
  renderPosts();
  Toast.show('Post created!', 'success');
}

function submitGroup() {
  const name = document.getElementById('group-name').value.trim();
  if (!name) {
    Toast.show('Group name is required', 'error');
    return;
  }
  
  addGroup(name);
  closeCreateGroup();
  renderGroups();
  Toast.show('Group created!', 'success');
}

function selectGroup(groupId) {
  selectedGroup = groupId;
  renderGroups();
  renderPosts();
}

function setSort(sort) {
  currentSort = sort;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  renderPosts();
}

function filterPosts() {
  renderPosts();
}

function filterGroupBrowser() {
  renderGroupBrowser();
}

// Responsive layout
function updateLayout() {
  const groupsSection = document.getElementById('groups-section');
  const rightRail = document.getElementById('right-rail');
  
  if (window.innerWidth >= 1024) {
    document.querySelector('#groups-section').parentElement.style.gridTemplateColumns = '250px 1fr';
    groupsSection.style.display = 'block';
  }
  
  if (window.innerWidth >= 1280) {
    document.querySelector('#groups-section').parentElement.style.gridTemplateColumns = '250px 1fr 300px';
    rightRail.style.display = 'block';
    renderRightRail();
  } else {
    rightRail.style.display = 'none';
  }
}

function renderRightRail() {
  const posts = getPosts();
  const groups = getGroups();
  const topPosts = [...posts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  
  const html = `
    <div class="mb-6 card">
      <div class="card-header">
        <h3 class="flex items-center gap-2">
          ${icon('info', 'icon')} Campus Guidelines
        </h3>
      </div>
      <div class="card-content">
        <ul style="list-style: none; padding: 0;">
          <li class="flex items-start gap-2 mb-2">
            <span style="color: var(--brand-primary);">•</span>
            <span class="text-sm text-muted">Be respectful and constructive</span>
          </li>
          <li class="flex items-start gap-2 mb-2">
            <span style="color: var(--brand-primary);">•</span>
            <span class="text-sm text-muted">No harassment or hate speech</span>
          </li>
          <li class="flex items-start gap-2 mb-2">
            <span style="color: var(--brand-primary);">•</span>
            <span class="text-sm text-muted">Keep it relevant to student life</span>
          </li>
          <li class="flex items-start gap-2">
            <span style="color: var(--brand-primary);">•</span>
            <span class="text-sm text-muted">Report inappropriate content</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="flex items-center gap-2">
          ${icon('trending-up', 'icon')} Popular This Week
        </h3>
      </div>
      <div class="card-content">
        ${topPosts.map((post, i) => {
          const group = groups.find(g => g.id === post.groupId);
          return `
            <button onclick="viewPost('${post.id}')" class="w-full text-left mb-3" style="all: unset; cursor: pointer; display: block; padding: 0.5rem; border-radius: calc(var(--radius) - 0.5rem); transition: background 0.2s;" onmouseover="this.style.background='rgba(159, 195, 214, 0.2)'" onmouseout="this.style.background='transparent'">
              <div class="flex items-start gap-2">
                <span class="text-xs font-bold text-muted" style="margin-top: 0.125rem;">${i + 1}</span>
                <div style="flex: 1; min-width: 0;">
                  <p class="text-sm font-semibold mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${post.title}</p>
                  <p class="text-xs text-muted">${group ? group.name : post.groupId} · ${post.upvotes} upvotes</p>
                </div>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  document.getElementById('right-rail').innerHTML = html;
}

// Initialize
initData();
renderGroups();
renderPosts();
updateLayout();
window.addEventListener('resize', updateLayout);