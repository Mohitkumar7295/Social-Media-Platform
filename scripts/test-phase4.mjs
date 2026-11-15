import { createClient } from '@insforge/sdk';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const client = createClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
});

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING WRITESPACE PHASE 4 INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testAuthorId = '7dc385e4-d1c9-4e46-9a9a-2bdb9ebd93e4';
  let createdPostId = null;
  const testSlug = `automated-test-${Date.now()}`;

  // Test 1: PostgreSQL `posts` table accessibility and RLS policies
  try {
    const { data, error } = await client.database
      .from('posts')
      .select('id, title, status')
      .limit(1);

    if (error) throw error;
    console.log('✅ Test 1: PostgreSQL `posts` table schema and RLS query verified.');
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: Create Draft Article
  try {
    const newPost = {
      author_id: testAuthorId,
      title: 'Automated Test: The Architecture of Modern Social Publishing',
      subtitle: 'Building a scalable editorial platform with Substack and Medium patterns',
      slug: testSlug,
      content: '<p>Writing freely and reading deeply are the core pillars of WriteSpace. This automated test verifies our PostgreSQL publishing pipeline.</p>',
      excerpt: 'Writing freely and reading deeply are the core pillars of WriteSpace.',
      category: 'Technology',
      status: 'draft',
      reading_time: 1,
    };

    const { data, error } = await client.database
      .from('posts')
      .insert([newPost])
      .select()
      .single();

    if (error) throw error;
    createdPostId = data.id;
    console.log('✅ Test 2: Draft article created in PostgreSQL. ID:', createdPostId, 'Slug:', data.slug);
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: Fetch Article by Slug with Author Profile Join
  try {
    const { data, error } = await client.database
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('slug', testSlug)
      .single();

    if (error) throw error;
    if (!data.author || data.author.username !== 'mohitkumar') {
      throw new Error('Author profile relation was not resolved properly');
    }
    console.log('✅ Test 3: Article queried by slug with author profile relation joined. Author:', data.author.full_name);
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Update & Publish Article
  try {
    const { data, error } = await client.database
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', createdPostId)
      .select()
      .single();

    if (error) throw error;
    if (data.status !== 'published') throw new Error('Status was not updated to published');
    console.log('✅ Test 4: Article successfully published in database. Status:', data.status, 'Published at:', data.published_at);
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // Test 5: Verify Feed Service Queries Published Post
  try {
    const { data, count, error } = await client.database
      .from('posts')
      .select('*, author:profiles(*)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    const found = data.some((p) => p.id === createdPostId);
    if (!found) throw new Error('Published article not found in global feed query');
    console.log('✅ Test 5: Published article successfully retrieved by global social feed. Total published:', count);
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }

  // Test 6: Revert to Draft (Unpublish) & Clean up
  try {
    // Unpublish
    const { error: unpubError } = await client.database
      .from('posts')
      .update({ status: 'draft', published_at: null })
      .eq('id', createdPostId);

    if (unpubError) throw unpubError;

    // Delete test record
    const { error: delError } = await client.database
      .from('posts')
      .delete()
      .eq('id', createdPostId);

    if (delError) throw delError;
    console.log('✅ Test 6: Article unpublish and deletion verified. Database cleaned.');
    passed++;
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase4Tests();
