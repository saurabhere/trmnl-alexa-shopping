// Knowledge base / help page for the Bring! Shopping List TRMNL plugin.

export function helpPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bring! Shopping List for TRMNL — Help</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; color: #222; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, #ff6450, #c83228); color: white; padding: 60px 20px 48px; text-align: center; }
    .hero h1 { font-size: 32px; margin-bottom: 8px; }
    .hero p { font-size: 16px; opacity: .9; max-width: 520px; margin: 0 auto; }
    .container { max-width: 680px; margin: 0 auto; padding: 32px 20px 60px; }
    h2 { font-size: 22px; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #ff4d3d; display: inline-block; }
    h3 { font-size: 17px; margin: 20px 0 8px; }
    p, li { font-size: 15px; margin-bottom: 8px; }
    ul, ol { padding-left: 24px; margin-bottom: 16px; }
    code { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .card { background: white; border-radius: 12px; padding: 24px; margin: 16px 0; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    .step-num { display: inline-block; width: 28px; height: 28px; background: #ff4d3d; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px; margin-right: 8px; flex-shrink: 0; }
    .step { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 16px; }
    .step-content { flex: 1; }
    .badge { display: inline-block; background: #ff4d3d; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 6px; }
    .badge--green { background: #2a9d3a; }
    .badge--gray { background: #888; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
    th { text-align: left; padding: 8px 12px; background: #f0f0f0; border-bottom: 2px solid #ddd; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .faq-q { font-weight: 700; margin-top: 16px; }
    .faq-a { margin-bottom: 16px; color: #444; }
    a { color: #ff4d3d; }
    .footer { text-align: center; color: #999; font-size: 13px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>

<div class="hero">
  <h1>🛒 Bring! Shopping List</h1>
  <p>See your Bring! shopping list at a glance on your TRMNL e-ink display. Works with Alexa, Google Home, or just the Bring! app.</p>
</div>

<div class="container">

  <h2>How it works</h2>
  <div class="card">
    <p>This plugin connects your <a href="https://www.getbring.com/" target="_blank">Bring!</a> shopping list account to your TRMNL device. Whenever your device refreshes, it fetches your current list and displays it.</p>
    <p style="margin-top:12px">
      <span class="badge">Bring! app</span>
      <span class="badge badge--gray">Alexa</span>
      <span class="badge badge--gray">Google Home</span>
      <span class="badge badge--gray">Shared lists</span>
      → all end up on your TRMNL screen.
    </p>
  </div>

  <h2>Setup</h2>

  <div class="step">
    <span class="step-num">1</span>
    <div class="step-content">
      <strong>Create a Bring! account</strong><br>
      Download the <a href="https://www.getbring.com/" target="_blank">Bring! app</a> and sign up with <strong>email + password</strong> (not Google/Apple sign-in — the API needs a password).
    </div>
  </div>

  <div class="step">
    <span class="step-num">2</span>
    <div class="step-content">
      <strong>Optional: Link a voice assistant</strong><br>
      <strong>Alexa:</strong> Alexa app → More → Lists & Notes → Settings → connect Bring!.<br>
      <strong>Google Home:</strong> "Hey Google, talk to Bring!" and follow the prompts.<br>
      Now anything you say — <em>"Add milk to my shopping list"</em> — lands in Bring!.
    </div>
  </div>

  <div class="step">
    <span class="step-num">3</span>
    <div class="step-content">
      <strong>Install the plugin on TRMNL</strong><br>
      Click <strong>Install</strong> on the plugin page. Enter your Bring! email and password. If you have multiple Bring! lists, pick the one you want on your screen.
    </div>
  </div>

  <div class="step">
    <span class="step-num">4</span>
    <div class="step-content">
      <strong>Add it to a playlist</strong><br>
      Go to Playlists in your TRMNL dashboard and add "Bring! Shopping List" to your device's rotation. Done!
    </div>
  </div>

  <h2>Layouts</h2>
  <div class="card">
    <table>
      <tr><th>Layout</th><th>Best for</th><th>Features</th></tr>
      <tr><td><strong>Full</strong></td><td>Dedicated screen</td><td>Up to 2 columns, item notes, adaptive text</td></tr>
      <tr><td><strong>Half Horizontal</strong></td><td>Side-by-side mashup</td><td>Up to 2 columns, names only</td></tr>
      <tr><td><strong>Half Vertical</strong></td><td>Stacked mashup</td><td>Single column, item notes</td></tr>
      <tr><td><strong>Quadrant</strong></td><td>4-plugin mashup</td><td>Up to 2 columns, compact</td></tr>
    </table>
    <p style="margin-top:8px;font-size:13px;color:#666">All layouts auto-fill available space and show "and X more" when items overflow.</p>
  </div>

  <h2>FAQ</h2>

  <p class="faq-q">Are my Bring! credentials safe?</p>
  <p class="faq-a">Yes. Your password is encrypted with AES-256-GCM before storage and is only ever sent to Bring!'s own API to fetch your list. It is never logged, displayed, or shared. When you uninstall the plugin, your credentials are immediately deleted.</p>

  <p class="faq-q">How fast do changes show up?</p>
  <p class="faq-a">Your list is fetched live each time the device refreshes — so it's as fresh as your device's refresh interval (typically 5–15 minutes on battery, faster on USB power). There is no caching or delay on our side.</p>

  <p class="faq-q">Can I use this without Alexa?</p>
  <p class="faq-a">Absolutely. The plugin reads your Bring! list regardless of how items get there — the Bring! app, a shared family list, Alexa, Google Home, or any other integration.</p>

  <p class="faq-q">I signed up with Google/Apple — can I still use this?</p>
  <p class="faq-a">The Bring! API requires an email + password login. If you signed up with Google/Apple, go to Bring! app → Profile → account settings and <strong>add a password</strong> to your existing account. Your lists stay the same.</p>

  <p class="faq-q">Can I show a specific list?</p>
  <p class="faq-a">Yes! If your Bring! account has multiple lists, the install flow lets you pick which one to display. To switch lists later, reinstall the plugin.</p>

  <p class="faq-q">What does the plugin show when the list is empty?</p>
  <p class="faq-a">A witty rotating message — like "Cart's empty. Fridge is judging you." or "Achievement unlocked: empty list." It changes periodically.</p>

  <h2>Troubleshooting</h2>

  <h3>Plugin shows "Bring! login failed"</h3>
  <p>Your password may have changed, or you signed up with Google/Apple SSO without setting a password. Go to the Bring! app → Profile → add/reset your password, then reinstall the plugin.</p>

  <h3>Plugin shows "Temporary error — will retry"</h3>
  <p>Bring!'s API had a momentary issue. This resolves on its own — your next device refresh will try again.</p>

  <h3>My items don't show up</h3>
  <ul>
    <li>Make sure you selected the correct list during install (if you have multiple).</li>
    <li>Check that items appear in the Bring! app itself first.</li>
    <li>Your device may not have refreshed yet — wait for the next cycle or force-refresh from the TRMNL dashboard.</li>
  </ul>

  <h3>I want to change which list is displayed</h3>
  <p>Uninstall the plugin from your TRMNL dashboard, then reinstall it — you'll get the list picker again.</p>

  <div class="footer">
    Bring! Shopping List for TRMNL · Made by <a href="https://github.com/saurabhere" target="_blank">Saurabh Gupta</a>
  </div>
</div>

</body>
</html>`;
}
