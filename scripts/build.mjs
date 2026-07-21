import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const styleSource = await readFile(path.join(root, 'src/styles.css'));
const assetNames = ['hero-door.webp', 'bibleproject-chapter.webp', 'eso-chapter.webp', 'healthmedocs-chapter.webp', 'contact-vignette.webp', 'icons.svg',
  'clean/understand.png', 'clean/creative.png', 'clean/team.png', 'clean/constraints.png', 'clean/results.png', 'clean/growth.png',
  'screens/bibleproject-mobile.webp', 'screens/eso-dreugh-wax-graph.webp', 'screens/healthme-mobile.webp',
  'clean/about-teacup.png', 'clean/about-lantern.png', 'clean/about-flower.png', 'clean/about-garden-left.png', 'clean/about-garden-right.png',
  'mockup/brand-botanical.png', 'clean/portland-footer.png'];
const projects = {
  bibleproject: {
    name: 'BibleProject', eyebrow: 'Digital platforms', image: 'bibleproject-chapter.webp', screen: 'screens/bibleproject-mobile.webp', screenWidth: 375, screenHeight: 800, scene: 'night',
    summary: 'Engineering leadership for a suite of digital platforms that help millions of people experience the Bible through videos, articles, and interactive tools.',
    challenge: 'BibleProject’s content is used by millions worldwide. Its platform needed to be scalable, reliable, and flexible enough to support new content types and experiences—while empowering non-technical teams.',
    role: 'Lead Software Engineer', roleText: 'I led architecture and development across web platforms, working closely with product, design, and content teams to ship features that served real user needs.',
    tech: ['Django', 'React', 'AWS', 'PostgreSQL', 'S3', 'Redis'],
    impacts: ['Reached millions of users worldwide', 'Streamlined content delivery workflows', 'Empowered teams to move faster']
  },
  'eso-market-tracker': {
    name: 'ESO Market Tracker', eyebrow: 'Real-time analytics platform', image: 'eso-chapter.webp', screen: 'screens/eso-dreugh-wax-graph.webp', screenWidth: 907, screenHeight: 650, scene: 'alpine',
    summary: 'A real-time energy market analytics platform that turns complex data into clear, actionable insights for traders and analysts.',
    challenge: 'Energy markets move fast. The platform needed to handle massive data volumes in real time while remaining accurate, responsive, and intuitive.',
    role: 'Lead Engineer', roleText: 'I architected the system from the ground up and led the engineering effort across frontend, backend, and data infrastructure.',
    tech: ['TypeScript', 'React', 'PostgreSQL', 'Redis', 'WebSockets', 'AWS'],
    impacts: ['Real-time insights that drive decisions', 'High performance at scale', 'Built for accuracy and reliability']
  },
  healthmedocs: {
    name: 'HealthMeDocs', eyebrow: 'Telehealth platform', image: 'healthmedocs-chapter.webp', screen: 'screens/healthme-mobile.webp', screenWidth: 600, screenHeight: 680, scene: 'greenhouse',
    summary: 'A telehealth platform connecting patients and providers through a seamless, secure, and compassionate experience.',
    challenge: 'Healthcare is complex. The platform needed to be easy to use, secure, and adaptable to evolving regulatory and business needs.',
    role: 'Lead Engineer', roleText: 'I led development across the full stack and partnered with stakeholders to deliver an experience that puts people first.',
    tech: ['Laravel', 'Vue', 'AWS', 'PostgreSQL', 'Stripe', 'Twilio'],
    impacts: ['Improved access to care for patients', 'Simplified workflows for providers', 'Built with security and trust at the core']
  }
};
const identities = {
  bri: { name: 'Bri', host: 'bri.bryantjames.com', email: 'bri@bryantjames.com' },
  bryant: { name: 'Bryant', host: 'bryantjames.com', email: 'hello@bryantjames.com' }
};

