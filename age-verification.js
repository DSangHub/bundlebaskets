/**
 * BundleBaskets Age Verification (Prototype)
 * 
 * For production liquor baskets, replace the demo logic with a real
 * third-party age verification API such as:
 * - AgeChecker.Net (alcohol e-commerce focused)
 * - Veratad AgeMatch / IDMatch
 * - Avalara Beverage Alcohol Age Verification
 * - Yoti Age Verification
 * 
 * These services handle state-specific 21+ rules, ID document checks,
 * and audit trails required by alcohol control boards.
 */

function showAgeModal(onSuccess) {
  let modal = document.getElementById('age-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'age-modal';
    modal.className = 'age-modal';
    modal.innerHTML = `
      <div class="age-box">
        <h3>Age Verification Required</h3>
        <p>Liquor baskets require age verification (21+) under state law. This demo uses a simple date-of-birth check. Production uses a certified API.</p>
        <input type="date" id="age-dob" max="${new Date().toISOString().split('T')[0]}" required>
        <select id="age-state">
          <option value="">Select your state</option>
          <option>CA</option><option>TX</option><option>NY</option><option>FL</option>
          <option>IL</option><option>PA</option><option>OH</option><option>GA</option>
          <option>Other</option>
        </select>
        <button class="btn btn-primary" id="age-verify-btn" style="width:100%;margin-top:0.5rem;">Verify Age</button>
        <button class="btn" id="age-cancel-btn" style="width:100%;margin-top:0.5rem;background:#eee;">Cancel</button>
        <div id="age-status" class="age-status"></div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('age-cancel-btn').onclick = () => {
      modal.classList.remove('active');
    };

    document.getElementById('age-verify-btn').onclick = () => {
      const dob = document.getElementById('age-dob').value;
      const status = document.getElementById('age-status');
      if (!dob) {
        status.textContent = 'Please enter your date of birth.';
        status.className = 'age-status fail';
        return;
      }
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

      if (age >= 21) {
        status.textContent = 'Verified: 21+';
        status.className = 'age-status success';
        sessionStorage.setItem('ageVerified', 'true');
        setTimeout(() => {
          modal.classList.remove('active');
          if (typeof onSuccess === 'function') onSuccess();
        }, 800);
      } else {
        status.textContent = 'Must be 21 or older to view liquor baskets.';
        status.className = 'age-status fail';
      }
    };
  }
  modal.classList.add('active');
}

function requireAgeVerification(callback) {
  if (sessionStorage.getItem('ageVerified') === 'true') {
    if (typeof callback === 'function') callback();
    return;
  }
  showAgeModal(callback);
}

// Auto-attach to liquor-related links/buttons if present
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-age-gate]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (sessionStorage.getItem('ageVerified') !== 'true') {
        e.preventDefault();
        showAgeModal(() => {
          if (el.tagName === 'A' && el.href) window.location = el.href;
          else el.click();
        });
      }
    });
  });
});
