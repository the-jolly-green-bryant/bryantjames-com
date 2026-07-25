import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const styleSource = await readFile(path.join(root, 'src/styles.css'));
const buildDate = new Date().toISOString().slice(0, 10);
const assetNames = ['hero-door.webp', 'hero-door-mobile.png', 'bibleproject-chapter.webp', 'eso-chapter.webp', 'healthmedocs-chapter.webp', 'contact-vignette.webp', 'icons.svg',
  'clean/understand.png', 'clean/creative.png', 'clean/team.png', 'clean/constraints.png', 'clean/results.png', 'clean/growth.png',
  'screens/bibleproject-mobile.webp', 'screens/eso-dreugh-wax-graph.webp', 'screens/healthme-mobile.webp',
  'clean/about-teacup.png', 'clean/about-lantern.png', 'clean/about-flower.png', 'clean/about-garden-left.png', 'clean/about-garden-right.png',
  'clean/brand-botanical-hd.png', 'clean/brand-botanical-crisp.png', 'clean/portland-footer-hd.png', 'clean/portland-line-crisp.png', 'clean/about-garden-left-hd.png', 'clean/about-garden-right-hd.png',
  'clean/garden-bee.png', 'clean/floating-butterfly.png', 'clean/floating-sprig.png', 'clean/floating-firefly.png',
  'clean/chapter-deer.png', 'clean/chapter-owl.png', 'clean/chapter-still-life.png',
  'clean/project-logo-bible.png', 'clean/project-logo-eso.png', 'clean/project-logo-health.png',
  'clean/project-icon-bible.png', 'clean/project-icon-eso-linked.png', 'clean/project-icon-health.png'];
