/*
 * Linux SOC Analyst Master Platform - Threat Labs & Incident Response Engine
 * Authored by Satya Samrudh
 */

// 1. Phishing Email Header & Triage Inspector
function generatePhishingTriageHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.2rem;">
        <div style="display:inline-block; background:rgba(234,179,8,0.15); color:#d97706; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:800; border:1px solid #f59e0b; margin-bottom:0.4rem;">
          Tier 1 SOC Core Lab
        </div>
        <h2 style="color:var(--accent-blue); font-size:1.8rem; font-weight:800; font-family:'Outfit',sans-serif; margin:0;">
          Phishing Email Header &amp; Triage Inspector
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:800px; margin:0.4rem auto 0;">
          Analyze raw email headers, inspect SPF/DKIM/DMARC alignment, defang malicious URLs, and calculate attachment hashes.
        </p>
      </div>

      <div style="display:flex; justify-content:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <button class="cs-pill" style="background:#eab308; color:#000; font-weight:800;" onclick="loadPhishingPreset('bec')">
          BEC CEO Fraud (Spoofed From)
        </button>
        <button class="cs-pill" style="background:#ef4444; color:#fff; font-weight:800;" onclick="loadPhishingPreset('macro')">
          Malicious Invoice Macro (.docm)
        </button>
        <button class="cs-pill" style="background:#3b82f6; color:#fff; font-weight:800;" onclick="loadPhishingPreset('m365')">
          M365 Credential Harvester
        </button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:1.5rem;">
        <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
          <h3 style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.6rem;">
            Raw Email Headers &amp; Body
          </h3>
          <textarea id="phish-header-input" rows="12" style="width:100%; font-family:'Fira Code',monospace; font-size:0.78rem; background:var(--bg-app); color:var(--text-dark); border:1px solid var(--card-border); border-radius:8px; padding:0.8rem;" placeholder="Paste raw email RFC822 headers here..."></textarea>
          <button onclick="analyzePhishingHeaders()" style="width:100%; margin-top:0.8rem; padding:0.6rem; background:var(--accent-blue); color:#fff; font-weight:800; border:none; border-radius:8px; cursor:pointer;">
            Analyze Email Headers &amp; Security Alignment
          </button>
        </div>

        <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.6rem;">
              Security Authentication Alignment
            </h3>
            <div id="phish-auth-results" style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.88rem;">
              <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#dc2626; padding:0.6rem 0.8rem; border-radius:8px; font-weight:700;">
                SPF: FAIL (IP 185.220.101.5 is not authorized for domain company.com)
              </div>
              <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#dc2626; padding:0.6rem 0.8rem; border-radius:8px; font-weight:700;">
                DKIM: FAIL (Invalid signature for selector s1)
              </div>
              <div style="background:rgba(239,68,68,0.15); border:1.5px solid #ef4444; color:#b91c1c; padding:0.6rem 0.8rem; border-radius:8px; font-weight:800;">
                DMARC: REJECT (Header From != Envelope From)
              </div>
              <div style="background:var(--bg-app); border:1px dashed var(--card-border); padding:0.6rem 0.8rem; border-radius:8px;">
                <strong>X-Originating-IP:</strong> 185.220.101.5 (Tor Exit Node / Cybercrime VPN)
              </div>
            </div>
          </div>

          <div style="margin-top:1rem; padding-top:0.8rem; border-top:1px dashed var(--card-border);">
            <div style="font-weight:800; font-size:0.85rem; color:var(--text-ink); margin-bottom:0.3rem;">
              URL Defanger Tool:
            </div>
            <div style="display:flex; gap:0.4rem;">
              <input id="url-defang-in" type="text" value="http://login-microsoft365-verify.ru/auth" style="flex:1; font-family:'Fira Code',monospace; font-size:0.78rem; padding:0.4rem; border-radius:6px; border:1px solid var(--card-border); background:var(--bg-app); color:var(--text-dark);" />
              <button onclick="defangUrl()" style="background:#22c55e; color:#fff; font-weight:800; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;">
                Defang
              </button>
            </div>
            <div id="url-defang-out" style="font-family:'Fira Code',monospace; font-size:0.8rem; color:#1565c0; font-weight:700; margin-top:0.4rem;">
              hxxps[:]//login-microsoft365-verify[.]ru/auth
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

