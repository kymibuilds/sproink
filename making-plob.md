# Making Plob: How I Built a Linktree Killer in a Weekend (and Only Cried Twice)

*A tale of coffee, chaos, and wildcard subdomains*

---

So there I was, staring at my sad, basic Linktree page like it owed me money. "There has to be something better," I muttered into the void. 

Spoiler: There wasn't. So I made one.

Welcome to the chaotic origin story of **plob.dev** — _linktree, but better._

## 🤔 Wait, What Even is "Plob"?

Good question. I have no idea where the name came from. It was 2 AM, I was on my third energy drink, and "plop" was taken. So... plob. It's memorable. It's cute. It sounds like something a frog would say. 

**Shipped it.**

## 💡 The "Brilliant" Idea

"What if," I thought, fueled by hubris and caffeine, "every user got their own subdomain like `username.plob.dev`?"

What I **thought** would happen: A couple DNS records and boom, done.

What **actually** happened: Three hours of middleware debugging, learning what `lvh.me` is, and questioning every life decision that led me here.

But hey — we got **wildcard subdomains** working. Every user gets their own little corner of the internet:

```
sarah.plob.dev
dev_chad.plob.dev
the-productivity-guy.plob.dev
```

*Beautiful.*

## 🛠️ The Tech Stack (aka My Comfort Zone)

Let me introduce you to the all-star lineup that made this fever dream possible:

| Tech | Why |
|------|-----|
| **Next.js 14** | App Router go brrr |
| **Drizzle ORM** | TypeScript all the way down |
| **Neon** | Serverless Postgres because I'm too lazy to manage a database |
| **Lucia Auth** | Passwords? In 2026? Apparently yes. |
| **TailwindCSS** | Because writing actual CSS is a punishment |

The tech stack is pretty standard, but here's the fun part — I originally started with Supabase. Then migrated to Neon mid-development because... reasons. 

> **Pro tip:** Don't migrate databases at midnight. Just don't.

## ✍️ The Blogging Crisis

Every Linktree alternative has links. *Revolutionary.* But I wanted more. I wanted **blogs**.

"How hard could it be to add a micro-blogging feature?"

*Narrator: It was moderately hard.*

The idea was simple:
- Write markdown
- Click publish
- Blog appears at `username.plob.dev/blog/your-slug`

But then came the feature creep:
- External blog links? Sure.
- View counts? Obviously.
- **A publish limit of 5 blogs?** Wait, what?

Yeah, I added a publish limit. Not because of technical constraints, but because I thought it would be *spicy*. Scarcity creates value, right? 

...Right?

```typescript
// The line that caused existential debates
const MAX_PUBLISHED_BLOGS = 5;
```

## ⌨️ Keyboard Shortcuts: Because Mice Are for Peasants

I'm a keyboard person. If I have to reach for my mouse, I've already lost. So I went absolutely unhinged with shortcuts:

- `g` + `l` → Links
- `g` + `b` → Blogs  
- `g` + `p` → Products
- `g` + `a` → Analytics
- `p` → Publish (in editor)
- `u` → Unpublish (in editor)

Is this overkill for a simple profile page app? *Yes.*

Do I regret it? *Absolutely not.*

You know that feeling when you hit `p` and your blog just *publishes*? That's power. That's control. That's being a keyboard warrior in the best possible way.

## 🎭 The "Username Validation" Saga

Let's talk about usernames. Simple, right? Just a text field.

WRONG.

Users, as it turns out, are **chaotic agents of destruction** and will try to:
- Use emojis (no)
- Use spaces (also no)
- Use 87-character usernames (WHY)
- Use names like `admin`, `api`, and `undefined` (nice try)

The validation logic got... extensive:

```typescript
// A sample of the chaos
const FORBIDDEN_USERNAMES = [
  "admin", "api", "auth", "blog", "dashboard",
  "login", "logout", "me", "settings", "undefined",
  "null", "system", "root", "www", "help"
];
```

Someone *will* try to register as `undefined.plob.dev`. I guarantee it.

## 📊 Analytics: Because Numbers Are Fun

You know what's more addicting than social media? **Watching your numbers go up.**

I added view tracking, click tracking, and basic analytics because I wanted users to feel that sweet dopamine hit when they see:

> *"3 people viewed your profile today!"*

Is it life-changing? No. Is it satisfying? *Absolutely.*

## 🌙 The Dark Mode Dilemma

Every modern app needs dark mode. This is non-negotiable. It's 2026. We're tired. Our eyes hurt.

But here's the thing about dark mode — it's never *just* dark mode. It's:
- System preference detection
- Color palette adjustments  
- Making sure your text is readable
- "Is this gray dark enough?"
- Existential crisis about what constitutes "true black"

We shipped dark mode. It looks good. I won't show you the 14 different gray values in my CSS file.

## 🚀 Deploying to Vercel: A Love Story

Deploying to Vercel is usually smooth. Push to main, magic happens. But wildcards subdomains? That's a whole different beast.

**What I had to configure:**
1. Main domain: `plob.dev`
2. Wildcard: `*.plob.dev`
3. DNS nameservers pointing to Vercel
4. Edge middleware to route subdomains correctly
5. A prayer to the deployment gods

After approximately 47 failed builds and one very concerned email from Vercel about my deployment frequency, **it worked**.

My browser finally loaded `test.plob.dev` and I may have shed a single tear.

## 🎉 What I Learned

1. **Wildcard subdomains are cool but not free.** Mentally or financially.
2. **Migrate databases in the morning.** Your brain deserves it.
3. **Feature limits can be features.** Sometimes constraints spark creativity.
4. **Ship it.** Perfection is the enemy of launching.
5. **Name things weird stuff.** Plob is memorable. Be memorable.

## 🔮 What's Next?

- Custom themes (let users be extra)
- Integration with Notion/GitHub
- Sponsors section (gotta get that bag)
- More keyboard shortcuts (there's never enough)

---

## Try It Out

Want your own `username.plob.dev`? 

Come check it out at **[plob.dev](https://plob.dev)** — where developers go to flex their links, blogs, and products.

No more boring Linktree. It's plobin' time. 

*Yeah, I said it.*

---

*Thanks for reading! If you enjoyed this chaotic journey, drop a follow. Or don't. I'm not your mom.*

**#webdev #nextjs #typescript #buildinpublic #sideproject**
