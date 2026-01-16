import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"), // Optional short bio for public profile
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User settings for public profile visibility
export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  showLinks: boolean("show_links").default(true).notNull(),
  showBlogs: boolean("show_blogs").default(true).notNull(),
  showProducts: boolean("show_products").default(true).notNull(),
  showIntegrations: boolean("show_integrations").default(true).notNull(),
  linksLayout: text("links_layout").default("horizontal").notNull(), // "horizontal" or "vertical"
  bgColor: text("bg_color"), // Background color hex for public profile
  textColor: text("text_color"), // Text color hex for public profile
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  clicks: integer("clicks").default(0).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(), // String to allow "free", "$29", etc.
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sales: integer("sales").default(0).notNull(),
  revenue: integer("revenue").default(0).notNull(), // In cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(), // URL friendly identifier
  description: text("description"), // Short summary
  content: text("content"), // Markdown content
  published: boolean("published").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  isExternal: boolean("is_external").default(false).notNull(),
  externalUrl: text("external_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});