// 2. Active Directory Event Log Hunter
function generateADLogHunterHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.2rem;">
        <div style="display:inline-block; background:rgba(139,92,246,0.15); color:#8b5cf6; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:800; border:1px solid #8b5cf6; margin-bottom:0.4rem;">
          Windows Active Directory Threat Lab
        </div>
        <h2 style="color:var(--accent-blue); font-size:1.8rem; font-weight:800; font-family:'Outfit',sans-serif; margin:0;">
          Active Directory Security &amp; Event Log Hunter
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:800px; margin:0.4rem auto 0;">
          Detect Kerberoasting, Pass-the-Hash, AS-REP Roasting, and Password Spraying attacks in Windows Event Security Logs.
        </p>
      </div>

      <div style="display:flex; justify-content:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <button class="cs-pill" style="background:#8b5cf6; color:#fff; font-weight:800;" onclick="loadADScenario('kerberoast')">
          Kerberoasting (Event 4769 RC4)
        </button>
        <button class="cs-pill" style="background:#ef4444; color:#fff; font-weight:800;" onclick="loadADScenario('pth')">
          Pass-the-Hash (Event 4624 Type 3)
        </button>
        <button class="cs-pill" style="background:#0284c7; color:#fff; font-weight:800;" onclick="loadADScenario('asrep')">
          AS-REP Roasting (Event 4768 No Pre-Auth)
        </button>
        <button class="cs-pill" style="background:#f59e0b; color:#fff; font-weight:800;" onclick="loadADScenario('spray')">
          Password Spraying (Event 4625 Burst)
        </button>
      </div>

      <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
        <h3 id="ad-scenario-title" style="color:var(--accent-blue); font-size:1.1rem; font-weight:800; margin-bottom:0.6rem;">
          Kerberoasting Attack Triage — Event ID 4769 Analysis
        </h3>

        <div id="ad-log-display" style="background:#090d16; color:#4af626; font-family:'Fira Code',monospace; font-size:0.82rem; padding:1rem; border-radius:8px; border:1px solid #1e293b; margin-bottom:1rem; max-height:260px; overflow-y:auto; line-height:1.5;">
          [EventID: 4769] A Kerberos service ticket was requested.<br/>
          TargetName: mssql_svc@CORP.LOCAL<br/>
          ServiceName: mssql_svc<br/>
          TicketOptions: 0x40810010<br/>
          TicketEncryptionType: 0x17 (RC4-HMAC)  <-- ANOMALY: Downgraded Encryption<br/>
          IpAddress: ::ffff:192.168.1.105<br/>
          Status: 0x0
        </div>

        <div id="ad-analysis-box" style="background:rgba(139,92,246,0.08); border-left:4px solid #8b5cf6; padding:1rem; border-radius:0 8px 8px 0; font-size:0.88rem; color:var(--text-ink);">
          <strong>SOC Threat Analysis:</strong> Adversary requested a Kerberos TGS ticket for service account <code>mssql_svc</code> using weak <code>0x17 (RC4-HMAC)</code> encryption to easily crack the password offline hash using Hashcat/John.
          <br/><br/>
          <strong>Containment Step:</strong> Rotate <code>mssql_svc</code> password to a 30+ character random string and enforce AES-256 Kerberos encryption in Active Directory.
        </div>
      </div>
    </article>
  `;
}

// 3. SOAR Automated Incident Containment Engine
function generateSOARPlaybooksHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.2rem;">
        <div style="display:inline-block; background:rgba(34,197,94,0.15); color:#16a34a; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:800; border:1px solid #22c55e; margin-bottom:0.4rem;">
          Tier 2/3 SOAR Automation Lab
        </div>
        <h2 style="color:var(--accent-blue); font-size:1.8rem; font-weight:800; font-family:'Outfit',sans-serif; margin:0;">
          SOAR Automated Incident Containment Engine
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:800px; margin:0.4rem auto 0;">
          Execute automated Security Orchestration, Automation, and Response (SOAR) playbooks to isolate hosts, purge malicious emails, and block firewall IPs.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:1.5rem;">
        <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 style="color:#ef4444; font-size:1.1rem; font-weight:800; margin-bottom:0.4rem;">
              Playbook 1: Compromised Endpoint Host Isolation
            </h3>
            <p style="font-size:0.85rem; color:var(--text-dark); margin-bottom:0.8rem;">
              Triggered when EDR detects C2 Beaconing. Automatically isolates endpoint from network, revokes Azure AD OAuth tokens, and alerts SOC team.
            </p>
          </div>
          <button onclick="runSOARPlaybook('host_isolate')" style="background:#ef4444; color:#fff; font-weight:800; border:none; padding:0.65rem; border-radius:8px; cursor:pointer;">
            Execute Host Isolation Playbook
          </button>
        </div>

        <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 style="color:#22c55e; font-size:1.1rem; font-weight:800; margin-bottom:0.4rem;">
              Playbook 2: Phishing Auto-Purge &amp; Firewall Block
            </h3>
            <p style="font-size:0.85rem; color:var(--text-dark); margin-bottom:0.8rem;">
              Triggered on user phishing report. Checks VirusTotal API reputation, purges email from all inbox mailboxes via Graph API, and blocks IP on firewall.
            </p>
          </div>
          <button onclick="runSOARPlaybook('phish_purge')" style="background:#22c55e; color:#fff; font-weight:800; border:none; padding:0.65rem; border-radius:8px; cursor:pointer;">
            Execute Phishing Purge Playbook
          </button>
        </div>
      </div>

      <div style="background:#05080e; border:1px solid #1e293b; border-radius:12px; padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
          <span style="color:#4af626; font-family:'Fira Code',monospace; font-weight:800; font-size:0.85rem;">
            SOAR Live Execution Console Log
          </span>
          <span id="soar-status-badge" style="background:rgba(74,246,38,0.2); color:#4af626; padding:0.2rem 0.6rem; border-radius:12px; font-weight:800; font-size:0.75rem;">
            System Ready
          </span>
        </div>
        <div id="soar-log-console" style="background:#090d16; color:#4af626; font-family:'Fira Code',monospace; font-size:0.8rem; padding:0.8rem; border-radius:6px; min-height:160px; max-height:220px; overflow-y:auto; line-height:1.6;">
          [READY] Waiting for SOAR playbook trigger execution...
        </div>
      </div>
    </article>
  `;
}