await rm(dist, { recursive: true, force: true });
const hash = createHash('sha256').update(styleSource).digest('hex').slice(0, 10);
const cssFile = `styles.${hash}.css`;

for (const [key, identity] of Object.entries(identities)) {
  const out = path.join(dist, key);
  await mkdir(path.join(out, 'assets'), { recursive: true });
  await writeFile(path.join(out, cssFile), styleSource);
  for (const name of assetNames) {
    const destination = path.join(out, 'assets', name);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(root, 'src/assets', name), destination);
  }
  await writePage(out, '', home(identity));
  await writePage(out, 'work', work(identity));
  for (const [slug, project] of Object.entries(projects)) await writePage(out, `work/${slug}`, detail(identity, project));
  await writePage(out, 'contact', contact(identity));
  const routes = ['', 'work/', ...Object.keys(projects).map(slug => `work/${slug}/`), 'contact/'];
  await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${identity.host}/sitemap.xml\n`);
  await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `\n  <url><loc>https://${identity.host}/${route}</loc></url>`).join('')}\n</urlset>\n`);
}

async function writePage(out, route, content) {
  const folder = path.join(out, route);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), content);
}

function layout(identity, page, title, description, content) {
  const route = page === 'home' ? '' : page === 'work' ? 'work/' : page === 'contact' ? 'contact/' : `work/${page}/`;
  const canonical = `https://${identity.host}/${route}`;
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': `https://${identity.host}/#person`, name: identity.name, url: `https://${identity.host}/`, jobTitle: 'Software Engineer and Website Developer', address: { '@type': 'PostalAddress', addressLocality: 'Portland', addressRegion: 'OR', addressCountry: 'US' } },
    { '@type': 'ProfessionalService', name: `${identity.name} — Software Engineering`, url: `https://${identity.host}/`, areaServed: 'Portland, Oregon', founder: { '@id': `https://${identity.host}/#person` } }
  ]});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://${identity.host}/assets/hero-door.webp"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="theme-color" content="#f8f4ed"><link rel="preload" href="/${cssFile}" as="style"><link rel="stylesheet" href="/${cssFile}"><script type="application/ld+json">${jsonLd}</script></head><body class="page-${page}"><a class="skip" href="#main">Skip to content</a>${header(identity, page)}<main id="main">${content}</main>${footer(identity)}</body></html>`;
}

function header(identity, page) {
  return `<header class="site-head"><a class="brand" href="/" aria-label="${identity.name} home"><span>${identity.name}</span><img src="/assets/mockup/brand-botanical.png" width="57" height="60" alt="" aria-hidden="true"></a><nav aria-label="Primary"><a${page === 'work' ? ' aria-current="page"' : ''} href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a href="/contact/">Contact</a></nav><details class="menu"><summary aria-label="Open menu"><i></i><i></i><i></i></summary><div><a href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a href="/contact/">Contact</a></div></details></header>`;
}

function footer(identity) {
  return `<footer><div><a class="brand light" href="/"><span>${identity.name}</span><img src="/assets/mockup/brand-botanical.png" width="57" height="60" alt="" aria-hidden="true"></a><p>Software engineer blending creativity,<br>strategy, and code to build software<br>that makes a difference.</p></div><div><small>Navigate</small><a href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a href="/contact/">Contact</a></div><div><small>Let’s connect</small><a href="https://github.com/bryantjames">GitHub</a><a href="https://linkedin.com/in/bryantjames">LinkedIn</a><a href="mailto:${identity.email}">Email</a></div><div class="portland"><img src="/assets/clean/portland-footer.png" width="225" height="113" loading="lazy" alt="Hand-drawn Portland skyline, bridge, forest, and Mount Hood"><span>Made with care in Portland</span></div></footer>`;
}

function icon(name) {
  return `<svg aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"></use></svg>`;
}

