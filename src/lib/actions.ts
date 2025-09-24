

'use server';

import { db } from '@/lib/db';
import { videos, users, comments as commentsTable, tests, questions as questionsTable, testSubmissions, watchHistory, tickVibes, playlists, playlistVideos, clipTickDrafts, followers, notifications, testDrafts } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';
import type { ClipTickDraft, TestDraft, User } from '@/types';

// NOTE: This file is the new single source of truth for data fetching.
// All data access should go through these server actions.
// Components should no longer import from 'data.ts' or use 'localStorage' for persistent data.

/**
 * Fetches all videos from the database.
 * @returns A promise that resolves to an array of videos.
 */
export async function getVideos() {
    noStore();
    try {
        const allVideos = await db.select().from(videos).orderBy(desc(videos.createdAt));
        return allVideos;
    } catch (error) {
        console.error('Database Error: Failed to fetch videos.', error);
        return [];
    }
}

/**
 * Fetches a single video by its ID.
 * @param id The numeric ID of the video.
 * @returns A promise that resolves to the video object or null if not found.
 */
export async function getVideoById(id: number) {
    noStore();
    try {
        const video = await db.select().from(videos).where(eq(videos.id, id));
        return video[0] || null;
    } catch (error) {
        console.error(`Database Error: Failed to fetch video with id ${id}.`, error);
        return null;
    }
}

/**
 * Fetches all users from the database.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers() {
    noStore();
    try {
        return await db.select().from(users);
    } catch (error) {
        console.error('Database Error: Failed to fetch users.', error);
        return [];
    }
}

/**
 * Fetches a single user by their ID.
 * @param id The numeric ID of the user.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUserById(id: number) {
    noStore();
    try {
        const user = await db.select().from(users).where(eq(users.id, id));
        return user[0] || null;
    } catch (error) {
        console.error(`Database Error: Failed to fetch user with id ${id}.`, error);
        return null;
    }
}

/**
 * Fetches a single user by their Firebase UID.
 * @param uid The string UID from Firebase.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUserByFirebaseUid(uid: string) {
    noStore();
    try {
        const user = await db.select().from(users).where(eq(users.firebaseUid, uid));
        return user[0] || null;
    } catch (error) {
        console.error(`Database Error: Failed to fetch user with firebase_uid ${uid}.`, error);
        return null;
    }
}


/**
 * Fetches all comments for a specific video, joined with user data.
 * @param videoId The numeric ID of the video.
 * @returns A promise that resolves to an array of comments with user details.
 */
export async function getCommentsByVideoId(videoId: number) {
    noStore();
    try {
        const allComments = await db.select({
            id: commentsTable.id,
            text: commentsTable.text,
            createdAt: commentsTable.createdAt,
            user: {
                id: users.firebaseUid,
                name: users.name,
                avatarUrl: users.avatarUrl
            }
        })
        .from(commentsTable)
        .where(eq(commentsTable.videoId, videoId))
        .innerJoin(users, eq(commentsTable.userId, users.id))
        .orderBy(desc(commentsTable.createdAt));
        
        return allComments.map(c => ({
            ...c,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
        }));

    } catch (error) {
        console.error(`Database Error: Failed to fetch comments for video ${videoId}.`, error);
        return [];
    }
}


/**
 * Saves a new user to the database.
 * @param newUser The user object to save.
 * @returns A promise that resolves when the user is saved.
 */
export async function saveNewUser(newUser: { firebaseUid: string, name: string, email: string, avatarUrl: string, joiners: number, role: 'user' | 'admin' }) {
    try {
        await db.insert(users).values(newUser);
        return { success: true };
    } catch (error) {
        console.error('Database Error: Failed to save new user.', error);
        return { success: false, error: 'Database Error' };
    }
}


/**
 * Updates a user's asset URLs (avatar, banner, gallery).
 * @param userId The ID of the user to update.
 * @param assets An object containing the URLs to update.
 * @returns A promise resolving to a success or error object.
 */
