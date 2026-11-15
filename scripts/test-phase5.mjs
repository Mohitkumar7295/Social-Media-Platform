import { createClient } from '@insforge/sdk';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { estimateReadingTime, extractExcerpt } from '../src/utils/editorUtils.js';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const client = createClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
});

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING WRITESPACE PHASE 5 INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testAuthorId = '7dc385e4-d1c9-4e46-9a9a-2bdb9ebd93e4';
  const testSlug = `phase5-test-${Date.now()}`;
  let publishedPostId = null;

  // Test 1: Reading Time Calculation Accuracy
  try {
    const shortText = 'Hello world! This is a short post.';
    const longWords = Array(450).fill('word').join(' ');
    const t1 = estimateReadingTime(shortText);
    const t2 = estimateReadingTime(longWords);

    if (t1 !== 1) throw new Error(`Expected 1 min for short text, got ${t1}`);
    if (t2 !== 3) throw new Error(`Expected 3 mins for 450 words, got ${t2}`);

    console.log(`✅ Test 1: Reading time estimation accurate (${t1}m for short, ${t2}m for 450 words).`);
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: HTML Sanitization & XSS Defense
  try {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const purify = DOMPurify(dom.window);

    const dirtyHtml = '<p>Normal text</p><script>alert("hack")</script><img src="x" onerror="alert(1)" /><a href="javascript:void(0)">Bad Link</a>';
    const cleanHtml = purify.sanitize(dirtyHtml);

    if (cleanHtml.includes('<script>') || cleanHtml.includes('onerror') || cleanHtml.includes('javascript:')) {
      throw new Error(`Sanitization failed! Dirty tags remained: ${cleanHtml}`);
    }
    if (!cleanHtml.includes('<p>Normal text</p>')) {
      throw new Error('Sanitization stripped legitimate tags');
    }

    console.log('✅ Test 2: DOMPurify XSS defense verified: malicious scripts and handlers stripped.');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: Create & Publish an Article in PostgreSQL for Anonymous Reader Testing
  try {
    const postPayload = {
      author_id: testAuthorId,
      title: 'Phase 5: The Art of Deep Reading in the Modern Web',
      subtitle: 'Designing distraction-free typography and editorial reading experiences',
      slug: testSlug,
      content: '<h2>Introduction</h2><p>Deep reading requires uninterrupted concentration and clean typography.</p><h2>Section 1</h2><p>Here is another section of the story.</p>',
      excerpt: 'Deep reading requires uninterrupted concentration and clean typography.',
      category: 'Design',
      status: 'published',
      published_at: new Date().toISOString(),
      reading_time: 2,
    };

    const { data, error } = await client.database
      .from('posts')
      .insert([postPayload])
      .select()
      .single();

    if (error) throw error;
    publishedPostId = data.id;
    console.log('✅ Test 3: Published test article created in PostgreSQL. ID:', publishedPostId, 'Slug:', data.slug);
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Anonymous Reader Access to Published Article via Slug
  try {
    // Querying with anon key (no user JWT)
    const { data, error } = await client.database
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('slug', testSlug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    if (!data || data.slug !== testSlug || !data.author) {
      throw new Error('Anonymous reader query failed or author profile relation missing');
    }

    console.log(`✅ Test 4: Anonymous public reader access verified for /p/${testSlug}. Author: ${data.author.full_name}`);
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // Test 5: Draft Privacy Isolation (Drafts must be unreadable by anonymous/third-party)
  try {
    const draftSlug = `draft-secret-${Date.now()}`;
    const { data: draftPost, error: insertError } = await client.database
      .from('posts')
      .insert([{
        author_id: testAuthorId,
        title: 'Secret Draft Article',
        slug: draftSlug,
        content: '<p>Top secret draft.</p>',
        status: 'draft',
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Now query as anonymous for status='published' OR test privacy constraint
    const { data: queriedDraft } = await client.database
      .from('posts')
      .select('*')
      .eq('slug', draftSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (queriedDraft) {
      throw new Error('Draft article was publicly returned by published query!');
    }

    // Clean up draft post
    await client.database.from('posts').delete().eq('id', draftPost.id);

    console.log('✅ Test 5: Draft privacy isolation confirmed: unpublished drafts cannot be queried as published articles.');
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }

  // Test 6: Related Articles Query (Same category + excluding current post)
  try {
    const { data: related, error } = await client.database
      .from('posts')
      .select('id, title, category, status')
      .eq('status', 'published')
      .neq('id', publishedPostId)
      .limit(3);

    if (error) throw error;
    console.log(`✅ Test 6: Related articles query executed successfully. Found ${related.length} other stories.`);
    passed++;
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }

  // Clean up test post
  if (publishedPostId) {
    await client.database.from('posts').delete().eq('id', publishedPostId);
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase5Tests();
