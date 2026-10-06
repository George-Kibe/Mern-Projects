const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80`;

export const authors = [
  {
    clerkUserId: "seed_user_ada",
    username: "ada_codes",
    email: "ada@seed.lama.dev",
  },
  {
    clerkUserId: "seed_user_nate",
    username: "neural_nate",
    email: "nate@seed.lama.dev",
  },
  {
    clerkUserId: "seed_user_grace",
    username: "grace_ops",
    email: "grace@seed.lama.dev",
  },
];

// Extra images embedded inside post bodies (key -> source).
export const inlineImages = {
  "inline-circuit": unsplash("1518770660439-4636190af475"),
  "inline-workspace": unsplash("1517694712202-14dd9538aa97"),
  "inline-chip": unsplash("1550751827-4bd374c3f58b"),
};

// `{{img:key}}` in content is replaced with the uploaded Cloudinary image.
export const posts = [
  {
    slug: "building-rag-pipelines-that-actually-work",
    title: "Building RAG Pipelines That Actually Work",
    author: "neural_nate",
    category: "ai",
    cover: unsplash("1677442136019-21780ecad995"),
    isFeatured: true,
    daysAgo: 1,
    visit: 1840,
    description:
      "Retrieval-augmented generation is easy to demo and hard to get right. Here is what moves the needle: chunking, hybrid search, re-ranking and honest evaluation.",
    content: `
<p>Retrieval-augmented generation (RAG) lets a language model answer questions using <strong>your</strong> data instead of whatever it memorised during training. The demo takes an afternoon. Getting answers people trust takes a lot longer.</p>
<h2>1. Chunking is a product decision</h2>
<p>Splitting documents every 500 tokens is the default for a reason: it is simple. It is also the most common cause of bad answers. Chunks should follow the structure of the source: headings, sections, functions in a codebase, rows in a table.</p>
<ul>
  <li>Keep the heading path (<code>Guide &gt; Billing &gt; Refunds</code>) attached to every chunk.</li>
  <li>Overlap chunks slightly so sentences are not cut in half.</li>
  <li>Store the original document id so you can cite sources.</li>
</ul>
<h2>2. Use hybrid search</h2>
<p>Dense embeddings are great at meaning, but they struggle with exact identifiers like error codes and SKUs. Combining vector search with keyword search (BM25) and merging the results with reciprocal rank fusion is one of the cheapest wins available.</p>
{{img:inline-circuit}}
<h2>3. Re-rank before you generate</h2>
<p>Retrieve 30–50 candidates, then use a cross-encoder or a small LLM call to re-rank them down to the best 5. The model reads less noise, answers get shorter and more accurate, and token costs drop.</p>
<h2>4. Evaluate like you mean it</h2>
<p>Build a set of 50–100 real questions with known good answers. Track <em>retrieval recall</em> (did the right chunk come back?) separately from <em>answer quality</em>. When a score drops, you will know which half of the pipeline broke.</p>
<blockquote>If you cannot measure retrieval on its own, you are debugging a black box with another black box.</blockquote>
<p>RAG is not magic. It is search engineering with a very articulate front end.</p>`,
  },
  {
    slug: "from-prompt-to-production-shipping-llm-features-safely",
    title: "From Prompt to Production: Shipping LLM Features Safely",
    author: "neural_nate",
    category: "ai",
    cover: unsplash("1620712943543-bcc4688e7485"),
    isFeatured: true,
    daysAgo: 3,
    visit: 1210,
    description:
      "Guardrails, structured outputs, cost controls and fallbacks: a checklist for taking an LLM prototype to real users.",
    content: `
<p>Every team has a prompt that works beautifully in a notebook. The hard part is everything around it: latency, cost, failures, and users who type things you never imagined.</p>
<h2>Ask for structured output</h2>
<p>Free-form text is hard to validate. Ask the model for JSON that matches a schema, validate it, and retry once with the validation error if it fails.</p>
<pre><code>const result = schema.safeParse(JSON.parse(reply));
if (!result.success) {
  // retry once, then fall back
}</code></pre>
<h2>Put a budget on every request</h2>
<ul>
  <li>Cap input tokens: trim history and retrieved context.</li>
  <li>Cap output tokens to what the UI can display.</li>
  <li>Cache identical requests; many workloads repeat themselves.</li>