const projects = {
  bibleproject: {
    name: 'BibleProject', eyebrow: 'Digital platforms', image: 'bibleproject-chapter.webp', logo: 'clean/project-icon-bible.png', logoWidth: 512, logoHeight: 512, scene: 'night',
    summary: 'Engineering leadership for a suite of digital platforms that help millions of people experience the Bible through videos, articles, and interactive tools.',
    challenge: 'BibleProject’s content is used by millions worldwide. Its platform needed to be scalable, reliable, and flexible enough to support new content types and experiences while empowering non-technical teams.',
    role: 'Lead Software Engineer', roleText: 'I led architecture and development across web platforms, working closely with product, design, and content teams to ship features that served real user needs.',
    tech: ['Django', 'React', 'AWS', 'PostgreSQL', 'S3', 'Redis'],
    impacts: ['Reached millions of users worldwide', 'Streamlined content delivery workflows', 'Empowered teams to move faster']
  },
  'eso-market-tracker': {
    name: 'ESO Market Tracker', eyebrow: 'Real-time analytics platform', image: 'eso-chapter.webp', logo: 'clean/project-icon-eso-linked.png', logoWidth: 225, logoHeight: 225, scene: 'alpine',
    summary: 'A real-time energy market analytics platform that turns complex data into clear, actionable insights for traders and analysts.',
    challenge: 'Energy markets move fast. The platform needed to handle massive data volumes in real time while remaining accurate, responsive, and intuitive.',
    role: 'Lead Engineer', roleText: 'I architected the system from the ground up and led the engineering effort across frontend, backend, and data infrastructure.',
    tech: ['TypeScript', 'React', 'PostgreSQL', 'Redis', 'WebSockets', 'AWS'],
    impacts: ['Real-time insights that drive decisions', 'High performance at scale', 'Built for accuracy and reliability']
  },
  healthmedocs: {
    name: 'HealthMeDocs', eyebrow: 'Telehealth platform', image: 'healthmedocs-chapter.webp', logo: 'clean/project-icon-health.png', logoWidth: 512, logoHeight: 512, scene: 'greenhouse',
    summary: 'A telehealth platform connecting patients and providers through a seamless, secure, and compassionate experience.',
    challenge: 'Healthcare is complex. The platform needed to be easy to use, secure, and adaptable to evolving regulatory and business needs.',
    role: 'Lead Engineer', roleText: 'I led development across the full stack and partnered with stakeholders to deliver an experience that puts people first.',
    tech: ['Laravel', 'Vue', 'AWS', 'PostgreSQL', 'Stripe', 'Twilio'],
    impacts: ['Improved access to care for patients', 'Simplified workflows for providers', 'Built with security and trust at the core']
  }
};
const identities = {
  bri: { name: 'Bri', host: 'bri.bryantjames.com', email: 'bri@bryantjames.com', github: 'the-jolly-green-bryant', linkedin: 'bryant-james' },
  bryant: { name: 'Bryant', host: 'bryantjames.com', email: 'bryant@bryantjames.com', github: 'the-jolly-green-bryant', linkedin: 'bryant-james' }
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
  await cp(path.join(root, 'src/slider-controls.js'), path.join(out, 'slider-controls.js'));
  await writePage(out, '', home(identity));
  await writePage(out, 'work', work(identity));
  for (const [slug, project] of Object.entries(projects)) await writePage(out, `work/${slug}`, detail(identity, project));
  await writePage(out, 'contact', contact(identity));
  const routes = ['', 'work/', ...Object.keys(projects).map(slug => `work/${slug}/`), 'contact/'];
  await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${identity.host}/sitemap.xml\n`);
  await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `\n  <url><loc>https://${identity.host}/${route}</loc><lastmod>${buildDate}</lastmod></url>`).join('')}\n</urlset>\n`);
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
    { '@type': 'Person', '@id': `https://${identity.host}/#person`, name: identity.name, url: `https://${identity.host}/`, email: identity.email, sameAs: [`https://github.com/${identity.github}`, `https://linkedin.com/in/${identity.linkedin}`], jobTitle: 'Portland Website Developer and Software Engineer', knowsAbout: ['Website development', 'Software engineering', 'Technical strategy'], address: { '@type': 'PostalAddress', addressLocality: 'Portland', addressRegion: 'OR', addressCountry: 'US' } },
    { '@type': 'WebSite', '@id': `https://${identity.host}/#website`, name: identity.name, url: `https://${identity.host}/` },
    { '@type': 'ProfessionalService', '@id': `https://${identity.host}/#business`, name: `${identity.name} Website Development`, url: `https://${identity.host}/`, description: 'Website development, software engineering, and technical strategy for Portland businesses.', serviceType: ['Website development', 'Custom software development', 'Technical strategy'], areaServed: { '@type': 'City', name: 'Portland', containedInPlace: { '@type': 'State', name: 'Oregon' } }, founder: { '@id': `https://${identity.host}/#person` } }
  ]});
  const pageHeader = page === 'home' ? '' : header(identity, page);
  const sliderScript = page === 'home' ? '<script src="/slider-controls.js" defer></script>' : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://${identity.host}/assets/hero-door.webp"><meta property="og:image:width" content="1600"><meta property="og:image:height" content="1067"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="theme-color" content="#f8f4ed"><link rel="preload" href="/${cssFile}" as="style"><link rel="stylesheet" href="/${cssFile}"><script type="application/ld+json">${jsonLd}</script>${sliderScript}</head><body class="page-${page}"><a class="skip" href="#main">Skip to content</a>${pageHeader}<main id="main">${content}</main>${footer(identity)}</body></html>`;
}

function header(identity, page) {
  return `<header class="site-head"><a class="brand" href="/" aria-label="${identity.name} home"><span>${identity.name}</span><img src="/assets/clean/brand-botanical-crisp.png" width="1254" height="1254" alt="" aria-hidden="true"></a><nav aria-label="Primary"><a${page === 'work' ? ' aria-current="page"' : ''} href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a class="nav-contact" href="/#contact">Contact</a></nav><details class="menu"><summary aria-label="Open menu"><i></i><i></i><i></i></summary><div><a href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a href="/#contact">Contact</a></div></details></header>`;
}