// 4. Cloud Telemetry & Detection Engine (AWS / Azure)
function generateCloudTelemetryHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.2rem;">
        <div style="display:inline-block; background:rgba(2,132,199,0.15); color:#0284c7; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:800; border:1px solid #0284c7; margin-bottom:0.4rem;">
          Hybrid Cloud Security Operations
        </div>
        <h2 style="color:var(--accent-blue); font-size:1.8rem; font-weight:800; font-family:'Outfit',sans-serif; margin:0;">
          Cloud Telemetry &amp; Detection Engine (AWS / Azure)
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:800px; margin:0.4rem auto 0;">
          Inspect AWS CloudTrail audit events, Azure Entra ID sign-in anomalies, and Sentinel KQL queries.
        </p>
      </div>

      <div style="display:flex; justify-content:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <button class="cs-pill" style="background:#0284c7; color:#fff; font-weight:800;" onclick="loadCloudScenario('aws_privesc')">
          AWS CloudTrail: IAM PrivEsc (CreateAccessKey)
        </button>
        <button class="cs-pill" style="background:#eab308; color:#000; font-weight:800;" onclick="loadCloudScenario('aws_s3')">
          AWS S3 Bucket Public Exfiltration
        </button>
        <button class="cs-pill" style="background:#8b5cf6; color:#fff; font-weight:800;" onclick="loadCloudScenario('azure_travel')">
          Azure Entra ID: Impossible Travel Sign-In
        </button>
        <button class="cs-pill" style="background:#ec4899; color:#fff; font-weight:800;" onclick="loadCloudScenario('azure_oauth')">
          Azure Consent Abuse (Malicious OAuth App)
        </button>
      </div>

      <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
        <h3 id="cloud-scenario-title" style="color:var(--accent-blue); font-size:1.1rem; font-weight:800; margin-bottom:0.6rem;">
          AWS CloudTrail Triage — IAM Privilege Escalation
        </h3>

        <div id="cloud-log-display" style="background:#090d16; color:#4af626; font-family:'Fira Code',monospace; font-size:0.82rem; padding:1rem; border-radius:8px; border:1px solid #1e293b; margin-bottom:1rem; max-height:260px; overflow-y:auto; line-height:1.5;">
          {<br/>
          &nbsp;&nbsp;"eventVersion": "1.08",<br/>
          &nbsp;&nbsp;"eventName": "CreateAccessKey",<br/>
          &nbsp;&nbsp;"eventSource": "iam.amazonaws.com",<br/>
          &nbsp;&nbsp;"userIdentitiy": { "type": "IAMUser", "userName": "dev_backdoor_user" },<br/>
          &nbsp;&nbsp;"sourceIPAddress": "198.51.100.42",<br/>
          &nbsp;&nbsp;"userAgent": "aws-cli/2.4.15 Python/3.8.8"<br/>
          }
        </div>

        <div id="cloud-analysis-box" style="background:rgba(2,132,199,0.08); border-left:4px solid #0284c7; padding:1rem; border-radius:0 8px 8px 0; font-size:0.88rem; color:var(--text-ink);">
          <strong>Cloud SOC Detection:</strong> Adversary generated long-term AWS API access keys for backdoor access outside standard CI/CD pipeline.<br/>
          <strong>Remediation:</strong> Delete access key via <code>aws iam delete-access-key</code> and revoke IAM policy immediately.
        </div>
      </div>
    </article>
  `;
}

// 5. Threat Intel IOC Reputation Lookup Engine
function generateThreatIntelIOCHHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.2rem;">
        <div style="display:inline-block; background:rgba(236,72,153,0.15); color:#db2777; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:800; border:1px solid #ec4899; margin-bottom:0.4rem;">
          Cyber Threat Intelligence (CTI) Hub
        </div>
        <h2 style="color:var(--accent-blue); font-size:1.8rem; font-weight:800; font-family:'Outfit',sans-serif; margin:0;">
          Threat Intel IOC Reputation Lookup Engine
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:800px; margin:0.4rem auto 0;">
          Query IPs, Domains, and SHA-256 Hashes against MISP, VirusTotal, AbuseIPDB, and AlienVault OTX datasets.
        </p>
      </div>

      <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem; margin-bottom:1.5rem;">
        <div style="display:flex; gap:0.6rem;">
          <input id="ioc-search-input" type="text" value="185.220.101.5" placeholder="Enter IP (e.g. 185.220.101.5), Domain, or File Hash..." style="flex:1; font-family:'Fira Code',monospace; font-size:0.9rem; padding:0.6rem; border-radius:8px; border:1px solid var(--card-border); background:var(--bg-app); color:var(--text-dark);" />
          <button onclick="performIOCLookup()" style="background:#db2777; color:#fff; font-weight:800; border:none; padding:0.6rem 1.4rem; border-radius:8px; cursor:pointer;">
            Search Threat Intel
          </button>
        </div>
      </div>

      <div id="ioc-results-area" style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px dashed var(--card-border); padding-bottom:0.6rem;">
          <div>
            <span style="font-weight:800; font-size:1.1rem; color:var(--accent-blue);" id="ioc-query-title">IOC Query: 185.220.101.5</span>
            <span style="background:rgba(239,68,68,0.15); color:#dc2626; border:1px solid #ef4444; padding:0.2rem 0.6rem; border-radius:12px; font-weight:800; font-size:0.78rem; margin-left:0.6rem;">
              MALICIOUS (Threat Score 94/100)
            </span>
          </div>
          <span style="font-size:0.8rem; color:#64748b;">STIX 2.1 Object Verified</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
          <div style="background:var(--bg-app); border:1px solid var(--card-border); padding:0.8rem; border-radius:8px;">
            <div style="font-weight:800; font-size:0.85rem; color:#db2777; margin-bottom:0.3rem;">VirusTotal Engine</div>
            <div style="font-size:0.82rem; color:var(--text-dark);">
              <strong>Detection:</strong> 68 / 90 Security Vendors<br/>
              <strong>Categories:</strong> Botnet C2, Cobalt Strike Gateway
            </div>
          </div>
          <div style="background:var(--bg-app); border:1px solid var(--card-border); padding:0.8rem; border-radius:8px;">
            <div style="font-weight:800; font-size:0.85rem; color:#0284c7; margin-bottom:0.3rem;">AbuseIPDB Score</div>
            <div style="font-size:0.82rem; color:var(--text-dark);">
              <strong>Confidence Score:</strong> 100% Malicious<br/>
              <strong>Reports:</strong> 1,420 abuse reports in last 30 days
            </div>
          </div>
          <div style="background:var(--bg-app); border:1px solid var(--card-border); padding:0.8rem; border-radius:8px;">
            <div style="font-weight:800; font-size:0.85rem; color:#8b5cf6; margin-bottom:0.3rem;">AlienVault OTX Pulses</div>
            <div style="font-size:0.82rem; color:var(--text-dark);">
              <strong>Pulses:</strong> 14 Active Threat Pulses<br/>
              <strong>Actor:</strong> APT29 / Cozy Bear Campaign
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

// --- INTERACTIVE EVENT HANDLERS & PRESETS ---
window.loadPhishingPreset = function(type) {
  const input = document.getElementById('phish-header-input');
  if (!input) return;

  if (type === 'bec') {
    input.value = `From: "CEO John Smith" <ceo@company.com>\nReturn-Path: <attacker@tor-exit-node.ru>\nReceived: from mail.attacker-server.ru (185.220.101.5)\nAuthentication-Results: spf=fail dkim=fail dmarc=fail\nSubject: URGENT: Wire Transfer Approval Needed Immediately`;
  } else if (type === 'macro') {
    input.value = `From: "Finance Billing" <billing@vendor-update.com>\nReturn-Path: <billing@vendor-update.com>\nAttachment: Invoice_AUG2026.docm (Contains VBA AutoOpen Macro)\nSHA256: 4f8a92b...e109\nSubject: Invoice #89201 Past Due - Please Review`;
  } else if (type === 'm365') {
    input.value = `From: "Microsoft Security" <no-reply@account-update.com>\nBody: Your password will expire today. Click below to verify:\nLink: http://login-microsoft365-verify.ru/auth\nSubject: Security Alert: Action Required`;
  }
  analyzePhishingHeaders();
};