export async function updateUserAssets(userId: number, assets: { bannerUrl?: string; avatarUrl?: string; newPhotoUrl?: string }) {
    try {
        const currentUser = await getUserById(userId);
        if (!currentUser) {
            return { success: false, error: 'User not found' };
        }

        let updateData: Partial<User> = {};
        if (assets.bannerUrl) {
            updateData.bannerUrl = assets.bannerUrl;
        }
        if (assets.avatarUrl) {
            updateData.avatarUrl = assets.avatarUrl;
        }
        if (assets.newPhotoUrl) {
            const currentGallery = (currentUser.galleryPhotos as any[]) || [];
            const newPhoto = {
                id: Date.now(),
                src: assets.newPhotoUrl,
                alt: `User photo ${currentGallery.length + 1}`
            };
            updateData.galleryPhotos = [newPhoto, ...currentGallery] as any;
        }

        if (Object.keys(updateData).length > 0) {
            await db.update(users).set(updateData).where(eq(users.id, userId));
        }

        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to update assets for user ${userId}.`, error);
        return { success: false, error: 'Database error' };
    }
}


/**
 * Saves a new video's metadata to the database.
 * @param videoData The video details to save.
 * @returns A promise resolving to a success or error object with the new video ID.
 */
export async function saveVideo(videoData: { title: string; description: string; category: string; videoUrl?: string; userId: number; channelName?: string; live?: boolean; duration?: string; aiSettings?: any; }) {
    try {
        const uploaderId = videoData.userId;
        const uploader = await getUserById(uploaderId);
        if (!uploader) {
            return { success: false, error: 'User not found.' };
        }

        videoData.channelName = uploader.name;
        
        const result = await db.insert(videos).values({
            title: videoData.title,
            description: videoData.description,
            category: videoData.category,
            videoUrl: videoData.videoUrl,
            userId: videoData.userId,
            channelName: videoData.channelName,
            thumbnailUrl: `https://picsum.photos/seed/vid${Date.now()}/600/400`,
            duration: videoData.duration || (videoData.live ? '00:00' : 'N/A'),
            views: videoData.live ? 1 : 0,
            live: videoData.live || false,
            aiSettings: videoData.aiSettings,
        }).returning({ id: videos.id });

        const newVideoId = result[0].id;

        // Create notifications for followers
        const userFollowers = await db.select({ followerId: followers.followerId }).from(followers).where(eq(followers.followingId, uploaderId));
        for (const f of userFollowers) {
            await createNotification({
                userId: f.followerId,
                actorId: uploaderId,
                type: videoData.live ? 'live_stream' : 'new_video',
                text: `${uploader.name} ${videoData.live ? 'is going live' : 'uploaded a new video'}: "${videoData.title}"`,
                href: videoData.live ? `/live/${newVideoId}` : `/watch/${newVideoId}`,
            });
        }

        return { success: true, videoId: newVideoId };

    } catch (error) {
        console.error('Database Error: Failed to save video.', error);
        return { success: false, error: 'Could not save video to database.' };
    }
}



// --- TEST / EDUCATIONAL ACTIONS ---

export async function getPublishedTests() {
    noStore();
    try {
        const publishedTests = await db.select().from(tests).where(eq(tests.isPublished, true)).orderBy(desc(tests.createdAt));
        return publishedTests;
    } catch (error) {
        console.error('Database Error: Failed to fetch published tests.', error);
        return [];
    }
}

export async function getTestById(id: number) {
    noStore();
    try {
        const testData = await db.select().from(tests).where(eq(tests.id, id));
        if (!testData[0]) return null;

        const questionsData = await db.select().from(questionsTable).where(eq(questionsTable.testId, id));
        
        return {
            ...testData[0],
            questions: questionsData
        };

    } catch (error) {
        console.error(`Database Error: Failed to fetch test with id ${id}.`, error);
        return null;
    }
}

export async function publishTest(draft: TestDraft, authorId: number) {
    try {
        // Upsert the test
        const testResult = await db.insert(tests).values({
            subject: draft.subject,
            instructions: draft.instructions,
            isPublished: true,
            authorId: authorId,
            createdAt: new Date(draft.createdAt).toISOString(),
        }).onConflictDoUpdate({
            target: tests.id,
            set: {
                subject: draft.subject,
                instructions: draft.instructions,
                isPublished: true,
            }
        }).returning({ id: tests.id });
        
        const testId = testResult[0].id;
        
        // Clear old questions for this test to handle updates
        await db.delete(questionsTable).where(eq(questionsTable.testId, testId));

        // Insert new questions
        if (draft.questions.length > 0) {
            const questionsToInsert = draft.questions.map(q => ({
                testId: testId,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                solution: q.solution
            }));
            await db.insert(questionsTable).values(questionsToInsert);
        }

        // Delete the draft from test_drafts table
        if (draft.id) {
             const numericDraftId = parseInt(draft.id.replace('test-', ''), 10);
             if (!isNaN(numericDraftId)) {
                await db.delete(testDrafts).where(eq(testDrafts.id, numericDraftId));
            }
        }
        

        return { success: true, testId };
    } catch(error) {
        console.error('Database Error: Failed to publish test.', error);
        return { success: false, error: 'Database Error' };
    }
}


