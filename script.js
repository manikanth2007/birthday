/* ====================================================================
   CONFIG: EDIT YOUR QUESTIONS, ANSWERS AND TEXT HERE
   ==================================================================== */
const CONFIG = {
  nextPage: "birthday.html",   // <-- the page that opens after the 3rd question
  unlockText: "Identity confirmed. Welcome, birthday star! 🎉",

  /* QUESTION TYPES
     "choice"  : options = [{text, correct, reply}]  (reply = playful message for a wrong pick)
     "text"    : answers = accepted answers (case-insensitive), wrong = playful wrong-guess messages
     "buttons" : options = [{text, correct, reply}]  (shown as big buttons) */
  questions: [
    { type:"choice",
      q:"Who holds the official title of best person in the world?",
      options:[
        {text:"Me, obviously 😎", correct:false, reply:"Bold of you to say that. Nope! 😜"},
        {text:"Whoever is reading this", correct:true},          // <-- the right answer
        {text:"A random stranger", correct:false, reply:"Nice try, imposter! Try again 😜"},
        {text:"My pet goldfish 🐠", correct:false, reply:"The goldfish is flattered, but no. 🐟"}
      ] },

    { type:"text",
      q:"What is our secret nickname?",
      answers:["pichi","Halfbrain"],                            // <-- CHANGE THE ANSWERS HERE
      placeholder:"Type the secret passcode",
      wrong:["Nice try, imposter! Try again 😜","Hmm… are you really who you say you are? 🕵️","So close! Or not. Try again 😏"] },

    { type:"buttons",
      q:"Are you ready for your birthday surprise?",
      options:[
        {text:"Yes!", correct:true},
        {text:"Definitely Yes! 🎉", correct:true}
      ] }
  ]
};

/* ====================================================================
   HELPERS + STATE
   ==================================================================== */
const $ = s => document.querySelector(s);
let idx = 0, locked = false;
// lowercase, strip punctuation + extra spaces so "Sweetie!" matches "sweetie"
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ====================================================================
   QUIZ
   ==================================================================== */
function setFb(text, cls){ const f = $("#fb"); f.textContent = text; f.className = "fb " + (cls || ""); }

function showQuestion(){
  const item = CONFIG.questions[idx], total = CONFIG.questions.length;
  locked = false;
  $("#gateEyebrow").textContent = `Step ${idx + 1} of ${total}`;
  $("#barFill").style.width = (idx / total * 100) + "%";     // progress indicator
  $("#q").textContent = item.q;
  setFb("");
  const box = $("#answer"); box.innerHTML = "";

  if (item.type === "text"){
    box.className = "";
    box.innerHTML = `<input type="text" id="txt" placeholder="${item.placeholder || "Your answer"}" autocomplete="off">
                     <button class="btn" id="go">Unlock ✨</button>`;
    const submit = () => {
      const v = norm($("#txt").value);
      const ok = item.answers.some(a => norm(a) === v);
      handle(ok, $("#txt"), ok ? "" : pick(item.wrong || ["Nice try, imposter! Try again 😜"]));
    };
    $("#go").onclick = submit;
    $("#txt").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  } else {
    box.className = "opts";
    item.options.forEach(o => {
      const b = document.createElement("button");
      b.className = item.type === "buttons" ? "btn" : "opt";
      b.textContent = o.text;
      b.onclick = () => handle(o.correct, b, o.reply || "Nice try, imposter! Try again 😜");
      box.appendChild(b);
    });
  }
}

function handle(ok, el, wrongMsg){
  if (locked) return;
  if (ok){
    locked = true;
    el.classList.add(el.tagName === "INPUT" ? "ok" : "right");
    setFb("Correct! 💖", "ok");
    setTimeout(() => { idx++; idx < CONFIG.questions.length ? showQuestion() : unlock(); }, 800);
  } else {
    el.classList.remove("wrong", "shake"); void el.offsetWidth;      // restart the shake animation
    el.classList.add(el.tagName === "INPUT" ? "shake" : "wrong");
    setFb(wrongMsg, "bad");
  }
}

/* ====================================================================
   AFTER THE LAST QUESTION: UNLOCK + CONFETTI + OPEN birthday.html
   ==================================================================== */
function unlock(){
  $("#barFill").style.width = "100%";
  $("#quiz").hidden = true;
  $("#done").hidden = false;
  $("#doneText").textContent = CONFIG.unlockText;

  // optional flag, lets birthday.html check that the quiz was passed
  try { sessionStorage.setItem("bdayUnlocked", "1"); } catch(e){}

  setTimeout(() => {                       // padlock opens + confetti
    $("#card").classList.add("open");
    bigConfetti();
  }, 700);

  setTimeout(() => $("#gate").classList.add("hide"), 2800);          // card fades out
  setTimeout(() => { window.location.href = CONFIG.nextPage; }, 3600); // open birthday.html
}

function bigConfetti(){
  if (!window.confetti) return;
  const end = Date.now() + 2000;
  confetti({particleCount:200, spread:110, origin:{y:.55}});
  (function side(){
    confetti({particleCount:6, angle:60, spread:65, origin:{x:0, y:.75}});
    confetti({particleCount:6, angle:120, spread:65, origin:{x:1, y:.75}});
    if (Date.now() < end) requestAnimationFrame(side);
  })();
}

/* ====================================================================
   FLOATING PARTICLES BACKGROUND
   ==================================================================== */
const cv = $("#bg"), ctx = cv.getContext("2d");
let W, H, parts = [];
const glyphs = ["♥","✦","•","✧"];
function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener("resize", resize); resize();
function spawn(initial){
  return {x:Math.random()*W, y:initial ? Math.random()*H : H+20, s:6+Math.random()*14,
    v:.25+Math.random()*.6, d:Math.random()*6.28, g:pick(glyphs), a:.15+Math.random()*.4, hue:Math.random()<.5 ? 0 : 1};
}
for (let i = 0; i < (W < 600 ? 28 : 55); i++) parts.push(spawn(true));
function frame(t){
  ctx.clearRect(0, 0, W, H);
  const cs = getComputedStyle(document.documentElement);
  const cols = [cs.getPropertyValue("--accent").trim(), cs.getPropertyValue("--accent2").trim()];
  parts.forEach((p, i) => {
    p.y -= p.v; p.x += Math.sin(t / 1500 + p.d) * .35;
    if (p.y < -30) parts[i] = spawn(false);
    ctx.globalAlpha = p.a; ctx.fillStyle = cols[p.hue]; ctx.shadowColor = cols[p.hue]; ctx.shadowBlur = 14;
    ctx.font = p.s + "px serif"; ctx.fillText(p.g, p.x, p.y);
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ============ START ============ */
showQuestion();