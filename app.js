const teachings = [
  {
    title: "Spirituality with social purpose",
    description:
      "The Guru taught that spiritual life should lead to dignity, compassion, equality, and service in the world around us."
  },
  {
    title: "One humanity",
    description:
      "His famous call for one caste, one religion, and one God for humankind challenged discrimination and affirmed shared human worth."
  },
  {
    title: "Education as liberation",
    description:
      "Learning, literacy, and disciplined inquiry were seen as practical pathways to freedom and collective uplift."
  },
  {
    title: "Purity in thought and action",
    description:
      "Cleanliness, ethical conduct, truthfulness, and self-control remain central to the Sivagiri ideal of a meaningful life."
  },
  {
    title: "Work, trade, and technical growth",
    description:
      "Sivagiri emphasized industry, agriculture, organization, and technical knowledge as part of a strong, self-respecting society."
  },
  {
    title: "Compassion for all beings",
    description:
      "The Guru's writings repeatedly return to karuna, reminding us that inner maturity is inseparable from care for others."
  },
  {
    title: "Self-knowledge",
    description:
      "Works such as Atmopadesa Satakam direct attention inward, encouraging disciplined reflection and realization of truth."
  },
  {
    title: "Harmony over division",
    description:
      "His life and writings point toward peaceful coexistence, mutual respect, and unity beyond sectarian identity."
  }
];

const products = [
  {
    title: "Daiva Dasakam Pocket Edition",
    type: "Book",
    price: "Rs. 149",
    description: "A compact devotional edition for daily recitation, gifting, and satsang use.",
    tag: "Best seller"
  },
  {
    title: "Atmopadesa Satakam Study Edition",
    type: "Book",
    price: "Rs. 399",
    description: "A reading-friendly edition designed for reflective study circles and personal practice.",
    tag: "Study text"
  },
  {
    title: "Sree Narayana Guru Biography",
    type: "Book",
    price: "Rs. 499",
    description: "An accessible introduction to the Guru's life, social reform, and spiritual legacy.",
    tag: "Gift pick"
  },
  {
    title: "Sivagiri Pilgrimage T-Shirt",
    type: "T-Shirt",
    price: "Rs. 799",
    description: "Soft cotton tee inspired by the pilgrimage ethos and the colors of Sivagiri.",
    tag: "Apparel"
  },
  {
    title: "One Humanity T-Shirt",
    type: "T-Shirt",
    price: "Rs. 849",
    description: "Minimal design carrying the Guru's message of equality and universal brotherhood.",
    tag: "New arrival"
  },
  {
    title: "Guru Quote Collector Set",
    type: "Book Set",
    price: "Rs. 999",
    description: "A curated starter bundle for readers who want teachings, poetry, and context together.",
    tag: "Bundle"
  }
];

const krithis = [
  ["Advaitha Deepika", "Malayalam", "Philosophical work"],
  ["Anukamba Dasakam", "Malayalam", "Devotional poem"],
  ["Arivu", "Malayalam", "Reflective poem"],
  ["Athma Vilasam", "Malayalam", "Spiritual composition"],
  ["Atmopadesa Satakam", "Malayalam", "One hundred verses of self-instruction"],
  ["Bhadrakaalyashtakam", "Malayalam", "Hymn"],
  ["Chijanda Chinthakam", "Malayalam", "Philosophical reflection"],
  ["Daiva Chinthanam 1", "Malayalam", "Devotional meditation"],
  ["Daiva Chinthanam 2", "Malayalam", "Devotional meditation"],
  ["Daiva Dasakam", "Malayalam", "Ten-verse prayer"],
  ["Jathi Lakshanam", "Malayalam", "Social thought"],
  ["Jathi Nirnayam", "Malayalam", "Social reform text"],
  ["Jeevakarunya Panchakam", "Malayalam", "Compassion-centered verses"],
  ["Shiva Shathakam", "Malayalam", "Hundred-verse hymn"],
  ["Swanubavageethi", "Malayalam", "Mystic song"],
  ["Asramam", "Sanskrit", "Spiritual text"],
  ["Bhadrakaliashtakam", "Sanskrit", "Hymn"],
  ["Brahmavidya Panchakam", "Sanskrit", "Philosophical verses"],
  ["Charama Slokangal", "Sanskrit", "Sacred verses"],
  ["Chidambarashtakam", "Sanskrit", "Hymn"],
  ["Darsana Mala", "Sanskrit", "Philosophical garland"],
  ["Dharmam", "Sanskrit", "On righteous living"],
  ["Genani Navamanjari", "Sanskrit", "Verse composition"],
  ["Guhashtakam", "Sanskrit", "Hymn"],
  ["Homa Manthram", "Sanskrit", "Mantra text"],
  ["Municharya Panchakam", "Sanskrit", "Discipline verses"],
  ["Nirvruthi Panchakam", "Sanskrit", "Liberation verses"],
  ["Slokathrayi", "Sanskrit", "Three-verse composition"],
  ["Sree Vasudeva Ashtakam", "Sanskrit", "Hymn"],
  ["Vedantha Suthram", "Sanskrit", "Vedantic text"],
  ["Vinayaka Ashtakam", "Sanskrit", "Hymn"],
  ["Thevarappathinkangal", "Tamil", "Tamil composition"],
  ["Isavasyo Upanishad", "Translation", "Translation work"],
  ["Ozhivil Odukkam", "Translation", "Translation work"],
  ["Thirukural", "Translation", "Translation work"]
].map(([title, language, note]) => ({
  title,
  language,
  note,
  youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Sree Narayana Guru ${title}`)}`
}));

function createTeachingCard(item) {
  return `
    <article class="teaching-card">
      <span class="pill">Teaching</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `;
}

function createProductCard(item) {
  const subject = encodeURIComponent(`Order enquiry: ${item.title}`);
  const body = encodeURIComponent(
    `Namaste,%0D%0A%0D%0AI would like to enquire about ${item.title} (${item.type}) listed at ${item.price}.%0D%0A%0D%0APlease share availability, shipping details, and payment options.%0D%0A`
  );

  return `
    <article class="product-card">
      <div class="product-media" aria-hidden="true"></div>
      <div class="product-meta">
        <span class="pill">${item.type}</span>
        <span class="pill">${item.tag}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="meta-row">${item.price}</p>
      <p>${item.description}</p>
      <a class="button button-primary" href="mailto:orders@sivagiriashram.com?subject=${subject}&body=${body}">
        Enquire to Order
      </a>
    </article>
  `;
}

function createKritiCard(item) {
  return `
    <article class="kriti-card">
      <div class="kriti-meta">
        <span class="pill">${item.language}</span>
        <span class="pill">Krithi</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.note}</p>
      <a class="button button-secondary" href="${item.youtube}" target="_blank" rel="noreferrer">
        Open YouTube
      </a>
    </article>
  `;
}

function renderTeachings() {
  document.getElementById("teachingGrid").innerHTML = teachings.map(createTeachingCard).join("");
}

function renderProducts() {
  document.getElementById("productGrid").innerHTML = products.map(createProductCard).join("");
}

function renderKrithis(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = krithis.filter((item) => {
    return [item.title, item.language, item.note].some((field) => field.toLowerCase().includes(normalized));
  });

  document.getElementById("kritiGrid").innerHTML = filtered.length
    ? filtered.map(createKritiCard).join("")
    : '<div class="empty-state">No matching krithis found. Try a broader search term.</div>';
}

renderTeachings();
renderProducts();
renderKrithis();

document.getElementById("kritiSearch").addEventListener("input", (event) => {
  renderKrithis(event.target.value);
});