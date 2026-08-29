import './styles.css';
import { consumedRecoveryNotice, emptyState, isDemoMode, loadState, resetDemoState, saveState, validateImport } from './db';
import { assignmentFor, dateOnly, weeklyEffort } from './rules';
import { cachedUnlock, captureLicense, checkoutUrl, saveLicense, storedLicense, verifyLicense } from './license';
import { decodePairing, encodePairing } from './pairing';
import type { Chore, HouseholdState } from './types';

type View = 'today' | 'people' | 'chores' | 'history' | 'data' | 'about';

const app = document.querySelector<HTMLDivElement>('#app')!;
let state: HouseholdState = emptyState();
let view: View = 'today';
let unlocked = cachedUnlock();
let returnFocus: HTMLElement | null = null;
let undoTimer = 0;
const BUILD_ID = '1.0.7';

const uid = () => crypto.randomUUID();
const esc = (value: string | number | undefined) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const fmt = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${dateOnly(iso)}T12:00:00`));

function icon(name: 'home'|'people'|'chores'|'history'|'data'|'info'|'check'|'plus'): string {
  const paths = {
    home: '<path d="M3 11 12 3l9 8v10h-6v-7H9v7H3z"/>',
    people: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 21v-3c0-3 2-5 6-5s6 2 6 5v3M14 14c4-1 8 1 8 5v2"/>',
    chores: '<path d="M8 4h12v16H4V8zM8 4v4H4M9 12h7M9 16h7"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-7M3 3v6h6M12 7v6l4 2"/>',
    data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 2 4 3 8 3s8-1 8-3V5M4 12v7c0 2 4 3 8 3s8-1 8-3v-7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function shell(): void {
  const legal = location.pathname === '/privacy' || location.pathname === '/terms';
  const landing = !legal && !state.householdName;
  const title = legal ? (location.pathname === '/privacy' ? 'Privacy' : 'Terms') : pageHeading();
  document.title = documentTitle(title, legal, landing);
  updateMetadata(canonicalPath(legal));
  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="${isDemoMode() ? '/demo' : '/'}" data-route="home" aria-label="Chore Rulebook home"><span class="brand-mark" aria-hidden="true">⌂</span><span>CHORE<br>RULEBOOK</span></a>
      ${siteNavigation()}
      <div class="signal"><span class="signal-dot"></span><span>${navigator.onLine ? 'DEVICE READY' : 'OFFLINE · SAVED HERE'}</span></div>
    </header>
    ${isDemoMode() && !legal ? demoBanner() : ''}
    ${legal || landing ? '' : navigation()}
    <main id="main" tabindex="-1" class="${landing ? 'landing-main' : ''}">
      ${landing ? '' : `<h1 class="page-title" tabindex="-1">${esc(title)}</h1>`}
      <div id="view-root">${legal ? legalPage(location.pathname) : renderView()}</div>
    </main>
    <footer>
      <p>Your household data stays on this device.</p>
      <nav aria-label="Legal and product information"><a href="/demo">Demo</a><a href="/privacy" data-route="legal">Privacy</a><a href="/terms" data-route="legal">Terms</a></nav>
      <p class="generated-note">Built by Param Factory · v${BUILD_ID} · Original house illustration generated with the factory image model.</p>
    </footer>
    <dialog id="modal" aria-labelledby="modal-title"><div id="modal-content"></div></dialog>
    <div id="route-status" class="sr-only" role="status" aria-live="polite">${esc(title)}</div>
    <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
  bind();
}

function documentTitle(title: string, legal: boolean, landing: boolean): string {
  if (legal) return `${title} — Chore Rulebook`;
  if (landing) return 'Chore Rulebook — clear household rotations';
  if (isDemoMode() && view === 'today') return 'Demo — Chore Rulebook';
  return `${title} — Chore Rulebook`;
}

function canonicalPath(legal: boolean): string {
  if (legal) return location.pathname;
  if (!state.householdName) return '/';
  const path = isDemoMode() ? '/demo' : '/';
  return view === 'today' ? path : `${path}?view=${view}`;
}

function pageHeading(): string {
  if (!state.householdName) return 'Know whose turn it is—and why';
  return ({ today: 'Today’s household chores', people: 'People and availability', chores: 'Recurring chore rules', history: 'Completion history', data: 'Move and back up your data', about: 'About Chore Rulebook' })[view];
}

function updateMetadata(path: string): void {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://chore-rulebook.sociobot.in${path}`;
  document.querySelectorAll<HTMLMetaElement>('meta[property="og:url"]').forEach((meta) => { meta.content = `https://chore-rulebook.sociobot.in${path}`; });
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved to your rulebook</strong><div><button data-action="reset-demo">Reset demo</button><a href="/" data-action="start-real">Start for real</a></div></aside>`;
}

function siteNavigation(): string {
  return `<nav class="site-nav" aria-label="Site"><a href="/demo">Demo</a><a href="/privacy" data-route="legal">Privacy</a><a href="/terms" data-route="legal">Terms</a></nav>`;
}

function navigation(): string {
  const items: Array<[View, string, keyof ReturnType<typeof navIcons>]> = [
    ['today', 'Today', 'home'], ['people', 'People', 'people'], ['chores', 'Chores', 'chores'], ['history', 'History', 'history'], ['data', 'Data', 'data'],
  ];
  return `<nav class="signal-rail" aria-label="Primary"><div>${items.map(([id, label, symbol]) => `<button class="nav-item ${view === id ? 'active' : ''}" data-view="${id}" ${view === id ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></button>`).join('')}</div></nav>`;
}
function navIcons() { return { home: true, people: true, chores: true, history: true, data: true }; }

function renderView(): string {
  switch (view) {
    case 'people': return peopleView();
    case 'chores': return choresView();
    case 'history': return historyView();
    case 'data': return dataView();
    case 'about': return aboutView();
    default: return todayView();
  }
}

function todayView(): string {
  if (!state.householdName) return onboarding();
  if (!state.chores.length) return `
    <section class="empty-state"><div><p class="eyebrow">${esc(state.householdName)} · RULEBOOK READY</p><h2>Add the first household rule</h2><p>Define a recurring chore, its real effort, and whether ownership rotates or stays fixed.</p><button class="primary" data-action="add-chore">${icon('plus')} Add a chore</button></div><img src="/assets/house-signal.webp" srcset="/assets/house-signal-480.webp 480w, /assets/house-signal.webp 768w" sizes="(max-width: 600px) 100vw, 50vw" width="768" height="512" alt="" decoding="async"></section>`;

  const assignments = state.chores.map((chore) => ({ chore, assignment: assignmentFor(chore, state.people, state.completions) }))
    .sort((a, b) => a.assignment.dueAt.localeCompare(b.assignment.dueAt));
  const due = assignments.filter(({ assignment }) => assignment.dueAt <= dateOnly(new Date()));
  const later = assignments.filter(({ assignment }) => assignment.dueAt > dateOnly(new Date()));
  return `
    <section class="page-lead"><div><p class="eyebrow">${esc(state.householdName)} · ${navigator.onLine ? 'LOCAL SIGNAL' : 'OFFLINE MODE'}</p><h2>${due.length ? `${due.length} ${due.length === 1 ? 'chore needs' : 'chores need'} attention` : 'The board is clear'}</h2><p>Assignments come from the rules below—not from points or guesses.</p></div><button class="secondary" data-action="add-chore">${icon('plus')} Add chore</button></section>
    ${due.length ? `<section aria-labelledby="due-heading"><h3 id="due-heading">Due now</h3><div class="assignment-list">${due.map(assignmentCard).join('')}</div></section>` : `<div class="clear-state"><span aria-hidden="true">✓</span><div><strong>Nothing due today.</strong><p>Upcoming work is still visible below.</p></div></div>`}
    ${later.length ? `<section aria-labelledby="later-heading"><h3 id="later-heading">Coming up</h3><div class="assignment-list compact">${later.map(assignmentCard).join('')}</div></section>` : ''}
    ${effortStrip()}`;
}

function onboarding(): string {
  return `<section class="onboarding">
    <div class="onboarding-copy"><p class="eyebrow">CHORE RULES FOR A SHARED DEVICE</p><h1 tabindex="-1">Know whose turn it is—and why</h1><p>For households sharing recurring chores, it rotates clear assignments and records what was done.</p>
      <div class="hero-actions"><a class="primary button-link" href="/demo">Try it with sample data</a><button class="secondary" data-action="start">Set up this household</button></div><p class="action-note">The sample opens a ready-made household. Setup starts your private rulebook.</p>
      <ul class="principles"><li><span aria-hidden="true">01</span> Stored on this device</li><li><span aria-hidden="true">02</span> Works offline after the first visit</li><li><span aria-hidden="true">03</span> Free for six chores</li></ul>
    </div>
    <figure class="hero-art"><picture><source srcset="/assets/house-signal-480.webp 480w, /assets/house-signal.webp 768w" sizes="(max-width: 600px) 100vw, 55vw" type="image/webp"><img src="/assets/house-signal.png" width="768" height="512" alt="A pixel-art cutaway home where glowing routes connect dishes, laundry, plants, and a broom" decoding="async" fetchpriority="high"></picture><figcaption>The sample shows chores, assignments, and household rules on one shared device.</figcaption></figure>
  </section><section class="landing-details" aria-labelledby="how-heading"><p class="eyebrow">HOW IT WORKS</p><h2 id="how-heading">Set rules in three steps</h2><ol><li><strong>Add people.</strong> Keep household order and mark anyone away.</li><li><strong>Write chore rules.</strong> Choose rotation or a fixed owner.</li><li><strong>Record completions.</strong> See the next assignment and its reason.</li></ol><h2>What stays private</h2><p>Names, rules, and history remain in browser storage. The app has no accounts, ads, analytics, or household-data server.</p></section>`;
}

function assignmentCard({ chore, assignment }: { chore: Chore; assignment: ReturnType<typeof assignmentFor> }): string {
  const dueLabel = assignment.overdueDays ? `${assignment.overdueDays}d late` : assignment.dueAt === dateOnly(new Date()) ? 'Due today' : `Due ${fmt(assignment.dueAt)}`;
  return `<article class="assignment-card ${assignment.overdueDays ? 'overdue' : ''}">
    <div class="assignment-route" aria-hidden="true"><span></span><i></i></div>
    <div class="assignment-main"><div class="assignment-top"><div><p class="status-label">${esc(dueLabel)}</p><h4>${esc(chore.name)}</h4></div><span class="effort">~${chore.effortMinutes} min</span></div>
      <p class="assignee">${assignment.person ? `<span>${initials(assignment.person.name)}</span> ${esc(assignment.person.name)}` : '<span>?</span> Needs an assignee'}</p>
      <details><summary>Why this assignment?</summary><p>${esc(assignment.explanation)}</p><p class="rule-code">RULE · ${chore.rule === 'fixed' ? 'FIXED OWNER' : 'ORDERED ROTATION'} / ${chore.missedPolicy === 'hold' ? 'HOLD MISSED TURN' : 'ADVANCE AFTER DONE'}</p></details>
    </div>
    <div class="assignment-actions"><button class="primary small" data-action="complete" data-id="${chore.id}" ${assignment.person ? '' : 'disabled'}>${icon('check')} Mark done</button><button class="icon-button" aria-label="Edit ${esc(chore.name)}" title="Edit chore" data-action="edit-chore" data-id="${chore.id}">•••</button></div>
  </article>`;
}

function effortStrip(): string {
  if (!state.people.length) return '';
  const effort = weeklyEffort(state.people, state.chores, state.completions);
  const max = Math.max(1, ...effort.values());
  return `<section class="effort-section" aria-labelledby="effort-heading"><div><h3 id="effort-heading">Recorded effort · 7 days</h3><p>Minutes are estimates, shown for conversation—not scoring.</p></div><ul>${state.people.map((person) => { const value = effort.get(person.id) ?? 0; return `<li><span>${esc(person.name)}</span><div class="meter"><i style="width:${Math.max(value ? 8 : 0, value / max * 100)}%"></i></div><strong>${value}m</strong></li>`; }).join('')}</ul></section>`;
}

function peopleView(): string {
  return `<section class="page-lead"><div><p class="eyebrow">HOUSEHOLD ORDER</p><h2>People and availability</h2><p>Rotation follows this order and automatically skips people marked away.</p></div><button class="primary" data-action="add-person">${icon('plus')} Add person</button></section>
  ${state.people.length ? `<ol class="people-list">${state.people.map((person, index) => `<li><span class="order">${String(index + 1).padStart(2, '0')}</span><span class="avatar">${initials(person.name)}</span><div><strong>${esc(person.name)}</strong><small>${person.available ? 'Available for rotating chores' : 'Away · rotations skip this person'}</small></div><label class="switch"><input type="checkbox" data-action="availability" data-id="${person.id}" ${person.available ? 'checked' : ''}><span aria-hidden="true"></span><em>${person.available ? 'Home' : 'Away'}</em></label><button class="text-danger" data-action="delete-person" data-id="${person.id}" aria-label="Remove ${esc(person.name)}">Remove</button></li>`).join('')}</ol>` : emptyPanel('No people yet', 'Add the people who share this household. They do not need accounts.', 'add-person', 'Add a person')}`;
}

function choresView(): string {
  return `<section class="page-lead"><div><p class="eyebrow">THE RULEBOOK</p><h2>Recurring chore rules</h2><p>Each rule says how often, roughly how long, and how ownership moves.</p></div><button class="primary" data-action="add-chore">${icon('plus')} Add chore</button></section>
  ${state.chores.length ? `<div class="rules-table" role="region" aria-label="Chore rules" tabindex="0"><table><thead><tr><th>Chore</th><th>Rule</th><th>Every</th><th>Effort</th><th>Next</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${state.chores.map((chore) => { const assignment = assignmentFor(chore, state.people, state.completions); return `<tr><th>${esc(chore.name)}</th><td>${chore.rule === 'fixed' ? `Fixed · ${esc(assignment.person?.name ?? 'owner needed')}` : 'Rotation'}</td><td>${chore.intervalDays} ${chore.intervalDays === 1 ? 'day' : 'days'}</td><td>${chore.effortMinutes} min</td><td>${esc(assignment.person?.name ?? '—')}<small>${fmt(assignment.dueAt)}</small></td><td><button class="secondary small" data-action="edit-chore" data-id="${chore.id}">Edit</button></td></tr>`; }).join('')}</tbody></table></div>` : emptyPanel('No rules written yet', 'Add a recurring chore to make its ownership transparent.', 'add-chore', 'Add first chore')}`;
}

function historyView(): string {
  const records = [...state.completions].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return `<section class="page-lead"><div><p class="eyebrow">LOCAL LOG</p><h2>Completion history</h2><p>A lightweight factual record. No scores, rankings, or streaks.</p></div><button class="secondary" data-action="export-csv" ${records.length ? '' : 'disabled'}>Export CSV</button></section>
  ${records.length ? `<ol class="history-list">${records.map((record) => { const chore = state.chores.find((item) => item.id === record.choreId); const person = state.people.find((item) => item.id === record.personId); return `<li><time datetime="${record.completedAt}"><strong>${new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(new Date(record.completedAt))}</strong>${new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(record.completedAt))}</time><span class="history-line" aria-hidden="true"></span><div><h3>${esc(chore?.name ?? 'Removed chore')}</h3><p>Recorded by ${esc(person?.name ?? 'Removed person')} · due ${fmt(record.dueAt)}</p>${record.note ? `<blockquote>${esc(record.note)}</blockquote>` : ''}</div><button class="text-danger" data-action="delete-completion" data-id="${record.id}" aria-label="Delete this ${esc(chore?.name ?? 'chore')} record">Delete</button></li>`; }).join('')}</ol>` : emptyPanel('No completions recorded', 'When someone marks a chore done, its date, person, and optional note appear here.', 'today', 'Go to Today', true)}`;
}

function dataView(): string {
  return `<section class="page-lead"><div><p class="eyebrow">YOUR DATA</p><h2>Move, back up, or unlock</h2><p>The rulebook is device-local. Export it whenever you want.</p></div></section>
    <div class="data-grid">
      <section><span class="section-pixel" aria-hidden="true">↧</span><h3>Backup and restore</h3><p>JSON preserves the whole rulebook. CSV provides a simple completion ledger.</p><div class="button-row"><button class="primary" data-action="export-json">Export JSON</button><button class="secondary" data-action="import-json" aria-controls="import-file">Import JSON</button><label class="sr-only" for="import-file">Choose a Chore Rulebook JSON backup</label><input class="sr-only" type="file" id="import-file" accept="application/json,.json"></div></section>
      <section><span class="section-pixel" aria-hidden="true">⌁</span><h3>Pair another device</h3><p>Create a printable QR containing this snapshot. Data travels in the QR—not through a server.</p><button class="secondary" data-action="pair">Create pairing sheet</button></section>
      <section class="plus-card"><span class="section-pixel" aria-hidden="true">+</span><p class="eyebrow">HOUSEHOLD PLUS</p><h3>${unlocked ? 'Plus is active' : '$12 one-time purchase'}</h3><p>${unlocked ? 'Unlimited chores and printable device pairing are active on this device.' : 'Free includes up to 6 chores, all core rules, history, and exports. Plus adds unlimited chores and printable QR pairing.'}</p>${unlocked ? '<p class="success-text">✓ License active</p>' : `<a class="primary button-link" href="${checkoutUrl}">Buy Household Plus</a><button class="link-button restore" data-action="restore-license">Have a license? Restore it</button>`}<p class="fine-print">Checkout opens through Dodo. A revoked license returns Plus features to free limits.</p></section>
    </div>`;
}

function aboutView(): string {
  return `<section class="prose"><p class="eyebrow">ABOUT</p><h2>A rulebook, not a scoreboard</h2><p>Chore Rulebook is for households that want recurring work to be explicit without turning domestic life into a game. It uses simple order, availability, fixed ownership, and recorded effort.</p><h3>How a rotation is chosen</h3><ol><li>Start after the person who recorded the last completion.</li><li>Follow household order.</li><li>Skip anyone marked away.</li><li>Keep a missed turn visible until it is completed.</li></ol><p>Everything is stored locally in IndexedDB. The app contains no analytics, ads, third-party scripts, or member accounts.</p></section>`;
}

function legalPage(path: string): string {
  if (path === '/privacy') return `<article class="prose legal"><p class="eyebrow">PLAIN-LANGUAGE POLICY · 29 AUG 2026</p><h2>Your household stays on your device</h2><p>Chore Rulebook stores names, chore rules, completion notes, and settings in your browser’s IndexedDB. We do not receive this data. The app has no analytics or tracking.</p><h3>Exports and pairing</h3><p>Your browser creates exports and pairing QR codes locally. Anyone with that file or QR can read its household data.</p><h3>Licenses</h3><p>Existing Plus license tokens are stored in localStorage. The token alone is sent to the Sociobot billing API for verification.</p><h3>Removing data</h3><p>Use your browser’s site-data controls to erase this rulebook and license. Export a backup first if you need it.</p><a href="/" data-route="home">← Return to the rulebook</a></article>`;
  return `<article class="prose legal"><p class="eyebrow">TERMS · 29 AUG 2026</p><h2>A practical household utility</h2><p>Chore Rulebook is provided “as is” for household coordination. You are responsible for your rules, backups, and shared-device access.</p><h3>Purchase</h3><p>Household Plus costs $12 once and adds unlimited chores and printable pairing. Core accessibility, exports, six chores, explanations, and history remain free.</p><p>Checkout opens through Dodo. A revoked license returns Plus features to free limits.</p><h3>Acceptable use</h3><p>Do not use the app for covert monitoring, behavioral scoring, or profiling children. The product does not provide those features.</p><h3>Liability</h3><p>The authors are not liable for lost local data or household disputes where law allows. Keep backups that suit your needs.</p><a href="/" data-route="home">← Return to the rulebook</a></article>`;
}

function emptyPanel(title: string, text: string, action: string, label: string, isView = false): string {
  return `<div class="empty-panel"><span aria-hidden="true">□</span><h3>${title}</h3><p>${text}</p><button class="secondary" ${isView ? 'data-view' : 'data-action'}="${action}">${label}</button></div>`;
}

function initials(name: string): string { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''); }

function bind(): void {
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((button) => button.addEventListener('click', () => {
    view = button.dataset.view as View;
    history.pushState({}, '', `${isDemoMode() ? '/demo' : '/'}?view=${view}`);
    shell();
    document.querySelector<HTMLElement>('h1')?.focus();
  }));
  document.querySelectorAll<HTMLAnchorElement>('[data-route="legal"]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); history.pushState({}, '', link.pathname); shell(); document.querySelector<HTMLElement>('h1')?.focus(); }));
  document.querySelectorAll<HTMLAnchorElement>('[data-route="home"]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); history.pushState({}, '', isDemoMode() ? '/demo' : '/'); view = 'today'; shell(); document.querySelector<HTMLElement>('h1')?.focus(); }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', handleAction));
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', importFile);
  const modal = document.querySelector<HTMLDialogElement>('#modal');
  modal?.addEventListener('close', () => returnFocus?.focus());
  modal?.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
}

async function handleAction(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLElement;
  const action = target.dataset.action;
  if (action === 'start') return householdModal();
  if (action === 'add-person') return personModal();
  if (action === 'add-chore') return choreModal();
  if (action === 'edit-chore') return choreModal(target.dataset.id);
  if (action === 'complete') return completionModal(target.dataset.id!);
  if (action === 'availability') { const person = state.people.find((item) => item.id === target.dataset.id); if (person) { person.available = (target as HTMLInputElement).checked; await persist('Availability updated.'); } return; }
  if (action === 'delete-person') return deletePerson(target.dataset.id!);
  if (action === 'delete-completion') return deleteCompletion(target.dataset.id!);
  if (action === 'export-json') return exportJson();
  if (action === 'export-csv') return exportCsv();
  if (action === 'import-json') { document.querySelector<HTMLInputElement>('#import-file')?.click(); return; }
  if (action === 'pair') return pairingModal();
  if (action === 'restore-license') return licenseModal();
  if (action === 'reset-demo') { await resetDemoState(); location.reload(); return; }
  if (action === 'start-real') { event.preventDefault(); await resetDemoState(); location.assign('/'); return; }
}

function openModal(content: string, onSubmit?: (form: HTMLFormElement) => Promise<void> | void): void {
  const modal = document.querySelector<HTMLDialogElement>('#modal')!;
  const root = document.querySelector<HTMLDivElement>('#modal-content')!;
  returnFocus = document.activeElement as HTMLElement;
  root.innerHTML = content;
  root.querySelectorAll<HTMLElement>('[data-close]').forEach((button) => button.addEventListener('click', () => modal.close()));
  const form = root.querySelector<HTMLFormElement>('form');
  if (form && onSubmit) form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    if (submit) submit.disabled = true;
    try { await onSubmit(form); modal.close(); } catch (error) { setFormError(form, error instanceof Error ? error.message : 'Something went wrong.'); if (submit) submit.disabled = false; }
  });
  modal.showModal();
  requestAnimationFrame(() => root.querySelector<HTMLElement>('input, select, button')?.focus());
}

function modalFrame(title: string, body: string, submit: string, danger = ''): string {
  return `<form><div class="modal-head"><div><p class="eyebrow">RULE EDITOR</p><h2 id="modal-title">${title}</h2></div><button type="button" class="close-button" data-close aria-label="Close dialog">×</button></div><div class="modal-body">${body}<p class="form-error" role="alert"></p></div><div class="modal-actions">${danger}<button type="button" class="secondary" data-close>Cancel</button><button class="primary" type="submit">${submit}</button></div></form>`;
}

function householdModal(): void {
  openModal(modalFrame('Set up this household', `<label>Household name<input name="household" required maxlength="60" autocomplete="organization" placeholder="e.g. Cedar House"></label><label>People <span class="hint">Separate names with commas</span><input name="people" required maxlength="200" placeholder="Alex, Bo, Casey"></label><p class="form-note">Names stay on this device. Nobody needs an account.</p>`, 'Create rulebook'), async (form) => {
    const data = new FormData(form); const now = new Date().toISOString();
    const names = String(data.get('people')).split(',').map((name) => name.trim()).filter(Boolean);
    if (!names.length) throw new Error('Add at least one person.');
    const householdName = String(data.get('household')).trim();
    if (!householdName) throw new Error('Enter a household name using letters or numbers.');
    state.householdName = householdName;
    state.people = names.map((name) => ({ id: uid(), name, available: true, createdAt: now }));
    await persist('Household created.');
  });
}

function personModal(): void {
  openModal(modalFrame('Add a person', `<label>Name<input name="name" required maxlength="60" autocomplete="off"></label><label class="check-row"><input type="checkbox" name="available" checked><span>Available for rotating chores</span></label>`, 'Add person'), async (form) => {
    const data = new FormData(form); const name = String(data.get('name')).trim();
    if (!name) throw new Error('Enter a person’s name using letters or numbers.');
    if (state.people.some((person) => person.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('That name is already in the household.');
    state.people.push({ id: uid(), name, available: data.has('available'), createdAt: new Date().toISOString() });
    await persist(`${name} added.`);
  });
}

function choreModal(id?: string): void {
  if (!state.people.length) { toast('Add a person before writing a chore rule.'); view = 'people'; shell(); return; }
  if (!id && !unlocked && state.chores.length >= 6) { view = 'data'; shell(); toast('The free rulebook holds 6 chores. Household Plus removes that limit.'); return; }
  const chore = state.chores.find((item) => item.id === id);
  const body = `<label>Chore name<input name="name" required maxlength="80" value="${esc(chore?.name)}" placeholder="e.g. Clean the bathroom"></label><div class="field-pair"><label>Repeat every<input name="interval" type="number" required min="1" max="365" inputmode="numeric" value="${chore?.intervalDays ?? 7}"><span class="suffix">days</span></label><label>Estimated effort<input name="effort" type="number" required min="5" max="600" step="5" inputmode="numeric" value="${chore?.effortMinutes ?? 20}"><span class="suffix">min</span></label></div><fieldset><legend>Assignment rule</legend><label class="radio-card"><input type="radio" name="rule" value="rotation" ${!chore || chore.rule === 'rotation' ? 'checked' : ''}><span><strong>Rotate in household order</strong><small>Skip people marked away; advance after completion.</small></span></label><label class="radio-card"><input type="radio" name="rule" value="fixed" ${chore?.rule === 'fixed' ? 'checked' : ''}><span><strong>Keep a fixed owner</strong><small>The same person remains responsible.</small></span></label></fieldset><label>Fixed owner <span class="hint">Used only for fixed rules</span><select name="owner"><option value="">Choose a person</option>${state.people.map((person) => `<option value="${person.id}" ${chore?.fixedPersonId === person.id ? 'selected' : ''}>${esc(person.name)}</option>`).join('')}</select></label><fieldset><legend>When a rotating turn is missed</legend><label class="radio-card"><input type="radio" name="missed" value="hold" ${!chore || chore.missedPolicy === 'hold' ? 'checked' : ''}><span><strong>Hold the turn</strong><small>Keep it visible until someone records it.</small></span></label><label class="radio-card"><input type="radio" name="missed" value="advance" ${chore?.missedPolicy === 'advance' ? 'checked' : ''}><span><strong>Pass a missed turn</strong><small>Move on after each full interval that passes.</small></span></label></fieldset>`;
  const danger = chore ? `<button type="button" class="text-danger modal-delete" data-delete-chore>Delete chore</button>` : '';
  openModal(modalFrame(chore ? 'Edit chore rule' : 'Add a chore rule', body, chore ? 'Save rule' : 'Add chore', danger), async (form) => {
    const data = new FormData(form); const rule = String(data.get('rule')) as Chore['rule']; const owner = String(data.get('owner'));
    if (rule === 'fixed' && !owner) throw new Error('Choose an owner for this fixed rule.');
    const name = String(data.get('name')).trim();
    if (!name) throw new Error('Enter a chore name using letters or numbers.');
    const values: Chore = { id: chore?.id ?? uid(), name, intervalDays: Number(data.get('interval')), effortMinutes: Number(data.get('effort')), rule, fixedPersonId: rule === 'fixed' ? owner : undefined, missedPolicy: String(data.get('missed')) as Chore['missedPolicy'], createdAt: chore?.createdAt ?? new Date().toISOString() };
    if (chore) Object.assign(chore, values); else state.chores.push(values);
    await persist(chore ? 'Rule updated.' : 'Chore added.');
  });
  if (chore) document.querySelector<HTMLElement>('[data-delete-chore]')?.addEventListener('click', () => {
    if (!confirm(`Delete “${chore.name}”? Its history will remain in the local log.`)) return;
    state.chores = state.chores.filter((item) => item.id !== chore.id); document.querySelector<HTMLDialogElement>('#modal')?.close(); void persist('Chore deleted.');
  });
}

function completionModal(id: string): void {
  const chore = state.chores.find((item) => item.id === id); if (!chore) return;
  const assignment = assignmentFor(chore, state.people, state.completions);
  openModal(modalFrame(`Record ${esc(chore.name)}`, `<p class="modal-summary">Assigned to <strong>${esc(assignment.person?.name ?? 'nobody')}</strong> · about ${chore.effortMinutes} minutes</p><label>Who completed it?<select name="person" required>${state.people.map((person) => `<option value="${person.id}" ${assignment.person?.id === person.id ? 'selected' : ''}>${esc(person.name)}</option>`).join('')}</select></label><label>Completed on<input type="date" name="date" required value="${dateOnly(new Date())}" max="${dateOnly(new Date())}"></label><label>Note <span class="hint">Optional, factual, and local</span><textarea name="note" maxlength="280" rows="3" placeholder="e.g. Filters need replacing next time"></textarea></label>`, 'Record completion'), async (form) => {
    const data = new FormData(form); const completed = new Date(`${String(data.get('date'))}T12:00:00`).toISOString();
    state.completions.push({ id: uid(), choreId: chore.id, personId: String(data.get('person')), completedAt: completed, dueAt: assignment.dueAt, note: String(data.get('note')).trim() || undefined });
    await persist(`${chore.name} recorded. Next turn is ready.`);
  });
}

async function deletePerson(id: string): Promise<void> {
  const person = state.people.find((item) => item.id === id); if (!person) return;
  const fixed = state.chores.filter((chore) => chore.fixedPersonId === id).length;
  if (!confirm(`Remove ${person.name}?${fixed ? ` ${fixed} fixed-owner ${fixed === 1 ? 'rule will' : 'rules will'} need a new owner.` : ''} Existing history will keep a removed-person label.`)) return;
  state.people = state.people.filter((item) => item.id !== id); await persist(`${person.name} removed.`);
}

async function deleteCompletion(id: string): Promise<void> {
  const index = state.completions.findIndex((item) => item.id === id); if (index < 0) return;
  const [removed] = state.completions.splice(index, 1); await saveState(state); shell();
  toast('Completion deleted.', 'Undo', async () => { state.completions.push(removed); await persist('Completion restored.'); });
}

async function persist(message: string): Promise<void> {
  try { await saveState(state); shell(); toast(message); }
  catch { shell(); toast('This change could not be saved. Check that browser storage is available.'); }
}

function toast(message: string, action?: string, callback?: () => void): void {
  clearTimeout(undoTimer); const node = document.querySelector<HTMLDivElement>('#toast'); if (!node) return;
  node.innerHTML = `<span>${esc(message)}</span>${action ? `<button>${esc(action)}</button>` : ''}`; node.classList.add('visible');
  if (action && callback) node.querySelector('button')?.addEventListener('click', callback);
  undoTimer = window.setTimeout(() => node.classList.remove('visible'), action ? 8000 : 4500);
}

function setFormError(form: HTMLFormElement, message: string): void { const error = form.querySelector<HTMLElement>('.form-error'); if (error) error.textContent = message; }

function download(filename: string, value: string, type: string): void {
  const url = URL.createObjectURL(new Blob([value], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJson(): void { download(`chore-rulebook-${dateOnly(new Date())}.json`, JSON.stringify(state, null, 2), 'application/json'); toast('JSON backup exported.'); }
function exportCsv(): void {
  const quote = (value: string | number | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = state.completions.map((record) => [record.completedAt, record.dueAt, state.chores.find((item) => item.id === record.choreId)?.name ?? 'Removed chore', state.people.find((item) => item.id === record.personId)?.name ?? 'Removed person', state.chores.find((item) => item.id === record.choreId)?.effortMinutes ?? '', record.note ?? ''].map(quote).join(','));
  download(`chore-history-${dateOnly(new Date())}.csv`, ['"completed_at","due_at","chore","person","estimated_minutes","note"', ...rows].join('\n'), 'text/csv'); toast('CSV history exported.');
}

async function importFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try {
    const imported = validateImport(JSON.parse(await file.text()));
    if (!confirm(`Replace this device’s rulebook with “${imported.householdName || 'Unnamed household'}” (${imported.people.length} people, ${imported.chores.length} chores)? Export first if you need the current data.`)) return;
    state = imported; await persist('Backup imported.');
  } catch (error) { toast(importErrorMessage(error)); }
  finally {
    input.value = '';
    document.querySelector<HTMLButtonElement>('[data-action="import-json"]')?.focus();
  }
}

function importErrorMessage(error: unknown): string {
  if (error instanceof SyntaxError) return 'This file is not valid JSON. Choose a Chore Rulebook JSON backup and try again.';
  const knownMessages = new Set([
    'That file does not contain a Chore Rulebook backup.',
    'That backup format is not supported. Choose a JSON export from Chore Rulebook.',
    'That backup has invalid fields and was not imported.',
  ]);
  if (error instanceof Error && knownMessages.has(error.message)) return error.message;
  return 'That backup could not be read. Choose a Chore Rulebook JSON backup and try again.';
}

async function pairingModal(): Promise<void> {
  if (!unlocked) { view = 'data'; shell(); toast('Printable pairing is included with Household Plus. JSON export always stays free.'); return; }
  const link = `${location.origin}/#pair=${await encodePairing(state)}`;
  openModal(`<div class="modal-head"><div><p class="eyebrow">LOCAL TRANSFER</p><h2 id="modal-title">Pair another device</h2></div><button class="close-button" data-close aria-label="Close dialog">×</button></div><div class="pair-sheet"><canvas id="pair-code" width="300" height="300" aria-label="QR code containing this rulebook snapshot"></canvas><div><h3>${esc(state.householdName)}</h3><p>Open Chore Rulebook on the other device and scan this code. The snapshot is inside the QR; no household data is uploaded.</p><p class="pair-warning">Anyone with this sheet can read the household names and rules.</p><button class="primary" id="print-pair">Print pairing sheet</button></div></div>`);
  try { const QRCode = await import('qrcode'); await QRCode.toCanvas(document.querySelector<HTMLCanvasElement>('#pair-code')!, link, { width: 300, margin: 2, color: { dark: '#0A101C', light: '#F4F1DF' }, errorCorrectionLevel: 'L' }); }
  catch { toast('The pairing code could not be drawn. Export JSON instead.'); }
  document.querySelector('#print-pair')?.addEventListener('click', () => window.print());
}

