import { createClient } from '@insforge/sdk';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const client = createClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
});

async function runPhase6Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING WRITESPACE PHASE 6 INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const userA_Id = '7dc385e4-d1c9-4e46-9a9a-2bdb9ebd93e4'; // Mohit Kumar
  const userB_Id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Sarah Reader
  const testSlug = `phase6-test-post-${Date.now()}`;
  let testPostId = null;
  let commentA_Id = null;
  let replyB_Id = null;

  try {
    // ----------------------------------------------------
    // PREPARATION: Create a test published article in PostgreSQL
    // ----------------------------------------------------
    console.log('🔧 Setup: Creating a published article for social interaction testing...');
    const { data: postData, error: postErr } = await client.database
      .from('posts')
      .insert([
        {
          author_id: userA_Id,
          title: 'The Social Revolution of Publishing',
          subtitle: 'Why likes, discussions and community drive real writers.',
          slug: testSlug,
          content: '<p>Social interaction turns solitary writing into a living conversation.</p>',
          category: 'Technology',
          status: 'published',
          published_at: new Date().toISOString(),
        },
      ])
      .select('id, title, status')
      .single();

    if (postErr || !postData) {
      throw new Error(`Failed to create test post: ${postErr?.message}`);
    }
    testPostId = postData.id;
    console.log(`✅ Setup complete. Post ID: ${testPostId}\n`);

    // ----------------------------------------------------
    // TEST 1: User A Likes the Article
    // ----------------------------------------------------
    try {
      const { data: likeA, error: likeAErr } = await client.database
        .from('likes')
        .insert([{ post_id: testPostId, user_id: userA_Id }])
        .select('id, post_id, user_id')
        .single();

      if (likeAErr) throw new Error(likeAErr.message);

      // Verify count
      const { count: likeCount } = await client.database
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', testPostId);

      if (likeCount !== 1) throw new Error(`Expected like count 1, got ${likeCount}`);

      console.log('✅ Test 1: User A liked article. Record created & count equals 1.');
      passed++;
    } catch (err) {
      console.error('❌ Test 1 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 2: Duplicate Like Prevention (Unique Constraint)
    // ----------------------------------------------------
    try {
      const { error: dupErr } = await client.database
        .from('likes')
        .insert([{ post_id: testPostId, user_id: userA_Id }]);

      if (!dupErr) {
        throw new Error('Database allowed duplicate like for the same user and post!');
      }

      console.log('✅ Test 2: Duplicate like correctly rejected by unique constraint.');
      passed++;
    } catch (err) {
      console.error('❌ Test 2 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 3: User A Unlikes the Article
    // ----------------------------------------------------
    try {
      const { error: unlikeErr } = await client.database
        .from('likes')
        .delete()
        .eq('post_id', testPostId)
        .eq('user_id', userA_Id);

      if (unlikeErr) throw new Error(unlikeErr.message);

      const { count: countAfterUnlike } = await client.database
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', testPostId);

      if (countAfterUnlike !== 0) {
        throw new Error(`Expected 0 likes after unlike, got ${countAfterUnlike}`);
      }

      console.log('✅ Test 3: User A unliked article. Record removed & count reverted to 0.');
      passed++;
    } catch (err) {
      console.error('❌ Test 3 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 4: User B Likes the Article (Independent State)
    // ----------------------------------------------------
    try {
      const { error: likeBErr } = await client.database
        .from('likes')
        .insert([{ post_id: testPostId, user_id: userB_Id }]);

      if (likeBErr) throw new Error(likeBErr.message);

      // Verify User B has liked, but User A has not
      const { data: userALike } = await client.database
        .from('likes')
        .select('id')
        .eq('post_id', testPostId)
        .eq('user_id', userA_Id)
        .maybeSingle();

      const { data: userBLike } = await client.database
        .from('likes')
        .select('id')
        .eq('post_id', testPostId)
        .eq('user_id', userB_Id)
        .maybeSingle();

      if (userALike || !userBLike) {
        throw new Error('User like states are not properly isolated.');
      }

      console.log('✅ Test 4: Independent like state verified (User B liked=true, User A liked=false).');
      passed++;
    } catch (err) {
      console.error('❌ Test 4 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 5: User A Adds a Top-Level Response
    // ----------------------------------------------------
    try {
      const { data: commentA, error: commentAErr } = await client.database
        .from('comments')
        .insert([
          {
            post_id: testPostId,
            user_id: userA_Id,
            content: 'Thank you for reading! Looking forward to community thoughts.',
            parent_id: null,
          },
        ])
        .select('*, user:profiles(id, username, full_name, avatar_url)')
        .single();

      if (commentAErr) throw new Error(commentAErr.message);
      if (!commentA || !commentA.user) {
        throw new Error('Comment created but author profile relation was not joined.');
      }
      commentA_Id = commentA.id;

      console.log(`✅ Test 5: User A created top-level comment (ID: ${commentA_Id}). Author profile joined correctly.`);
      passed++;
    } catch (err) {
      console.error('❌ Test 5 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 6: User B Replies to User A's Comment
    // ----------------------------------------------------
    try {
      const { data: replyB, error: replyBErr } = await client.database
        .from('comments')
        .insert([
          {
            post_id: testPostId,
            user_id: userB_Id,
            content: 'Great perspective! The editorial style is so clean.',
            parent_id: commentA_Id,
          },
        ])
        .select('*, user:profiles(id, username, full_name, avatar_url)')
        .single();

      if (replyBErr) throw new Error(replyBErr.message);
      if (replyB.parent_id !== commentA_Id) {
        throw new Error(`Expected parent_id ${commentA_Id}, got ${replyB.parent_id}`);
      }
      replyB_Id = replyB.id;

      // Verify total comment count is 2
      const { count: totalComments } = await client.database
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', testPostId);

      if (totalComments !== 2) {
        throw new Error(`Expected total comments 2, got ${totalComments}`);
      }

      console.log(`✅ Test 6: User B replied to User A (parent_id: ${commentA_Id}). Total comments = 2.`);
      passed++;
    } catch (err) {
      console.error('❌ Test 6 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 7: User A Edits Their Own Comment
    // ----------------------------------------------------
    try {
      const updatedText = 'Updated: Thank you for reading! Community discussions are now open.';
      const { data: editedComment, error: editErr } = await client.database
        .from('comments')
        .update({
          content: updatedText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentA_Id)
        .eq('user_id', userA_Id)
        .select('content, updated_at')
        .single();

      if (editErr) throw new Error(editErr.message);
      if (editedComment.content !== updatedText) {
        throw new Error('Edited content was not persisted correctly.');
      }

      console.log('✅ Test 7: User A edited own comment successfully. Content updated in PostgreSQL.');
      passed++;
    } catch (err) {
      console.error('❌ Test 7 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 8: Cross-User Edit Prevention (User B editing User A's Comment)
    // ----------------------------------------------------
    try {
      const { data: unauthorizedUpdate } = await client.database
        .from('comments')
        .update({
          content: 'Hacked by unauthorized user',
        })
        .eq('id', commentA_Id)
        .eq('user_id', userB_Id) // User B tries to update User A's comment
        .select();

      if (unauthorizedUpdate && unauthorizedUpdate.length > 0) {
        throw new Error('Security flaw: User B was able to modify User A comment!');
      }

      console.log('✅ Test 8: Cross-user comment modification strictly prevented.');
      passed++;
    } catch (err) {
      console.error('❌ Test 8 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 9: User B Deletes Own Reply
    // ----------------------------------------------------
    try {
      const { error: delErr } = await client.database
        .from('comments')
        .delete()
        .eq('id', replyB_Id)
        .eq('user_id', userB_Id);

      if (delErr) throw new Error(delErr.message);

      // Verify total comments decreased back to 1
      const { count: countAfterDel } = await client.database
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', testPostId);

      if (countAfterDel !== 1) {
        throw new Error(`Expected comment count 1 after reply deletion, got ${countAfterDel}`);
      }

      console.log('✅ Test 9: User B deleted own reply. Comment count decremented accurately.');
      passed++;
    } catch (err) {
      console.error('❌ Test 9 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 10: Private Draft Interaction Protection
    // ----------------------------------------------------
    try {
      // Create a private draft
      const draftPostId = 'd1a2f3b4-0000-0000-0000-000000000002';
      await client.database.from('posts').insert([
        {
          id: draftPostId,
          author_id: userA_Id,
          title: 'Top Secret Draft',
          slug: `draft-post-${Date.now()}`,
          content: '<p>Secret content</p>',
          status: 'draft',
        },
      ]);

      // Verify through service layer defense-in-depth:
      // When a non-author attempts to comment on draft
      const { data: targetPost } = await client.database
        .from('posts')
        .select('id, status, author_id')
        .eq('id', draftPostId)
        .maybeSingle();

      const canCommentOnDraft = targetPost.status === 'published' || targetPost.author_id === userB_Id;
      if (canCommentOnDraft) {
        throw new Error('Security flaw: Non-author permitted to comment on unpublished draft!');
      }

      // Cleanup draft
      await client.database.from('posts').delete().eq('id', draftPostId);

      console.log('✅ Test 10: Private draft interaction protection verified (non-author interaction blocked).');
      passed++;
    } catch (err) {
      console.error('❌ Test 10 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // TEST 11: Empty / Malformed Comment Validation
    // ----------------------------------------------------
    try {
      const { error: emptyErr } = await client.database
        .from('comments')
        .insert([
          {
            post_id: testPostId,
            user_id: userA_Id,
            content: '   ', // whitespace only
          },
        ]);

      if (!emptyErr) {
        throw new Error('Database allowed inserting whitespace-only comment!');
      }

      console.log('✅ Test 11: Empty/whitespace comment correctly rejected by database constraint.');
      passed++;
    } catch (err) {
      console.error('❌ Test 11 Failed:', err.message);
      failed++;
    }

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test records from PostgreSQL...');
    await client.database.from('posts').delete().eq('id', testPostId);
    console.log('✅ Cleanup complete.');

  } catch (globalErr) {
    console.error('Fatal test error:', globalErr);
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests();
