
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const { drizzle } = require('drizzle-orm/vercel-postgres');
const { sql } = require('@vercel/postgres');
const schema = require('./schema.js');

const db = drizzle(sql, { schema });

const initialUsers = [
  { id: 1, firebaseUid: 'user-1', name: 'TechVision', email: 'tech@vision.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 125000 },
  { id: 2, firebaseUid: 'user-2', name: 'GamerGuild', email: 'gamer@guild.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 78000 },
  { id: 3, firebaseUid: 'user-3', name: 'EduLearn', email: 'edu@learn.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 250000 },
  { id: 4, firebaseUid: 'user-4', name: 'MusicMania', email: 'music@mania.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 500000 },
  { id: 5, firebaseUid: 'user-5', name: 'NewsNow', email: 'news@now.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 1200000 },
  { id: 6, firebaseUid: 'user-6', name: 'AgriSolutions', email: 'agri@solutions.com', avatarUrl: 'https://placehold.co/40x40.png', joiners: 95000 },
];

const initialVideos = [
  { id: 1, title: 'The Future of AI: What to Expect in the Next 5 Years', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'TechVision', views: 150000, duration: '15:32', category: 'Education', live: false, description: 'A deep dive into the upcoming advancements in Artificial Intelligence.', userId: 1 },
  { id: 2, title: 'Epic Gameplay Montage: Best Moments of the Year', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'GamerGuild', views: 320000, duration: '10:05', category: 'Entertainment', live: false, description: 'A collection of the most thrilling and hilarious moments in gaming this year.', userId: 2 },
  { id: 3, title: 'Learn JavaScript in 60 Minutes', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'EduLearn', views: 1200000, duration: '1:02:15', category: 'Education', live: false, description: 'A comprehensive tutorial for beginners to get started with JavaScript programming.', userId: 3 },
  { id: 4, title: 'Acoustic Hits: Unplugged Sessions', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'MusicMania', views: 850000, duration: '25:40', category: 'Music', live: false, description: 'Relax and enjoy beautiful acoustic versions of your favorite songs.', userId: 4 },
  { id: 5, title: 'Weekly News Roundup: Top Stories This Week', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'NewsNow', views: 95000, duration: '08:12', category: 'News', live: false, description: 'Stay informed with the biggest news stories from around the world.', userId: 5 },
  { id: 6, title: 'Hilarious Cat Fails Compilation', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'GamerGuild', views: 2100000, duration: '12:30', category: 'Entertainment', live: false, description: 'A collection of funny cat videos to brighten your day.', userId: 2 },
  { id: 7, title: 'Quantum Computing Explained Simply', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'TechVision', views: 450000, duration: '22:01', category: 'Education', live: false, description: 'A simple explanation of the complex world of quantum computing.', userId: 1 },
  { id: 8, title: 'Top 10 Pop Songs of the Summer - Live Performance', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'MusicMania', views: 1500000, duration: '35:50', category: 'Music', live: true, description: 'Live performance of the top 10 pop songs of the summer.', userId: 4 },
  { id: 9, title: 'The Science of Cooking: Perfect Steak', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'EduLearn', views: 650000, duration: '18:45', category: 'Education', live: false, description: 'Learn the science behind cooking the perfect steak every time.', userId: 3 },
  { id: 10, title: 'Indie Gems: A Video Game Review', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'GamerGuild', views: 98000, duration: '14:22', category: 'Entertainment', live: false, description: 'A review of some of the best indie games you might have missed.', userId: 2 },
  { id: 11, title: 'Breaking News: Market Update', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'NewsNow', views: 15000, duration: '05:30', category: 'News', live: true, description: 'Live breaking news on the latest market updates.', userId: 5 },
  { id: 12, title: 'Lo-Fi Beats to Relax/Study to', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'MusicMania', views: 12000000, duration: '2:30:00', category: 'Music', live: true, description: 'A collection of lo-fi beats perfect for relaxing or studying.', userId: 4 },
  { id: 13, title: 'Introduction to Sustainable Farming', thumbnailUrl: 'https://placehold.co/600x400.png', channelName: 'AgriSolutions', views: 75000, duration: '30:15', category: 'Education', live: false, description: 'An introduction to sustainable farming practices for a better future.', userId: 6 }
];

const initialComments = [
    { text: 'This is amazing! 🔥', userId: 2, videoId: 1 },
    { text: 'Welcome to the stream everyone!', userId: 3, videoId: 8 },
    { text: 'Great content!', userId: 1, videoId: 3 },
];

async function main() {
  console.log('Seeding database...');
  await db.transaction(async (tx) => {
    // Clear existing data
    await tx.delete(schema.comments);
    await tx.delete(schema.videos);
    await tx.delete(schema.users);
    console.log('Cleared existing data.');

    // Insert users
    await tx.insert(schema.users).values(initialUsers).onConflictDoNothing();
    console.log(`Seeded ${initialUsers.length} users.`);

    // Insert videos
    // The `id` is serial, so we don't insert it. The userId references the correct user.
    const videosToInsert = initialVideos.map(({ id, ...video }) => video);
    await tx.insert(schema.videos).values(videosToInsert);
    console.log(`Seeded ${videosToInsert.length} videos.`);
    
    // Insert comments
    await tx.insert(schema.comments).values(initialComments);
    console.log(`Seeded ${initialComments.length} comments.`);
  });
  console.log('Database seeded successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
