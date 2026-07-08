/* ==========================================================================
   Interactive Portfolio Core Logic - Debarjun Maiti
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize systems
    initParticles();
    initMobileNav();
    initRecruiterFilters();
    initChatbot();
    initTerminal();
    initScrollTracker();
    initCardTilt();
});

/* ==========================================================================
   1. Particle Canvas System
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let particlesArray = [];
    const maxParticles = 65;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", () => {
        resizeCanvas();
        init();
    });

    // Particle template
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.color = Math.random() > 0.5 ? '#A855F7' : '#06B6D4'; // purple or cyan
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Collision boundary checks
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

            // Mouse interact push
            if (mouse.x != null && mouse.y != null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
            }
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Connect particles with lines
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 130) {
                    opacityValue = 1 - (distance / 130);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${opacityValue * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ==========================================================================
   2. Mobile Menu System
   ========================================================================== */
function initMobileNav() {
    const toggle = document.getElementById("mobile-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
        menu.classList.toggle("open");
        document.body.style.overflow = menu.classList.contains("open") ? "hidden" : "auto";
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) {
        menu.classList.remove("open");
        document.body.style.overflow = "auto";
    }
}

/* ==========================================================================
   3. Recruiter Mode Filter System
   ========================================================================== */
const recruiterData = {
    general: {
        tagline: "Full Stack Developer | Cloud & Web App Solutions | BCA Graduate",
        pitchHeading: "💡 Dynamic Recruiter Pitch",
        pitchContent: "I construct responsive, secure, and user-centric web applications. Specializing in full-stack architectures and cloud solutions, I focus on optimizing performance, database scaling, and adapting rapidly to modern technology stacks.",
        status: "Available for Internships & Roles",
        highlightedProject: null
    },
    saas: {
        tagline: "Full Stack MERN Developer | Scaling React & Node.js Apps | API Architecture",
        pitchHeading: "💻 Full-Stack SaaS Pitch",
        pitchContent: "Looking to deploy scalable web architectures? I specialize in the MERN stack (MongoDB, Express, React, Node), responsive layouts via TailwindCSS, global state management, and robust API endpoints with clean routing.",
        status: "Seeking SaaS Engineering Roles",
        highlightedProject: "DebarjunMaiti Portfolio"
    },
    cloud: {
        tagline: "Cloud Engineer & DevOps Enthusiast | AWS Deployment & Scaling Systems",
        pitchHeading: "☁️ Cloud & DevOps Pitch",
        pitchContent: "Focusing on secure, performant infrastructure deployments. I set up virtual servers (AWS EC2), manage bucket resources (AWS S3), construct automated deployment steps, and optimize full-stack server pipelines.",
        status: "Seeking Cloud Engineering Roles",
        highlightedProject: "text-to-speech-flask"
    },
    enterprise: {
        tagline: "Backend Software Engineer | Java, C, .NET Core & SQL | Focus on Enterprise Security",
        pitchHeading: "🏢 Enterprise Backend Pitch",
        pitchContent: "I excel at building secure, performant, database-driven endpoints. I write clean, structured OOP code in C, Java, and .NET Core, optimizing complex relational models in MySQL, Microsoft SQL, and Oracle Database.",
        status: "Seeking Backend Engineering Roles",
        highlightedProject: null
    }
};

function initRecruiterFilters() {
    const dropdown = document.getElementById("industry-selector");
    const pillsContainer = document.getElementById("pills-nav");
    
    if (!dropdown || !pillsContainer) return;
    const pills = pillsContainer.querySelectorAll(".pill-btn");

    // Sync dropdown with pills
    dropdown.addEventListener("change", (e) => {
        const val = e.target.value;
        updatePortfolioView(val);
        // Sync active pill class
        pills.forEach(pill => {
            if (pill.getAttribute("data-view") === val) {
                pill.classList.add("active");
            } else {
                pill.classList.remove("active");
            }
        });
    });

    // Sync pills with dropdown
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            const val = pill.getAttribute("data-view");
            dropdown.value = val;
            updatePortfolioView(val);
            // Toggle active state
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
        });
    });
}