export async function unpublishTest(testId: number) {
    try {
        await db.update(tests).set({ isPublished: false }).where(eq(tests.id, testId));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to unpublish test ${testId}.`, error);
        return { success: false, error: 'Database Error' };
    }
}

export async function saveTestSubmission(submission: { testId: number, studentId: number, score: number, answers: any }) {
    try {
        const result = await db.insert(testSubmissions).values(submission).returning({ id: testSubmissions.id });
        return { success: true, submissionId: result[0].id };
    } catch (error) {
        console.error('Database Error: Failed to save test submission.', error);
        return { success: false, error: 'Database Error' };
    }
}

export async function getTestSubmissionById(submissionId: number) {
    noStore();
    try {
        const submission = await db.select().from(testSubmissions).where(eq(testSubmissions.id, submissionId));
        if(!submission[0]) return null;
        
        const testData = await getTestById(submission[0].testId);
        if(!testData) return null;

        return {
            ...submission[0],
            test: testData
        };

    } catch (error) {
        console.error(`Database Error: Failed to fetch submission ${submissionId}.`, error);
        return null;
    }
}

// --- Watch History Actions ---

/**
 * Adds a video to a user's watch history.
 * If the video is already in the history, it updates the `watchedAt` timestamp.
 * @param userId The ID of the user.
 * @param videoId The ID of the video.
 * @returns A promise resolving to a success or error object.
 */
export async function addToWatchHistory(userId: number, videoId: number) {
    noStore();
    try {
        await db.insert(watchHistory)
            .values({ userId, videoId })
            .onConflictDoUpdate({ 
                target: [watchHistory.userId, watchHistory.videoId], 
                set: { watchedAt: new Date() } 
            });
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to add to watch history for user ${userId}.`, error);
        return { success: false, error: "Could not update watch history." };
    }
}

/**
 * Fetches the watch history for a user, returning the video details.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of video objects.
 */
export async function getWatchHistory(userId: number) {
    noStore();
    try {
        const historyVideos = await db.select({
            video: videos
        })
        .from(watchHistory)
        .innerJoin(videos, eq(watchHistory.videoId, videos.id))
        .where(eq(watchHistory.userId, userId))
        .orderBy(desc(watchHistory.watchedAt));
        
        return historyVideos.map(item => item.video);
    } catch (error) {
        console.error(`Database Error: Failed to fetch watch history for user ${userId}.`, error);
        return [];
    }
}

/**
 * Clears the entire watch history for a user.
 * @param userId The ID of the user.
 * @returns A promise resolving to a success or error object.
 */