function footer(identity) {
  return `<footer id="site-footer"><div><a class="brand light" href="/"><span>${identity.name}</span><img src="/assets/clean/brand-botanical-crisp.png" width="1254" height="1254" alt="" aria-hidden="true"></a><p>Software engineer blending creativity,<br> strategy, and code to build software<br> that makes a difference.</p></div><div><small>Navigate</small><a href="/work/">Work</a><a href="/#approach">Approach</a><a href="/#about">About</a><a href="/#contact">Contact</a></div><div><small>Let’s connect</small><a href="https://github.com/${identity.github}">GitHub</a><a href="https://linkedin.com/in/${identity.linkedin}">LinkedIn</a><a href="mailto:${identity.email}">Email</a></div><div class="portland"><img src="/assets/clean/portland-line-crisp.png" width="1771" height="888" loading="lazy" alt="Crisp line drawing of the Portland skyline, bridge, forest, and Mount Hood"><span>Made with care in Portland, Oregon <b aria-hidden="true">♡</b></span></div></footer>`;
}

function icon(name) {
  return `<svg aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"></use></svg>`;
}

function home(identity) {
  const description = `${identity.name} provides Portland website development, custom software engineering, and practical technical strategy for growing businesses.`;
  return layout(identity, 'home', `Portland Website Development & Software Engineering | ${identity.name}`, description, `
  <section class="hero shell">${header(identity, 'home')}<div class="hero-copy"><p class="eyebrow">Portland website development</p><h1>Creative solutions.<br>Built for <em>real</em> impact.</h1><p>I help Portland businesses design and build thoughtful websites and custom software that fit their goals, their team, and their reality.</p><div class="actions"><a class="button" href="#contact">Contact me <span>→</span></a><a class="text-link" href="/work/">View my work</a></div></div><div class="hero-art"><picture><source media="(max-width: 760px)" srcset="/assets/hero-door-mobile.png"><img src="/assets/hero-door.webp" width="1600" height="1067" alt="A whimsical Portland garden path, city skyline, Mount Hood, and a flower-covered round door" fetchpriority="high"></picture><img class="butterfly floating-accent" src="/assets/clean/floating-butterfly.png" width="320" height="320" alt="" aria-hidden="true"></div><a class="section-cue" href="#approach" aria-label="Continue to how I work"><span>↓</span></a></section>
  <section class="approach paper" id="approach"><img class="chapter-vignette chapter-deer" src="/assets/clean/chapter-deer.png" width="900" height="600" loading="lazy" alt="" aria-hidden="true"><img class="floating-accent floating-sprig approach-sprig" src="/assets/clean/floating-sprig.png" width="320" height="320" loading="lazy" alt="" aria-hidden="true"><div class="shell"><p class="kicker">How I work</p><h2>I bring <em>context, creativity,</em> and <em>care</em> to every project.</h2><p class="lede">I take time to understand the business, the people, and the constraints. Then I craft technology solutions that make sense. Solutions that are sustainable, budget-conscious, and built to support growth and profitability.</p><div class="steps" id="process-slider" data-slider>${processStep('understand','Understand','I listen first. I dig into the business, users, market, and constraints.')}${processStep('creative','Solve creatively','I design thoughtful solutions that are pragmatic, elegant, and fit for purpose.')}${processStep('team','Right-sized teams','I work with the right people, tools, and level of complexity for the job.')}${processStep('constraints','Respect constraints','I plan around real budgets, timelines, and support needs.')}${processStep('results','Drive results','I focus on profit, efficiency, and sustainable growth for the long term.')}${processStep('growth','Plan for growth','I build roadmaps that create momentum and adapt as you grow.')}</div>${railControls('process-slider','process steps')}</div><a class="section-cue" href="#selected-work" aria-label="Continue to selected work"><span>↓</span></a></section>
  <section class="selected" id="selected-work"><img class="chapter-vignette chapter-owl" src="/assets/clean/chapter-owl.png" width="900" height="600" loading="lazy" alt="" aria-hidden="true"><img class="floating-accent floating-firefly" src="/assets/clean/floating-firefly.png" width="320" height="320" loading="lazy" alt="" aria-hidden="true"><div class="shell selected-heading"><p class="kicker">Selected work</p><h2>A few projects I’m proud of.</h2></div><div class="project-slider" id="project-slider" data-slider aria-label="Selected projects">${Object.entries(projects).map(([slug, p]) => projectCard(slug, p)).join('')}</div>${railControls('project-slider','selected projects')}<a class="more" href="/work/"><span>View all projects</span><b aria-hidden="true">→</b></a><a class="section-cue" href="#about" aria-label="Continue to about me"><span>↓</span></a></section>
  <section class="about paper" id="about"><img class="chapter-vignette chapter-still-life" src="/assets/clean/chapter-still-life.png" width="900" height="503" loading="lazy" alt="" aria-hidden="true"><img class="floating-accent floating-sprig about-sprig" src="/assets/clean/floating-sprig.png" width="320" height="320" loading="lazy" alt="" aria-hidden="true"><div class="shell about-grid"><div><p class="kicker">A little about me</p><h2><span>I’m a thought partner,</span><span>not just a developer.</span></h2><p>The best software solves the right problem in the right way. I bring a blend of technical expertise, business acumen, and creative thinking to every project. I care about clarity, communication, and building lasting partnerships.</p><div class="values" id="values-slider" data-slider>${aboutValue('about-teacup','Empathetic & curious','I listen deeply and ask the right questions.')}${aboutValue('about-lantern','Clear & collaborative','I keep things transparent and move as a team.')}${aboutValue('about-flower','Practical & grounded','I ship solutions that make sense today and scale tomorrow.')}</div>${railControls('values-slider','values')}</div></div><a class="section-cue" href="#contact" aria-label="Continue to contact"><span>↓</span></a></section>
  ${contactChapter(identity, true)}`);
}

