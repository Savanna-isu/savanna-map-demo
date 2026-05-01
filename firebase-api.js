/**
 * firebase-api.js
 * All Firebase calls are isolated here. No Firebase SDK calls should appear
 * anywhere else in the codebase.
 *
 * Requires these Firebase compat SDKs to be loaded before this script:
 *   firebase-app-compat.js, firebase-firestore-compat.js,
 *   firebase-storage-compat.js, firebase-auth-compat.js
 *
 * Replace FIREBASE_CONFIG values with those from your Firebase project console
 * (Project Settings → Your apps → SDK setup and configuration).
 */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCNiRgNSRsji3mEnj-0A8IPnp9NfSjJE1g",
  authDomain:        "savanna-map-bbfc7.firebaseapp.com",
  projectId:         "savanna-map-bbfc7",
  storageBucket:     "savanna-map-bbfc7.firebasestorage.app",
  messagingSenderId: "427537993436",
  appId:             "1:427537993436:web:4bc433fdd1b99edf266e19"
};

firebase.initializeApp(FIREBASE_CONFIG);

const _db      = firebase.firestore();
const _storage = firebase.storage();
const _auth    = firebase.auth();

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _uploadPhoto(submissionId, file) {
  const ext  = file.name.split('.').pop().toLowerCase().replace('jpeg', 'jpg');
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const ref  = _storage.ref(`submissions/${submissionId}/${name}`);
  await ref.put(file, { contentType: file.type });
  return ref.getDownloadURL();
}

function _docToStory(doc) {
  const d = doc.data();
  // Convert Firestore Timestamps to JS Date for convenience
  return {
    id:               doc.id,
    siteId:           d.siteId,
    siteName:         d.siteName,
    year:             d.year,
    alumniName:       d.alumniName,
    contributorRole:  d.contributorRole || '',
    story:            d.story,
    photoUrls:        d.photoUrls || [],
    status:           d.status,
    submittedAt:      d.submittedAt?.toDate?.() ?? null,
    reviewedAt:       d.reviewedAt?.toDate?.() ?? null,
    // alumniEmail intentionally omitted from returned objects (kept server-side only)
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Submit an alumni story with optional photos.
 *
 * @param {object} data
 * @param {string}   data.siteId       - e.g. "new-orleans-la"
 * @param {string}   data.siteName     - human-readable site name
 * @param {number}   data.year         - year of the visit
 * @param {string}   data.alumniName       - submitter's name (shown publicly)
 * @param {string}   data.alumniEmail      - submitter's email (kept private)
 * @param {string}   data.contributorRole  - "Alumni" | "Current Student" | "Faculty / Staff"
 * @param {string}   data.story            - the story text
 * @param {File[]}   [data.photos]         - optional photo File objects from <input type="file">
 * @returns {Promise<string>} the new Firestore document ID
 */
async function submitStory({ siteId, siteName, year, alumniName, alumniEmail, contributorRole, story, photos = [] }) {
  const id = _db.collection('submissions').doc().id;

  const photoUrls = await Promise.all(photos.map(f => _uploadPhoto(id, f)));

  await _db.collection('submissions').doc(id).set({
    siteId,
    siteName,
    year:             Number(year),
    alumniName:       alumniName.trim(),
    alumniEmail:      alumniEmail.trim().toLowerCase(),
    contributorRole:  contributorRole || '',
    story:            story.trim(),
    photoUrls,
    status:           'pending',
    submittedAt:      firebase.firestore.FieldValue.serverTimestamp(),
  });

  return id;
}

/**
 * Get all pending submissions. Requires the current user to be signed in.
 *
 * @returns {Promise<object[]>}
 */
async function getPendingSubmissions() {
  const snap = await _db.collection('submissions')
    .where('status', '==', 'pending')
    .orderBy('submittedAt', 'desc')
    .get();
  return snap.docs.map(_docToStory);
}

/**
 * Approve a submission. Requires the current user to be signed in.
 *
 * @param {string} id - Firestore document ID
 * @returns {Promise<void>}
 */
async function approveSubmission(id) {
  await _db.collection('submissions').doc(id).update({
    status:     'approved',
    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Reject a submission. Requires the current user to be signed in.
 *
 * @param {string} id - Firestore document ID
 * @returns {Promise<void>}
 */
async function rejectSubmission(id) {
  await _db.collection('submissions').doc(id).update({
    status:     'rejected',
    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get approved stories, optionally filtered to one site.
 * Readable by anyone (unauthenticated).
 *
 * @param {string} [siteId] - if provided, only returns stories for that site
 * @returns {Promise<object[]>}
 */
async function getApprovedStories(siteId) {
  let q = _db.collection('submissions').where('status', '==', 'approved');
  if (siteId) q = q.where('siteId', '==', siteId);
  q = q.orderBy('submittedAt', 'desc');
  const snap = await q.get();
  return snap.docs.map(_docToStory);
}

/**
 * Sign in with email + password (admin only).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<firebase.auth.UserCredential>}
 */
async function adminSignIn(email, password) {
  return _auth.signInWithEmailAndPassword(email, password);
}

/**
 * Sign out the current admin user.
 * @returns {Promise<void>}
 */
async function adminSignOut() {
  return _auth.signOut();
}

/**
 * Subscribe to auth state changes.
 * @param {function} callback - called with (user) where user is null if signed out
 * @returns {function} unsubscribe function
 */
function onAuthStateChanged(callback) {
  return _auth.onAuthStateChanged(callback);
}