function home(identity) {
  const description = `${identity.name} is a Portland, Oregon website developer, software engineer, and technical strategist building thoughtful software for real businesses.`;
  return layout(identity, 'home', `${identity.name} | Website Developer in Portland, Oregon`, description, `
  <section class="hero shell"><div class="hero-copy"><p class="eyebrow">Software engineer</p><h1>Creative solutions.<br>Built for <em>real</em> impact.</h1><p>I partner with businesses to design and build software that fits their goals, their team, and their reality.</p><div class="actions"><a class="button" href="/work/">View my work <span>→</span></a><a class="text-link" href="/contact/">Start a conversation</a></div></div><div class="hero-art"><img src="/assets/hero-door.webp" width="1600" height="1067" alt="A whimsical Pacific Northwest garden path among wildflowers and ferns" fetchpriority="high"><span class="butterfly">❧</span></div></section>
  <section class="approach paper" id="approach"><div class="shell"><p class="kicker">How I work</p><h2>I bring <em>context, creativity, and care</em> to every project.</h2><p class="lede">I take time to understand the business, the people, and the constraints—then craft technology solutions that make sense. Solutions that are sustainable, budget-conscious, and built to support growth and profitability.</p><div class="steps">${processStep('understand','Understand','I listen first. I dig into the business, users, market, and constraints.')}${processStep('creative','Solve creatively','I design thoughtful solutions that are pragmatic, elegant, and fit for purpose.')}${processStep('team','Right-sized teams','I work with the right people, tools, and level of complexity for the job.')}${processStep('constraints','Respect constraints','Budget, timeline, support—I plan for what’s real, not what’s ideal.')}${processStep('results','Drive results','I focus on profit, efficiency, and sustainable growth for the long term.')}${processStep('growth','Plan for growth','I build roadmaps that create momentum and adapt as you grow.')}</div></div></section>
  <section class="selected" id="selected-work"><div class="shell selected-heading"><p class="kicker">Selected work</p><h2>A few projects I’m proud of.</h2></div><div class="project-slider" aria-label="Selected projects">${Object.entries(projects).map(([slug, p]) => projectCard(slug, p)).join('')}</div><div class="slider-hint" aria-hidden="true"><span>←</span> Swipe or scroll to explore <span>→</span></div><a class="more" href="/work/">View all projects <span>→</span></a></section>
  <section class="about paper" id="about"><img class="about-garden about-garden-left" src="/assets/clean/about-garden-left.png" width="360" height="283" loading="lazy" alt="Mushrooms, wildflowers, lavender, and a handwritten note"><img class="about-garden about-garden-right" src="/assets/clean/about-garden-right.png" width="174" height="283" loading="lazy" alt="Lavender and a glowing botanical lantern"><div class="shell about-grid"><aside><p class="note">It’s not just about the code.<br>It’s about the outcome. ♡</p></aside><div><p class="kicker">A little about me</p><h2>I’m a thought partner,<br>not just a developer.</h2><p>The best software solves the right problem in the right way. I bring a blend of technical expertise, business acumen, and creative thinking to every project. I care about clarity, communication, and building lasting partnerships.</p><div class="values">${aboutValue('about-teacup','Empathetic & curious','I listen deeply and ask the right questions.')}${aboutValue('about-lantern','Clear & collaborative','I keep things transparent and move as a team.')}${aboutValue('about-flower','Practical & grounded','I ship solutions that make sense today and scale tomorrow.')}</div></div></div></section>`);
}

function processStep(image, title, copy) {
  return `<article><img src="/assets/clean/${image}.png" width="116" height="82" loading="lazy" alt=""><h3>${title}</h3><p>${copy}</p></article>`;
}

function aboutValue(image, title, copy) {
  return `<article><img src="/assets/clean/${image}.png" width="70" height="77" loading="lazy" alt=""><p><b>${title}</b><br>${copy}</p></article>`;
}