window.analyzePhishingHeaders = function() {
  const input = document.getElementById('phish-header-input');
  const results = document.getElementById('phish-auth-results');
  if (!input || !results) return;

  const val = input.value;
  let spf = "PASS", dkim = "PASS", dmarc = "PASS", ip = "192.168.1.1";

  if (val.includes('fail') || val.includes('attacker') || val.includes('185.220')) {
    spf = "FAIL (IP 185.220.101.5 unauthorized)";
    dkim = "FAIL (Invalid signature)";
    dmarc = "REJECT (Header From != Envelope From)";
    ip = "185.220.101.5 (Known Cybercrime Proxy)";
  }

  results.innerHTML = `
    <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#dc2626; padding:0.6rem 0.8rem; border-radius:8px; font-weight:700;">
      SPF: ${spf}
    </div>
    <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#dc2626; padding:0.6rem 0.8rem; border-radius:8px; font-weight:700;">
      DKIM: ${dkim}
    </div>
    <div style="background:rgba(239,68,68,0.15); border:1.5px solid #ef4444; color:#b91c1c; padding:0.6rem 0.8rem; border-radius:8px; font-weight:800;">
      DMARC: ${dmarc}
    </div>
    <div style="background:var(--bg-app); border:1px dashed var(--card-border); padding:0.6rem 0.8rem; border-radius:8px;">
      <strong>X-Originating-IP:</strong> ${ip}
    </div>
  `;
};