function railControls(id, label) {
  return `<div class="rail-controls" data-controls-for="${id}" aria-label="Scroll ${label}"><button type="button" data-direction="-1" aria-label="Previous ${label}">←</button><button type="button" data-direction="1" aria-label="Next ${label}">→</button></div>`;
}

function processStep(image, title, copy) {
  return `<article><img src="/assets/clean/${image}.png" width="116" height="82" loading="lazy" alt=""><h3>${title}</h3><p>${copy}</p></article>`;
}

function aboutValue(image, title, copy) {
  return `<article><img src="/assets/clean/${image}.png" width="70" height="77" loading="lazy" alt=""><p><b>${title}</b><br>${copy}</p></article>`;
}

function contactChapter(identity, showCue = false) {
  return `<section class="home-contact contact-chapter" id="contact"><div class="shell home-contact-copy"><p class="kicker">Let’s connect</p><h2>Let’s grow something meaningful.</h2><p>I’m always open to thoughtful conversations and new opportunities. Have a project in mind, or just want to compare notes? I’d love to hear from you.</p><div class="home-contact-links"><a href="mailto:${identity.email}"><span class="icon">${icon("mail")}</span><span><small>Email</small>${identity.email}</span><b aria-hidden="true">→</b></a><a href="https://linkedin.com/in/${identity.linkedin}"><span class="icon">${icon("linkedin")}</span><span><small>LinkedIn</small>linkedin.com/in/${identity.linkedin}</span><b aria-hidden="true">→</b></a><a href="https://github.com/${identity.github}"><span class="icon">${icon("github")}</span><span><small>GitHub</small>github.com/${identity.github}</span><b aria-hidden="true">→</b></a></div><p class="note">It’s not just about the code.<br>It’s about the outcome. ♡</p></div><img class="garden-bee" src="/assets/clean/garden-bee.png" width="320" height="320" loading="lazy" alt="" aria-hidden="true"><div class="about-art"><span aria-hidden="true"></span><img class="about-garden-left" src="/assets/clean/about-garden-left-hd.png" width="1440" height="1132" loading="lazy" alt="Mushrooms, daisies, lavender, and wildflowers"><img class="about-garden-right" src="/assets/clean/about-garden-right-hd.png" width="696" height="1132" loading="lazy" alt="Lavender and a glowing botanical lantern"></div>${showCue ? '<a class="section-cue" href="#site-footer" aria-label="Continue to the footer"><span>↓</span></a>' : ''}</section>`;
}