</ul>
<h2>Design the failure path first</h2>
<p>Models time out, rate limits hit, and providers have bad days. Decide what the user sees when that happens. A clear “try again” message is better than a spinner that never ends.</p>
<h2>Log, then review</h2>
<p>Store prompts, responses and user feedback (with consent and PII scrubbed). A weekly review of the worst-rated answers is the fastest way to improve quality.</p>`,
  },
  {
    slug: "a-practical-guide-to-ai-coding-agents",
    title: "A Practical Guide to AI Coding Agents",
    author: "ada_codes",
    category: "ai",
    cover: unsplash("1485827404703-89b55fcc595e"),
    daysAgo: 5,
    visit: 960,
    description:
      "Coding agents can now read a repo, run tests and open pull requests. How to get real value from them without losing control of your codebase.",
    content: `
<p>AI coding agents have moved from autocomplete to collaborators that can plan a change, edit several files, run the test suite and explain what they did. Used well, they remove a lot of drudgery.</p>
<h2>Give them the same context you would give a new teammate</h2>
<p>A short <code>README</code> section on how to run, test and lint the project pays for itself immediately. Agents follow conventions they can see.</p>
<h2>Good tasks for agents</h2>
<ul>
  <li>Dependency upgrades with failing tests to fix.</li>
  <li>Adding tests around legacy code before a refactor.</li>
  <li>Mechanical migrations: renamed APIs, new config formats.</li>
  <li>Investigating a bug with a clear reproduction.</li>
</ul>
<h2>Keep humans in the loop</h2>
<p>Review diffs like you would review a colleague's. Ask the agent to explain trade-offs. Never let it push to production without CI and a human approval.</p>
{{img:inline-workspace}}
<p>The teams getting the most out of agents treat them as fast, tireless juniors: great at execution, still needing direction and review.</p>`,
  },
  {
    slug: "vector-databases-explained",
    title: "Vector Databases Explained: Embeddings, Indexes and Trade-offs",
    author: "grace_ops",
    category: "databases",
    cover: unsplash("1558494949-ef010cbdcc31"),
    isFeatured: true,
    daysAgo: 2,
    visit: 1530,
    description:
      "What an embedding is, how HNSW and IVF indexes find neighbours fast, and when you do not need a dedicated vector database at all.",
    content: `
<p>An <strong>embedding</strong> turns text, images or code into a list of numbers where similar things end up close together. A vector database stores those lists and answers one question very quickly: <em>what is nearest to this?</em></p>
<h2>Exact vs approximate search</h2>
<p>Comparing a query against every vector is exact but slow at scale. Approximate nearest neighbour (ANN) indexes trade a little accuracy for huge speedups.</p>
<h3>HNSW</h3>
<p>A layered graph you can “zoom into”. Excellent recall and latency, but memory hungry.</p>
<h3>IVF</h3>
<p>Clusters vectors and only searches the closest clusters. Lighter on memory, sensitive to tuning.</p>
<h2>Do you need a new database?</h2>
<p>Often not. MongoDB Atlas, Postgres with <code>pgvector</code>, and most search engines now support vector indexes. Keeping vectors next to the rest of your data makes filtering and consistency much simpler.</p>
<blockquote>Start with the database you already run. Move only when you have numbers that say you must.</blockquote>`,
  },
  {
    slug: "mongodb-schema-design-patterns-for-real-apps",
    title: "MongoDB Schema Design Patterns for Real Apps",
    author: "grace_ops",
    category: "databases",
    cover: unsplash("1544197150-b99a580bb7a8"),
    daysAgo: 12,
    visit: 720,
    description:
      "Embed or reference? Bucket or outlier? Practical MongoDB modelling patterns, with the queries that should drive every decision.",
    content: `
<p>The golden rule of MongoDB modelling: <strong>data that is read together should be stored together</strong>. Your queries, not your entity diagram, should shape the schema.</p>
<h2>Embed when the child belongs to the parent</h2>
<p>Addresses on a user, line items on an order: they are read together and rarely on their own. Embedding saves a round trip.</p>
<h2>Reference when it grows without limit</h2>
<p>Comments on a popular post can grow forever, and documents have a 16&nbsp;MB cap. Store comments in their own collection with a <code>post</code> field and an index on it.</p>
<pre><code>commentSchema.index({ post: 1, createdAt: -1 });</code></pre>
<h2>Useful patterns</h2>
<ul>
  <li><strong>Subset:</strong> embed the latest 5 reviews, keep the rest separate.</li>
  <li><strong>Computed:</strong> store counters like <code>visit</code> instead of counting on every read.</li>
  <li><strong>Bucket:</strong> group time-series readings per hour instead of one document each.</li>