export async function clearWatchHistory(userId: number) {
    try {
        await db.delete(watchHistory).where(eq(watchHistory.userId, userId));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to clear watch history for user ${userId}.`, error);
        return { success: false, error: "Could not clear watch history." };
    }
}

// --- TickVibe Actions ---

/**
 * Toggles a "tick" on a video for a user.
 * Adds the tick if it doesn't exist, removes it if it does.
 * @param userId The ID of the user.
 * @param videoId The ID of the video.
 * @returns A promise resolving to an object indicating the new ticked status.
 */
export async function toggleTick(userId: number, videoId: number) {
    noStore();
    try {
        const existingTick = await db.select()
            .from(tickVibes)
            .where(and(eq(tickVibes.userId, userId), eq(tickVibes.videoId, videoId)));

        if (existingTick.length > 0) {
            // Tick exists, so remove it
            await db.delete(tickVibes)
                .where(and(eq(tickVibes.userId, userId), eq(tickVibes.videoId, videoId)));
            return { success: true, ticked: false };
        } else {
            // Tick doesn't exist, so add it
            await db.insert(tickVibes).values({ userId, videoId });
            return { success: true, ticked: true };
        }
    } catch (error) {
        console.error(`Database Error: Failed to toggle tick for user ${userId} and video ${videoId}.`, error);
        return { success: false, error: "Could not update TickVibe status." };
    }
}

/**
 * Fetches all video IDs that a user has "ticked".
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of video ID numbers.
 */
export async function getTickedVideoIds(userId: number) {
    noStore();
    try {
        const result = await db.select({
            videoId: tickVibes.videoId
        })
        .from(tickVibes)
        .where(eq(tickVibes.userId, userId));

        return result.map(item => item.videoId);
    } catch (error) {
        console.error(`Database Error: Failed to fetch ticked videos for user ${userId}.`, error);
        return [];
    }
}


// --- Playlist Actions ---

export async function getPlaylistsByUserId(userId: number) {
    noStore();
    try {
        const userPlaylists = await db.select()
            .from(playlists)
            .where(eq(playlists.userId, userId))
            .orderBy(desc(playlists.createdAt));

        // For each playlist, get the video count and thumbnail of the latest video
        const playlistsWithDetails = await Promise.all(userPlaylists.map(async (playlist) => {
            const videoCountResult = await db.select({ videoId: playlistVideos.videoId })
                .from(playlistVideos)
                .where(eq(playlistVideos.playlistId, playlist.id));
            
            let latestVideoThumbnail = 'https://placehold.co/600x400.png';
            if (videoCountResult.length > 0) {
                const latestVideo = await db.select({ thumbnailUrl: videos.thumbnailUrl })
                    .from(playlistVideos)
                    .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
                    .where(eq(playlistVideos.playlistId, playlist.id))
                    .orderBy(desc(playlistVideos.addedAt))
                    .limit(1);
                if (latestVideo[0]?.thumbnailUrl) {
                    latestVideoThumbnail = latestVideo[0].thumbnailUrl;
                }
            }

            return {
                ...playlist,
                videoCount: videoCountResult.length,
                thumbnailUrl: latestVideoThumbnail,
            };
        }));

        return playlistsWithDetails;

    } catch (error) {
        console.error(`Database Error: Failed to fetch playlists for user ${userId}.`, error);
        return [];
    }
}


export async function createPlaylist(name: string, description: string, userId: number) {
    try {
        const result = await db.insert(playlists).values({
            name,
            description,
            userId,
        }).returning();
        return { success: true, playlist: result[0] };
    } catch (error) {
        console.error('Database Error: Failed to create playlist.', error);
        return { success: false, error: 'Could not create the playlist.' };
    }
}


export async function addVideoToPlaylist(playlistId: number, videoId: number) {
    try {
        // Check if the video is already in the playlist to avoid duplicates
        const existing = await db.select().from(playlistVideos).where(
            and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId))
        );
        if (existing.length > 0) {
            return { success: false, error: 'Video is already in this playlist.' };
        }
        await db.insert(playlistVideos).values({ playlistId, videoId });
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to add video ${videoId} to playlist ${playlistId}.`, error);
        return { success: false, error: 'Could not add video to the playlist.' };
    }
}

// --- ClipTick Draft Actions ---

export async function saveClipTickDraft(userId: number, draftData: ClipTickDraft) {
    noStore();
    try {
        const result = await db.insert(clipTickDrafts)
            .values({ userId, draftData })
            .onConflictDoUpdate({
                target: clipTickDrafts.id,
                set: {
                    draftData: draftData,
                    updatedAt: new Date()
                }
            })
            .returning();
        return { success: true, draft: result[0] };
    } catch (error) {
        console.error(`Database Error: Failed to save ClipTick draft for user ${userId}.`, error);
        return { success: false, error: "Could not save draft." };
    }
}

export async function getClipTickDraftsByUserId(userId: number) {
    noStore();
    try {
        const drafts = await db.select()
            .from(clipTickDrafts)
            .where(eq(clipTickDrafts.userId, userId))
            .orderBy(desc(clipTickDrafts.updatedAt));
        
        // The `draftData` is already a JSON object, we just add the DB id to it
        return drafts.map(d => ({ ...(d.draftData as ClipTickDraft), id: d.id, createdAt: d.createdAt.toISOString() }));

    } catch (error) {
        console.error(`Database Error: Failed to fetch ClipTick drafts for user ${userId}.`, error);
        return [];
    }
}