window.defangUrl = function() {
  const inEl = document.getElementById('url-defang-in');
  const outEl = document.getElementById('url-defang-out');
  if (!inEl || !outEl) return;
  const defanged = inEl.value.replace(/http/g, 'hxxp').replace(/\./g, '[.]');
  outEl.innerText = defanged;
};

window.loadADScenario = function(scen) {
  const title = document.getElementById('ad-scenario-title');
  const display = document.getElementById('ad-log-display');
  const analysis = document.getElementById('ad-analysis-box');
  if (!title || !display || !analysis) return;

  if (scen === 'kerberoast') {
    title.innerText = "Kerberoasting Attack Triage — Event ID 4769 Analysis";
    display.innerHTML = `[EventID: 4769] A Kerberos service ticket was requested.<br/>TargetName: mssql_svc@CORP.LOCAL<br/>TicketEncryptionType: 0x17 (RC4-HMAC) <-- Downgraded<br/>IpAddress: 192.168.1.105`;
    analysis.innerHTML = `<strong>SOC Threat Analysis:</strong> Adversary requested TGS ticket for <code>mssql_svc</code> using RC4 encryption to crack password hash offline.<br/><strong>Mitigation:</strong> Enforce AES-256 Kerberos encryption in Active Directory.`;
  } else if (scen === 'pth') {
    title.innerText = "Pass-the-Hash (PtH) Logon — Event ID 4624 Analysis";
    display.innerHTML = `[EventID: 4624] An account was successfully logged on.<br/>LogonType: 3 (Network)<br/>AuthenticationPackage: NTLM<br/>KeyLength: 0<br/>WorkstationName: WORKSTATION-99<br/>IpAddress: 10.0.4.12`;
    analysis.innerHTML = `<strong>SOC Threat Analysis:</strong> Lateral movement using stolen NTLM hash without knowing plaintext password.<br/><strong>Mitigation:</strong> Disable NTLM authentication and restrict Local Admin Remote Logon.`;
  } else if (scen === 'asrep') {
    title.innerText = "AS-REP Roasting Attack — Event ID 4768 Analysis";
    display.innerHTML = `[EventID: 4768] A Kerberos authentication ticket (TGT) was requested.<br/>TargetUserName: legacy_user<br/>PreAuthType: - (No Pre-Authentication Required)<br/>TicketEncryptionType: 0x17`;
    analysis.innerHTML = `<strong>SOC Threat Analysis:</strong> Account has "Do not require Kerberos preauthentication" set, allowing anyone to request encrypted TGT.<br/><strong>Mitigation:</strong> Enable Kerberos Pre-Authentication on user object immediately.`;
  } else if (scen === 'spray') {
    title.innerText = "Password Spraying Burst — Event ID 4625 Analysis";
    display.innerHTML = `[EventID: 4625] 50 Failed Logons across 50 different user accounts within 60 seconds.<br/>FailureReason: Unknown user name or bad password.<br/>IpAddress: 45.33.32.156`;
    analysis.innerHTML = `<strong>SOC Threat Analysis:</strong> Password Spraying attempting common password (e.g. Summer2026!) against multiple domain accounts.<br/><strong>Mitigation:</strong> Enable MFA and block source IP 45.33.32.156 at perimeter firewall.`;
  }
};