function updatePortfolioView(category) {
    const data = recruiterData[category] || recruiterData.general;
    
    // Grabbing DOM nodes
    const typewriter = document.getElementById("typewriter-text");
    const pitchHeading = document.getElementById("pitch-heading");
    const pitchContent = document.getElementById("pitch-content");
    const statusBadge = document.getElementById("status-badge");
    const pitchCard = document.getElementById("pitch-card");

    if (pitchCard) {
        // Simple fade-out animation transition
        pitchCard.style.opacity = "0.3";
        pitchCard.style.transform = "translateY(5px)";
        
        setTimeout(() => {
            if (typewriter) typewriter.textContent = data.tagline;
            if (pitchHeading) pitchHeading.textContent = data.pitchHeading;
            if (pitchContent) pitchContent.textContent = data.pitchContent;
            if (statusBadge) statusBadge.textContent = data.status;
            
            pitchCard.style.opacity = "1";
            pitchCard.style.transform = "translateY(0)";
        }, 250);
    }

    // Filter or Highlight projects dynamically
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        const categoryMatch = card.getAttribute("data-category");
        const projectName = card.querySelector(".project-name").textContent;
        
        card.style.border = "1px solid var(--border-glass)";
        card.style.boxShadow = "none";
        
        if (data.highlightedProject && projectName.includes(data.highlightedProject)) {
            // Apply highlight styling
            card.style.borderColor = "var(--color-secondary)";
            card.style.boxShadow = "0 0 25px rgba(6, 182, 212, 0.25)";
        }
    });
}

/* ==========================================================================
   4. Recruiter Q&A Chatbot System
   ========================================================================== */
const botAnswers = [
    "🎓 **Education Timeline:** I completed my Bachelor of Computer Applications (BCA) in 2025 with a strong baseline in computer science. Currently, I am specializing in Cloud Engineering & DevOps, focusing on AWS hosting, backend deployment pipelines, and scalable APIs.",
    "💪 **Core Tech Matrix:** My core strengths lie in full-stack architecture. I build optimized, modular web platforms utilizing the MERN stack (MongoDB, Express, React, Node) and Python (Django, Flask). I have deep interest in optimizing complex database structures.",
    "🌍 **Availability Setup:** I am open to remote contracts, hybrid arrangements, and standard on-site roles. Furthermore, I am ready to relocate to main technology hubs for permanent, high-impact career positions.",
    "🎙️ **Text-to-Speech Flask App:** This is a multilingual project I constructed. It utilizes Flask (Python) and gTTS to take input in blended Hindi-English text and convert it into natural-sounding speech. You can access the codebase from the Projects catalog above!",
    "🍳 **Grilli Restaurant Management System:** A premium, fully responsive restaurant website with interactive menus, online table reservations, smooth transitions, and a modern aesthetic, deployed via Vercel. You can visit the live application and view the code from the Projects section above!"
];

function initChatbot() {
    // Exposed globally so inline click handlers work
    window.askBot = function(questionId) {
        const chatBox = document.getElementById("chat-box");
        const repliesContainer = document.getElementById("quick-replies");
        if (!chatBox || !repliesContainer) return;

        // Get question text
        const buttons = repliesContainer.querySelectorAll("button");
        if (questionId >= buttons.length) return;
        const questionText = buttons[questionId].innerText;

        // 1. Append User Bubble
        const userBubble = document.createElement("div");
        userBubble.className = "chat-msg user-msg";
        userBubble.innerText = questionText;
        chatBox.appendChild(userBubble);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Disable buttons temporarily
        const originalButtons = repliesContainer.innerHTML;
        repliesContainer.innerHTML = `<span style="font-size: 0.82rem; color: var(--color-text-dark);">Virtual assistant is writing...</span>`;

        // 2. Append Thinking Indicator
        setTimeout(() => {
            const botBubble = document.createElement("div");
            botBubble.className = "chat-msg bot-msg";
            botBubble.innerText = "Let me retrieve that information for you...";
            chatBox.appendChild(botBubble);
            chatBox.scrollTop = chatBox.scrollHeight;

            // 3. Update with real answer
            setTimeout(() => {
                botBubble.innerHTML = formatMarkdown(botAnswers[questionId]);
                chatBox.scrollTop = chatBox.scrollHeight;
                repliesContainer.innerHTML = originalButtons;
            }, 600);

        }, 400);
    };
}

// Simple parser for chat markdown highlight formatting
function formatMarkdown(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/* ==========================================================================
   5. Interactive Terminal Console System
   ========================================================================== */
function initTerminal() {
    const input = document.getElementById("terminal-input");
    const screen = document.getElementById("terminal-screen");
    if (!input || !screen) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const cmd = input.value.trim().toLowerCase();
            input.value = "";
            processCommand(cmd);
        }
    });
}