function projectCard(slug, p) {
  return `<article class="project-card ${p.scene}"><a class="card-media" href="/work/${slug}/"><img class="scene-image" src="/assets/${p.image}" width="1536" height="1024" loading="lazy" alt="Illustrated ${p.scene} setting for the ${p.name} case study"><span class="screen-ghost"><img src="/assets/${p.screen}" width="${p.screenWidth}" height="${p.screenHeight}" loading="lazy" alt="${p.name} live project interface"></span></a><div class="card-copy"><p>${p.eyebrow}</p><h3><a href="/work/${slug}/">${p.name}</a></h3><p>${p.summary}</p><ul>${p.tech.slice(0, 4).map(x => `<li>${x}</li>`).join('')}</ul><a class="story" href="/work/${slug}/">Read the ${p.name} story <span>→</span></a></div></article>`;
}

function work(identity) {
  return layout(identity, 'work', `Selected Work | ${identity.name}, Portland Software Engineer`, `Explore ${identity.name}’s software engineering and website development projects in digital media, analytics, and healthcare.`, `<section class="work-intro shell"><p class="kicker">My work</p><h1>Solutions shaped<br>by <em>context.</em></h1><p>Different problems. Different teams. Different constraints. The same care.</p></section><section class="work-list shell">${Object.entries(projects).map(([slug, p]) => projectCard(slug, p)).join('')}</section><aside class="garden-note shell"><span class="icon">${icon("flourish")}</span><p>Good software is like a garden—it takes care, patience, and the right conditions to thrive. ♡</p><span class="icon">${icon("flourish")}</span></aside>`);
}

function detail(identity, p) {
  const slug = Object.entries(projects).find(([, project]) => project === p)[0];
  return layout(identity, slug, `${p.name} Case Study | ${identity.name}`, `${p.summary} Read the ${p.name} software engineering case study by ${identity.name}.`, `<article class="case ${p.scene}"><a class="back" href="/work/">← Back to work</a><div class="case-hero"><img src="/assets/${p.image}" width="1400" height="933" alt="${p.name} represented as an illustrated ${p.scene} landscape" fetchpriority="high"></div><div class="case-sheet"><header><h1>${p.name}</h1><p class="eyebrow">${p.eyebrow}</p><p class="case-summary">${p.summary}</p><ul class="chips">${p.tech.map(x => `<li>${x}</li>`).join('')}</ul></header><section><p class="kicker">The challenge</p><p>${p.challenge}</p></section><section><p class="kicker">My role</p><h2>${p.role}</h2><p>${p.roleText}</p></section><section><p class="kicker">Impact</p><ul class="impact">${p.impacts.map((x, i) => `<li><span class="icon">${icon(['spark','flourish','fit'][i])}</span>${x}</li>`).join('')}</ul></section><nav class="case-next" aria-label="More projects"><a href="/work/">Explore all work →</a></nav></div></article>`);
}

function contact(identity) {
  return layout(identity, 'contact', `Contact ${identity.name} | Portland Software Engineer`, `Contact ${identity.name}, a Portland, Oregon website developer and software engineer, about a thoughtful software project.`, `<section class="contact shell"><a class="back" href="/">← Back to home</a><div class="contact-note"><span class="icon">${icon("flourish")}</span><h1>Let’s grow<br>something<br>meaningful.</h1><b>♡</b></div><div class="contact-copy"><p>I’m always open to thoughtful conversations and new opportunities. Whether you have a project in mind or just want to chat, I’d love to hear from you.</p><div class="contact-links"><a href="mailto:${identity.email}"><span class="icon">${icon("mail")}</span>${identity.email}<b>→</b></a><a href="https://linkedin.com/in/bryantjames"><span class="icon">${icon("linkedin")}</span>linkedin.com/in/bryantjames<b>→</b></a><a href="https://github.com/bryantjames"><span class="icon">${icon("github")}</span>github.com/bryantjames<b>→</b></a></div></div><img src="/assets/contact-vignette.webp" width="1400" height="933" alt="A handmade ceramic mug, blank note, pencil, lantern, and wildflowers arranged on a garden table" loading="eager"></section>`);
}
