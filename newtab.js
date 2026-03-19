// ── State ──────────────────────────────────────────────
let allBookmarks = [];       // flat list of {title, url, folder}
let activeFolder = 'All';
let searchQuery  = '';

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 10000);

  chrome.bookmarks.getTree(tree => {
    allBookmarks = flattenBookmarks(tree);
    buildFolderNav();
    render();
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    render();
  });
});

// ── Clock ──────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('timeDisplay').textContent = `${h}:${m}`;
}

// ── Flatten bookmarks tree ─────────────────────────────
function flattenBookmarks(nodes, folderName = 'Bookmarks') {
  let result = [];
  for (const node of nodes) {
    if (node.url) {
      // It's a bookmark
      result.push({ title: node.title || node.url, url: node.url, folder: folderName });
    } else if (node.children) {
      // It's a folder — recurse
      const name = node.title || folderName;
      result = result.concat(flattenBookmarks(node.children, name));
    }
  }
  return result;
}

// ── Folder nav ─────────────────────────────────────────
function buildFolderNav() {
  const nav = document.getElementById('folderNav');
  nav.innerHTML = '';

  // Count per folder
  const folderCounts = {};
  allBookmarks.forEach(b => {
    folderCounts[b.folder] = (folderCounts[b.folder] || 0) + 1;
  });

  const folders = ['All', ...Object.keys(folderCounts)];

  folders.forEach(folder => {
    const pill = document.createElement('button');
    pill.className = 'folder-pill' + (folder === activeFolder ? ' active' : '');
    const count = folder === 'All' ? allBookmarks.length : folderCounts[folder];
    pill.innerHTML = `${folder} <span class="folder-count">${count}</span>`;
    pill.addEventListener('click', () => {
      activeFolder = folder;
      document.querySelectorAll('.folder-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      render();
    });
    nav.appendChild(pill);
  });
}

// ── Render grid ────────────────────────────────────────
function render() {
  const grid = document.getElementById('bookmarkGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';

  // Filter
  let filtered = allBookmarks;
  if (activeFolder !== 'All') {
    filtered = filtered.filter(b => b.folder === activeFolder);
  }
  if (searchQuery) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(searchQuery) ||
      b.url.toLowerCase().includes(searchQuery)
    );
  }

  // Update count badge
  document.getElementById('countBadge').textContent =
    `${filtered.length} bookmark${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  // Group by folder if showing All and not searching
  if (activeFolder === 'All' && !searchQuery) {
    const groups = groupByFolder(filtered);
    groups.forEach(({ folder, bookmarks }) => {
      if (groups.length > 1) {
        const label = document.createElement('div');
        label.className = 'section-label';
        label.textContent = folder;
        grid.appendChild(label);
      }
      bookmarks.forEach(b => grid.appendChild(createCard(b)));
    });
  } else {
    filtered.forEach(b => grid.appendChild(createCard(b)));
  }
}

function groupByFolder(bookmarks) {
  const map = new Map();
  bookmarks.forEach(b => {
    if (!map.has(b.folder)) map.set(b.folder, []);
    map.get(b.folder).push(b);
  });
  return Array.from(map, ([folder, bookmarks]) => ({ folder, bookmarks }));
}

// ── Card ───────────────────────────────────────────────
function createCard(bookmark) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = bookmark.url;
  a.title = bookmark.title;

  // Favicon
  const faviconWrapper = document.createElement('div');
  faviconWrapper.style.display = 'contents';

  const img = document.createElement('img');
  img.className = 'card-favicon';
  img.alt = '';

  // Use Chrome's favicon API
  try {
    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', bookmark.url);
    faviconUrl.searchParams.set('size', '64');
    img.src = faviconUrl.href;
  } catch {
    img.src = getFaviconFallbackUrl(bookmark.url);
  }

  img.onerror = () => {
    // Replace with letter fallback
    img.replaceWith(createFallbackIcon(bookmark.title));
  };

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = bookmark.title || getDomain(bookmark.url);

  a.appendChild(img);
  a.appendChild(title);

  // Middle-click or Ctrl+click opens in new tab natively via <a>
  return a;
}

function createFallbackIcon(title) {
  const div = document.createElement('div');
  div.className = 'card-favicon-fallback';
  div.textContent = (title || '?').charAt(0);
  return div;
}

function getFaviconFallbackUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}