export async function deleteClipTickDraft(draftId: number, userId: number) {
    try {
        await db.delete(clipTickDrafts)
            .where(and(eq(clipTickDrafts.id, draftId), eq(clipTickDrafts.userId, userId)));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to delete ClipTick draft ${draftId}.`, error);
        return { success: false, error: "Could not delete draft." };
    }
}


// --- Joiner (Follower) Actions ---

export async function isJoined(joinerId: number, joiningId: number) {
    noStore();
    try {
        const result = await db.select().from(followers).where(and(eq(followers.followerId, joinerId), eq(followers.followingId, joiningId)));
        return result.length > 0;
    } catch (error) {
        console.error('Database Error: Failed to check join status.', error);
        return false;
    }
}

export async function toggleJoin(joinerId: number, joiningId: number) {
    noStore();
    try {
        const alreadyJoined = await isJoined(joinerId, joiningId);
        const joiningUser = await getUserById(joiningId);

        if (alreadyJoined) {
            await db.delete(followers).where(and(eq(followers.followerId, joinerId), eq(followers.followingId, joiningId)));
            await db.update(users).set({ joiners: (joiningUser?.joiners || 1) - 1 }).where(eq(users.id, joiningId));
            return { success: true, joined: false };
        } else {
            await db.insert(followers).values({ followerId: joinerId, followingId: joiningId });
            await db.update(users).set({ joiners: (joiningUser?.joiners || 0) + 1 }).where(eq(users.id, joiningId));
            return { success: true, joined: true };
        }
    } catch (error) {
        console.error('Database Error: Failed to toggle join.', error);
        return { success: false, error: 'Could not update join status.' };
    }
}

// --- Notification Actions ---

type CreateNotificationPayload = {
    userId: number;
    actorId?: number;
    type: 'new_video' | 'live_stream' | 'new_joiner' | 'comment_reply';
    text: string;
    href: string;
}
export async function createNotification(payload: CreateNotificationPayload) {
    try {
        await db.insert(notifications).values(payload);
        return { success: true };
    } catch (error) {
        console.error('Database Error: Failed to create notification.', error);
        return { success: false, error: 'Database Error' };
    }
}

export async function getNotificationsByUserId(userId: number) {
    noStore();
    try {
        const userNotifications = await db
            .select({
                id: notifications.id,
                type: notifications.type,
                text: notifications.text,
                href: notifications.href,
                read: notifications.read,
                createdAt: notifications.createdAt,
                actor: {
                    id: users.id,
                    name: users.name,
                    avatarUrl: users.avatarUrl,
                }
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.actorId, users.id))
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(20); // Limit to recent 20 notifications

        return userNotifications;
    } catch (error) {
        console.error(`Database Error: Failed to get notifications for user ${userId}.`, error);
        return [];
    }
}

export async function markNotificationsAsRead(userId: number) {
    try {
        await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to mark notifications as read for user ${userId}.`, error);
        return { success: false, error: 'Database Error' };
    }
}

// --- Membership Actions ---

export async function updateMembership(userId: number, tier: string | null) {
    try {
        await db.update(users).set({ membershipTier: tier }).where(eq(users.id, userId));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to update membership for user ${userId}.`, error);
        return { success: false, error: 'Could not update membership.' };
    }
}

// --- Test Draft Actions ---
export async function saveTestDraft(userId: number, draftData: Omit<TestDraft, 'id'>, draftId?: number) {
    try {
        if (draftId) {
            // Update existing draft
            const result = await db.update(testDrafts)
                .set({ draftData: draftData as any, updatedAt: new Date() })
                .where(and(eq(testDrafts.id, draftId), eq(testDrafts.userId, userId)))
                .returning();
            return { success: true, draft: { ...result[0].draftData, id: result[0].id, createdAt: result[0].createdAt } };
        } else {
            // Create new draft
            const result = await db.insert(testDrafts)
                .values({ userId, draftData: draftData as any })
                .returning();
            return { success: true, draft: { ...result[0].draftData, id: result[0].id, createdAt: result[0].createdAt } };
        }
    } catch (error) {
        console.error(`Database Error: Failed to save test draft for user ${userId}.`, error);
        return { success: false, error: "Could not save test draft." };
    }
}


export async function getTestDraftsByUserId(userId: number) {
    noStore();
    try {
        const drafts = await db.select()
            .from(testDrafts)
            .where(eq(testDrafts.userId, userId))
            .orderBy(desc(testDrafts.updatedAt));
        
        return drafts.map(d => {
            const draft = d.draftData as TestDraft;
            return {
                ...draft,
                id: `test-${d.id}`, // Keep string ID format for client
                createdAt: d.createdAt.toISOString()
            };
        });

    } catch (error) {
        console.error(`Database Error: Failed to fetch test drafts for user ${userId}.`, error);
        return [];
    }
}


export async function getTestDraftById(draftId: number, userId: number) {
    noStore();
    try {
        const result = await db.select()
            .from(testDrafts)
            .where(and(eq(testDrafts.id, draftId), eq(testDrafts.userId, userId)));
        
        if (result.length === 0) {
            return null;
        }
        
        const d = result[0];
        const draft = d.draftData as TestDraft;
        return {
            ...draft,
            id: `test-${d.id}`,
            createdAt: d.createdAt.toISOString(),
        };

    } catch (error) {
        console.error(`Database Error: Failed to fetch test draft with id ${draftId}.`, error);
        return null;
    }
}

export async function deleteTestDraft(draftId: number, userId: number) {
    try {
        await db.delete(testDrafts)
            .where(and(eq(testDrafts.id, draftId), eq(testDrafts.userId, userId)));
        return { success: true };
    } catch (error) {
        console.error(`Database Error: Failed to delete test draft ${draftId}.`, error);
        return { success: false, error: "Could not delete draft." };
    }
}
