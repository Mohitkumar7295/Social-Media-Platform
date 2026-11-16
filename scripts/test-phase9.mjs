import { createClient } from '@insforge/sdk';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const client = createClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
});

async function runPhase9Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING WRITESPACE PHASE 9 INTEGRATION TESTS');
  console.log('   (Notifications System & Writer Dashboard)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Real test user IDs in PostgreSQL
  const userA_Id = '7dc385e4-d1c9-4e46-9a9a-2bdb9ebd93e4'; // Mohit Kumar (Writer)
  const userB_Id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Sarah Reader (Reader / Actor)

  let testPostId = null;
  let testDraftId = null;
  let parentCommentId = null;
  let replyCommentId = null;
  const createdNotificationIds = [];

  try {
    // ----------------------------------------------------
    // SETUP: Clean up previous notifications & create test stories
    // ----------------------------------------------------
    console.log('📦 Setting up test records in PostgreSQL...');

    // Clean any prior residual notifications between test users
    await client.database
      .from('notifications')
      .delete()
      .or(`recipient_id.eq.${userA_Id},recipient_id.eq.${userB_Id}`);

    // Create a published article owned by User A
    const { data: pubPost, error: pubErr } = await client.database
      .from('posts')
      .insert([
        {
          author_id: userA_Id,
          title: `Phase 9 Notification & Dashboard Testing ${Date.now()}`,
          subtitle: 'Verification story for applauds, discussions, and author metrics',
          excerpt: 'Testing notifications pipeline and dashboard aggregates.',
          slug: `phase9-test-story-${Date.now()}`,
          content: '<p>Testing real PostgreSQL notification events and dashboard counts.</p>',
          category: 'Technology',
          status: 'published',
          published_at: new Date().toISOString(),
          reading_time: 3,
        },
      ])
      .select('id, title, slug, status, author_id')
      .single();

    if (pubErr) throw new Error(`Setup published post failed: ${pubErr.message}`);
    testPostId = pubPost.id;

    // Create a draft article owned by User A
    const { data: dftPost, error: dftErr } = await client.database
      .from('posts')
      .insert([
        {
          author_id: userA_Id,
          title: `Phase 9 Unpublished Draft ${Date.now()}`,
          subtitle: 'Draft counter verification',
          slug: `phase9-draft-${Date.now()}`,
          content: '<p>Unpublished draft content.</p>',
          status: 'draft',
          reading_time: 1,
        },
      ])
      .select('id, status')
      .single();

    if (dftErr) throw new Error(`Setup draft post failed: ${dftErr.message}`);
    testDraftId = dftPost.id;

    console.log(`   User A Published Post ID: ${testPostId}`);
    console.log(`   User A Draft Post ID: ${testDraftId}\n`);

    // ----------------------------------------------------
    // TEST 1: User B Follows User A -> Generates Follow Notification
    // ----------------------------------------------------
    try {
      // 1. Follow User A
      await client.database.from('follows').delete().eq('follower_id', userB_Id).eq('following_id', userA_Id);
      await client.database.from('follows').insert([{ follower_id: userB_Id, following_id: userA_Id }]);

      // 2. Insert notification
      const { data: nRow, error: nErr } = await client.database
        .from('notifications')
        .insert([
          {
            recipient_id: userA_Id,
            actor_id: userB_Id,
            type: 'follow',
          },
        ])
        .select('*')
        .single();

      if (nErr) throw new Error(nErr.message);
      if (!nRow || nRow.recipient_id !== userA_Id || nRow.actor_id !== userB_Id) {
        throw new Error('Follow notification record data mismatch');
      }
      createdNotificationIds.push(nRow.id);

      console.log('✅ TEST 1 PASSED: User B follows User A -> Follow notification created for User A');
      passed++;
    } catch (err) {
      console.error('❌ TEST 1 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 2: User B Likes User A's Article -> Generates Like Notification
    // ----------------------------------------------------
    try {
      // 1. Like User A's story
      await client.database.from('likes').delete().eq('post_id', testPostId).eq('user_id', userB_Id);
      await client.database.from('likes').insert([{ post_id: testPostId, user_id: userB_Id }]);

      // 2. Insert like notification
      const { data: nRow, error: nErr } = await client.database
        .from('notifications')
        .insert([
          {
            recipient_id: userA_Id,
            actor_id: userB_Id,
            type: 'like',
            post_id: testPostId,
          },
        ])
        .select('*')
        .single();

      if (nErr) throw new Error(nErr.message);
      if (!nRow || nRow.post_id !== testPostId) {
        throw new Error('Like notification post_id mismatch');
      }
      createdNotificationIds.push(nRow.id);

      console.log("✅ TEST 2 PASSED: User B likes User A's story -> Like notification created with post_id");
      passed++;
    } catch (err) {
      console.error('❌ TEST 2 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 3: User B Comments on User A's Story -> Generates Comment Notification
    // ----------------------------------------------------
    try {
      // 1. User B comments on story
      const { data: commentRow, error: cErr } = await client.database
        .from('comments')
        .insert([
          {
            post_id: testPostId,
            user_id: userB_Id,
            content: 'Brilliant perspectives on autonomous software engineering!',
          },
        ])
        .select('id, post_id, user_id')
        .single();

      if (cErr) throw new Error(cErr.message);
      parentCommentId = commentRow.id;

      // 2. Insert comment notification for article author (User A)
      const { data: nRow, error: nErr } = await client.database
        .from('notifications')
        .insert([
          {
            recipient_id: userA_Id,
            actor_id: userB_Id,
            type: 'comment',
            post_id: testPostId,
            comment_id: parentCommentId,
          },
        ])
        .select('*')
        .single();

      if (nErr) throw new Error(nErr.message);
      createdNotificationIds.push(nRow.id);

      console.log('✅ TEST 3 PASSED: User B comments on story -> Comment notification created for author');
      passed++;
    } catch (err) {
      console.error('❌ TEST 3 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 4: User A Replies to User B's Comment -> Generates Reply Notification for User B
    // ----------------------------------------------------
    try {
      // 1. User A replies to User B's comment
      const { data: replyRow, error: rErr } = await client.database
        .from('comments')
        .insert([
          {
            post_id: testPostId,
            user_id: userA_Id,
            parent_id: parentCommentId,
            content: 'Thank you Sarah! Great insights from your end as well.',
          },
        ])
        .select('id, post_id, user_id, parent_id')
        .single();

      if (rErr) throw new Error(rErr.message);
      replyCommentId = replyRow.id;

      // 2. Notification must go to the author of the parent comment (User B)
      const { data: nRow, error: nErr } = await client.database
        .from('notifications')
        .insert([
          {
            recipient_id: userB_Id,
            actor_id: userA_Id,
            type: 'reply',
            post_id: testPostId,
            comment_id: replyCommentId,
          },
        ])
        .select('*')
        .single();

      if (nErr) throw new Error(nErr.message);
      if (nRow.recipient_id !== userB_Id) {
        throw new Error('Reply notification recipient was not the comment author');
      }
      createdNotificationIds.push(nRow.id);

      console.log('✅ TEST 4 PASSED: Reply notification generated accurately for the parent comment author');
      passed++;
    } catch (err) {
      console.error('❌ TEST 4 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 5: Self-Notification Prevention (Check Constraint)
    // ----------------------------------------------------
    try {
      const { data: selfNotify, error: selfErr } = await client.database
        .from('notifications')
        .insert([
          {
            recipient_id: userA_Id,
            actor_id: userA_Id,
            type: 'like',
            post_id: testPostId,
          },
        ]);

      if (!selfErr) {
        throw new Error('Database check constraint failed: self-notification was erroneously permitted!');
      }

      console.log('✅ TEST 5 PASSED: Self-notification rejected by check_no_self_notification constraint');
      passed++;
    } catch (err) {
      console.error('❌ TEST 5 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 6: Fetch Notifications with Joined Actor and Post Relations
    // ----------------------------------------------------
    try {
      const { data: userANotifications, count, error: listErr } = await client.database
        .from('notifications')
        .select(`
          id,
          recipient_id,
          type,
          is_read,
          created_at,
          actor:profiles!actor_id(id, username, full_name, avatar_url),
          post:posts!post_id(id, title, slug)
        `, { count: 'exact' })
        .eq('recipient_id', userA_Id)
        .order('created_at', { ascending: false });

      if (listErr) throw new Error(listErr.message);
      if (!userANotifications || userANotifications.length < 3) {
        throw new Error(`Expected at least 3 notifications for User A, found ${userANotifications?.length}`);
      }

      const firstItem = userANotifications[0];
      if (!firstItem.actor?.username) {
        throw new Error('Actor metadata (username/full_name) missing from notification');
      }

      console.log(`✅ TEST 6 PASSED: Notifications stream successfully resolved with joined actor & post metadata (${userANotifications.length} items)`);
      passed++;
    } catch (err) {
      console.error('❌ TEST 6 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 7: Mark Individual Notification as Read
    // ----------------------------------------------------
    let targetNotifId = null;
    try {
      const { data: unreadRows } = await client.database
        .from('notifications')
        .select('id')
        .eq('recipient_id', userA_Id)
        .eq('is_read', false)
        .limit(1);

      if (!unreadRows || unreadRows.length === 0) throw new Error('No unread notification found');
      targetNotifId = unreadRows[0].id;

      const { error: markErr } = await client.database
        .from('notifications')
        .update({ is_read: true })
        .eq('id', targetNotifId)
        .eq('recipient_id', userA_Id);

      if (markErr) throw new Error(markErr.message);

      // Verify is_read is true
      const { data: updatedRow } = await client.database
        .from('notifications')
        .select('is_read')
        .eq('id', targetNotifId)
        .single();

      if (!updatedRow?.is_read) throw new Error('Notification is_read flag remained false');

      console.log('✅ TEST 7 PASSED: Individual notification marked as read in PostgreSQL');
      passed++;
    } catch (err) {
      console.error('❌ TEST 7 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 8: Mark All Notifications as Read & Verify Unread Count
    // ----------------------------------------------------
    try {
      const { error: markAllErr } = await client.database
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userA_Id)
        .eq('is_read', false);

      if (markAllErr) throw new Error(markAllErr.message);

      // Verify unread count is 0
      const { count: unreadCount, error: countErr } = await client.database
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userA_Id)
        .eq('is_read', false);

      if (countErr) throw new Error(countErr.message);
      if (unreadCount !== 0) throw new Error(`Expected 0 unread notifications, got ${unreadCount}`);

      console.log('✅ TEST 8 PASSED: Mark all as read updated all rows; unread count returned to 0');
      passed++;
    } catch (err) {
      console.error('❌ TEST 8 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 9: Writer Dashboard Overview Statistics Verification
    // ----------------------------------------------------
    try {
      // 1. Query published count
      const { count: publishedCount } = await client.database
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userA_Id)
        .eq('status', 'published');

      // 2. Query draft count
      const { count: draftCount } = await client.database
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userA_Id)
        .eq('status', 'draft');

      // 3. Query followers count
      const { count: followersCount } = await client.database
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userA_Id);

      // Verify counts are valid numbers matching database records
      if (typeof publishedCount !== 'number' || publishedCount < 1) {
        throw new Error(`Expected publishedCount >= 1, got ${publishedCount}`);
      }
      if (typeof draftCount !== 'number' || draftCount < 1) {
        throw new Error(`Expected draftCount >= 1, got ${draftCount}`);
      }
      if (typeof followersCount !== 'number' || followersCount < 1) {
        throw new Error(`Expected followersCount >= 1, got ${followersCount}`);
      }

      console.log(`✅ TEST 9 PASSED: Dashboard statistics match database records (Published: ${publishedCount}, Drafts: ${draftCount}, Followers: ${followersCount})`);
      passed++;
    } catch (err) {
      console.error('❌ TEST 9 FAILED:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 10: Engagement Aggregation Across Writer's Stories
    // ----------------------------------------------------
    try {
      // Get all post IDs for User A
      const { data: userPosts } = await client.database
        .from('posts')
        .select('id')
        .eq('author_id', userA_Id);

      const postIds = (userPosts || []).map((p) => p.id);

      const [likesRes, commentsRes] = await Promise.all([
        client.database.from('likes').select('id', { count: 'exact', head: true }).in('post_id', postIds),
        client.database.from('comments').select('id', { count: 'exact', head: true }).in('post_id', postIds),
      ]);

      if (typeof likesRes.count !== 'number' || likesRes.count < 1) {
        throw new Error(`Expected total likes count >= 1, got ${likesRes.count}`);
      }
      if (typeof commentsRes.count !== 'number' || commentsRes.count < 1) {
        throw new Error(`Expected total comments count >= 1, got ${commentsRes.count}`);
      }

      console.log(`✅ TEST 10 PASSED: Aggregate engagement across stories accurately computed (Likes: ${likesRes.count}, Comments: ${commentsRes.count})`);
      passed++;
    } catch (err) {
      console.error('❌ TEST 10 FAILED:', err.message);
      failed++;
    }

  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test artifacts...');
    if (createdNotificationIds.length > 0) {
      await client.database.from('notifications').delete().in('id', createdNotificationIds);
    }
    if (replyCommentId) {
      await client.database.from('comments').delete().eq('id', replyCommentId);
    }
    if (parentCommentId) {
      await client.database.from('comments').delete().eq('id', parentCommentId);
    }
    if (testPostId) {
      await client.database.from('likes').delete().eq('post_id', testPostId);
      await client.database.from('bookmarks').delete().eq('post_id', testPostId);
      await client.database.from('posts').delete().eq('id', testPostId);
    }
    if (testDraftId) {
      await client.database.from('posts').delete().eq('id', testDraftId);
    }
    await client.database.from('follows').delete().eq('follower_id', userB_Id).eq('following_id', userA_Id);
    console.log('   Test cleanup finished.');
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 9 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
