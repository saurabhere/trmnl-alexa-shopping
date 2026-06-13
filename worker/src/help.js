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
    .container { max-width: 720px; margin: 0 auto; padding: 32px 20px 60px; }
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
    .badge--blue { background: #232f3e; }
    .badge--google { background: #4285f4; }
    .badge--apple { background: #333; }
    .badge--gray { background: #888; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
    th { text-align: left; padding: 8px 12px; background: #f0f0f0; border-bottom: 2px solid #ddd; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .faq-q { font-weight: 700; margin-top: 16px; }
    .faq-a { margin-bottom: 16px; color: #444; }
    .voice-card { background: white; border-radius: 12px; padding: 20px 24px; margin: 12px 0; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    .voice-card h3 { margin-top: 0; display: flex; align-items: center; gap: 8px; }
    .voice-cmd { background: #f8f8f8; border-left: 3px solid #ff4d3d; padding: 8px 14px; margin: 8px 0; font-style: italic; font-size: 14px; color: #555; }
    a { color: #ff4d3d; }
    .footer { text-align: center; color: #999; font-size: 13px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>

<div class="hero">
  <h1>🛒 Bring! Shopping List</h1>
  <p>Say it to Alexa, Google, or Siri. See it on your TRMNL e-ink display.</p>
</div>

<div class="container">

  <h2>How it works</h2>
  <div class="card">
    <p>This plugin connects your <a href="https://www.getbring.com/" target="_blank">Bring!</a> shopping list to your TRMNL device. Add items from any source — your list updates on the next screen refresh.</p>
    <p style="margin-top:12px">
      <span class="badge">Bring! app</span>
      <span class="badge badge--blue">Alexa</span>
      <span class="badge badge--google">Google</span>
      <span class="badge badge--apple">Siri</span>
      <span class="badge badge--gray">Shared lists</span>
      → all show on your TRMNL.
    </p>
  </div>

  <h2>Plugin setup</h2>

  <div class="step">
    <span class="step-num">1</span>
    <div class="step-content">
      <strong>Create a Bring! account</strong><br>
      Download the <a href="https://www.getbring.com/" target="_blank">Bring! app</a> and sign up with <strong>email + password</strong>.<br>
      <span style="font-size:13px;color:#888">Signed up with Google/Apple? Go to Profile → add a password. Your lists stay the same.</span>
    </div>
  </div>

  <div class="step">
    <span class="step-num">2</span>
    <div class="step-content">
      <strong>Install the plugin on TRMNL</strong><br>
      Click <strong>Install</strong> on the plugin page. Enter your Bring! email, password, pick a language, and choose which list to display.
    </div>
  </div>

  <div class="step">
    <span class="step-num">3</span>
    <div class="step-content">
      <strong>Add it to a playlist</strong><br>
      In your TRMNL dashboard, add "Bring! Shopping List" to your device's playlist. Done!
    </div>
  </div>

  <h2>Voice assistant guides</h2>
  <p>Bring! works with all major voice assistants. Set up any (or all) of these so you can add items by voice and see them on your TRMNL.</p>

  <div class="voice-card">
    <h3><span class="badge badge--blue">Alexa</span> Amazon Alexa</h3>
    <ol>
      <li>Open the <strong>Alexa app</strong> on your phone.</li>
      <li>Go to <strong>More → Skills & Games</strong>. Search for <strong>"Bring! Shopping List"</strong>.</li>
      <li>Tap <strong>Enable</strong> and sign in with your Bring! account.</li>
      <li>Under the skill's <strong>Settings</strong>, choose your default list.</li>
      <li>Grant Alexa <strong>read and write access</strong> to your list.</li>
    </ol>
    <p><strong>Voice commands:</strong></p>
    <div class="voice-cmd">"Alexa, open Bring and add milk to my shopping list."</div>
    <div class="voice-cmd">"Alexa, open Bring and add eggs, bread, and butter."</div>
    <p style="font-size:13px;color:#888">Note: Alexa syncs with Bring! periodically, not in real time. Items usually appear within a minute.</p>
  </div>

  <div class="voice-card">
    <h3><span class="badge badge--apple">Siri</span> Apple Siri (iOS)</h3>
    <p>Works on iPhone and iPad with iOS 17+.</p>
    <ol>
      <li>Just say: <strong>"Hey Siri, add milk to my shopping list in Bring!"</strong></li>
      <li>If prompted, grant Siri permission to access Bring!.</li>
      <li>That's it — no separate skill to enable.</li>
    </ol>
    <p>Or set it up manually: <strong>Settings → Bring! → Siri & Search</strong> → enable.</p>
    <p><strong>Voice commands:</strong></p>
    <div class="voice-cmd">"Hey Siri, add 1 liter of milk to my shopping list in Bring!"</div>
    <div class="voice-cmd">"Hey Siri, add milk, eggs and bread to my shopping list in Bring!"</div>
    <div class="voice-cmd">"Hey Siri, what's on my shopping list in Bring!?"</div>
    <div class="voice-cmd">"Hey Siri, mark milk as complete in Bring!"</div>
    <p style="font-size:13px;color:#888">Tip: Change the default list in Bring! app settings to control which list Siri adds to.</p>
  </div>

  <div class="voice-card">
    <h3><span class="badge badge--google">Google</span> Google Home / Assistant</h3>
    <ol>
      <li>Say <strong>"Hey Google, talk to Bring!"</strong> on your Google Home or phone.</li>
      <li>Follow the prompts to <strong>link your Bring! account</strong>.</li>
      <li>Once linked, you can add items by voice.</li>
    </ol>
    <p><strong>Voice commands:</strong></p>
    <div class="voice-cmd">"Hey Google, talk to Bring! and add milk."</div>
    <div class="voice-cmd">"Hey Google, ask Bring! to add eggs and bread."</div>
  </div>

  <h2>Layouts</h2>
  <div class="card">
    <table>
      <tr><th>Layout</th><th>Best for</th><th>Features</th></tr>
      <tr><td><strong>Full</strong></td><td>Dedicated screen</td><td>Greeting header, 2 columns, icons, item notes, progress bar, recently-got strip, witty tagline</td></tr>
      <tr><td><strong>Half Horizontal</strong></td><td>Side-by-side mashup</td><td>2 columns, icons, recently-got strip, witty tagline</td></tr>
      <tr><td><strong>Half Vertical</strong></td><td>Stacked mashup</td><td>Single column, icons, item notes, witty tagline</td></tr>
      <tr><td><strong>Quadrant</strong></td><td>4-plugin mashup</td><td>2 columns, icons, compact</td></tr>
    </table>
    <p style="margin-top:8px;font-size:13px;color:#666">Text size adapts automatically — fewer items = bigger text to fill the screen.</p>
  </div>

  <h2>FAQ</h2>

  <p class="faq-q">Are my Bring! credentials safe?</p>
  <p class="faq-a">Yes. Your password is encrypted with AES-256-GCM before storage and only ever sent to Bring!'s own API. It is never logged or shared. On uninstall, credentials are immediately deleted. The <a href="https://github.com/saurabhere/trmnl-alexa-shopping" target="_blank">source code is open</a> — audit it yourself.</p>

  <p class="faq-q">Why do you need my password?</p>
  <p class="faq-a">Bring! doesn't offer "Sign in with Bring!" (no OAuth). Direct email + password login is the only way — the same approach <a href="https://www.home-assistant.io/integrations/bring/" target="_blank">Home Assistant</a> and other integrations use.</p>

  <p class="faq-q">How fast do changes show up?</p>
  <p class="faq-a">Your list is fetched live each time the device refreshes (typically every 5–15 minutes on battery). There is no caching or delay on our side.</p>

  <p class="faq-q">Can I use this without a voice assistant?</p>
  <p class="faq-a">Absolutely. The plugin reads your Bring! list regardless of how items get there — the Bring! app, a shared family list, or any voice assistant.</p>

  <p class="faq-q">I signed up with Google/Apple — can I use this?</p>
  <p class="faq-a">Go to Bring! app → Profile → <strong>add a password</strong> to your account. Your lists stay the same, and you can then use that password here.</p>

  <p class="faq-q">Can I switch lists or language later?</p>
  <p class="faq-a">Yes. Go to the plugin management page (TRMNL dashboard → plugin settings). Sign in, pick a new list or language, and save. No reinstall needed.</p>

  <p class="faq-q">What shows when the list is empty?</p>
  <p class="faq-a">A witty rotating phrase in italic — like <em>"Cart's empty. Fridge is judging you."</em> It changes hourly.</p>

  <h2>Troubleshooting</h2>

  <h3>Plugin shows "Bring! login failed"</h3>
  <p>Your password may have changed, or you signed up with Google/Apple without setting a password. Go to Bring! app → Profile → add/reset your password.</p>

  <h3>Plugin shows "Temporary error"</h3>
  <p>Bring!'s API had a momentary issue. It resolves on its own — your next device refresh will try again.</p>

  <h3>My items don't show up</h3>
  <ul>
    <li>Make sure you selected the correct list during install.</li>
    <li>Check that items appear in the Bring! app first.</li>
    <li>Your device may not have refreshed yet — wait for the next cycle.</li>
  </ul>

  <h3>Items show in German (Brot, Milch...)</h3>
  <p>Bring! stores items internally in German. The plugin translates them based on your language setting. Go to the management page and make sure your language is set correctly. Some niche items may not be in the translation catalog.</p>

  <h3>Change list or language</h3>
  <p>Plugin management page → sign in → pick a new list or language → Save. Takes effect on the next device refresh.</p>

  <div class="footer">
    Bring! Shopping List for TRMNL · <a href="https://github.com/saurabhere/trmnl-alexa-shopping" target="_blank">Open source</a> · Made by <a href="https://github.com/saurabhere" target="_blank">Saurabh Gupta</a>
  </div>
</div>

</body>
</html>`;
}
