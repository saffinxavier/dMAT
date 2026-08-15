/** About dMAT — exam-day + APS India facts (mirrors materials/EXAM-DAY.md) */

export function openAboutView(root, { onBack }) {
  root.innerHTML = `
    <div class="about-view">
      <div class="about-top">
        <button type="button" data-back>← Hub</button>
        <h2>About dMAT</h2>
        <p class="note">Official-first facts for Core + General Academic Module (APS India). Re-check d-mat.de / APS before you register — dates can change.</p>
      </div>

      <div class="panel about-callout">
        <strong>Watch the UI videos</strong> before test day — on-screen navigation is explained there, not fully in the PDFs.
        <a href="https://www.d-mat.de/en/preparation-for-the-exam/" target="_blank" rel="noopener">d-mat.de preparation</a>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">What it is</h3>
        <p class="note" style="margin:0">Computer-based English aptitude test by g.a.s.t. Two modules: <strong>Core</strong> (3 subtests) + <strong>General Academic Module</strong> for APS India. Not a syllabus cram; not a fixed pass/fail by g.a.s.t.</p>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">Structure &amp; timing</h3>
        <table class="about-table">
          <thead>
            <tr><th>Part</th><th>Items</th><th>Time</th></tr>
          </thead>
          <tbody>
            <tr><td>Figure Sequences</td><td>20</td><td>25 min</td></tr>
            <tr><td>Mathematical Equations</td><td>20</td><td>25 min</td></tr>
            <tr><td>Latin Squares</td><td>20</td><td>25 min</td></tr>
            <tr><td>Break</td><td>—</td><td>30 min</td></tr>
            <tr><td>General Academic Module</td><td>scenarios + Qs</td><td>90 min</td></tr>
          </tbody>
        </table>
        <p class="note">~3.5 hours overall (Core ~75 min + break + GAM 90). Counts from the official GAM prep PDF.</p>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">What each part asks</h3>
        <ul class="about-list">
          <li><strong>FS</strong> — Continue a 4-matrix series (move / spin / hue / step / edges).</li>
          <li><strong>ME</strong> — Letters = distinct integers 1–20; find the asked value.</li>
          <li><strong>LS</strong> — 5×5 A–E Latin square; find ?.</li>
          <li><strong>GAM</strong> — Academic scenario; answer from givens (single-choice).</li>
        </ul>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">Exam-day rules</h3>
        <ul class="about-list">
          <li>English · computer · single-choice</li>
          <li><strong>No notes</strong> (or calculator / helping tools)</li>
          <li><strong>Guess</strong> if unsure — blanks score nothing; no penalty for wrong answers is stated</li>
          <li>Full instructions live in prep materials; exam shows short reminders only</li>
        </ul>
      </div>

      <div class="panel about-callout warn">
        <h3 class="panel-sub" style="margin-top:0">Navigation &amp; changing answers</h3>
        <p class="note" style="margin:0 0 0.5rem">PDFs do not fully spell out every UI control. Watch the official videos.</p>
        <p class="note" style="margin:0"><strong>Our Exam Mock:</strong> jump around and change answers <em>within</em> a subtest; <strong>End subtest is irreversible</strong>; then Core → break → GAM. Approximation only — not a pixel clone.</p>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">Scoring &amp; certificate</h3>
        <ul class="about-list">
          <li>Core and Subject each scaled <strong>0–200</strong> (average ≈ 100)</li>
          <li><strong>Total</strong> = Core + Subject · plus a <strong>percentile</strong> vs all test-takers</li>
          <li>No fixed pass mark — universities decide how to use it</li>
          <li>Certificate <strong>valid indefinitely</strong> (g.a.s.t. portal)</li>
        </ul>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">APS India (who / when)</h3>
        <p class="note"><strong>Who (intro phase):</strong> prior degree in Engineering · Commerce/Accounting/Finance/Economics · Business/Management, applying Master SS 2027+, unless exempt. Confirm on APS.</p>
        <table class="about-table">
          <thead>
            <tr><th>Milestone</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr><td>Register by</td><td>15 Sep 2026</td></tr>
            <tr><td>Exam</td><td>26 Sep 2026</td></tr>
            <tr><td>Certificate online</td><td>12 Oct 2026</td></tr>
          </tbody>
        </table>
        <ul class="about-list">
          <li><strong>Fee:</strong> €150 via g.a.s.t. (confirm on portal)</li>
          <li><strong>Module:</strong> Core + General Academic Module</li>
          <li>You may ship APS docs before the dMAT certificate; APS finishes only after dMAT is submitted</li>
          <li>Centres (planned): Ahmedabad, Bengaluru, Bhopal, Chandigarh, Chennai, Kolkata, Mananthavady, Mumbai, New Delhi, Pune, Kathmandu — final list at booking</li>
        </ul>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">This app vs real exam</h3>
        <ul class="about-list">
          <li><strong>Practice:</strong> scratch pad / check OK · original items</li>
          <li><strong>Exam Mock:</strong> timed Core→break→GAM · no notes · irreversible End</li>
          <li><strong>Real dMAT:</strong> official software &amp; items — watch the videos</li>
        </ul>
        <p class="note">No past papers yet (India APS cycle starts 2026).</p>
      </div>

      <div class="panel">
        <h3 class="panel-sub" style="margin-top:0">Official links</h3>
        <ul class="about-list about-links">
          <li><a href="https://www.d-mat.de/en/this-is-how-the-dmat-is-structured/" target="_blank" rel="noopener">Structure</a></li>
          <li><a href="https://www.d-mat.de/en/dmat-in-india/" target="_blank" rel="noopener">dMAT in India</a></li>
          <li><a href="https://www.d-mat.de/en/preparation-for-the-exam/" target="_blank" rel="noopener">Prep + UI videos</a></li>
          <li><a href="https://www.d-mat.de/wp-content/uploads/2026/07/260716_dMAT_General-Academic-Module_Preparatoy-Materials_EN.pdf" target="_blank" rel="noopener">GAM prep PDF</a></li>
          <li><a href="https://aps-india.de/dmat/" target="_blank" rel="noopener">APS India dMAT</a></li>
          <li><a href="https://www.gast.de/portal/center-search/center-search/dmat/exams/worldwide?lang=en" target="_blank" rel="noopener">Register / book centre</a></li>
        </ul>
        <p class="note">Offline markdown: <code>materials/EXAM-DAY.md</code> · checklist: <code>registration-checklist.md</code></p>
      </div>
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', onBack);
}