function processCommand(cmd) {
    const screen = document.getElementById("terminal-screen");
    if (!screen) return;

    // 1. Output Prompt Echo
    const echoLine = document.createElement("div");
    echoLine.className = "terminal-line";
    echoLine.innerHTML = `<span class="terminal-prompt">$</span> ${cmd}`;
    screen.appendChild(echoLine);

    if (cmd === "") {
        screen.scrollTop = screen.scrollHeight;
        return;
    }

    // 2. Process Command Actions
    let output = "";
    switch (cmd) {
        case "help":
            output = `
Available terminal commands:<br>
- <span class="terminal-cmd">about</span>: Brief summary of Debarjun.<br>
- <span class="terminal-cmd">skills</span>: Key tech competencies.<br>
- <span class="terminal-cmd">projects</span>: Repos and showcase links.<br>
- <span class="terminal-cmd">contact</span>: Email, LinkedIn and social links.<br>
- <span class="terminal-cmd">clear</span>: Clear terminal console buffer.<br>
- <span class="terminal-cmd">email</span>: Open draft email to Debarjun.<br>
- <span class="terminal-cmd">linkedin</span>: Open LinkedIn in new tab.<br>
- <span class="terminal-cmd">github</span>: Open GitHub page.
`;
            break;
        case "about":
            output = `Debarjun Maiti - Full Stack Developer based in West Bengal, India. BCA graduate focused on modular UI development, scalable server architectures, and cloud hosting integrations.`;
            break;
        case "skills":
            output = `Languages: Javascript, Python, TypeScript, Java, C<br>Front: ReactJS, TailwindCSS, Figma Mockups<br>Back: Node.js, Express, Django, Flask, .NET<br>DB & Cloud: MongoDB, MySQL, MS SQL, AWS`;
            break;
        case "projects":
            output = `1. <span class="terminal-cmd">text-to-speech-flask</span>: Multilingual speech builder (Flask/Python)<br>2. <span class="terminal-cmd">grilli-restaurant-system</span>: Premium restaurant website (HTML5/CSS3/JS)<br>3. <span class="terminal-cmd">interactive-portfolio</span>: This site codebase`;
            break;
        case "contact":
            output = `Email: debarjunmaiti004@gmail.com<br>LinkedIn: linkedin.com/in/debarjunmaiti<br>GitHub: github.com/DebarjunMaiti`;
            break;
        case "clear":
            screen.innerHTML = "";
            return;
        case "email":
            output = `<span class="terminal-success">Launching email client...</span>`;
            window.open("mailto:debarjunmaiti004@gmail.com", "_self");
            break;
        case "linkedin":
            output = `<span class="terminal-success">Opening LinkedIn profile...</span>`;
            window.open("https://www.linkedin.com/in/debarjunmaiti/", "_blank");
            break;
        case "github":
            output = `<span class="terminal-success">Opening GitHub workspace...</span>`;
            window.open("https://github.com/DebarjunMaiti", "_blank");
            break;
        case "grilli-restaurant-system":
            output = `<span class="terminal-success">Opening Grilli Restaurant Management System...</span>`;
            window.open("https://grilli-the-restaurant-management-sy.vercel.app", "_blank");
            break;
        default:
            output = `<span class="terminal-error">Command not found: '${cmd}'. Type 'help' to review console triggers.</span>`;
    }

    // 3. Render Output
    const responseLine = document.createElement("div");
    responseLine.className = "terminal-line";
    responseLine.innerHTML = output;
    screen.appendChild(responseLine);
    
    // Scroll to bottom
    screen.scrollTop = screen.scrollHeight;
}

/* ==========================================================================
   6. Navigation Scroll Tracker
   ========================================================================== */
function initScrollTracker() {
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140; // adjusting header height offsets
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${currentSectionId}`) {
                item.classList.add("active");
            }
        });
    });
}

/* ==========================================================================
   7. Glass Card 3D Tilt Effect
   ========================================================================== */
function initCardTilt() {
    const cards = document.querySelectorAll("[data-tilt]");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position inside card
            const y = e.clientY - rect.top;  // y position inside card
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt angle
            const angleX = (centerY - y) / 14; 
            const angleY = (x - centerX) / 14;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}