function licenseModal(): void {
  openModal(modalFrame('Restore Household Plus', `<p>Paste the license token from your purchase email. It will be stored on this device.</p><label>License token<input name="license" required autocomplete="off" spellcheck="false" value="${esc(storedLicense())}"></label>`, 'Verify license'), async (form) => {
    saveLicense(String(new FormData(form).get('license')));
    try { unlocked = await verifyLicense(true); if (!unlocked) throw new Error('That license is not active for Chore Rulebook.'); shell(); toast('Household Plus restored.'); }
    catch (error) { throw new Error(error instanceof Error ? error.message : 'The license could not be verified.'); }
  });
}

async function importPairFromHash(): Promise<void> {
  if (!location.hash.startsWith('#pair=')) return;
  try {
    const incoming = await decodePairing(location.hash.slice(6)); history.replaceState({}, '', '/');
    if (confirm(`Import the paired rulebook “${incoming.householdName || 'Unnamed household'}” on this device? This replaces any current local data.`)) { state = incoming; await saveState(state); toast('Paired rulebook imported.'); }
  } catch { history.replaceState({}, '', '/'); toast('That pairing code is invalid or incomplete.'); }
}

async function start(): Promise<void> {
  try { state = await loadState(); }
  catch { state = emptyState(); app.innerHTML = `<main id="main"><h1>Chore Rulebook</h1><section class="fatal"><h2>Local storage is unavailable</h2><p>This app needs browser storage to protect your rulebook between visits. Leave private browsing or allow site storage, then reload.</p><button onclick="location.reload()">Try again</button></section></main>`; return; }
  if (isDemoMode()) await saveState(state);
  view = viewFromLocation();
  const hadLicense = captureLicense(); if (hadLicense) toast('License received. Checking it now.');
  shell();
  if (consumedRecoveryNotice()) toast('Invalid saved data was set aside. Start a new rulebook or import a valid backup.');
  await importPairFromHash();
  if (storedLicense()) verifyLicense().then((valid) => { const changed = valid !== unlocked; unlocked = valid; if (changed) { shell(); toast(valid ? 'Household Plus is active.' : 'License no longer active. Free features and your data are unchanged.'); } }).catch(() => { /* cached access remains during network errors */ });
}

function viewFromLocation(): View {
  const requested = new URL(location.href).searchParams.get('view');
  return ['today', 'people', 'chores', 'history', 'data', 'about'].includes(requested ?? '') ? requested as View : 'today';
}

window.addEventListener('popstate', () => { view = viewFromLocation(); shell(); document.querySelector<HTMLElement>('h1')?.focus(); });
window.addEventListener('online', () => { shell(); toast('Back online. Your local rulebook is unchanged.'); });
window.addEventListener('offline', () => { shell(); toast('Offline. Changes will keep saving on this device.'); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) toast('An update is ready. Reload to use it.', 'Reload', () => location.reload()); });
    });
  }).catch(() => { /* app remains usable without install support */ });
}

void start();
