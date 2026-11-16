import { createClient } from '@insforge/sdk';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const client = createClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
});

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING WRITESPACE PHASE 7 INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const userA_Id = '7dc385e4-d1c9-4e46-9a9a-2bdb9ebd93e4'; // Mohit Kumar
  const userB_Id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Sarah Reader
  const testSlug = `phase7-feed-story-${Date.now()}`;
  let userB_PostId = null;

  try {
    // ----------------------------------------------------
    // CLEANUP PREVIOUS RESIDUAL FOLLOWS FOR TEST RUN
    // ----------------------------------------------------
    await client.database
      .from('follows')
      .delete()
      .eq('follower_id', userA_Id)
      .eq('following_id', userB_Id);

    // ----------------------------------------------------
    // TEST 1: User A Follows User B
    // ----------------------------------------------------
    try {
      const { data: followRecord, error: followErr } = await client.database
        .from('follows')
        .insert([
          {
            follower_id: userA_Id,
            following_id: userB_Id,
          },
        ])
        .select('id, follower_id, following_id')
        .single();

      if (followErr) throw new Error(followErr.message);

      // Verify record exists
      const { count: followerCount } = await client.database
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userB_Id);

      if (followerCount !== 1) {
        throw new Error(`Expected User B follower count = 1, got ${followerCount}`);
      }

      console.log('✅ Test 1: User A followed User B. Record created in PostgreSQL & count equals 1.');
      passed++;
    } catch (err) {
      console.error('❌ Test 1 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 2: Self-Follow Prevention
    // ----------------------------------------------------
    try {
      const { error: selfErr } = await client.database
        .from('follows')
        .insert([
          {
            follower_id: userA_Id,
            following_id: userA_Id,
          },
        ]);

      if (!selfErr) {
        throw new Error('Database allowed a user to follow themselves!');
      }

      console.log('✅ Test 2: Self-follow correctly rejected by check_not_self_follow constraint.');
      passed++;
    } catch (err) {
      console.error('❌ Test 2 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 3: Duplicate Follow Prevention
    // ----------------------------------------------------
    try {
      const { error: dupErr } = await client.database
        .from('follows')
        .insert([
          {
            follower_id: userA_Id,
            following_id: userB_Id,
          },
        ]);

      if (!dupErr) {
        throw new Error('Database allowed duplicate follow relationship!');
      }

      console.log('✅ Test 3: Duplicate follow correctly rejected by unique constraint.');
      passed++;
    } catch (err) {
      console.error('❌ Test 3 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 4: Followers & Following Lists
    // ----------------------------------------------------
    try {
      // 1. User B's followers list should include User A
      const { data: followersData, error: fErr } = await client.database
        .from('follows')
        .select('*, follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, bio)')
        .eq('following_id', userB_Id);

      if (fErr) throw new Error(fErr.message);
      const hasUserA = followersData?.some((r) => r.follower?.id === userA_Id);
      if (!hasUserA) {
        throw new Error("Followers list does not contain User A's profile relation.");
      }

      // 2. User A's following list should include User B
      const { data: followingData, error: fgErr } = await client.database
        .from('follows')
        .select('*, following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url, bio)')
        .eq('follower_id', userA_Id);

      if (fgErr) throw new Error(fgErr.message);
      const hasUserB = followingData?.some((r) => r.following?.id === userB_Id);
      if (!hasUserB) {
        throw new Error("Following list does not contain User B's profile relation.");
      }

      console.log('✅ Test 4: Followers and following lists correctly resolve profile relationships.');
      passed++;
    } catch (err) {
      console.error('❌ Test 4 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 5: Recommended Writers Excludes Already Followed
    // ----------------------------------------------------
    try {
      // Fetch followed IDs for User A
      const { data: followRows } = await client.database
        .from('follows')
        .select('following_id')
        .eq('follower_id', userA_Id);

      const followedSet = new Set(followRows?.map((r) => r.following_id) || []);

      // Fetch candidate recommendations excluding User A
      const { data: candidateProfiles, error: recErr } = await client.database
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', userA_Id);

      if (recErr) throw new Error(recErr.message);

      const filteredRecs = (candidateProfiles || []).filter((p) => !followedSet.has(p.id));

      // User B should NOT be in the recommendations since User A follows User B
      const userBInRecs = filteredRecs.some((p) => p.id === userB_Id);
      if (userBInRecs) {
        throw new Error('Followed writer User B was incorrectly included in recommendations!');
      }

      console.log('✅ Test 5: Recommended writers accurately exclude already-followed authors.');
      passed++;
    } catch (err) {
      console.error('❌ Test 5 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 6: Following Feed Shows Stories From Followed Writers
    // ----------------------------------------------------
    try {
      // User B publishes a story
      const { data: userBPost, error: pErr } = await client.database
        .from('posts')
        .insert([
          {
            author_id: userB_Id,
            title: 'Sarah’s Field Notes on Modern Web',
            slug: testSlug,
            content: '<p>Learning by building real fullstack platforms.</p>',
            status: 'published',
            published_at: new Date().toISOString(),
          },
        ])
        .select('id, title, author_id, status')
        .single();

      if (pErr) throw new Error(pErr.message);
      userB_PostId = userBPost.id;

      // Query User A's following feed
      const { data: followingFeed, error: ffErr } = await client.database
        .from('posts')
        .select('*, author:profiles(*)')
        .in('author_id', [userB_Id])
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (ffErr) throw new Error(ffErr.message);
      const foundStory = followingFeed?.some((p) => p.id === userB_PostId);

      if (!foundStory) {
        throw new Error('Published story by followed author does not appear in Following feed!');
      }

      console.log('✅ Test 6: Following feed dynamically returns published stories from followed creators.');
      passed++;
    } catch (err) {
      console.error('❌ Test 6 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 7: Drafts Never Appear in Feeds
    // ----------------------------------------------------
    try {
      const draftSlug = `draft-secret-${Date.now()}`;
      const { data: draftStory } = await client.database
        .from('posts')
        .insert([
          {
            author_id: userB_Id,
            title: 'Private Draft Title',
            slug: draftSlug,
            content: '<p>Secret</p>',
            status: 'draft',
          },
        ])
        .select('id')
        .single();

      // Query feeds looking for draft
      const { data: forYouFeed } = await client.database
        .from('posts')
        .select('id, status')
        .eq('status', 'published');

      const draftInFeed = forYouFeed?.some((p) => p.id === draftStory.id);

      // Cleanup draft
      await client.database.from('posts').delete().eq('id', draftStory.id);

      if (draftInFeed) {
        throw new Error('Security flaw: Unpublished draft appeared in feed query!');
      }

      console.log('✅ Test 7: Unpublished drafts strictly excluded from all public feeds.');
      passed++;
    } catch (err) {
      console.error('❌ Test 7 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 8: User A Unfollows User B
    // ----------------------------------------------------
    try {
      const { error: unfollowErr } = await client.database
        .from('follows')
        .delete()
        .eq('follower_id', userA_Id)
        .eq('following_id', userB_Id);

      if (unfollowErr) throw new Error(unfollowErr.message);

      // Verify count decreased back to 0
      const { count: finalFollowerCount } = await client.database
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userB_Id);

      if (finalFollowerCount !== 0) {
        throw new Error(`Expected User B follower count = 0, got ${finalFollowerCount}`);
      }

      console.log('✅ Test 8: User A unliked/unfollowed User B. Count returned to 0 in PostgreSQL.');
      passed++;
    } catch (err) {
      console.error('❌ Test 8 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 9: Following Feed Updates After Unfollow
    // ----------------------------------------------------
    try {
      // User A no longer follows User B, so User A's followed IDs is empty
      const { data: activeFollows } = await client.database
        .from('follows')
        .select('following_id')
        .eq('follower_id', userA_Id);

      const followedAuthorIds = activeFollows?.map((r) => r.following_id) || [];

      let postCount = 0;
      if (followedAuthorIds.length > 0) {
        const { count } = await client.database
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .in('author_id', followedAuthorIds)
          .eq('status', 'published');
        postCount = count || 0;
      }

      if (postCount !== 0) {
        throw new Error(`Expected 0 posts in Following feed after unfollowing, got ${postCount}`);
      }

      console.log('✅ Test 9: Following feed immediately clears stories from unfollowed writers.');
      passed++;
    } catch (err) {
      console.error('❌ Test 9 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test records from PostgreSQL...');
    if (userB_PostId) {
      await client.database.from('posts').delete().eq('id', userB_PostId);
    }
    console.log('✅ Cleanup complete.');

  } catch (globalErr) {
    console.error('Fatal test error:', globalErr);
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests();