function projectCard(slug, p) {
  return `<article class="project-card ${p.scene}"><a class="card-media" href="/work/${slug}/"><img class="scene-image" src="/assets/${p.image}" width="1536" height="1024" loading="lazy" alt="Illustrated ${p.scene} setting for the ${p.name} case study"><span class="logo-ghost"><img src="/assets/${p.logo}" width="${p.logoWidth}" height="${p.logoHeight}" loading="lazy" alt="${p.name} logo"></span></a><div class="card-copy"><p>${p.eyebrow}</p><h3><a href="/work/${slug}/">${p.name}</a></h3><p>${p.summary}</p><ul>${p.tech.slice(0, 4).map(x => `<li>${x}</li>`).join('')}</ul><a class="story" href="/work/${slug}/">Read the story <span>→</span></a></div></article>`;
}

function work(identity) {
  return layout(identity, 'work', `Selected Work | ${identity.name}, Portland Software Engineer`, `Explore ${identity.name}’s software engineering and website development projects in digital media, analytics, and healthcare.`, `<section class="work-intro shell"><p class="kicker">My work</p><h1>Solutions shaped<br>by <em>context.</em></h1><p>Different problems. Different teams. Different constraints. The same care.</p></section><section class="work-list shell">${Object.entries(projects).map(([slug, p]) => projectCard(slug, p)).join('')}</section><aside class="garden-note shell"><span class="icon">${icon("flourish")}</span><p>Good software is like a garden. It takes care, patience, and the right conditions to thrive. ♡</p><span class="icon">${icon("flourish")}</span></aside>${contactChapter(identity)}`);
}

function detail(identity, p) {
  const slug = Object.entries(projects).find(([, project]) => project === p)[0];
  return layout(identity, slug, `${p.name} Case Study | ${identity.name}`, `${p.summary} Read the ${p.name} software engineering case study by ${identity.name}.`, `<article class="case ${p.scene}"><a class="back" href="/work/">← Back to work</a><div class="case-hero"><img src="/assets/${p.image}" width="1400" height="933" alt="${p.name} represented as an illustrated ${p.scene} landscape" fetchpriority="high"></div><div class="case-sheet"><header><h1>${p.name}</h1><p class="eyebrow">${p.eyebrow}</p><p class="case-summary">${p.summary}</p><ul class="chips">${p.tech.map(x => `<li>${x}</li>`).join('')}</ul></header><section><p class="kicker">The challenge</p><p>${p.challenge}</p></section><section><p class="kicker">My role</p><h2>${p.role}</h2><p>${p.roleText}</p></section><section><p class="kicker">Impact</p><ul class="impact">${p.impacts.map((x, i) => `<li><span class="icon">${icon(['spark','flourish','fit'][i])}</span>${x}</li>`).join('')}</ul></section><nav class="case-next" aria-label="More projects"><a href="/work/">Explore all work →</a></nav></div></article>${contactChapter(identity)}`);
}

function contact(identity) {
  return layout(identity, 'contact', `Contact ${identity.name} | Portland Software Engineer`, `Contact ${identity.name}, a Portland, Oregon website developer and software engineer, about a thoughtful software project.`, `<section class="contact shell"><a class="back" href="/">← Back to home</a><div class="contact-note"><span class="icon">${icon("flourish")}</span><h1>Let’s grow<br>something<br>meaningful.</h1><b>♡</b></div><div class="contact-copy"><p>I’m always open to thoughtful conversations and new opportunities. Whether you have a project in mind or just want to chat, I’d love to hear from you.</p><div class="contact-links"><a href="mailto:${identity.email}"><span class="icon">${icon("mail")}</span>${identity.email}<b>→</b></a><a href="https://linkedin.com/in/${identity.linkedin}"><span class="icon">${icon("linkedin")}</span>linkedin.com/in/${identity.linkedin}<b>→</b></a><a href="https://github.com/${identity.github}"><span class="icon">${icon("github")}</span>github.com/${identity.github}<b>→</b></a></div></div><img src="/assets/contact-vignette.webp" width="1400" height="933" alt="A handmade ceramic mug, blank note, pencil, lantern, and wildflowers arranged on a garden table" loading="eager"></section>`);
}