window.runSOARPlaybook = function(type) {
  const consoleEl = document.getElementById('soar-log-console');
  const badgeEl = document.getElementById('soar-status-badge');
  if (!consoleEl || !badgeEl) return;

  badgeEl.innerText = "Executing Playbook...";
  badgeEl.style.background = "rgba(245,158,11,0.2)";
  badgeEl.style.color = "#f59e0b";

  if (type === 'host_isolate') {
    consoleEl.innerHTML = `
      [00:00:01] Trigger: EDR C2 Beaconing Alert Received for Host WKS-902...<br/>
      [00:00:02] Calling CrowdStrike EDR API: POST /devices/entities/containments/v1...<br/>
      [00:00:03] Response 200 OK: Host WKS-902 Isolated from Network.<br/>
      [00:00:04] Calling Azure AD Graph API: POST /users/revokeSignInSessions...<br/>
      [00:00:05] Posting Alert to SOC Incident Channel via Slack Webhook...<br/>
      [00:00:06] PLAYBOOK COMPLETE: Endpoint Containment Successful!
    `;
  } else if (type === 'phish_purge') {
    consoleEl.innerHTML = `
      [00:00:01] Trigger: User Reported Phishing Email (MsgID: <phish-882@attacker.com>)...<br/>
      [00:00:02] Querying VirusTotal API: GET /api/v3/urls/defanged_hash... Score: 18/90 Malicious.<br/>
      [00:00:03] Calling O365 Graph API: DELETE /users/messages/searchEmail...<br/>
      [00:00:04] Response 200 OK: Purged 14 matching phishing emails from all company mailboxes.<br/>
      [00:00:05] Calling Fortinet Firewall API: POST /api/v2/cmdb/firewall/address... Blocked Sender IP 185.220.101.5.<br/>
      [00:00:06] PLAYBOOK COMPLETE: Phishing Auto-Remediation Successful!
    `;
  }

  setTimeout(() => {
    badgeEl.innerText = "Playbook Executed (200 OK)";
    badgeEl.style.background = "rgba(74,246,38,0.2)";
    badgeEl.style.color = "#4af626";
  }, 1000);
};

