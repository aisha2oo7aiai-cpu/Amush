// Demo data. In a real app this comes from your server.
const CIRCLES = [
  { id: 1, topic: "exam",     name: "Before the results",      desc: "For students stuck in exam and rank anxiety.", members: 18 },
  { id: 2, topic: "career",   name: "Lost on the career path", desc: "Unsure what you want, or scared of choosing wrong.", members: 12 },
  { id: 3, topic: "marriage", name: "Not ready, not asked",    desc: "A safe space for girls facing pressure to marry early.", members: 9 },
  { id: 4, topic: "loan",     name: "Loan weight",             desc: "Dealing with education loans and family expectations.", members: 14 },
  { id: 5, topic: "homesick", name: "Far from home",           desc: "Missing home in a new city or hostel.", members: 21 },
  { id: 6, topic: "lonely",   name: "Lonely in a crowd",       desc: "Surrounded by people, still feeling alone.", members: 25 },
];

const SEED = [
  ["Moon_42", "I haven't told anyone how stressed I am. Glad this place exists."],
  ["QuietRiver", "Same here. It helped me just to type it out. You're not alone in this."],
];

// Words that trigger the crisis banner. Keep this list reviewed by a clinician.
const CRISIS_WORDS = ["suicide", "kill myself", "end my life", "want to die", "self harm", "hurt myself", "no reason to live"];

const $ = (id) => document.getElementById(id);
const circlesEl = $("circles"), crisisBox = $("crisisBox"), room = $("room");
const msgs = $("msgs"), input = $("msgInput"), crisisInline = $("crisisInline");

function renderCircles(topic) {
  crisisBox.hidden = topic !== "crisis";
  circlesEl.innerHTML = "";
  if (topic === "crisis") return; // never show peer circles for crisis

  CIRCLES.filter((c) => topic === "all" || c.topic === topic).forEach((c) => {
    const card = document.createElement("article");
    card.className = "circle";
    card.innerHTML = `
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <div class="circle-foot">
        <small>${c.members} students &middot; moderated</small>
        <button class="btn btn-blue" data-id="${c.id}">Join</button>
      </div>`;
    circlesEl.appendChild(card);
  });
}

function addMsg(who, text, mine = false) {
  const div = document.createElement("div");
  div.className = "msg" + (mine ? " mine" : "");
  const name = document.createElement("b");
  name.textContent = who;                 // textContent prevents HTML injection
  const body = document.createElement("span");
  body.textContent = text;
  div.append(name, body);
  if (!mine) {
    const rep = document.createElement("button");
    rep.className = "link-btn report";
    rep.textContent = "Report";
    rep.onclick = () => { rep.textContent = "Reported"; rep.disabled = true; };
    div.appendChild(rep);
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function openRoom(id) {
  const c = CIRCLES.find((x) => x.id === Number(id));
  $("roomName").textContent = c.name;
  $("roomMeta").textContent = ` · you appear as Guest_${Math.floor(Math.random() * 900 + 100)}`;
  msgs.innerHTML = "";
  crisisInline.hidden = true;
  SEED.forEach(([w, t]) => addMsg(w, t));
  room.hidden = false;
  room.scrollIntoView({ behavior: "smooth", block: "center" });
}

function send() {
  const text = input.value.trim();
  if (!text) return;
  addMsg("You", text, true);
  input.value = "";
  const lower = text.toLowerCase();
  crisisInline.hidden = !CRISIS_WORDS.some((w) => lower.includes(w));
}

document.querySelector(".chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  room.hidden = true;
  renderCircles(chip.dataset.topic);
});

circlesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) openRoom(btn.dataset.id);
});

$("sendMsg").addEventListener("click", send);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
$("leaveRoom").addEventListener("click", () => { room.hidden = true; });

renderCircles("all");