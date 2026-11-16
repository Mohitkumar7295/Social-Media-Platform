// scripts/seed-writers-and-articles.mjs
import { createClient } from '@insforge/sdk';
import { WRITERS } from './writers-data.mjs';
import { ARTICLES_PART1 } from './articles-part1.mjs';
import { ARTICLES_PART2 } from './articles-part2.mjs';
import { ARTICLES_PART3 } from './articles-part3.mjs';

const BASE_URL = 'https://u9367zk9.us-east.insforge.app';
const ANON_KEY = 'ik_7a92c79e83bf37e2f2791602c71bb359';

const ALL_ARTICLES = [
  ...ARTICLES_PART1,
  ...ARTICLES_PART2,
  ...ARTICLES_PART3,
];

async function seed() {
  console.log('====================================================');
  console.log('   WRITESPACE: SEEDING 5 WRITERS & 15 ARTICLES      ');
  console.log('====================================================');
  console.log(`Found ${WRITERS.length} writers and ${ALL_ARTICLES.length} articles to process.\n`);

  const client = createClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
  });

  const seededWriters = [];
  const seededArticles = [];

  let articleIndex = 0;

  for (const writer of WRITERS) {
    const fullName = writer.name || writer.full_name;
    const writerKey = writer.id_key || writer.key;

    console.log(`\n----------------------------------------------------`);
    console.log(`Processing Writer: ${fullName} (@${writer.username}) [${writer.field}]`);
    console.log(`----------------------------------------------------`);

    // 1. Authenticate / Sign up writer in InsForge Auth
    let authData;
    let isNewUser = false;

    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
      email: writer.email,
      password: writer.password,
      name: fullName,
    });

    if (signUpErr) {
      console.log(`  > Sign up returned (${signUpErr.message}), attempting sign in...`);
      const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
        email: writer.email,
        password: writer.password,
      });

      if (signInErr) {
        console.error(`  x Authentication failed for ${writer.email}:`, signInErr.message);
        continue;
      }
      authData = signInData;
    } else {
      console.log(`  ✓ Successfully signed up new auth user for ${writer.email}`);
      authData = signUpData;
      isNewUser = true;
    }

    const userId = authData.user.id;
    console.log(`  ✓ Auth user ID: ${userId}`);

    // Set active session for RLS authorization
    if (authData.accessToken) {
      client.auth.saveSessionFromResponse(authData);
    }

    // 2. Insert or update writer's profile
    const { data: existingProfile } = await client.database
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      console.log(`  > Profile exists. Updating profile details...`);
      const { error: updErr } = await client.database
        .from('profiles')
        .update({
          username: writer.username,
          full_name: fullName,
          bio: writer.bio,
          avatar_url: writer.avatar_url,
          cover_image_url: writer.cover_image_url,
          location: writer.location,
          website: writer.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updErr) {
        console.error(`  x Profile update error:`, updErr);
      } else {
        console.log(`  ✓ Updated profile for @${writer.username}`);
      }
    } else {
      console.log(`  > Inserting new profile...`);
      const { error: insErr } = await client.database
        .from('profiles')
        .insert([{
          id: userId,
          username: writer.username,
          full_name: fullName,
          bio: writer.bio,
          avatar_url: writer.avatar_url,
          cover_image_url: writer.cover_image_url,
          location: writer.location,
          website: writer.website,
        }]);

      if (insErr) {
        console.error(`  x Profile insert error:`, insErr);
      } else {
        console.log(`  ✓ Created profile for @${writer.username}`);
      }
    }

    seededWriters.push({
      id: userId,
      username: writer.username,
      full_name: fullName,
      field: writer.field,
    });

    // 3. Insert or update articles for this writer
    const writerArticles = ALL_ARTICLES.filter((a) => a.writer_key === writerKey);
    console.log(`  > Publishing ${writerArticles.length} articles for ${fullName}...`);

    for (const art of writerArticles) {
      articleIndex++;
      // Stagger publication dates nicely across recent days (e.g., between 1 and 14 days ago)
      const hoursOffset = (15 - articleIndex) * 18 + 4;
      const publishedAt = new Date(Date.now() - hoursOffset * 60 * 60 * 1000).toISOString();

      const { data: existingPost } = await client.database
        .from('posts')
        .select('id, slug, title')
        .eq('slug', art.slug)
        .maybeSingle();

      if (existingPost) {
        console.log(`    * Updating existing post: "${art.title}" (${art.slug})`);
        const { error: pUpdErr } = await client.database
          .from('posts')
          .update({
            author_id: userId,
            title: art.title,
            excerpt: art.excerpt,
            content: art.content,
            category: art.category,
            cover_image_url: art.cover_image_url,
            reading_time: art.reading_time,
            status: 'published',
            published_at: publishedAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPost.id);

        if (pUpdErr) {
          console.error(`    x Post update error for "${art.slug}":`, pUpdErr);
        } else {
          seededArticles.push({
            id: existingPost.id,
            slug: art.slug,
            title: art.title,
            category: art.category,
            author: fullName,
            author_id: userId,
          });
          console.log(`    ✓ Updated: "${art.title}"`);
        }
      } else {
        console.log(`    * Inserting new post: "${art.title}"`);
        const { data: newPost, error: pInsErr } = await client.database
          .from('posts')
          .insert([{
            author_id: userId,
            title: art.title,
            slug: art.slug,
            excerpt: art.excerpt,
            content: art.content,
            category: art.category,
            cover_image_url: art.cover_image_url,
            reading_time: art.reading_time,
            status: 'published',
            published_at: publishedAt,
          }])
          .select('id, slug, title')
          .single();

        if (pInsErr) {
          console.error(`    x Post insert error for "${art.slug}":`, pInsErr);
        } else {
          seededArticles.push({
            id: newPost.id,
            slug: art.slug,
            title: art.title,
            category: art.category,
            author: fullName,
            author_id: userId,
          });
          console.log(`    ✓ Published: "${art.title}"`);
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log('                SEEDING COMPLETED                   ');
  console.log('====================================================');
  console.log(`Successfully seeded ${seededWriters.length} writers:`);
  seededWriters.forEach((w) => console.log(` - ${w.full_name} (@${w.username}) [${w.field}]`));

  console.log(`\nSuccessfully seeded ${seededArticles.length} published articles:`);
  seededArticles.forEach((a, i) => console.log(` ${i + 1}. [${a.category}] "${a.title}" by ${a.author} (/p/${a.slug})`));
}

seed().catch((err) => {
  console.error('Fatal seeding script error:', err);
  process.exit(1);
});