</ul>
<p>Index for the queries you actually run, check them with <code>explain()</code>, and revisit as the app evolves.</p>`,
  },
  {
    slug: "whats-new-in-react-19",
    title: "What's New in React 19: Actions, use() and the Compiler",
    author: "ada_codes",
    category: "development",
    cover: unsplash("1555066931-4365d14bab8c"),
    isFeatured: true,
    daysAgo: 4,
    visit: 2100,
    description:
      "Actions, useOptimistic, the use() hook, ref as a prop and the React Compiler. What changed and how it simplifies everyday components.",
    content: `
<p>React 19 is less about new concepts and more about deleting boilerplate. Forms, pending states and memoisation all got simpler.</p>
<h2>Actions</h2>
<p>Pass an async function to a form's <code>action</code> and React tracks the pending state for you. Pair it with <code>useActionState</code> to get the result and errors.</p>
<pre><code>const [state, submit, isPending] = useActionState(savePost, null);
return &lt;form action={submit}&gt;...&lt;/form&gt;;</code></pre>
<h2>useOptimistic</h2>
<p>Show the result immediately and let React roll it back if the request fails. Perfect for likes, saves and comments.</p>
<h2>use()</h2>
<p>Read a promise or context during render. Combined with Suspense it replaces a lot of loading-state plumbing.</p>
<h2>The React Compiler</h2>
<p>The compiler memoises components and values automatically. Most <code>useMemo</code> and <code>useCallback</code> calls become unnecessary, and the new lint rules flag patterns that block it, such as setting state synchronously inside an effect.</p>
<p>Upgrading is mostly painless. Start with the lint rules, then let the compiler do the rest.</p>`,
  },
  {
    slug: "express-5-migration-guide",
    title: "Express 5 Migration Guide: Async Errors, Routing and More",
    author: "grace_ops",
    category: "development",
    cover: unsplash("1461749280684-dccba630e2f6"),
    daysAgo: 9,
    visit: 840,
    description:
      "Express 5 finally handles rejected promises, tightens path matching and drops long-deprecated APIs. Here is how to upgrade an existing API.",
    content: `