window.loadCloudScenario = function(scen) {
  const title = document.getElementById('cloud-scenario-title');
  const display = document.getElementById('cloud-log-display');
  const analysis = document.getElementById('cloud-analysis-box');
  if (!title || !display || !analysis) return;

  if (scen === 'aws_privesc') {
    title.innerText = "AWS CloudTrail Triage — IAM Privilege Escalation";
    display.innerHTML = `{\n  "eventName": "CreateAccessKey",\n  "eventSource": "iam.amazonaws.com",\n  "userName": "dev_backdoor_user",\n  "sourceIPAddress": "198.51.100.42"\n}`;
    analysis.innerHTML = `<strong>Cloud SOC Detection:</strong> Adversary created long-term access key for backdoor user.<br/><strong>Remediation:</strong> Delete access key via AWS CLI and revoke user IAM policy.`;
  } else if (scen === 'aws_s3') {
    title.innerText = "AWS S3 Bucket Public Exfiltration Triage";
    display.innerHTML = `{\n  "eventName": "PutBucketPolicy",\n  "eventSource": "s3.amazonaws.com",\n  "bucketName": "corp-confidential-customer-data",\n  "policy": "Principal: '*', Effect: 'Allow'"\n}`;
    analysis.innerHTML = `<strong>Cloud SOC Detection:</strong> S3 bucket policy changed to public read ('*'). Data exfiltration in progress.<br/><strong>Remediation:</strong> Enable AWS S3 Block Public Access at account level.`;
  } else if (scen === 'azure_travel') {
    title.innerText = "Azure Entra ID — Impossible Travel Alert";
    display.innerHTML = `Logon 1: New York, US (10:00 AM UTC)<br/>Logon 2: Moscow, RU (10:14 AM UTC - 14 mins later)<br/>User: sarah.admin@corp.com<br/>App: Azure Management Portal`;
    analysis.innerHTML = `<strong>Cloud SOC Detection:</strong> User authenticated from 2 distant physical locations within 14 minutes.<br/><strong>Remediation:</strong> Revoke Azure user session tokens and require FIDO2 MFA reset.`;
  } else if (scen === 'azure_oauth') {
    title.innerText = "Azure OAuth App Consent Abuse Triage";
    display.innerHTML = `[AuditLog] User consent granted.<br/>AppId: 4f901a-malicious-app<br/>AppName: "ReadWriteAllMail_Helper"<br/>PermissionsRequested: Mail.ReadWrite, Files.ReadWrite.All`;
    analysis.innerHTML = `<strong>Cloud SOC Detection:</strong> Phishing OAuth app granted full mailbox reading & file access.<br/><strong>Remediation:</strong> Revoke OAuth consent grant in Azure Portal Enterprise Applications.`;
  }
};

window.performIOCLookup = function() {
  const input = document.getElementById('ioc-search-input');
  const title = document.getElementById('ioc-query-title');
  if (!input || !title) return;
  title.innerText = `IOC Query: ${input.value}`;
};
