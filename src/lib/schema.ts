

import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  json,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  bannerUrl: varchar('banner_url', { length: 255 }),
  galleryPhotos: json('gallery_photos'),
  joiners: integer('joiners').default(0),
  role: varchar('role', { length: 50 }).default('user').notNull(), // 'user', 'admin'
  membershipTier: varchar('membership_tier', { length: 50 }), // e.g., 'bronze', 'silver', 'gold'
});

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 255 }),
  videoUrl: varchar('video_url', { length: 255 }),
  channelName: varchar('channel_name', { length: 255 }),
  views: integer('views').default(0),
  duration: varchar('duration', { length: 50 }),
  category: varchar('category', { length: 100 }),
  live: boolean('live').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  userId: integer('user_id').references(() => users.id),
  aiSettings: json('ai_settings'),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  userId: integer('user_id').references(() => users.id),
  videoId: integer('video_id').references(() => videos.id),
});

export const tests = pgTable('tests', {
    id: serial('id').primaryKey(),
    subject: varchar('subject', { length: 255 }).notNull(),
    instructions: json('instructions'),
    isPublished: boolean('is_published').default(false),
    authorId: integer('author_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const testDrafts = pgTable('test_drafts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    draftData: json('draft_data').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
    id: serial('id').primaryKey(),
    testId: integer('test_id').references(() => tests.id).notNull(),
    questionText: text('question_text').notNull(),
    options: json('options').notNull(),
    correctAnswer: varchar('correct_answer', { length: 255 }).notNull(),
    solution: text('solution'),
});

export const testSubmissions = pgTable('test_submissions', {
    id: serial('id').primaryKey(),
    testId: integer('test_id').references(() => tests.id).notNull(),
    studentId: integer('student_id').references(() => users.id),
    score: integer('score'),
    submittedAt: timestamp('submitted_at').defaultNow(),
    answers: json('answers'),
});

export const watchHistory = pgTable('watch_history', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    videoId: integer('video_id').references(() => videos.id).notNull(),
    watchedAt: timestamp('watched_at').defaultNow().notNull(),
  }, (table) => {
    return {
      userVideoUnique: uniqueIndex('user_video_unique_idx').on(table.userId, table.videoId),
    }
  }
);

export const tickVibes = pgTable('tick_vibes', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    videoId: integer('video_id').references(() => videos.id).notNull(),
    tickedAt: timestamp('ticked_at').defaultNow().notNull(),
  }, (table) => {
    return {
      userVideoTickUnique: uniqueIndex('user_video_tick_unique_idx').on(table.userId, table.videoId),
    }
  }
);


export const playlists = pgTable('playlists', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    userId: integer('user_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playlistVideos = pgTable('playlist_videos', {
    playlistId: integer('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }).notNull(),
    videoId: integer('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.playlistId, table.videoId] }),
    }
});

export const clipTickDrafts = pgTable('clip_tick_drafts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    draftData: json('draft_data').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const followers = pgTable('followers', {
    followerId: integer('follower_id').references(() => users.id).notNull(),
    followingId: integer('following_id').references(() => users.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    }
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(), // The user who receives the notification
  actorId: integer('actor_id').references(() => users.id), // The user who performed the action
  type: varchar('type', { length: 50 }).notNull(), // e.g., 'new_video', 'new_joiner'
  text: text('text').notNull(),
  href: varchar('href', { length: 255 }),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