<p>After a decade of version 4, Express 5 is stable. The headline feature is small but important: <strong>async errors just work</strong>.</p>
<h2>No more try/catch in every route</h2>
<p>A rejected promise in a handler is now passed to your error middleware automatically.</p>
<pre><code>app.get("/posts/:slug", async (req, res) =&gt; {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) return res.status(404).json("Post not found!");
  res.json(post);
});</code></pre>
<h2>Stricter path syntax</h2>
<p>Express 5 uses a newer <code>path-to-regexp</code>. Wildcards must be named (<code>/*splat</code>), optional segments use braces (<code>/:file{.:ext}</code>), and regex characters in paths are no longer supported.</p>
<h2>Removed APIs</h2>
<ul>
  <li><code>res.send(status)</code> → <code>res.sendStatus(status)</code></li>
  <li><code>req.param()</code> → <code>req.params</code>, <code>req.body</code> or <code>req.query</code></li>
  <li><code>app.del()</code> → <code>app.delete()</code></li>
</ul>
<p>For most APIs, the upgrade is an afternoon: bump the version, fix the paths, and delete your async wrapper helpers.</p>`,
  },
  {
    slug: "typescript-generics-without-the-headache",
    title: "TypeScript Generics Without the Headache",
    author: "ada_codes",
    category: "development",
    cover: unsplash("1504639725590-34d0984388bd"),
    daysAgo: 15,
    visit: 610,
    description:
      "Generics explained through everyday examples: typed fetch helpers, reusable components and constraints that catch real bugs.",
    content: `
<p>Generics let you write a function once and keep full type information for every caller. If you have ever returned <code>any</code> from a helper, generics are the fix.</p>
<h2>A typed fetch helper</h2>
<pre><code>async function getJson&lt;T&gt;(url: string): Promise&lt;T&gt; {
  const res = await fetch(url);
  return res.json() as Promise&lt;T&gt;;
}

const post = await getJson&lt;Post&gt;("/posts/react-19");</code></pre>
<h2>Constraints</h2>
<p>Use <code>extends</code> to require a shape. Here, anything with an <code>_id</code> can be indexed:</p>
<pre><code>function byId&lt;T extends { _id: string }&gt;(items: T[]) {
  return Object.fromEntries(items.map((i) =&gt; [i._id, i]));
}</code></pre>
<h2>Rules of thumb</h2>
<ul>
  <li>If a type parameter appears only once, you probably do not need it.</li>
  <li>Let inference work; only pass type arguments explicitly when it cannot.</li>
  <li>Name parameters meaningfully (<code>TItem</code>) in larger signatures.</li>
</ul>`,
  },
  {
    slug: "git-workflows-for-small-teams",
    title: "Git Workflows for Small Teams",
    author: "grace_ops",
    category: "development",
    cover: unsplash("1580894894513-541e068a3e2b"),
    daysAgo: 20,
    visit: 430,
    description:
      "Trunk-based development, short-lived branches and a pull request template are all a small team needs. Skip the ceremony and ship.",
    content: `
<p>Small teams do not need complex branching models. They need a workflow that keeps <code>main</code> releasable and makes reviews quick.</p>
<h2>Keep branches short-lived</h2>
<p>A branch that lives longer than two days collects merge conflicts. Split work into smaller pull requests, and hide unfinished features behind flags.</p>
<h2>Automate the boring checks</h2>
<ul>
  <li>Lint and test on every pull request.</li>
  <li>Require one approval and a green build to merge.</li>
  <li>Deploy <code>main</code> automatically to a staging environment.</li>
</ul>
<h2>Write commits for your future self</h2>
<p>A good commit message explains <em>why</em> the change was made. The diff already shows what changed.</p>
<blockquote>The best workflow is the one your team actually follows.</blockquote>`,
  },
  {
    slug: "designing-accessible-uis-with-tailwind-css-4",
    title: "Designing Accessible UIs with Tailwind CSS 4",
    author: "ada_codes",
    category: "web-design",
    cover: unsplash("1498050108023-c5249f4df085"),
    daysAgo: 7,
    visit: 690,
    description:
      "Focus states, colour contrast, reduced motion and screen-reader text: building accessible interfaces with Tailwind's utilities.",
    content: `
<p>Accessibility is not a separate phase. With Tailwind CSS 4, most of it is a handful of utilities applied consistently.</p>
<h2>Visible focus</h2>
<p>Never remove focus outlines without replacing them. <code>focus-visible:ring-2</code> shows a ring for keyboard users without distracting mouse users.</p>
<h2>Contrast</h2>
<p>Body text needs a contrast ratio of at least 4.5:1. Light grey on a lavender background often fails. Check your palette early.</p>
<h2>Respect motion preferences</h2>
<p>Wrap decorative animations in <code>motion-safe:</code> so people who prefer reduced motion are not made dizzy by a spinning button.</p>
<pre><code>&lt;svg class="motion-safe:animate-spin" ...&gt;</code></pre>
<h2>Label everything</h2>
<ul>
  <li>Use <code>sr-only</code> text for icon-only buttons.</li>
  <li>Give images meaningful <code>alt</code> text, or an empty one when decorative.</li>
  <li>Associate every input with a <code>&lt;label&gt;</code>.</li>
</ul>`,
  },
  {
    slug: "core-web-vitals-a-developers-field-guide",
    title: "Core Web Vitals: A Developer's Field Guide",
    author: "grace_ops",
    category: "web-design",
    cover: unsplash("1587620962725-abab7fe55159"),
    daysAgo: 6,
    visit: 1020,
    description:
      "LCP, INP and CLS explained, with the fixes that matter most: responsive images, less JavaScript and reserved layout space.",
    content: `
<p>Core Web Vitals measure what users actually feel: how fast the main content appears, how quickly the page responds, and whether things jump around.</p>
<h2>Largest Contentful Paint (LCP)</h2>
<p>Usually the hero image. Serve it in a modern format at the right size. An image CDN like Cloudinary does this with a URL change:</p>
<pre><code>/image/upload/f_auto,q_auto,w_800,c_limit/hero.jpg</code></pre>
<h2>Interaction to Next Paint (INP)</h2>
<p>Long JavaScript tasks block the main thread. Split bundles by route, defer non-critical scripts and avoid heavy work in event handlers.</p>
<h2>Cumulative Layout Shift (CLS)</h2>
<p>Always set <code>width</code> and <code>height</code> (or an <code>aspect-ratio</code>) on images and embeds so the browser can reserve space before they load.</p>
{{img:inline-chip}}
<p>Measure with real-user data, not just Lighthouse on a fast laptop.</p>`,
  },
  {
    slug: "web-security-basics-every-developer-should-know",
    title: "Web Security Basics Every Developer Should Know",
    author: "neural_nate",
    category: "development",
    cover: unsplash("1526374965328-7f61d4dc18c5"),
    daysAgo: 10,
    visit: 880,
    description:
      "XSS, CSRF, mass assignment and leaky error messages: the common vulnerabilities in MERN apps and how to close them.",
    content: `
<p>Most breaches do not involve clever zero-days. They exploit ordinary mistakes that are easy to prevent once you know where to look.</p>
<h2>Cross-site scripting (XSS)</h2>
<p>If you render user HTML with <code>dangerouslySetInnerHTML</code>, sanitise it first with a library like DOMPurify. Never trust content just because it came from your own database.</p>
<h2>Mass assignment</h2>
<p>Spreading <code>req.body</code> straight into a model lets users set fields they should not, such as <code>isAdmin</code> or <code>isFeatured</code>. Pick the allowed fields explicitly.</p>
<pre><code>const { title, content, category } = req.body;
await Post.create({ title, content, category, user: user._id });</code></pre>
<h2>Leaky errors</h2>
<p>Stack traces help attackers map your code. Return generic messages in production and log the details server-side.</p>
<h2>Secrets</h2>
<ul>
  <li>Keep API keys in environment variables, never in the frontend bundle.</li>
  <li>Sign uploads on the server so clients never see your API secret.</li>
  <li>Rotate any key that was ever committed to git.</li>
</ul>`,
  },
  {
    slug: "edge-computing-and-the-future-of-the-web",
    title: "Edge Computing and the Future of the Web",
    author: "neural_nate",
    category: "general",
    cover: unsplash("1451187580459-43490279c0fa"),
    daysAgo: 18,
    visit: 540,
    description:
      "Running code close to users cuts latency, but it changes how you think about data. A look at what belongs at the edge and what does not.",
    content: `
<p>Content delivery networks used to cache static files. Today they run your code in hundreds of locations, often just milliseconds from the user.</p>
<h2>What works well at the edge</h2>
<ul>
  <li>Authentication checks and redirects.</li>
  <li>Personalisation and A/B testing.</li>
  <li>Image transformation and resizing.</li>
  <li>Rate limiting and bot protection.</li>
</ul>
<h2>The data problem</h2>
<p>Code at the edge is fast only if its data is nearby too. A function in Nairobi that queries a database in Virginia is no faster than a server in Virginia. Use read replicas, edge caches or globally distributed databases for hot data.</p>
<h2>Start small</h2>
<p>Move one latency-sensitive route to the edge, measure, and expand from there. Most apps get the biggest win from caching and image optimisation alone.</p>`,
  },
];

export const comments = [
  {
    post: "building-rag-pipelines-that-actually-work",
    author: "ada_codes",
    description: "Hybrid search + re-ranking fixed most of our bad answers. Great write-up!",
  },
  {
    post: "building-rag-pipelines-that-actually-work",
    author: "grace_ops",
    description: "Measuring retrieval recall separately is such an underrated tip.",
  },
  {
    post: "whats-new-in-react-19",
    author: "neural_nate",
    description: "useOptimistic made our like button so much simpler.",
  },
  {
    post: "vector-databases-explained",
    author: "ada_codes",
    description: "We stayed on Atlas vector search and haven't looked back.",
  },
  {
    post: "express-5-migration-guide",
    author: "ada_codes",
    description: "Deleting our asyncHandler wrapper was the best part of the upgrade.",
  },
];
